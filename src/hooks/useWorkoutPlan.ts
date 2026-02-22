import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeeklyPlan, WorkoutExercise, WorkoutSession } from '@/types/fitness';
import { remoteFitnessRepo } from '@/services/remoteFitnessRepo';

const WEEK_PLAN_KEY = "@mulhim_week_plan";

export const useWorkoutPlan = (userId?: string) => {
  const [currentWeekPlan, setCurrentWeekPlan] = useState<WeeklyPlan | null>(null);

  const updateWeekPlan = useCallback(async (plan: WeeklyPlan) => {
    setCurrentWeekPlan(plan);
    await AsyncStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(plan));
    console.log('[useWorkoutPlan] Week plan saved locally');

    if (userId) {
      remoteFitnessRepo.saveWorkoutPlan(userId, plan).then(() => {
        console.log('[useWorkoutPlan] Workout plan synced to Supabase');
      }).catch((err) => {
        console.warn('[useWorkoutPlan] Error saving workout plan to Supabase:', err);
      });
    }
  }, [userId]);

  const toggleExerciseCompletion = useCallback((sessionId: string, exerciseId: string) => {
    if (!currentWeekPlan) return;

    const updatedSessions = currentWeekPlan.sessions.map((session) => {
      if (session.id === sessionId) {
        const completedExercises = session.completedExercises || [];
        const isCompleted = completedExercises.includes(exerciseId);

        const newCompletedExercises = isCompleted
          ? completedExercises.filter((id) => id !== exerciseId)
          : [...completedExercises, exerciseId];

        const allExercisesCompleted = newCompletedExercises.length === session.exercises.length;
        const newCompletedAt = allExercisesCompleted ? new Date().toISOString() : session.completedAt;

        if (userId) {
          remoteFitnessRepo.updateSessionCompletion(
            sessionId,
            allExercisesCompleted,
            newCompletedAt,
            newCompletedExercises
          );
        }

        return {
          ...session,
          completedExercises: newCompletedExercises,
          completed: allExercisesCompleted,
          completedAt: newCompletedAt,
        };
      }
      return session;
    });

    const updatedPlan = { ...currentWeekPlan, sessions: updatedSessions };
    setCurrentWeekPlan(updatedPlan);
    AsyncStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(updatedPlan)).catch(console.error);
  }, [currentWeekPlan, userId]);

  const toggleSessionCompletion = useCallback((sessionId: string) => {
    if (!currentWeekPlan) return;

    const updatedSessions = currentWeekPlan.sessions.map((session) => {
      if (session.id === sessionId) {
        const newCompleted = !session.completed;
        const newCompletedAt = newCompleted ? new Date().toISOString() : undefined;
        const newCompletedExercises = newCompleted ? session.exercises.map((e) => e.id) : [];

        if (userId) {
          remoteFitnessRepo.updateSessionCompletion(
            sessionId,
            newCompleted,
            newCompletedAt,
            newCompletedExercises
          );
        }

        return {
          ...session,
          completed: newCompleted,
          completedAt: newCompletedAt,
          completedExercises: newCompletedExercises,
        };
      }
      return session;
    });

    const updatedPlan = { ...currentWeekPlan, sessions: updatedSessions };
    setCurrentWeekPlan(updatedPlan);
    AsyncStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(updatedPlan)).catch(console.error);
  }, [currentWeekPlan, userId]);

  const updateExercise = useCallback((sessionId: string, exerciseId: string, updates: Partial<{ sets: number; reps: string; rest: number; assignedWeight: string }>) => {
    if (!currentWeekPlan) return;

    const updatedSessions = currentWeekPlan.sessions.map((session) => {
      if (session.id === sessionId) {
        const updatedExercises = session.exercises.map((exercise) => {
          if (exercise.id === exerciseId) {
            return { ...exercise, ...updates };
          }
          return exercise;
        });
        return { ...session, exercises: updatedExercises };
      }
      return session;
    });

    const updatedPlan = { ...currentWeekPlan, sessions: updatedSessions };
    setCurrentWeekPlan(updatedPlan);
    AsyncStorage.setItem(WEEK_PLAN_KEY, JSON.stringify(updatedPlan)).catch(console.error);
  }, [currentWeekPlan]);

  return {
    currentWeekPlan,
    setCurrentWeekPlan,
    updateWeekPlan,
    toggleExerciseCompletion,
    toggleSessionCompletion,
    updateExercise,
  };
};
