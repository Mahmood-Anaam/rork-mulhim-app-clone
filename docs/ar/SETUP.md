# دليل الإعداد

## البدء السريع

### 1. متطلبات النظام

| المتطلب | الإصدار |
|---|---|
| Node.js | v18+ |
| npm | v9+ (أو Bun v1+) |
| Git | v2+ |
| Expo Go (الهاتف) | الأحدث |

### 2. النسخ والتثبيت

```bash
git clone https://github.com/Mahmood-Anaam/rork-mulhim-app-clone.git
cd rork-mulhim-app-clone
npm install --legacy-peer-deps
```

### 3. إعداد البيئة

```bash
cp .env.example .env
```

قم بتحرير `.env` ببياناتك:

```env
EXPO_PUBLIC_RORK_DB_ENDPOINT="https://api.rivet.dev"
EXPO_PUBLIC_RORK_DB_NAMESPACE="your-namespace"
EXPO_PUBLIC_RORK_DB_TOKEN="your-token"
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. إعداد قاعدة البيانات

1. أنشئ مشروعاً جديداً على [Supabase](https://supabase.com)
2. اذهب إلى محرر SQL في لوحة تحكم Supabase
3. انسخ والصق محتويات `supabase-migration.sql`
4. نفذ SQL لإنشاء جميع الجداول والفهارس وسياسات RLS

### 5. تشغيل التطبيق

```bash
# خادم التطوير (الهاتف)
npm start

# معاينة الويب
npm run start-web
```

### 6. الاختبار على الجهاز

1. ثبت **Expo Go** على هاتفك
2. امسح رمز QR من الطرفية
3. سيتم تحميل التطبيق على جهازك

## جداول قاعدة البيانات

بعد تشغيل الهجرة، هذه الجداول متاحة:

- `user_profiles` - ملفات اللياقة للمستخدمين
- `workout_plans` - خطط التمارين المولدة
- `workout_sessions` - جلسات التمرين اليومية
- `exercises` - التمارين الفردية
- `workout_logs` - سجلات التمارين المكتملة
- `exercise_logs` - سجلات إكمال التمارين
- `progress_entries` - تتبع الوزن
- `nutrition_plans` - خطط التغذية
- `meal_plans` - خطط الوجبات اليومية
- `meals` - الوجبات الفردية
- `favorite_exercises` - التمارين المحفوظة
- `favorite_meals` - الوجبات المحفوظة

## التحقق من الإعداد

1. **فحص TypeScript**: `npx tsc --noEmit` (يجب أن ينجح بدون أخطاء)
2. **فحص اللنت**: `npx expo lint` (يجب أن ينجح)
3. **تحميل التطبيق**: شاشة الترحيب يجب أن تظهر عند فتح التطبيق
4. **اتصال Supabase**: سجل بالبريد الإلكتروني التجريبي؛ تحقق من لوحة Supabase Auth
