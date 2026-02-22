# دليل المعمارية — تطبيق ملهم

## نظرة عامة

يتبع ملهم **معمارية طبقية قائمة على الميزات** مصممة للصيانة والاختبار والتوسع.

```
┌─────────────────────────────────────────────────────────────┐
│                   الشاشات (app/)                            │
│        Expo Router • توجيه قائم على الملفات                 │
├──────────────────────────┬──────────────────────────────────┤
│     المكونات             │          الـ Hooks               │
│  (components/)           │         (hooks/)                 │
│  عناصر UI قابلة للإعادة  │  منطق الأعمال المُستخلص          │
├──────────────────────────┴──────────────────────────────────┤
│               المزودون (providers/)                         │
│    AuthProvider • FitnessProvider • LanguageProvider        │
├─────────────────────────────────────────────────────────────┤
│               طبقة الخدمات (lib/)                           │
│      supabase.ts • remoteFitnessRepo.ts • trpc.ts           │
├─────────────────────────────────────────────────────────────┤
│               الخدمات الخارجية                              │
│     Supabase (PostgreSQL) • OpenAI • AsyncStorage           │
└─────────────────────────────────────────────────────────────┘
```

---

## وصف الطبقات

### 1. الشاشات (`app/`)

شاشات Expo Router. الشاشات **نحيلة** — تقوم بـ:
- استيراد وتكوين المكونات
- استخدام الـ Hooks لمنطق الأعمال
- معالجة التنقل بين الشاشات

### 2. المكونات (`components/`)

مُنظَّمة حسب الميزة، مع مكونات مشتركة في `ui/`.

```
components/
├── ui/
│   ├── Button.tsx          زر أساسي/ثانوي/خطر
│   ├── Card.tsx            حاوية بطاقة مرتفعة
│   ├── LoadingScreen.tsx   مؤشر تحميل الشاشة الكاملة
│   └── StatBox.tsx         أداة إحصائية (أيقونة + قيمة + تسمية)
├── plan/
│   ├── ExerciseItem.tsx    صف تمرين واحد
│   └── WeekProgressCard.tsx شريط التقدم الأسبوعي
├── nutrition/
│   ├── MacroSummaryCard.tsx عرض السعرات والماكرو
│   └── MealCard.tsx        صف وجبة مع تبديل الإتمام
├── coach/
│   └── ChatMessage.tsx     فقاعة محادثة AI
└── profile/
    └── ProfileStats.tsx    صف صناديق الإحصاء
```

### 3. الـ Hooks (`hooks/`)

Hooks مخصصة تستخلص وتمركز منطق الأعمال.

| الـ Hook | الغرض |
|---------|-------|
| `useProgressStats` | إحصاءات مشتقة (BMI، تغيير الوزن، الإنجاز) |
| `usePlanGeneration` | خوارزمية توليد خطة التمرين |
| `useMealPlan` | عمليات خطة الوجبات ومقاييس مشتقة |

### 4. المزودون (`providers/`)

#### `AuthProvider`
- يدير جلسة مصادقة Supabase
- يُعرض: `user`, `session`, `isAuthenticated`, `signIn`, `signUp`, `signOut`

#### `FitnessProvider`
- الحالة المركزية لجميع بيانات اللياقة
- **تسلسل التشغيل:**
  1. التحميل من `AsyncStorage` (سريع، أولوية للوضع غير المتصل)
  2. الجلب من Supabase (مزامنة خلفية)
  3. دفع البيانات المحلية فقط إلى Supabase عند تسجيل الدخول
- يُعرض: `profile`, `currentWeekPlan`, `currentMealPlan`, `progress`, إلخ

#### `LanguageProvider`
- يدير اختيار اللغة العربية/الإنجليزية
- يحفظ في `AsyncStorage`
- يُطبِّق اتجاه RTL للغة العربية

### 5. طبقة الخدمات (`lib/`)

#### `supabase.ts`
عميل Supabase مُهيَّأ بمتغيرات البيئة. يستخدم `AsyncStorage` كتخزين للجلسة.

#### `remoteFitnessRepo.ts`
طبقة الوصول إلى البيانات لجميع عمليات Supabase. يتضمن: منطق إعادة المحاولة (2 مرات لأخطاء الشبكة)، معالجة الأخطاء، إدراج دُفعي للتمارين.

#### `trpc.ts`
عميل tRPC للخادم الخلفي. يرجع إلى `localhost:3000` إذا لم يُعيَّن `EXPO_PUBLIC_RORK_API_BASE_URL`.

---

## تدفق البيانات

### تدفق المصادقة

```
تشغيل التطبيق
     │
     ▼
AuthProvider.getSession()
     │
     ├─ جلسة موجودة ──► FitnessProvider.loadData(user)
     │                        │
     │                        ├─ تحميل AsyncStorage (فوري)
     │                        └─ مزامنة مع Supabase (خلفي)
     │
     └─ لا توجد جلسة ──► FitnessProvider.loadData(null)
                              │
                              └─ تحميل AsyncStorage فقط
```

### استراتيجية تزامن البيانات

التطبيق يستخدم استراتيجية **Offline-First**:

1. **القراءة:** دائماً من الحالة المحلية (AsyncStorage) أولاً للعرض الفوري
2. **الكتابة:** كتابة في AsyncStorage فوراً، ثم مزامنة مع Supabase بشكل غير متزامن
3. **حل التعارضات:** بيانات Supabase لها الأولوية عند تشغيل التطبيق للمستخدمين المصادَق عليهم

---

## مخطط قاعدة البيانات

راجع [`supabase-migration.sql`](../../supabase-migration.sql) للمخطط الكامل.

### علاقات الكيانات

```
auth.users (Supabase managed)
    │
    ├── user_profiles (1:1)
    ├── progress_entries (1:N)
    ├── workout_logs (1:N)
    │   └── exercise_logs (1:N)
    ├── workout_plans (1:N)
    │   └── workout_sessions (1:N)
    │       └── exercises (1:N)
    ├── nutrition_plans (1:N)
    │   └── meal_plans (1:N)
    │       └── meals (1:N)
    ├── favorite_exercises (1:N)
    └── favorite_meals (1:N)
```

---

## متغيرات البيئة

| المتغير | مطلوب | الغرض |
|---------|-------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ | رابط مشروع Supabase |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | مفتاح Supabase المجهول |
| `EXPO_PUBLIC_OPENAI_API_KEY` | ✅ | مفتاح OpenAI للمدرب الذكي |
| `EXPO_PUBLIC_RORK_API_BASE_URL` | ⬜ اختياري | رابط API السحابي Rork |
| `EXPO_PUBLIC_RORK_DB_ENDPOINT` | ⬜ اختياري | نقطة نهاية Rivet DB |
| `EXPO_PUBLIC_RORK_DB_NAMESPACE` | ⬜ اختياري | نطاق Rivet DB |
| `EXPO_PUBLIC_RORK_DB_TOKEN` | ⬜ اختياري | رمز Rivet DB |
