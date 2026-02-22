# المعمارية — تطبيق مُلهم

## هيكل المجلدات

```
rork-mulhim-app-clone/
├── app/                        # شاشات Expo Router (واجهة المستخدم فقط)
│   ├── _layout.tsx             # التخطيط الجذري: المزودون، مكدس التنقل
│   ├── (tabs)/                 # شاشات التبويب السفلي
│   │   ├── plan.tsx            # شاشة خطة التمرين
│   │   ├── nutrition.tsx       # شاشة التغذية وخطة الوجبات
│   │   ├── coach.tsx           # شاشة المحادثة مع المدرب الذكي
│   │   └── profile.tsx         # شاشة الملف الشخصي
│   ├── auth/                   # شاشات المصادقة
│   ├── onboarding.tsx
│   ├── workout-details.tsx
│   └── meal-details.tsx
│
├── src/                        # منطق الأعمال والخدمات
│   ├── utils/
│   │   └── config.ts           # إعداد متغيرات البيئة المركزي
│   ├── services/
│   │   └── openai.ts           # generateObject + chatWithTools
│   └── hooks/
│       └── useOpenAICoach.ts   # خطاف المدرب الذكي الحالة
│
├── lib/
│   ├── supabase.ts             # عميل Supabase المفرد
│   └── remoteFitnessRepo.ts   # عمليات CRUD على Supabase
│
├── providers/
│   ├── AuthProvider.tsx        # حالة مصادقة Supabase
│   ├── FitnessProvider.tsx     # بيانات اللياقة على مستوى التطبيق
│   └── LanguageProvider.tsx    # سياق i18n
│
├── constants/
│   ├── colors.ts
│   └── translations.ts
│
├── data/                       # بيانات أولية ثابتة
│   ├── exercises.ts
│   └── meals.ts
│
├── types/
│   └── fitness.ts              # واجهات TypeScript
│
└── docs/                       # توثيق هندسي
```

---

## دورة حياة البيانات

### تدفق المصادقة

```
تشغيل التطبيق
  → AuthProvider.useEffect
      → supabase.auth.getSession()
          → مستخدم موجود  → انتقل إلى (tabs)
          → لا مستخدم     → انتقل إلى /welcome
```

### تدفق المدرب الذكي

```
المستخدم يرسل رسالة
  → useOpenAICoach.sendMessage(text)
      → chatWithTools(messages, tools)
          → POST https://api.openai.com/v1/chat/completions
              → استدعاء أدوات؟
                  نعم → tools[name].execute(input)  → تحديث حالة React
                  لا  → رد نصي
      → setMessages([...prev, assistantMsg])
```

### توليد الوجبة المخصصة (شاشة التغذية)

```
المستخدم يدخل اسم وجبة مخصصة
  → generateObject({ messages, schema: mealSchema })
      → POST https://api.openai.com/v1/chat/completions
         (response_format: json_object)
      → schema.parse(JSON.parse(content))
      → كائن MealSuggestion مُعاد
```

### تدفق بيانات اللياقة

```
FitnessProvider.loadData()
  ├── AsyncStorage  (ذاكرة تخزين مؤقتة محلية، محمَّلة أولاً)
  └── remoteFitnessRepo  (Supabase، مُزامَن عند المصادقة)
       ← عميل supabase  ← config.ts (EXPO_PUBLIC_SUPABASE_*)
```

---

## خريطة الشاشة → الخطاف / الخدمة

| الشاشة | الخطاف / الخدمة المخصص |
|---|---|
| `app/(tabs)/coach.tsx` | `useOpenAICoach`، `useFitness`، `useLanguage` |
| `app/(tabs)/nutrition.tsx` | `generateObject` (openai.ts)، `useFitness` |
| `app/(tabs)/plan.tsx` | `useFitness`، `useLanguage` |
| `app/(tabs)/profile.tsx` | `useAuth`، `useFitness` |
| `app/auth/login.tsx` | `useAuth` |
| `app/auth/signup.tsx` | `useAuth` |
| `app/onboarding.tsx` | `useFitness` |
