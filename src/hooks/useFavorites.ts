import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteExercise, FavoriteMeal } from '@/types/fitness';
import { remoteFitnessRepo } from '@/services/remoteFitnessRepo';

const FAVORITE_EXERCISES_KEY = "@mulhim_favorite_exercises";
const FAVORITE_MEALS_KEY = "@mulhim_favorite_meals";

export const useFavorites = (userId?: string) => {
  const [favoriteExercises, setFavoriteExercises] = useState<FavoriteExercise[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<FavoriteMeal[]>([]);

  const addFavoriteExercise = useCallback(async (exercise: Omit<FavoriteExercise, "id" | "addedAt">) => {
    try {
      const newFavorite: FavoriteExercise = {
        ...exercise,
        id: `fav-exercise-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };

      if (userId) {
        try {
          const remote = await remoteFitnessRepo.addFavoriteExercise(userId, exercise);
          if (remote) {
            newFavorite.id = remote.id;
            newFavorite.addedAt = remote.addedAt;
          }
        } catch (err: any) {
          if (err?.message !== 'NETWORK_ERROR') console.error('[useFavorites] Error syncing fav exercise:', err);
        }
      }

      const updated = [...favoriteExercises, newFavorite];
      await AsyncStorage.setItem(FAVORITE_EXERCISES_KEY, JSON.stringify(updated));
      setFavoriteExercises(updated);
    } catch (error) {
      console.error("[useFavorites] Error adding favorite exercise:", error);
    }
  }, [favoriteExercises, userId]);

  const removeFavoriteExercise = useCallback(async (id: string) => {
    try {
      if (userId) {
        try {
          await remoteFitnessRepo.removeFavoriteExercise(userId, id);
        } catch (err: any) {
          if (err?.message !== 'NETWORK_ERROR') console.error('[useFavorites] Error removing fav exercise:', err);
        }
      }
      const updated = favoriteExercises.filter(ex => ex.id !== id);
      await AsyncStorage.setItem(FAVORITE_EXERCISES_KEY, JSON.stringify(updated));
      setFavoriteExercises(updated);
    } catch (error) {
      console.error("[useFavorites] Error removing favorite exercise:", error);
    }
  }, [favoriteExercises, userId]);

  const addFavoriteMeal = useCallback(async (meal: Omit<FavoriteMeal, "id" | "addedAt">) => {
    try {
      const newFavorite: FavoriteMeal = {
        ...meal,
        id: `fav-meal-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };

      if (userId) {
        try {
          const remote = await remoteFitnessRepo.addFavoriteMeal(userId, meal);
          if (remote) {
            newFavorite.id = remote.id;
            newFavorite.addedAt = remote.addedAt;
          }
        } catch (err: any) {
          if (err?.message !== 'NETWORK_ERROR') console.error('[useFavorites] Error syncing fav meal:', err);
        }
      }

      const updated = [...favoriteMeals, newFavorite];
      await AsyncStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(updated));
      setFavoriteMeals(updated);
    } catch (error) {
      console.error("[useFavorites] Error adding favorite meal:", error);
    }
  }, [favoriteMeals, userId]);

  const removeFavoriteMeal = useCallback(async (id: string) => {
    try {
      if (userId) {
        try {
          await remoteFitnessRepo.removeFavoriteMeal(userId, id);
        } catch (err: any) {
          if (err?.message !== 'NETWORK_ERROR') console.error('[useFavorites] Error removing fav meal:', err);
        }
      }
      const updated = favoriteMeals.filter(meal => meal.id !== id);
      await AsyncStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(updated));
      setFavoriteMeals(updated);
    } catch (error) {
      console.error("[useFavorites] Error removing favorite meal:", error);
    }
  }, [favoriteMeals, userId]);

  return {
    favoriteExercises,
    setFavoriteExercises,
    favoriteMeals,
    setFavoriteMeals,
    addFavoriteExercise,
    removeFavoriteExercise,
    addFavoriteMeal,
    removeFavoriteMeal,
  };
};
