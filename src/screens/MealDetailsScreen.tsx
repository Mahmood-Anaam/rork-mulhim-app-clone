import { ArrowLeft, Scale, CupSoda, Edit2, Save, X, Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { MealSuggestion } from "@/types/fitness";
import { useFitness } from "@/context/FitnessProvider";
import { useTranslation } from "@/context/LanguageProvider";

type MeasurementUnit = "weight" | "volume";

interface IngredientMeasurement {
  nameAr: string;
  weight: string;
  volume: string;
}

const ingredientMeasurements: Record<string, IngredientMeasurement> = {
  "فول": { nameAr: "فول", weight: "200 جرام", volume: "1 كوب" },
  "بيض": { nameAr: "بيض", weight: "100 جرام", volume: "2 حبة" },
  "زيت زيتون": { nameAr: "زيت زيتون", weight: "15 جرام", volume: "1 ملعقة كبيرة" },
  "كمون": { nameAr: "كمون", weight: "2 جرام", volume: "½ ملعقة صغيرة" },
  "ليمون": { nameAr: "ليمون", weight: "30 جرام", volume: "نصف حبة" },
  "خبز": { nameAr: "خبز", weight: "80 جرام", volume: "رغيف صغير" },
  "طماطم": { nameAr: "طماطم", weight: "150 جرام", volume: "1 حبة متوسطة" },
  "بصل": { nameAr: "بصل", weight: "100 جرام", volume: "1 حبة متوسطة" },
  "فلفل رومي": { nameAr: "فلفل رومي", weight: "120 جرام", volume: "1 حبة" },
  "بهارات": { nameAr: "بهارات", weight: "3 جرام", volume: "1 ملعقة صغيرة" },
  "لبنة": { nameAr: "لبنة", weight: "120 جرام", volume: "½ كوب" },
  "زعتر": { nameAr: "زعتر", weight: "5 جرام", volume: "1 ملعقة كبيرة" },
  "خيار": { nameAr: "خيار", weight: "100 جرام", volume: "1 حبة صغيرة" },
  "سبانخ": { nameAr: "سبانخ", weight: "50 جرام", volume: "1 كوب" },
  "جبنة": { nameAr: "جبنة", weight: "50 جرام", volume: "شريحتين" },
  "زيتون": { nameAr: "زيتون", weight: "30 جرام", volume: "6 حبات" },
  "نعناع": { nameAr: "نعناع", weight: "5 جرام", volume: "2 ملعقة كبيرة" },
  "حمص حب": { nameAr: "حمص حب", weight: "200 جرام", volume: "1 كوب" },
  "ثوم": { nameAr: "ثوم", weight: "10 جرام", volume: "2 فص" },
  "صدور دجاج": { nameAr: "صدور دجاج", weight: "200 جرام", volume: "قطعة متوسطة" },
  "أرز": { nameAr: "أرز", weight: "150 جرام", volume: "¾ كوب" },
  "خضار": { nameAr: "خضار", weight: "150 جرام", volume: "1 كوب" },
  "دجاج": { nameAr: "دجاج", weight: "250 جرام", volume: "قطعتين" },
  "أرز بسمتي": { nameAr: "أرز بسمتي", weight: "150 جرام", volume: "¾ كوب" },
  "بهارات كبسة": { nameAr: "بهارات كبسة", weight: "5 جرام", volume: "1 ملعقة صغيرة" },
  "زبيب": { nameAr: "زبيب", weight: "30 جرام", volume: "2 ملعقة كبيرة" },
  "لحم أو دجاج": { nameAr: "لحم أو دجاج", weight: "250 جرام", volume: "قطعتين" },
  "بهارات مندي": { nameAr: "بهارات مندي", weight: "5 جرام", volume: "1 ملعقة صغيرة" },
  "سمن": { nameAr: "سمن", weight: "20 جرام", volume: "1 ملعقة كبيرة" },
  "فيليه سمك": { nameAr: "فيليه سمك", weight: "200 جرام", volume: "قطعة" },
  "خضار مشكلة": { nameAr: "خضار مشكلة", weight: "200 جرام", volume: "1 كوب" },
  "باذنجان": { nameAr: "باذنجان", weight: "150 جرام", volume: "1 حبة صغيرة" },
  "قرنبيط": { nameAr: "قرنبيط", weight: "150 جرام", volume: "1 كوب" },
  "لومي": { nameAr: "لومي", weight: "3 جرام", volume: "2 حبة" },
  "لحم غنم": { nameAr: "لحم غنم", weight: "200 جرام", volume: "قطع متوسطة" },
  "صلصة طماطم": { nameAr: "صلصة طماطم", weight: "100 جرام", volume: "½ كوب" },
  "لحم بقري أو غنم": { nameAr: "لحم بقري أو غنم", weight: "200 جرام", volume: "قطع" },
  "سلطة مشكلة": { nameAr: "سلطة مشكلة", weight: "150 جرام", volume: "1 كوب" },
  "صوص ثوم": { nameAr: "صوص ثوم", weight: "30 جرام", volume: "2 ملعقة كبيرة" },
  "مخللات": { nameAr: "مخللات", weight: "50 جرام", volume: "4 قطع" },
  "خس": { nameAr: "خس", weight: "30 جرام", volume: "½ كوب" },
  "لحم مفروم": { nameAr: "لحم مفروم", weight: "200 جرام", volume: "قدر كف اليد" },
  "بقدونس": { nameAr: "بقدونس", weight: "10 جرام", volume: "2 ملعقة كبيرة" },
  "مرق": { nameAr: "مرق", weight: "300 جرام", volume: "1½ كوب" },
  "سمك": { nameAr: "سمك", weight: "200 جرام", volume: "قطعة" },
  "زبادي": { nameAr: "زبادي", weight: "150 جرام", volume: "¾ كوب" },
  "عدس": { nameAr: "عدس", weight: "100 جرام", volume: "½ كوب" },
  "جزر": { nameAr: "جزر", weight: "100 جرام", volume: "1 حبة متوسطة" },
  "تمر": { nameAr: "تمر", weight: "40 جرام", volume: "3 حبات" },
  "لوز": { nameAr: "لوز", weight: "30 جرام", volume: "10 حبات" },
  "زبادي يوناني": { nameAr: "زبادي يوناني", weight: "150 جرام", volume: "¾ كوب" },
  "عسل": { nameAr: "عسل", weight: "20 جرام", volume: "1 ملعقة كبيرة" },
  "حمص": { nameAr: "حمص", weight: "100 جرام", volume: "½ كوب" },
  "طحينة": { nameAr: "طحينة", weight: "30 جرام", volume: "2 ملعقة كبيرة" },
  "جوز": { nameAr: "جوز", weight: "30 جرام", volume: "8 حبات" },
  "كاجو": { nameAr: "كاجو", weight: "30 جرام", volume: "10 حبات" },
  "فواكه مشكلة": { nameAr: "فواكه مشكلة", weight: "200 جرام", volume: "1 كوب" },
  "عصير ليمون": { nameAr: "عصير ليمون", weight: "15 جرام", volume: "1 ملعقة كبيرة" },
};

export const MealDetailsScreen = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { updateMealInPlan } = useFitness();
  const { t, language } = useTranslation();
  const [measurementUnit, setMeasurementUnit] = useState<MeasurementUnit>("weight");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const dayId = params.dayId as string | undefined;
  const mealType = params.mealType as "breakfast" | "lunch" | "dinner" | "snack" | undefined;
  const snackIndex = params.snackIndex ? parseInt(params.snackIndex as string) : undefined;

  let originalMeal: MealSuggestion | null = null;
  let parseError = false;

  try {
    const mealParam = params.meal;
    if (!mealParam) {
      throw new Error('Meal parameter is missing');
    }

    const mealStr = String(mealParam);
    if (
      mealStr.startsWith('[object') ||
      mealStr === 'undefined' ||
      mealStr === 'null' ||
      mealStr === 'object Object' ||
      mealStr.startsWith('object')
    ) {
      throw new Error('Invalid JSON: received invalid string');
    }

    if (typeof mealParam === 'string') {
      let decodedMeal = mealParam;
      try {
        decodedMeal = decodeURIComponent(mealParam);
      } catch {
        // URI decode not needed or failed, using original
      }
      originalMeal = JSON.parse(decodedMeal);
    } else {
      originalMeal = mealParam as unknown as MealSuggestion;
    }
  } catch (error) {
    console.error('Error parsing meal data:', error);
    parseError = true;
  }

  const [editedMeal, setEditedMeal] = useState<MealSuggestion | null>(originalMeal);
  const [editedIngredients, setEditedIngredients] = useState<{ nameAr: string; weight: string; volume: string }[]>(originalMeal ? originalMeal.ingredientsAr.map(ing => {
    const measurement = ingredientMeasurements[ing] || { nameAr: ing, weight: "حسب الحاجة", volume: "حسب الحاجة" };
    return measurement;
  }) : []);

  React.useEffect(() => {
    if (parseError || !originalMeal) {
      Alert.alert(t.common.error, t.mealDetails.errorLoading, [
        {
          text: t.mealDetails.ok,
          onPress: () => router.back(),
        },
      ]);
    }
  }, [parseError, originalMeal, router, t]);

  if (!editedMeal || !originalMeal) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.mealDetails.title}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: Colors.textSecondary }}>{t.mealDetails.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (editedMeal.calories <= 0 || editedMeal.protein < 0 || editedMeal.carbs < 0 || editedMeal.fats < 0) {
      Alert.alert(t.common.error, t.mealDetails.invalidValues);
      return;
    }

    const finalMeal = {
      ...editedMeal,
      ingredientsAr: editedIngredients.map(ing => ing.nameAr),
      ingredients: editedIngredients.map(ing => ing.nameAr),
    };

    if (dayId && mealType && updateMealInPlan) {
      await updateMealInPlan(dayId, mealType, finalMeal, snackIndex);
      Alert.alert(t.common.success, t.common.success);
      setIsEditing(false);
      router.back();
    } else {
      Alert.alert(t.common.success, t.common.success);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedMeal(originalMeal);
    setEditedIngredients(originalMeal ? originalMeal.ingredientsAr.map(ing => {
      const measurement = ingredientMeasurements[ing] || { nameAr: ing, weight: "حسب الحاجة", volume: "حسب الحاجة" };
      return measurement;
    }) : []);
    setIsEditing(false);
  };

  const addIngredient = () => {
    const defaultWeight = language === 'ar' ? "حسب الحاجة" : "As needed";
    setEditedIngredients([...editedIngredients, { nameAr: "", weight: defaultWeight, volume: defaultWeight }]);
  };

  const removeIngredient = (index: number) => {
    setEditedIngredients(editedIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: "nameAr" | "weight" | "volume", value: string) => {
    const updated = [...editedIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setEditedIngredients(updated);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.mealDetails.title}</Text>
        {!isEditing ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Edit2 size={20} color={Colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <X size={20} color={Colors.danger} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Save size={20} color={Colors.success} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mealCard}>
          {isEditing ? (
            <>
              <Text style={styles.editLabel}>اسم الوجبة</Text>
              <TextInput
                style={styles.editInput}
                value={editedMeal.nameAr}
                onChangeText={(text) => setEditedMeal({ ...editedMeal, nameAr: text })}
                placeholder="اسم الوجبة بالعربي"
                placeholderTextColor={Colors.textLight}
              />
              <TextInput
                style={[styles.editInput, { marginBottom: 16 }]}
                value={editedMeal.name}
                onChangeText={(text) => setEditedMeal({ ...editedMeal, name: text })}
                placeholder="اسم الوجبة بالإنجليزي"
                placeholderTextColor={Colors.textLight}
              />
            </>
          ) : (
            <>
              <Text style={styles.mealName}>{editedMeal.nameAr}</Text>
              <Text style={styles.mealNameEn}>{editedMeal.name}</Text>
            </>
          )}

          <View style={styles.macrosCard}>
            <View style={styles.macroItem}>
              {isEditing ? (
                <TextInput
                  style={styles.macroInput}
                  value={String(editedMeal.calories)}
                  onChangeText={(text) => setEditedMeal({ ...editedMeal, calories: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                />
              ) : (
                <Text style={styles.macroValue}>{editedMeal.calories}</Text>
              )}
              <Text style={styles.macroLabel}>سعرة</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              {isEditing ? (
                <TextInput
                  style={styles.macroInput}
                  value={String(editedMeal.protein)}
                  onChangeText={(text) => setEditedMeal({ ...editedMeal, protein: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                />
              ) : (
                <Text style={styles.macroValue}>{editedMeal.protein}g</Text>
              )}
              <Text style={styles.macroLabel}>🍗 بروتين</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              {isEditing ? (
                <TextInput
                  style={styles.macroInput}
                  value={String(editedMeal.carbs)}
                  onChangeText={(text) => setEditedMeal({ ...editedMeal, carbs: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                />
              ) : (
                <Text style={styles.macroValue}>{editedMeal.carbs}g</Text>
              )}
              <Text style={styles.macroLabel}>🍚 كارب</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              {isEditing ? (
                <TextInput
                  style={styles.macroInput}
                  value={String(editedMeal.fats)}
                  onChangeText={(text) => setEditedMeal({ ...editedMeal, fats: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={Colors.textLight}
                />
              ) : (
                <Text style={styles.macroValue}>{editedMeal.fats}g</Text>
              )}
              <Text style={styles.macroLabel}>🥑 دهون</Text>
            </View>
          </View>
        </View>

        <View style={styles.measurementToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              measurementUnit === "weight" && styles.toggleButtonActive,
            ]}
            onPress={() => setMeasurementUnit("weight")}
          >
            <Scale size={18} color={measurementUnit === "weight" ? Colors.background : Colors.textLight} />
            <Text
              style={[
                styles.toggleButtonText,
                measurementUnit === "weight" && styles.toggleButtonTextActive,
              ]}
            >
              الوزن
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              measurementUnit === "volume" && styles.toggleButtonActive,
            ]}
            onPress={() => setMeasurementUnit("volume")}
          >
            <CupSoda size={18} color={measurementUnit === "volume" ? Colors.background : Colors.textLight} />
            <Text
              style={[
                styles.toggleButtonText,
                measurementUnit === "volume" && styles.toggleButtonTextActive,
              ]}
            >
              الأكواب / المعالق
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>المكونات</Text>
            {isEditing && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={addIngredient}
              >
                <Plus size={18} color={Colors.primary} />
                <Text style={styles.addButtonText}>إضافة مكون</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.ingredientsList}>
            {editedIngredients.map((ingredient, index) => {
              return (
                <View key={`ingredient-${index}`} style={styles.ingredientItem}>
                  {!isEditing && <View style={styles.ingredientDot} />}
                  <View style={styles.ingredientContent}>
                    {isEditing ? (
                      <>
                        <View style={styles.ingredientEditRow}>
                          <TextInput
                            style={[styles.ingredientInput, { flex: 1 }]}
                            value={ingredient.nameAr}
                            onChangeText={(text) => updateIngredient(index, "nameAr", text)}
                            placeholder="اسم المكون"
                            placeholderTextColor={Colors.textLight}
                          />
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => removeIngredient(index)}
                          >
                            <Trash2 size={18} color={Colors.danger} />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.measurementRow}>
                          <View style={styles.measurementInputContainer}>
                            <Text style={styles.measurementLabel}>الوزن:</Text>
                            <TextInput
                              style={styles.ingredientInput}
                              value={ingredient.weight}
                              onChangeText={(text) => updateIngredient(index, "weight", text)}
                              placeholder="مثال: 200 جرام"
                              placeholderTextColor={Colors.textLight}
                            />
                          </View>
                          <View style={styles.measurementInputContainer}>
                            <Text style={styles.measurementLabel}>الحجم:</Text>
                            <TextInput
                              style={styles.ingredientInput}
                              value={ingredient.volume}
                              onChangeText={(text) => updateIngredient(index, "volume", text)}
                              placeholder="مثال: 1 كوب"
                              placeholderTextColor={Colors.textLight}
                            />
                          </View>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={styles.ingredientName}>{ingredient.nameAr}</Text>
                        <Text style={styles.ingredientQuantity}>
                          {measurementUnit === "weight" ? ingredient.weight : ingredient.volume}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>💡 ملاحظة</Text>
          <Text style={styles.noteText}>
            الكميات المذكورة تقريبية ويمكن تعديلها حسب احتياجاتك الغذائية وتفضيلاتك الشخصية
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editActions: {
    flexDirection: "row",
    gap: 8,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.success,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  macroInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 50,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  mealCard: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  mealName: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.text,
    textAlign: "center",
  },
  mealNameEn: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  macrosCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 8,
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.text,
  },
  macroLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  macroDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  measurementToggle: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textLight,
  },
  toggleButtonTextActive: {
    color: Colors.background,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.text,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  ingredientsList: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 4,
  },
  ingredientDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 8,
  },
  ingredientContent: {
    flex: 1,
    gap: 4,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  noteCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.text,
  },
  noteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  ingredientEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  ingredientInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  measurementRow: {
    flexDirection: "row",
    gap: 8,
  },
  measurementInputContainer: {
    flex: 1,
    gap: 4,
  },
  measurementLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
});
