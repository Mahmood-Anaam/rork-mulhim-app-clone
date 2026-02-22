import {
  FitnessProfile,
  NutritionAssessment,
  NutritionPlan,
  DietPattern,
  MacroDistribution,
  MealSuggestion
} from '@/types/fitness';

export const calculateBMR = (profile: FitnessProfile): number => {
  const { height, age, gender, weight } = profile;
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

export const calculateTDEE = (profile: FitnessProfile): number => {
  const bmr = calculateBMR(profile);
  const activityMultipliers: Record<number, number> = {
    0: 1.2, 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.55, 5: 1.725, 6: 1.725, 7: 1.9,
  };
  const multiplier = activityMultipliers[profile.availableDays] || 1.55;
  return bmr * multiplier;
};

export const getTargetCalories = (profile: FitnessProfile): number => {
  const tdee = calculateTDEE(profile);
  switch (profile.goal) {
    case "fat_loss": return tdee - 500;
    case "muscle_gain": return tdee + 300;
    default: return tdee;
  }
};

export const calculateMacros = (
  calories: number,
  pattern: DietPattern,
  profile: FitnessProfile
): MacroDistribution => {
  const proteinPerKg = pattern === "high_protein_carbs" ? 2.0 : pattern === "high_protein" ? 1.8 : 1.6;
  const protein = profile.weight * proteinPerKg;
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
};

export const calculateMealDistribution = (
  structure: "1_meal_snacks" | "2_meals" | "3_meals" | "3_meals_snacks",
  totalProtein: number
) => {
  let mealsCount = 3;
  let snacksCount = 0;

  switch (structure) {
    case "1_meal_snacks": mealsCount = 1; snacksCount = 4; break;
    case "2_meals": mealsCount = 2; snacksCount = 3; break;
    case "3_meals": mealsCount = 3; snacksCount = 2; break;
    case "3_meals_snacks": mealsCount = 3; snacksCount = 3; break;
  }

  const proteinPerMeal = totalProtein / (mealsCount + snacksCount * 0.3);
  return { mealsCount, snacksCount, proteinPerMeal: Math.round(proteinPerMeal) };
};

export const estimateCurrentProtein = (dietHistory: NutritionAssessment["dietHistory"]): number => {
  const allMeals = [...dietHistory.breakfast, ...dietHistory.lunch, ...dietHistory.dinner, ...dietHistory.snacks];
  let proteinEstimate = 0;
  const proteinKeywords = ["دجاج", "لحم", "سمك", "بيض", "بروتين", "chicken", "meat", "fish", "egg"];
  allMeals.forEach((meal) => {
    const lowerMeal = meal.toLowerCase();
    const hasProtein = proteinKeywords.some((keyword) => lowerMeal.includes(keyword));
    if (hasProtein) proteinEstimate += 25;
  });
  return proteinEstimate;
};

export const generateNutritionPlan = (profile: FitnessProfile, assessment: NutritionAssessment): NutritionPlan => {
  const targetCalories = getTargetCalories(profile);
  const recommendations: string[] = [];
  let dietPattern: DietPattern = "balanced";
  let proteinPriority = false;
  let carbTiming: "around_workout" | "evenly_distributed" = "evenly_distributed";

  if (profile.goal === "muscle_gain") {
    dietPattern = "high_protein_carbs";
    proteinPriority = true;
    carbTiming = "around_workout";
    recommendations.push("زيادة البروتين والكربوهيدرات لبناء العضلات");
    recommendations.push("تناول الكربوهيدرات قبل وبعد التمرين");
  } else if (profile.goal === "fat_loss") {
    if (profile.availableDays >= 3) {
      dietPattern = "high_protein";
      carbTiming = "around_workout";
      recommendations.push("بروتين عالي للحفاظ على العضلات أثناء نزول الوزن");
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

  const macros = calculateMacros(targetCalories, dietPattern, profile);
  const mealDistribution = calculateMealDistribution(
    assessment.mealStructure || "3_meals",
    macros.protein
  );

  if (assessment.ffq.vegetables === "rarely" || assessment.ffq.vegetables === "never") {
    recommendations.push("زيادة تناول الخضروات تدريجياً");
  }
  if (assessment.ffq.fish === "rarely" || assessment.ffq.fish === "never") {
    recommendations.push("إضافة السمك للحصول على أوميغا 3");
  }

  const currentProtein = estimateCurrentProtein(assessment.dietHistory);
  if (currentProtein < macros.protein) {
    recommendations.push(`زيادة البروتين من ${Math.round(currentProtein)}g إلى ${Math.round(macros.protein)}g`);
  }

  return {
    targetCalories,
    macros,
    dietPattern,
    recommendations,
    proteinPriority,
    carbTiming,
    mealDistribution,
  };
};

export const extractFavoriteMealsFromHistory = (dietHistory: NutritionAssessment["dietHistory"]): MealSuggestion[] => {
  const favorites: MealSuggestion[] = [];
  const mealMap: Record<string, { type: "breakfast" | "lunch" | "dinner" | "snack"; names: string[] }> = {
    breakfast: { type: "breakfast" as const, names: dietHistory.breakfast },
    lunch: { type: "lunch" as const, names: dietHistory.lunch },
    dinner: { type: "dinner" as const, names: dietHistory.dinner },
    snacks: { type: "snack" as const, names: dietHistory.snacks },
  };

  const estimateMealCalories = (type: string) => type === "snack" ? 150 : type === "breakfast" ? 350 : 500;

  Object.entries(mealMap).forEach(([key, value]) => {
    value.names.forEach((mealName) => {
      const meal: MealSuggestion = {
        id: `fav-${Date.now()}-${Math.random()}`,
        name: mealName,
        nameAr: mealName,
        type: value.type,
        calories: estimateMealCalories(value.type),
        protein: 20, // Dummy value
        carbs: 40,   // Dummy value
        fats: 15,    // Dummy value
        ingredients: [mealName],
        ingredientsAr: [mealName],
      };
      favorites.push(meal);
    });
  });
  return favorites;
};
