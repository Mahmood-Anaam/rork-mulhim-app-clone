import {
  FitnessProfile,
  NutritionAssessment,
  NutritionPlan,
  DietPattern,
  MacroDistribution
} from "@/types/fitness";

export const nutritionService = {
  calculateBMR: (profile: FitnessProfile, currentWeight: number): number => {
    const { height, age, gender } = profile;
    if (gender === "male") {
      return 10 * currentWeight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * currentWeight + 6.25 * height - 5 * age - 161;
    }
  },

  calculateTDEE: (profile: FitnessProfile, bmr: number): number => {
    const activityMultipliers: Record<number, number> = {
      0: 1.2, 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.55, 5: 1.725, 6: 1.725, 7: 1.9,
    };
    const multiplier = activityMultipliers[profile.availableDays] || 1.55;
    return bmr * multiplier;
  },

  getTargetCalories: (profile: FitnessProfile, tdee: number): number => {
    switch (profile.goal) {
      case "fat_loss": return tdee - 500;
      case "muscle_gain": return tdee + 300;
      default: return tdee;
    }
  },

  calculateMacros: (
    calories: number,
    pattern: DietPattern,
    weight: number
  ): MacroDistribution => {
    const proteinPerKg = pattern === "high_protein_carbs" ? 2.0 : pattern === "high_protein" ? 1.8 : 1.6;
    const protein = weight * proteinPerKg;
    const proteinCalories = protein * 4;

    let carbPercentage = 0.4;
    let fatPercentage = 0.3;

    if (pattern === "high_protein_carbs") {
      carbPercentage = 0.45;
      fatPercentage = 0.25;
    } else if (pattern === "high_protein") {
      carbPercentage = 0.35;
      fatPercentage = 0.3;
    } else if (pattern === "moderate_low_carb") {
      carbPercentage = 0.25;
      fatPercentage = 0.4;
    }

    const remainingCalories = calories - proteinCalories;
    const carbs = (remainingCalories * carbPercentage) / 4;
    const fats = (remainingCalories * fatPercentage) / 9;

    return {
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
    };
  },

  generateNutritionPlan: (profile: FitnessProfile, assessment: NutritionAssessment, targetCalories: number): NutritionPlan => {
    const recommendations: string[] = [];
    let dietPattern: DietPattern = "balanced";
    let proteinPriority = false;

    if (profile.goal === "muscle_gain") {
      dietPattern = "high_protein_carbs";
      proteinPriority = true;
      recommendations.push("زيادة البروتين والكربوهيدرات لبناء العضلات");
      recommendations.push("تناول الكربوهيدرات قبل وبعد التمرين");
    } else if (profile.goal === "fat_loss") {
      if (profile.availableDays >= 3) {
        dietPattern = "high_protein";
      } else {
        dietPattern = "moderate_low_carb";
        recommendations.push("تقليل الكربوهيدرات تدريجياً");
      }
      proteinPriority = true;
      recommendations.push("العجز في السعرات الحرارية لحرق الدهون");
    } else {
      dietPattern = "balanced";
      recommendations.push("نظام متوازن للصحة العامة");
    }

    if (profile.injuries && profile.injuries.toLowerCase().includes("diabetes")) {
      dietPattern = "moderate_low_carb";
      recommendations.push("تقليل الكربوهيدرات لمرضى السكري");
    }

    const macros = nutritionService.calculateMacros(targetCalories, dietPattern, profile.weight);

    const structure = assessment.mealStructure || "3_meals";
    let mealsCount = 3;
    let snacksCount = 0;

    switch (structure) {
      case "1_meal_snacks": mealsCount = 1; snacksCount = 4; break;
      case "2_meals": mealsCount = 2; snacksCount = 3; break;
      case "3_meals": mealsCount = 3; snacksCount = 2; break;
      case "3_meals_snacks": mealsCount = 3; snacksCount = 3; break;
    }

    const proteinPerMeal = macros.protein / (mealsCount + snacksCount * 0.3);

    return {
      targetCalories,
      macros,
      dietPattern,
      recommendations,
      proteinPriority,
      carbTiming: profile.goal === "muscle_gain" || profile.goal === "fat_loss" ? "around_workout" : "evenly_distributed",
      mealDistribution: {
        mealsCount,
        snacksCount,
        proteinPerMeal: Math.round(proteinPerMeal)
      },
    };
  }
};
