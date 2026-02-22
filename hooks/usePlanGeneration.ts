/**
 * usePlanGeneration – encapsulates the weekly workout plan generation logic
 * so it can be reused and tested independently from the PlanScreen.
 */
import { useCallback } from "react";
import { useFitness } from "@/providers/FitnessProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { exerciseDatabase, workoutTemplates } from "@/data/exercises";
import { WorkoutExercise } from "@/types/fitness";

export function usePlanGeneration() {
  const { profile, updateWeekPlan } = useFitness();
  const { t } = useLanguage();

  const generateWeeklyPlan = useCallback(() => {
    if (!profile) return;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    // Select workout template based on profile
    const selectTemplate = () => {
      if (profile.activityLevel === "none") return workoutTemplates.fullBody;
      if (profile.availableDays <= 3) return workoutTemplates.fullBody;
      if (profile.availableDays === 4) return workoutTemplates.upperLower;
      if (profile.fitnessLevel === "advanced" && profile.activityLevel === "high") {
        return workoutTemplates.pushPullLegs;
      }
      return workoutTemplates.upperLower;
    };

    const template = selectTemplate();

    const filterByLocation = (exercises: WorkoutExercise[]) => {
      if (profile.trainingLocation === "home") {
        return exercises.filter((ex) => ex.equipment.length === 0);
      }
      if (profile.trainingLocation === "minimal_equipment") {
        const allowed = ["dumbbells", "resistance-bands", "pullup-bar"];
        return exercises.filter(
          (ex) =>
            ex.equipment.length === 0 ||
            ex.equipment.every((eq) => allowed.includes(eq))
        );
      }
      return exercises;
    };

    const filterByInjuries = (exercises: WorkoutExercise[]) => {
      if (!profile.injuries) return exercises;
      const injuries = profile.injuries.toLowerCase();
      return exercises.filter((ex) => {
        if (injuries.includes("knee") && (ex.id.includes("squat") || ex.id.includes("lunge"))) return false;
        if (injuries.includes("back") && (ex.id.includes("deadlift") || ex.id.includes("row"))) return false;
        if (injuries.includes("shoulder") && (ex.id.includes("press") || ex.id.includes("raise"))) return false;
        return true;
      });
    };

    const adjustByGoal = (exercise: WorkoutExercise): WorkoutExercise => {
      const adj = { ...exercise };
      switch (profile.goal) {
        case "fat_loss":
          adj.sets = Math.max(3, exercise.sets);
          adj.rest = Math.min(exercise.rest, 60);
          break;
        case "muscle_gain":
          adj.sets = exercise.sets + 1;
          adj.rest = Math.max(exercise.rest, 90);
          break;
        default:
          break;
      }
      return adj;
    };

    const daysOfWeek = [
      t.days.Sunday,
      t.days.Monday,
      t.days.Tuesday,
      t.days.Wednesday,
      t.days.Thursday,
      t.days.Friday,
      t.days.Saturday,
    ];

    const sessions = template.map((workout: any, index: number) => {
      const muscleGroups: string[] = workout.muscleGroups ?? [workout.muscleGroup].filter(Boolean);
      let allExercises: WorkoutExercise[] = [];

      for (const mg of muscleGroups) {
        const dbExercises = exerciseDatabase[mg.toLowerCase()] ?? [];
        const filtered = filterByInjuries(filterByLocation(dbExercises));
        const adjusted = filtered.map(adjustByGoal);
        allExercises = [...allExercises, ...adjusted.slice(0, Math.ceil(4 / muscleGroups.length))];
      }

      return {
        id: `session-${index}-${Date.now()}`,
        day: daysOfWeek[index] ?? `Day ${index + 1}`,
        name: workout.name,
        exercises: allExercises,
        duration: profile.sessionDuration,
        completed: false,
        restNote: workout.restNote ?? undefined,
      };
    });

    updateWeekPlan({
      weekNumber: 1,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sessions,
    });
  }, [profile, updateWeekPlan, t.days]);

  return { generateWeeklyPlan };
}
