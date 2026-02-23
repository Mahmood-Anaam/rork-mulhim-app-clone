import { Sparkles, Send, Bot, User, Save } from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessProvider";
import { useLanguage } from "@/context/LanguageProvider";
import { useAICoach } from "@/hooks/useAICoach";

export const CoachScreen = () => {
  const { t } = useLanguage();
  const {
    profile,
    getCurrentStreak,
    currentWeekPlan,
    updateWeekPlan,
    currentMealPlan,
    addMealToDay,
    addFavoriteExercise,
    addFavoriteMeal,
  } = useFitness();

  const [input, setInput] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveModalType, setSaveModalType] = useState<"workout" | "meal" | null>(null);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack" | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [saveToFavorites, setSaveToFavorites] = useState<boolean>(false);
  const [selectedWorkoutDays, setSelectedWorkoutDays] = useState<string[]>([]);
  const [saveWorkoutToFavorites, setSaveWorkoutToFavorites] = useState<boolean>(false);

  const { messages, isLoading, error, sendMessage } = useAICoach();

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleQuickAction = (message: string) => {
    if (!isLoading) {
      sendMessage(message);
    }
  };

  const openSaveModal = (type: "workout" | "meal", data: any) => {
    setSaveModalType(type);
    setSelectedData(data);
    setShowSaveModal(true);
  };

  const handleSaveWorkout = () => {
    if (!selectedData) return;

    let savedToFavorites = false;
    let savedToPlan = false;

    const exercisesWithIds = selectedData.exercises.map((ex: any, index: number) => ({
      id: `ai-exercise-${Date.now()}-${index}-${Math.random()}`,
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      muscleGroup: selectedData.muscleGroup,
      equipment: [],
      assignedWeight: "حسب قدرتك",
    }));

    if (saveWorkoutToFavorites && addFavoriteExercise) {
      exercisesWithIds.forEach((ex: any) => {
        addFavoriteExercise({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          muscleGroup: ex.muscleGroup,
          equipment: ex.equipment,
          assignedWeight: ex.assignedWeight,
        });
      });
      savedToFavorites = true;
    }

    if (currentWeekPlan && selectedWorkoutDays.length > 0) {
      const updatedSessions = currentWeekPlan.sessions.map((session) => {
        if (selectedWorkoutDays.includes(session.id)) {
          const newExercises = selectedData.exercises.map((ex: any, index: number) => ({
            id: `ai-exercise-${Date.now()}-${index}-${Math.random()}-${session.id}`,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            rest: ex.rest,
            muscleGroup: selectedData.muscleGroup,
            equipment: [],
            assignedWeight: "حسب قدرتك",
          }));
          return {
            ...session,
            exercises: [...session.exercises, ...newExercises],
          };
        }
        return session;
      });

      updateWeekPlan({
        ...currentWeekPlan,
        sessions: updatedSessions,
      });
      savedToPlan = true;
    }

    if (savedToFavorites && savedToPlan) {
      Alert.alert(t.common.success, t.common.success);
    } else if (savedToFavorites || savedToPlan) {
      Alert.alert(t.common.success, t.common.success);
    }

    setShowSaveModal(false);
    setSelectedWorkoutDays([]);
    setSaveWorkoutToFavorites(false);
  };

  const handleSaveMeal = () => {
    if (!selectedData) return;

    let savedToFavorites = false;
    let savedToPlan = false;

    const mealToAdd = {
      id: `ai-meal-${Date.now()}`,
      name: selectedData.mealName,
      nameAr: selectedData.mealName,
      type: selectedData.mealType,
      calories: selectedData.calories,
      protein: selectedData.protein,
      carbs: Math.round(selectedData.calories * 0.4 / 4),
      fats: Math.round(selectedData.calories * 0.3 / 9),
      ingredients: selectedData.ingredients,
      ingredientsAr: selectedData.ingredients,
    };

    if (saveToFavorites && addFavoriteMeal) {
      addFavoriteMeal({
        name: selectedData.mealName,
        nameAr: selectedData.mealName,
        type: selectedData.mealType,
        calories: selectedData.calories,
        protein: selectedData.protein,
        carbs: Math.round(selectedData.calories * 0.4 / 4),
        fats: Math.round(selectedData.calories * 0.3 / 9),
        ingredients: selectedData.ingredients,
        ingredientsAr: selectedData.ingredients,
      });
      savedToFavorites = true;
    }

    if (currentMealPlan && selectedDays.length > 0 && selectedMealType && addMealToDay) {
      selectedDays.forEach(dayId => {
        addMealToDay(dayId, mealToAdd, selectedMealType);
      });
      savedToPlan = true;
    }

    if (savedToFavorites || savedToPlan) {
      Alert.alert(t.common.success, t.common.success);
    }

    setShowSaveModal(false);
    setSelectedMealType(null);
    setSelectedDays([]);
    setSaveToFavorites(false);
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
        <TouchableOpacity
          style={[styles.quickActionButton, isLoading && styles.quickActionButtonDisabled]}
          onPress={() => handleQuickAction("اقترح لي تمرين اليوم")}
          disabled={isLoading}
        >
          <Text style={styles.quickActionText}>{t.coach.todayWorkout}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, isLoading && styles.quickActionButtonDisabled]}
          onPress={() => handleQuickAction("اقترح لي وجبة غداء سعودية صحية")}
          disabled={isLoading}
        >
          <Text style={styles.quickActionText}>{t.coach.todayMeal}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, isLoading && styles.quickActionButtonDisabled]}
          onPress={() => handleQuickAction("كيف تقدمي حتى الآن؟")}
          disabled={isLoading}
        >
          <Text style={styles.quickActionText}>{t.coach.analyzeProgress}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionButton, isLoading && styles.quickActionButtonDisabled]}
          onPress={() => handleQuickAction("نصائح لتحسين نتائجي")}
          disabled={isLoading}
        >
          <Text style={styles.quickActionText}>{t.coach.tips}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconWrapper}>
              <Sparkles size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.title}>{t.coach.title}</Text>
              <Text style={styles.subtitle}>{t.coach.subtitle}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatValue}>{getCurrentStreak ? getCurrentStreak() : 0}</Text>
              <Text style={styles.miniStatLabel}>يوم</Text>
            </View>
          </View>
        </View>

        {messages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <Bot size={48} color={Colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>{profile?.gender === 'male' ? t.coach.welcomeHero : t.coach.welcomeHeroine}</Text>
            <Text style={styles.welcomeText}>
              {t.coach.welcomeText}
            </Text>
            <View style={styles.welcomeFeatures}>
              <Text style={styles.welcomeFeature}>{t.coach.feature1}</Text>
              <Text style={styles.welcomeFeature}>{t.coach.feature2}</Text>
              <Text style={styles.welcomeFeature}>{t.coach.feature3}</Text>
              <Text style={styles.welcomeFeature}>{t.coach.feature4}</Text>
            </View>
            <Text style={styles.welcomePrompt}>{t.coach.tryButtons}</Text>
          </View>
        )}

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View key={message.id} style={styles.messageWrapper}>
              {message.role === "user" ? (
                <View style={styles.userMessage}>
                  <Text style={styles.userMessageText}>{message.content}</Text>
                  <View style={styles.userAvatar}>
                    <User size={16} color={Colors.background} />
                  </View>
                </View>
              ) : (
                <View style={styles.assistantMessage}>
                  <View style={styles.assistantAvatar}>
                    <Bot size={16} color={Colors.primary} />
                  </View>
                  <View style={styles.assistantMessageContent}>
                    <View>
                      <Text style={styles.assistantMessageText}>
                        {message.content}
                      </Text>
                    </View>
                    {message.toolName && message.toolData && (
                      <TouchableOpacity
                        style={styles.inlineSaveButton}
                        onPress={() => {
                          if (message.toolName === 'suggestWorkout') {
                            openSaveModal('workout', message.toolData);
                          } else if (message.toolName === 'suggestMeal') {
                            openSaveModal('meal', message.toolData);
                          }
                        }}
                      >
                        <Save size={16} color={Colors.primary} />
                        <Text style={styles.inlineSaveButtonText}>{t.coach.save}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          ))}

          {isLoading && (
            <View style={styles.toolMessage}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.toolMessageText}>{t.coach.preparing}</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorMessage}>
              <Text style={styles.errorText}>{error || t.coach.errorOccurred}</Text>
            </View>
          )}
        </ScrollView>

        {renderQuickActions()}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, isLoading && styles.inputDisabled]}
            placeholder={t.coach.askCoach}
            placeholderTextColor={Colors.textLight}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.background} />
            ) : (
              <Send size={20} color={Colors.background} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {saveModalType === "workout" ? t.coach.saveWorkout : t.coach.saveMeal}
            </Text>

            {saveModalType === "workout" ? (
              <ScrollView>
                <View style={styles.modalSection}>
                  <TouchableOpacity
                    style={[styles.checkboxOption, saveWorkoutToFavorites && styles.checkboxOptionSelected]}
                    onPress={() => setSaveWorkoutToFavorites(!saveWorkoutToFavorites)}
                  >
                    <View style={[styles.checkbox, saveWorkoutToFavorites && styles.checkboxChecked]}>
                      {saveWorkoutToFavorites && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>{t.coach.saveToFavorites}</Text>
                  </TouchableOpacity>

                  {currentWeekPlan && (
                    <View style={{ marginTop: 16 }}>
                      <View style={styles.daysSelectionHeader}>
                        <Text style={styles.modalSectionTitle}>{t.coach.addToPlan}:</Text>
                        <TouchableOpacity
                          onPress={() => {
                            if (selectedWorkoutDays.length === currentWeekPlan.sessions.length) {
                              setSelectedWorkoutDays([]);
                            } else {
                              setSelectedWorkoutDays(currentWeekPlan.sessions.map(s => s.id));
                            }
                          }}
                        >
                          <Text style={styles.selectAllButton}>
                            {selectedWorkoutDays.length === currentWeekPlan.sessions.length ? t.common.deselectAll : t.common.selectAll}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.compactRowWrap}>
                        {currentWeekPlan.sessions.map((session) => (
                          <TouchableOpacity
                            key={session.id}
                            style={[
                              styles.compactButton,
                              selectedWorkoutDays.includes(session.id) && styles.compactButtonSelected
                            ]}
                            onPress={() => {
                              if (selectedWorkoutDays.includes(session.id)) {
                                setSelectedWorkoutDays(selectedWorkoutDays.filter(id => id !== session.id));
                              } else {
                                setSelectedWorkoutDays([...selectedWorkoutDays, session.id]);
                              }
                            }}
                          >
                            <Text style={[
                              styles.compactButtonText,
                              selectedWorkoutDays.includes(session.id) && styles.compactButtonTextSelected
                            ]}>{session.day}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            ) : (
              <ScrollView>
                <View style={styles.modalSection}>
                  <TouchableOpacity
                    style={[styles.checkboxOption, saveToFavorites && styles.checkboxOptionSelected]}
                    onPress={() => setSaveToFavorites(!saveToFavorites)}
                  >
                    <View style={[styles.checkbox, saveToFavorites && styles.checkboxChecked]}>
                      {saveToFavorites && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>{t.coach.saveToFavorites}</Text>
                  </TouchableOpacity>

                  {currentMealPlan && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={styles.modalSectionTitle}>إضافة للخطة</Text>

                      <Text style={styles.compactLabel}>النوع:</Text>
                      <View style={styles.compactRow}>
                        {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.compactButton,
                              selectedMealType === type && styles.compactButtonSelected
                            ]}
                            onPress={() => setSelectedMealType(type as any)}
                          >
                            <Text style={[
                              styles.compactButtonText,
                              selectedMealType === type && styles.compactButtonTextSelected
                            ]}>{(t.nutrition as any)[type]}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <View style={styles.daysSelectionHeader}>
                        <Text style={styles.compactLabel}>الأيام:</Text>
                        <TouchableOpacity
                          onPress={() => {
                            if (selectedDays.length === currentMealPlan.days.length) {
                              setSelectedDays([]);
                            } else {
                              setSelectedDays(currentMealPlan.days.map(d => d.id));
                            }
                          }}
                        >
                          <Text style={styles.selectAllButton}>
                            {selectedDays.length === currentMealPlan.days.length ? t.common.deselectAll : t.common.selectAll}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.compactRowWrap}>
                        {currentMealPlan.days.map((day) => (
                          <TouchableOpacity
                            key={day.id}
                            style={[
                              styles.compactButton,
                              selectedDays.includes(day.id) && styles.compactButtonSelected
                            ]}
                            onPress={() => {
                              if (selectedDays.includes(day.id)) {
                                setSelectedDays(selectedDays.filter(id => id !== day.id));
                              } else {
                                setSelectedDays([...selectedDays, day.id]);
                              }
                            }}
                          >
                            <Text style={[
                              styles.compactButtonText,
                              selectedDays.includes(day.id) && styles.compactButtonTextSelected
                            ]}>{day.day}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowSaveModal(false);
                  setSaveToFavorites(false);
                  setSaveWorkoutToFavorites(false);
                  setSelectedMealType(null);
                  setSelectedDays([]);
                  setSelectedWorkoutDays([]);
                }}
              >
                <Text style={styles.modalCancelButtonText}>{t.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  saveModalType === "workout"
                    ? (!saveWorkoutToFavorites && selectedWorkoutDays.length === 0) && styles.modalConfirmButtonDisabled
                    : (!saveToFavorites && (!selectedMealType || selectedDays.length === 0)) && styles.modalConfirmButtonDisabled
                ]}
                onPress={saveModalType === "workout" ? handleSaveWorkout : handleSaveMeal}
                disabled={
                  saveModalType === "workout"
                    ? (!saveWorkoutToFavorites && selectedWorkoutDays.length === 0)
                    : (!saveToFavorites && (!selectedMealType || selectedDays.length === 0))
                }
              >
                <Text style={styles.modalConfirmButtonText}>{t.coach.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  miniStat: {
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  miniStatValue: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.primary,
  },
  miniStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  welcomeContainer: {
    padding: 24,
    alignItems: "center",
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeFeatures: {
    gap: 8,
    marginBottom: 16,
  },
  welcomeFeature: {
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
  },
  welcomePrompt: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: "center",
    fontStyle: "italic" as const,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  userMessage: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 8,
  },
  userMessageText: {
    backgroundColor: Colors.primary,
    color: Colors.background,
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    fontSize: 15,
    maxWidth: "80%",
    lineHeight: 20,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assistantMessageContent: {
    flex: 1,
    gap: 8,
  },
  assistantMessageText: {
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    fontSize: 15,
    maxWidth: "90%",
    lineHeight: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    margin: 16,
  },
  toolMessageText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  errorMessage: {
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    marginTop: 8,
    marginHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.danger,
    textAlign: "center",
  },
  quickActions: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  quickActionsScroll: {
    padding: 12,
    gap: 8,
  },
  quickActionButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionButtonDisabled: {
    opacity: 0.5,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  inlineSaveButton: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  inlineSaveButtonText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: Colors.background,
  },
  compactLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 8,
  },
  compactRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  compactRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  compactButton: {
    backgroundColor: Colors.background,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compactButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  compactButtonText: {
    fontSize: 12,
    color: Colors.text,
  },
  compactButtonTextSelected: {
    color: Colors.background,
    fontWeight: "600" as const,
  },
  daysSelectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  selectAllButton: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkboxOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  modalConfirmButtonDisabled: {
    opacity: 0.4,
  },
});
