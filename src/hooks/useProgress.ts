import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressEntry, WorkoutLog, FitnessProfile } from '@/types/fitness';
import { remoteFitnessRepo } from '@/services/remoteFitnessRepo';

const PROGRESS_KEY = "@mulhim_progress";
const WORKOUT_LOGS_KEY = "@mulhim_workout_logs";

export const useProgress = (userId?: string, profile?: FitnessProfile | null) => {
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);

  const addProgressEntry = useCallback(async (entry: ProgressEntry) => {
    try {
      const updated = [...progress, entry];
      setProgress(updated);
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
      console.log('[useProgress] Progress entry saved locally');

      if (userId) {
        try {
          await remoteFitnessRepo.insertProgressEntry(userId, entry);
          console.log('[useProgress] Progress entry synced to Supabase');
        } catch (error: any) {
          console.error('[useProgress] Error syncing progress entry:', error);
        }
      }
    } catch (error) {
      console.error("[useProgress] Error adding progress entry:", error);
      throw error;
    }
  }, [progress, userId]);

  const addWorkoutLog = useCallback(async (log: WorkoutLog) => {
    try {
      const updated = [...workoutLogs, log];
      setWorkoutLogs(updated);
      await AsyncStorage.setItem(WORKOUT_LOGS_KEY, JSON.stringify(updated));
      console.log('[useProgress] Workout log saved locally');

      if (userId) {
        try {
          await remoteFitnessRepo.insertWorkoutLog(userId, log);
          console.log('[useProgress] Workout log synced to Supabase');
        } catch (error: any) {
          console.error('[useProgress] Error syncing workout log:', error);
        }
      }
    } catch (error) {
      console.error("[useProgress] Error adding workout log:", error);
      throw error;
    }
  }, [workoutLogs, userId]);

  const getCurrentWeight = useCallback((): number => {
    if (progress.length > 0) {
      const sorted = [...progress].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sorted[0].weight;
    }
    return profile?.weight || 0;
  }, [progress, profile]);

  const getCurrentStreak = useCallback((): number => {
    if (workoutLogs.length === 0) return 0;
    const sortedLogs = [...workoutLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }
    return streak;
  }, [workoutLogs]);

  return {
    progress,
    setProgress,
    workoutLogs,
    setWorkoutLogs,
    addProgressEntry,
    addWorkoutLog,
    getCurrentWeight,
    getCurrentStreak,
  };
};
