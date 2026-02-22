import { useCallback } from "react";
import { useFitness } from "@/context/FitnessProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { WorkoutSession } from "@/types/fitness";
import { exerciseDatabase, workoutTemplates } from "@/data/exercises";

export function useWorkoutPlan() {
  const { profile, updateWeekPlan } = useFitness();
  const { t } = useLanguage();

  const generateWeeklyPlan = useCallback(() => {
    if (!profile) return;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - today.getDay());

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const selectWorkoutTemplate = () => {
      if (profile.activityLevel === "none") {
        return workoutTemplates.fullBody;
      }

      if (profile.availableDays >= 2 && profile.availableDays <= 3) {
        return workoutTemplates.fullBody;
      }

      if (profile.availableDays === 4) {
        return workoutTemplates.upperLower;
      }

      if (profile.availableDays >= 5 && profile.availableDays <= 6) {
        if (profile.fitnessLevel === "advanced" && profile.activityLevel === "high") {
          return workoutTemplates.pushPullLegs;
        }
        return workoutTemplates.upperLower;
      }

      if (profile.availableDays === 7) {
        if (profile.fitnessLevel === "advanced" && profile.activityLevel === "high") {
          return workoutTemplates.pushPullLegs;
        }
        return workoutTemplates.upperLower;
      }

      return workoutTemplates.fullBody;
    };

    const template = selectWorkoutTemplate();

    const updateVideoUrl = (exercise: typeof exerciseDatabase[string][number]) => {
      const ex = { ...exercise };
      if (profile.trainingLocation === "home" || profile.trainingLocation === "minimal_equipment") {
        const videoMapping: Record<string, string> = {
          "pushups": "https://www.youtube.com/watch?v=IODxDxX7oi4",
          "wide-pushups": "https://www.youtube.com/watch?v=KYIPC75rSQg",
          "diamond-pushups": "https://www.youtube.com/watch?v=J0DnG1_S92I",
          "decline-pushups": "https://www.youtube.com/watch?v=SKPab2YC8BE",
          "bodyweight-squats": "https://www.youtube.com/watch?v=aclHkVaku9U",
          "bulgarian-split-squat": "https://www.youtube.com/watch?v=2C-uNgKwPLE",
          "jump-squats": "https://www.youtube.com/watch?v=A-cFYWvaHr0",
          "wall-sit": "https://www.youtube.com/watch?v=y-wV4Venusw",
          "glute-bridges": "https://www.youtube.com/watch?v=wPM8icPu6H8",
          "single-leg-deadlift": "https://www.youtube.com/watch?v=Zfr6wizR8rs",
          "pullups": "https://www.youtube.com/watch?v=eGo4IYlbE5g",
          "chin-ups": "https://www.youtube.com/watch?v=brhWuCQ17FI",
          "inverted-rows": "https://www.youtube.com/watch?v=hXTc1mDnZCw",
          "superman": "https://www.youtube.com/watch?v=cc6UVRS7PW4",
          "reverse-snow-angels": "https://www.youtube.com/watch?v=4Z3BM3JnZuo",
          "pike-pushups": "https://www.youtube.com/watch?v=x4YNjHHyqn8",
          "handstand-pushups": "https://www.youtube.com/watch?v=tQhrk6WMcKw",
          "bench-dips": "https://www.youtube.com/watch?v=0326dy_-CzM",
          "close-grip-pushups": "https://www.youtube.com/watch?v=bTsCz0kCNJI",
          "dumbbell-rows": "https://www.youtube.com/watch?v=pYcpY20QaE8",
          "goblet-squats": "https://www.youtube.com/watch?v=MeIiIdhvXT4",
          "lunges": "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
          "dumbbell-press": "https://www.youtube.com/watch?v=qEwKCR5JCog",
          "lateral-raises": "https://www.youtube.com/watch?v=3VcKaXpzqRo",
          "bicep-curls": "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
          "tricep-dips": "https://www.youtube.com/watch?v=2z8JmcrW-As",
        };
        if (videoMapping[ex.id]) {
          ex.videoUrl = videoMapping[ex.id];
        }
      }
      return ex;
    };

    const filterExercisesByLocation = (exercises: typeof exerciseDatabase[string]) => {
      if (profile.trainingLocation === "home") {
        return exercises.filter((ex) => ex.equipment.length === 0);
      } else if (profile.trainingLocation === "minimal_equipment") {
        return exercises.filter((ex) => {
          const allowedEquipment = ["dumbbells", "resistance-bands", "pullup-bar"];
          return ex.equipment.length === 0 || ex.equipment.every(eq => allowedEquipment.includes(eq));
        });
      }
      return exercises;
    };

    const filterExercisesByInjuries = (exercises: typeof exerciseDatabase[string]) => {
      if (!profile.injuries) return exercises;

      const injuries = profile.injuries.toLowerCase();
      return exercises.filter((ex) => {
        if (injuries.includes("knee") && (ex.id.includes("squat") || ex.id.includes("lunge"))) {
          return false;
        }
        if (injuries.includes("back") && (ex.id.includes("deadlift") || ex.id.includes("row"))) {
          return false;
        }
        if (injuries.includes("shoulder") && (ex.id.includes("press") || ex.id.includes("raise"))) {
          return false;
        }
        return true;
      });
    };

    const adjustExerciseByGoal = (exercise: typeof exerciseDatabase[string][number]) => {
      const adjusted = { ...exercise };

      switch (profile.goal) {
        case "fat_loss":
          adjusted.sets = Math.min(exercise.sets + 1, 5);
          adjusted.reps = exercise.reps.includes("-")
            ? `${parseInt(exercise.reps.split("-")[0]) + 2}-${parseInt(exercise.reps.split("-")[1]) + 5}`
            : exercise.reps;
          adjusted.rest = Math.max(exercise.rest - 15, 45);
          break;
        case "muscle_gain":
          adjusted.sets = exercise.sets;
          adjusted.reps = exercise.reps.includes("-")
            ? `${Math.max(parseInt(exercise.reps.split("-")[0]) - 2, 6)}-${Math.max(parseInt(exercise.reps.split("-")[1]) - 2, 8)}`
            : exercise.reps;
          adjusted.rest = exercise.rest + 15;
          break;
        case "general_fitness":
          adjusted.sets = exercise.sets;
          adjusted.reps = exercise.reps;
          adjusted.rest = exercise.rest;
          break;
      }

      if (adjusted.recommendedWeight && profile.gender && profile.fitnessLevel) {
        const genderWeights = adjusted.recommendedWeight[profile.gender];
        adjusted.assignedWeight = genderWeights[profile.fitnessLevel];
      }

      return adjusted;
    };

    const daysOfWeek = [
      t.days.Monday,
      t.days.Tuesday,
      t.days.Wednesday,
      t.days.Thursday,
      t.days.Friday,
      t.days.Saturday,
      t.days.Sunday,
    ];

    const shouldAddRestNote = (dayIndex: number, totalDays: number, fitnessLevel: string, goal: string, activityLevel: string) => {
      if (activityLevel === "high") return null;

      if (fitnessLevel === "beginner" && totalDays >= 6) {
        if (dayIndex === 2 || dayIndex === 5) return "⚠️ يُنصح بأخذ استراحة اليوم - الجسم يحتاج للتعافي";
      }
      if (activityLevel === "none" && totalDays >= 5) {
        if (dayIndex % 2 === 0 && dayIndex > 0) return "💡 يمكنك أخذ استراحة اليوم وتركيز الأيام الأخرى";
      }
      if (goal === "fat_loss" && totalDays === 7 && fitnessLevel === "beginner") {
        if (dayIndex === 3) return "🔥 استراحة نشطة: مشي خفيف أو يوجا";
      }
      return null;
    };

    const generateWarmupExercises = () => [
      {
        id: "warmup-cardio",
        name: "General Warm-Up",
        sets: 1,
        reps: "5 min",
        rest: 0,
        muscleGroup: "Warm-up",
        equipment: [],
        description: "مشي خفيف أو قفز بالحبل أو تمارين هوائية خفيفة",
        assignedWeight: "Body weight",
        videoUrl: "https://youtu.be/-p0PA9Zt8zk?si=T8-h3y9EEMzK58a8"
      },
      {
        id: "warmup-mobility",
        name: "Dynamic Mobility",
        sets: 1,
        reps: "5 min",
        rest: 0,
        muscleGroup: "Warm-up",
        equipment: [],
        description: "Hip openers, Arm circles, Leg swings",
        assignedWeight: "Body weight",
        videoUrl: "https://www.youtube.com/watch?v=_kGESn8ArrU"
      }
    ];

    const generateCooldownExercises = () => [
      {
        id: "cooldown-stretch",
        name: "Static Stretching",
        sets: 1,
        reps: "5 min",
        rest: 0,
        muscleGroup: "Cool-down",
        equipment: [],
        description: "تمدد ثابت لجميع العضلات المستخدمة",
        assignedWeight: "Body weight",
        videoUrl: "https://www.youtube.com/watch?v=g_tea8ZNk5A"
      },
      {
        id: "cooldown-breathing",
        name: "Breathing & Recovery",
        sets: 1,
        reps: "3 min",
        rest: 0,
        muscleGroup: "Cool-down",
        equipment: [],
        description: "تنفس عميق وتمارين استرخاء",
        assignedWeight: "Body weight",
        videoUrl: "https://youtu.be/lEzaFx8k7Ew?si=VsFBnd5yvdB84mic"
      }
    ];

    const templateCycle = [];
    for (let i = 0; i < profile.availableDays; i++) {
      templateCycle.push(template[i % template.length]);
    }

    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const sessions: WorkoutSession[] = templateCycle.map((workout, index) => {
      const warmupExercises = generateWarmupExercises();
      const cooldownExercises = generateCooldownExercises();

      const mainExercises = workout.muscleGroups.flatMap((group: string) => {
        let groupExercises = exerciseDatabase[group] || [];

        groupExercises = filterExercisesByLocation(groupExercises);
        groupExercises = filterExercisesByInjuries(groupExercises);

        if (groupExercises.length === 0) {
          console.warn(`No exercises found for ${group} with current filters`);
          return [];
        }

        const exerciseCount = profile.fitnessLevel === "beginner" ? 2 :
                             profile.fitnessLevel === "intermediate" ? 3 : 4;

        const shuffledExercises = shuffleArray(groupExercises);
        const selectedExercises = shuffledExercises.slice(0, Math.min(exerciseCount, shuffledExercises.length));

        return selectedExercises.map(ex => adjustExerciseByGoal(updateVideoUrl(ex)));
      });

      const allExercises = [...warmupExercises, ...mainExercises, ...cooldownExercises];
      const restNote = shouldAddRestNote(index, profile.availableDays, profile.fitnessLevel, profile.goal, profile.activityLevel);

      return {
        id: `session-${index}`,
        day: daysOfWeek[index],
        name: workout.name,
        exercises: allExercises,
        duration: profile.sessionDuration,
        completed: false,
        restNote: restNote || undefined,
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
