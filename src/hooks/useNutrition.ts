import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NutritionAssessment,
  NutritionPlan,
  WeeklyMealPlan,
  GroceryList,
  MealSuggestion,
  DietPattern,
  FitnessProfile,
  MacroDistribution
} from '@/types/fitness';
import { remoteFitnessRepo } from '@/services/remoteFitnessRepo';

const NUTRITION_KEY = "@mulhim_nutrition";
const MEAL_PLAN_KEY = "@mulhim_meal_plan";
const GROCERY_LIST_KEY = "@mulhim_grocery_list";
const NUTRITION_PLAN_KEY = "@mulhim_nutrition_plan";

export const useNutrition = (userId?: string, profile?: FitnessProfile | null) => {
  const [nutritionAssessment, setNutritionAssessment] = useState<NutritionAssessment | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);

  const saveMealPlan = useCallback(async (plan: WeeklyMealPlan) => {
    try {
      await AsyncStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(plan));
      setCurrentMealPlan(plan);

      if (userId && nutritionPlan) {
        remoteFitnessRepo.saveNutritionPlan(userId, nutritionPlan, plan).catch((err) => {
          console.warn('[useNutrition] Error syncing meal plan to Supabase:', err);
        });
      }
    } catch (error) {
      console.error("[useNutrition] Error saving meal plan:", error);
    }
  }, [userId, nutritionPlan]);

  const saveGroceryList = useCallback(async (list: GroceryList) => {
    try {
      await AsyncStorage.setItem(GROCERY_LIST_KEY, JSON.stringify(list));
      setGroceryList(list);
    } catch (error) {
      console.error("[useNutrition] Error saving grocery list:", error);
    }
  }, []);

  const toggleGroceryItem = useCallback(async (itemId: string) => {
    if (!groceryList) return;
    const updatedItems = groceryList.items.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    const updatedList = { ...groceryList, items: updatedItems };
    await saveGroceryList(updatedList);
  }, [groceryList, saveGroceryList]);

  const toggleMealCompletion = useCallback(async (dayId: string, mealType: "breakfast" | "lunch" | "dinner" | "snack", snackIndex?: number) => {
    if (!currentMealPlan) return;

    const updatedDays = currentMealPlan.days.map((day) => {
      if (day.id === dayId) {
        const completedMeals = day.completedMeals || {
          breakfast: false, lunch: false, dinner: false,
          snacks: day.snacks.map(() => false),
        };

        if (mealType === "snack" && snackIndex !== undefined) {
          const snacksCompletion = completedMeals.snacks || day.snacks.map(() => false);
          snacksCompletion[snackIndex] = !snacksCompletion[snackIndex];
          return { ...day, completedMeals: { ...completedMeals, snacks: snacksCompletion } };
        } else if (mealType === "breakfast") {
          return { ...day, completedMeals: { ...completedMeals, breakfast: !completedMeals.breakfast } };
        } else if (mealType === "lunch") {
          return { ...day, completedMeals: { ...completedMeals, lunch: !completedMeals.lunch } };
        } else if (mealType === "dinner") {
          return { ...day, completedMeals: { ...completedMeals, dinner: !completedMeals.dinner } };
        }
      }
      return day;
    });

    const updatedPlan = { ...currentMealPlan, days: updatedDays };
    await saveMealPlan(updatedPlan);
  }, [currentMealPlan, saveMealPlan]);

  const recalcDayTotals = useCallback((day: any) => {
    const d = { ...day };
    d.totalCalories = (d.breakfast?.calories || 0) + (d.lunch?.calories || 0) + (d.dinner?.calories || 0) + d.snacks.reduce((sum: number, s: MealSuggestion) => sum + s.calories, 0);
    d.totalProtein = (d.breakfast?.protein || 0) + (d.lunch?.protein || 0) + (d.dinner?.protein || 0) + d.snacks.reduce((sum: number, s: MealSuggestion) => sum + s.protein, 0);
    d.totalCarbs = (d.breakfast?.carbs || 0) + (d.lunch?.carbs || 0) + (d.dinner?.carbs || 0) + d.snacks.reduce((sum: number, s: MealSuggestion) => sum + s.carbs, 0);
    d.totalFats = (d.breakfast?.fats || 0) + (d.lunch?.fats || 0) + (d.dinner?.fats || 0) + d.snacks.reduce((sum: number, s: MealSuggestion) => sum + s.fats, 0);
    return d;
  }, []);

  const addMealToDay = useCallback(async (dayId: string, meal: MealSuggestion, mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    if (!currentMealPlan) return;

    const updatedDays = currentMealPlan.days.map((day) => {
      if (day.id === dayId) {
        const updatedDay = { ...day };
        if (mealType === "snack") {
          updatedDay.snacks = [...day.snacks, meal];
          const completedMeals = updatedDay.completedMeals || { breakfast: false, lunch: false, dinner: false, snacks: [] };
          updatedDay.completedMeals = { ...completedMeals, snacks: [...(completedMeals.snacks || []), false] };
        } else {
          updatedDay[mealType] = meal;
        }
        return recalcDayTotals(updatedDay);
      }
      return day;
    });
    await saveMealPlan({ ...currentMealPlan, days: updatedDays });
  }, [currentMealPlan, recalcDayTotals, saveMealPlan]);

  const removeMealFromDay = useCallback(async (dayId: string, mealType: "breakfast" | "lunch" | "dinner" | "snack", snackIndex?: number) => {
    if (!currentMealPlan) return;

    const updatedDays = currentMealPlan.days.map((day) => {
      if (day.id === dayId) {
        const updatedDay = { ...day };
        if (mealType === "snack" && snackIndex !== undefined) {
          updatedDay.snacks = day.snacks.filter((_, index) => index !== snackIndex);
          const completedMeals = updatedDay.completedMeals || { breakfast: false, lunch: false, dinner: false, snacks: [] };
          updatedDay.completedMeals = { ...completedMeals, snacks: (completedMeals.snacks || []).filter((_, index) => index !== snackIndex) };
        } else if (mealType !== "snack") {
          updatedDay[mealType] = undefined;
          if (updatedDay.completedMeals) {
            updatedDay.completedMeals[mealType] = false;
          }
        }
        return recalcDayTotals(updatedDay);
      }
      return day;
    });
    await saveMealPlan({ ...currentMealPlan, days: updatedDays });
  }, [currentMealPlan, recalcDayTotals, saveMealPlan]);

  const updateMealInPlan = useCallback(async (dayId: string, mealType: "breakfast" | "lunch" | "dinner" | "snack", updatedMeal: MealSuggestion, snackIndex?: number) => {
    if (!currentMealPlan) return;

    const updatedDays = currentMealPlan.days.map((day) => {
      if (day.id === dayId) {
        const updatedDay = { ...day };
        if (mealType === "snack" && snackIndex !== undefined) {
          updatedDay.snacks = day.snacks.map((snack, index) => index === snackIndex ? updatedMeal : snack);
        } else if (mealType !== "snack") {
          updatedDay[mealType] = updatedMeal;
        }
        return recalcDayTotals(updatedDay);
      }
      return day;
    });
    await saveMealPlan({ ...currentMealPlan, days: updatedDays });
  }, [currentMealPlan, recalcDayTotals, saveMealPlan]);

  return {
    nutritionAssessment,
    setNutritionAssessment,
    nutritionPlan,
    setNutritionPlan,
    currentMealPlan,
    setCurrentMealPlan,
    groceryList,
    setGroceryList,
    saveMealPlan,
    saveGroceryList,
    toggleGroceryItem,
    toggleMealCompletion,
    addMealToDay,
    removeMealFromDay,
    updateMealInPlan,
  };
};
