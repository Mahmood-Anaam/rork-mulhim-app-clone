import React from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { Bot, User, Save } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageProvider";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isPreparing?: boolean;
  onSave?: () => void;
  showSaveButton?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  isPreparing,
  onSave,
  showSaveButton,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.messageWrapper}>
      {role === "user" ? (
        <View style={styles.userMessage}>
          <Text style={styles.userMessageText}>{content}</Text>
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
              <Text style={styles.assistantMessageText}>{content}</Text>
            </View>
            {isPreparing && (
              <View style={styles.toolMessage}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.toolMessageText}>{t.coach.preparing}</Text>
              </View>
            )}
            {showSaveButton && (
              <TouchableOpacity style={styles.inlineSaveButton} onPress={onSave}>
                <Save size={16} color={Colors.primary} />
                <Text style={styles.inlineSaveButtonText}>{t.coach.save}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  toolMessageText: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    fontWeight: "600",
    color: Colors.primary,
  },
});
