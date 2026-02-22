import { User, Settings, LogOut, ChevronRight, Bell, Shield, CircleHelp, CreditCard, Arabic, Languages, UserCircle, Weight, Ruler, Activity, Target } from "lucide-react-native";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessProvider";
import { useAuth } from "@/context/AuthProvider";
import { useLanguage } from "@/context/LanguageProvider";

export const ProfileScreen = () => {
  const router = useRouter();
  const { profile, progress, isLoading: fitnessLoading } = useFitness();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [notifications, setNotifications] = useState(true);

  const handleSignOut = async () => {
    Alert.alert(
      t.profile.logout,
      t.common.confirm,
      [
        { text: t.common.cancel, style: "cancel" },
        {
          text: t.profile.logout,
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/welcome" as any);
          }
        },
      ]
    );
  };

  const toggleLanguage = async () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    await setLanguage(newLang);
  };

  if (authLoading || fitnessLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const profileItems = [
    {
      icon: <UserCircle size={22} color={Colors.primary} />,
      label: t.profile.editProfile,
      onPress: () => router.push("/onboarding" as any),
    },
    {
      icon: <Languages size={22} color={Colors.primary} />,
      label: language === 'ar' ? 'English' : 'العربية',
      onPress: toggleLanguage,
      rightElement: <Text style={styles.langBadge}>{language.toUpperCase()}</Text>
    },
    {
      icon: <Bell size={22} color={Colors.primary} />,
      label: t.profile.notifications,
      onPress: () => setNotifications(!notifications),
      rightElement: (
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={Colors.background}
        />
      ),
    },
  ];

  const supportItems = [
    {
      icon: <CircleHelp size={22} color={Colors.primary} />,
      label: t.profile.help,
      onPress: () => {},
    },
    {
      icon: <Shield size={22} color={Colors.primary} />,
      label: t.profile.privacy,
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color={Colors.primary} />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Settings size={16} color={Colors.background} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || t.profile.guest}</Text>
          <Text style={styles.userEmail}>{user?.email || t.profile.subtitle}</Text>
        </View>

        {profile && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Weight size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{profile.weight}kg</Text>
              <Text style={styles.statLabel}>{t.onboarding.weight}</Text>
            </View>
            <View style={styles.statCard}>
              <Ruler size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{profile.height}cm</Text>
              <Text style={styles.statLabel}>{t.onboarding.height}</Text>
            </View>
            <View style={styles.statCard}>
              <Target size={20} color={Colors.primary} />
              <Text style={styles.statValue}>
                {profile.goal === 'fat_loss' ? '⬇️' : profile.goal === 'muscle_gain' ? '💪' : '⚖️'}
              </Text>
              <Text style={styles.statLabel}>{t.onboarding.goal}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.title}</Text>
          <View style={styles.menuCard}>
            {profileItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === profileItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconWrapper}>{item.icon}</View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                {item.rightElement || <ChevronRight size={20} color={Colors.textLight} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.help}</Text>
          <View style={styles.menuCard}>
            {supportItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === supportItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconWrapper}>{item.icon}</View>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                </View>
                <ChevronRight size={20} color={Colors.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <LogOut size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>{t.profile.logout}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Mulhim v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.background,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editAvatarButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.text,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "500" as const,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: `${Colors.danger}10`,
    borderRadius: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.danger,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 32,
  },
  langBadge: {
    fontSize: 12,
    fontWeight: "bold" as const,
    color: Colors.primary,
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
