/**
 * ChatMessage – renders a single chat bubble in the AI Coach screen.
 */
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Bot, User } from "lucide-react-native";
import Colors from "@/constants/colors";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Bot size={18} color={Colors.primary} />
        </View>
      )}

      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isStreaming ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={[styles.text, isUser && styles.textUser]}>{content}</Text>
        )}
      </View>

      {isUser && (
        <View style={[styles.avatar, styles.avatarUser]}>
          <User size={18} color={Colors.background} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    gap: 8,
    paddingHorizontal: 4,
  },
  rowUser: {
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarUser: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    padding: 12,
  },
  bubbleAssistant: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  textUser: {
    color: Colors.background,
  },
});
