/**
 * useProgressStats – computes derived stats from progress entries and workout logs.
 */
import { useFitness } from "@/providers/FitnessProvider";

export function useProgressStats() {
  const { profile, progress, workoutLogs, getCurrentStreak, getCurrentWeight } =
    useFitness();

  const currentWeight = getCurrentWeight();
  const startWeight = profile?.weight ?? 0;
  const weightChange = currentWeight - startWeight;

  const currentStreak = getCurrentStreak();
  const totalWorkouts = workoutLogs.length;

  const bmi =
    profile && profile.height > 0
      ? currentWeight / Math.pow(profile.height / 100, 2)
      : null;

  const weightHistory = [...progress]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((e) => ({ date: e.date, weight: e.weight }));

  return {
    currentWeight,
    startWeight,
    weightChange,
    currentStreak,
    totalWorkouts,
    bmi,
    weightHistory,
  };
}
