/**
 * useMealPlan – helpers for working with the weekly meal plan state.
 */
import { useFitness } from "@/providers/FitnessProvider";
import { WeeklyMealPlan, DailyMealPlan, MealSuggestion } from "@/types/fitness";

export function useMealPlan() {
  const {
    currentMealPlan,
    saveMealPlan,
    toggleMealCompletion,
    addMealToDay,
    removeMealFromDay,
    groceryList,
    toggleGroceryItem,
    addGroceryItem,
    saveGroceryList,
  } = useFitness();

  const getTodayPlan = (): DailyMealPlan | null => {
    if (!currentMealPlan) return null;
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return currentMealPlan.days.find((d) => d.day === today) ?? null;
  };

  const getWeeklyCalorieAverage = (): number => {
    if (!currentMealPlan || currentMealPlan.days.length === 0) return 0;
    const total = currentMealPlan.days.reduce((sum, d) => sum + d.totalCalories, 0);
    return Math.round(total / currentMealPlan.days.length);
  };

  const getCompletionRate = (): number => {
    if (!currentMealPlan || currentMealPlan.days.length === 0) return 0;
    let completed = 0;
    let possible = 0;
    for (const day of currentMealPlan.days) {
      if (day.breakfast) { possible++; if (day.completedMeals?.breakfast) completed++; }
      if (day.lunch) { possible++; if (day.completedMeals?.lunch) completed++; }
      if (day.dinner) { possible++; if (day.completedMeals?.dinner) completed++; }
      for (let i = 0; i < day.snacks.length; i++) {
        possible++;
        if (day.completedMeals?.snacks?.[i]) completed++;
      }
    }
    return possible > 0 ? Math.round((completed / possible) * 100) : 0;
  };

  return {
    currentMealPlan,
    saveMealPlan,
    toggleMealCompletion,
    addMealToDay,
    removeMealFromDay,
    groceryList,
    toggleGroceryItem,
    addGroceryItem,
    saveGroceryList,
    getTodayPlan,
    getWeeklyCalorieAverage,
    getCompletionRate,
  };
}
