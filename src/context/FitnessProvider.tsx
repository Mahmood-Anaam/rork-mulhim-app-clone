import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback } from "react";
import {
  FitnessProfile,
  ProgressEntry,
  WeeklyPlan,
  WorkoutLog,
  NutritionAssessment,
  WeeklyMealPlan,
  GroceryList,
  NutritionPlan,
  MealSuggestion,
  FavoriteExercise,
  FavoriteMeal,
} from "@/types/fitness";
import { useAuth } from "@/context/AuthProvider";
import { remoteFitnessRepo } from "@/services/remoteFitnessRepo";
import { useWorkoutPlan } from "@/hooks/useWorkoutPlan";
import { useNutrition } from "@/hooks/useNutrition";
import { useProgress } from "@/hooks/useProgress";
import { useProfile } from "@/hooks/useProfile";
import { useFavorites } from "@/hooks/useFavorites";
import { generateNutritionPlan, extractFavoriteMealsFromHistory } from "@/utils/fitness";

const PROFILE_KEY = "@mulhim_profile";
const PROGRESS_KEY = "@mulhim_progress";
const WORKOUT_LOGS_KEY = "@mulhim_workout_logs";
const NUTRITION_KEY = "@mulhim_nutrition";
const MEAL_PLAN_KEY = "@mulhim_meal_plan";
const GROCERY_LIST_KEY = "@mulhim_grocery_list";
const FAVORITE_EXERCISES_KEY = "@mulhim_favorite_exercises";
const FAVORITE_MEALS_KEY = "@mulhim_favorite_meals";
const WEEK_PLAN_KEY = "@mulhim_week_plan";
const NUTRITION_PLAN_KEY = "@mulhim_nutrition_plan";

export const [FitnessProvider, useFitness] = createContextHook(() => {
  const { user } = useAuth();
  const userId = user?.id;

  const profileHook = useProfile(userId);
  const workoutPlanHook = useWorkoutPlan(userId);
  const nutritionHook = useNutrition(userId, profileHook.profile);
  const progressHook = useProgress(userId, profileHook.profile);
  const favoritesHook = useFavorites(userId);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [remoteProfileChecked, setRemoteProfileChecked] = useState<boolean>(false);
  const [hasRemoteProfile, setHasRemoteProfile] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);

  const safeJsonParse = <T,>(data: string | null, fallback: T): T => {
    if (!data) return fallback;
    try {
      const trimmed = data.trim();
      if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed.startsWith('[object')) {
        return fallback;
      }
      return JSON.parse(trimmed);
    } catch (e) {
      console.error('JSON parse error:', e);
      return fallback;
    }
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(false);
      console.log('[FitnessProvider] Loading data...');

      const [
        profileData, progressData, logsData, nutritionData,
        mealPlanData, groceryData, favoriteExercisesData,
        favoriteMealsData, weekPlanData, nutritionPlanData
      ] = await Promise.all([
        AsyncStorage.getItem(PROFILE_KEY),
        AsyncStorage.getItem(PROGRESS_KEY),
        AsyncStorage.getItem(WORKOUT_LOGS_KEY),
        AsyncStorage.getItem(NUTRITION_KEY),
        AsyncStorage.getItem(MEAL_PLAN_KEY),
        AsyncStorage.getItem(GROCERY_LIST_KEY),
        AsyncStorage.getItem(FAVORITE_EXERCISES_KEY),
        AsyncStorage.getItem(FAVORITE_MEALS_KEY),
        AsyncStorage.getItem(WEEK_PLAN_KEY),
        AsyncStorage.getItem(NUTRITION_PLAN_KEY),
      ]);

      if (profileData) profileHook.setProfile(safeJsonParse<FitnessProfile | null>(profileData, null));
      if (progressData) progressHook.setProgress(safeJsonParse<ProgressEntry[]>(progressData, []));
      if (logsData) progressHook.setWorkoutLogs(safeJsonParse<WorkoutLog[]>(logsData, []));
      if (nutritionData) nutritionHook.setNutritionAssessment(safeJsonParse<NutritionAssessment | null>(nutritionData, null));
      if (mealPlanData) nutritionHook.setCurrentMealPlan(safeJsonParse<WeeklyMealPlan | null>(mealPlanData, null));
      if (groceryData) nutritionHook.setGroceryList(safeJsonParse<GroceryList | null>(groceryData, null));
      if (favoriteExercisesData) favoritesHook.setFavoriteExercises(safeJsonParse<FavoriteExercise[]>(favoriteExercisesData, []));
      if (favoriteMealsData) favoritesHook.setFavoriteMeals(safeJsonParse<FavoriteMeal[]>(favoriteMealsData, []));
      if (weekPlanData) workoutPlanHook.setCurrentWeekPlan(safeJsonParse<WeeklyPlan | null>(weekPlanData, null));
      if (nutritionPlanData) nutritionHook.setNutritionPlan(safeJsonParse<NutritionPlan | null>(nutritionPlanData, null));

      if (!userId) {
        setIsLoading(false);
        setRemoteProfileChecked(true);
        setHasRemoteProfile(false);
        return;
      }

      console.log('[FitnessProvider] Syncing with remote...');
      try {
        const [remoteProfile, remoteProgress, remoteLogs, remoteFavExercises, remoteFavMeals] = await Promise.all([
          remoteFitnessRepo.fetchProfile(userId),
          remoteFitnessRepo.fetchProgressEntries(userId),
          remoteFitnessRepo.fetchWorkoutLogs(userId),
          remoteFitnessRepo.fetchFavoriteExercises(userId),
          remoteFitnessRepo.fetchFavoriteMeals(userId),
        ]);

        setRemoteProfileChecked(true);
        setHasRemoteProfile(!!remoteProfile);

        if (remoteProfile) {
          profileHook.setProfile(remoteProfile);
          await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(remoteProfile));
        }
        if (remoteProgress.length > 0) {
          progressHook.setProgress(remoteProgress);
          await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(remoteProgress));
        }
        if (remoteLogs.length > 0) {
          progressHook.setWorkoutLogs(remoteLogs);
          await AsyncStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(remoteLogs));
        }
        if (remoteFavExercises.length > 0) {
          favoritesHook.setFavoriteExercises(remoteFavExercises);
          await AsyncStorage.setItem(FAVORITE_EXERCISES_KEY, JSON.stringify(remoteFavExercises));
        }
        if (remoteFavMeals.length > 0) {
          favoritesHook.setFavoriteMeals(remoteFavMeals);
          await AsyncStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(remoteFavMeals));
        }

        const remoteWorkoutPlan = await remoteFitnessRepo.fetchActiveWorkoutPlan(userId);
        if (remoteWorkoutPlan && remoteWorkoutPlan.sessions.length > 0) {
          workoutPlanHook.setCurrentWeekPlan(remoteWorkoutPlan);
          await AsyncStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(remoteWorkoutPlan));
        }

        const remoteNutrition = await remoteFitnessRepo.fetchActiveNutritionPlan(userId);
        if (remoteNutrition) {
          nutritionHook.setNutritionPlan(remoteNutrition.plan);
          await AsyncStorage.setItem(NUTRITION_PLAN_KEY, JSON.stringify(remoteNutrition.plan));
          if (remoteNutrition.mealPlan.days.length > 0) {
            nutritionHook.setCurrentMealPlan(remoteNutrition.mealPlan);
            await AsyncStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(remoteNutrition.mealPlan));
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('[FitnessProvider] Remote sync error:', err);
        setLoadError(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[FitnessProvider] Load error:", error);
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveNutritionAssessment = async (assessment: NutritionAssessment) => {
    try {
      if (assessment.completed && !assessment.favoriteMeals) {
        assessment.favoriteMeals = extractFavoriteMealsFromHistory(assessment.dietHistory);
      }
      await AsyncStorage.setItem(NUTRITION_KEY, JSON.stringify(assessment));
      nutritionHook.setNutritionAssessment(assessment);
      if (assessment.completed && profileHook.profile) {
        const plan = generateNutritionPlan(profileHook.profile, assessment);
        nutritionHook.setNutritionPlan(plan);
        await AsyncStorage.setItem(NUTRITION_PLAN_KEY, JSON.stringify(plan));

        if (userId) {
          remoteFitnessRepo.saveNutritionPlan(userId, plan).catch((err) => {
            console.warn('[FitnessProvider] Error syncing nutrition plan:', err);
          });
        }
      }
    } catch (error) {
      console.error("Error saving nutrition assessment:", error);
    }
  };

  return {
    ...profileHook,
    ...workoutPlanHook,
    ...nutritionHook,
    ...progressHook,
    ...favoritesHook,
    isLoading,
    loadError,
    saveNutritionAssessment,
    hasProfile: userId
      ? (remoteProfileChecked ? (hasRemoteProfile || !!profileHook.profile) : !!profileHook.profile)
      : !!profileHook.profile,
  };
});
