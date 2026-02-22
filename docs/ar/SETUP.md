# دليل الإعداد — التطوير المحلي

## المتطلبات الأساسية

| الأداة | الإصدار | التثبيت |
|--------|---------|---------|
| Node.js | ≥ 18 | [nvm](https://github.com/nvm-sh/nvm) |
| Bun | ≥ 1.0 | [bun.sh](https://bun.sh) |
| Git | أي إصدار | حزم النظام |

**اختياري (للمحاكيات):**
- macOS + Xcode ≥ 15 (محاكي iOS)
- Android Studio (محاكي Android)

---

## خطوات التثبيت

### 1. استنساخ المستودع

```bash
git clone https://github.com/Mahmood-Anaam/rork-mulhim-app-clone.git
cd rork-mulhim-app-clone
```

### 2. تثبيت الحزم

```bash
bun install
# أو
npm install
```

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
# مطلوب
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# مطلوب للمدرب الذكي
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...

# اختياري — Rork السحابي (اتركه فارغاً للتطوير المحلي)
EXPO_PUBLIC_RORK_API_BASE_URL=

# اختياري — Rivet DB
EXPO_PUBLIC_RORK_DB_ENDPOINT=
EXPO_PUBLIC_RORK_DB_NAMESPACE=
EXPO_PUBLIC_RORK_DB_TOKEN=
```

> ⚠️ **لا تقم أبداً بحفظ ملف `.env` في المستودع.** إنه مُدرج في `.gitignore`.

### 4. إعداد قاعدة بيانات Supabase

1. انتقل إلى [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. افتح **SQL Editor** في لوحة التحكم
3. انسخ وشغِّل محتوى ملف `supabase-migration.sql`
4. حدِّث ملف `.env` بـ URL المشروع والمفتاح المجهول

---

## تشغيل التطبيق

### المتصفح (معاينة الويب — مستحسن للاختبار السريع)

```bash
bun run web
# أو
npx expo start --web
```
يفتح على `http://localhost:8081`

### Expo Go (جهاز فعلي)

1. ثبِّت **Expo Go** من App Store / Google Play
2. شغِّل:
   ```bash
   bun run start
   ```
3. امسح رمز QR الظاهر في الطرفية بكاميرا هاتفك

### محاكي iOS (macOS فقط)

```bash
bun run ios
```

### محاكي Android

```bash
bun run android
```

---

## سكريبتات التطوير

| السكريبت | الأمر | الوصف |
|----------|-------|-------|
| `start` | `expo start` | تشغيل Expo DevTools |
| `web` | `expo start --web` | معاينة الويب |
| `ios` | `expo start --ios` | محاكي iOS |
| `android` | `expo start --android` | محاكي Android |
| `lint` | `expo lint` | تشغيل ESLint |
| `start:rork` | `bunx rork start ...` | معاينة Rork السحابية |

---

## حل المشكلات

### التطبيق لا يعمل

```bash
# مسح ذاكرة التخزين المؤقت لـ Metro
npx expo start --clear

# إعادة تثبيت الحزم
rm -rf node_modules
bun install
```

### أخطاء اتصال Supabase

- تحقق من صحة `EXPO_PUBLIC_SUPABASE_URL` و `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- تأكد من وجود جداول قاعدة البيانات بتشغيل `supabase-migration.sql`
- تأكد من تطبيق سياسات Row Level Security

### المدرب الذكي لا يستجيب

- تحقق من صحة `EXPO_PUBLIC_OPENAI_API_KEY` وكافية رصيده
- يتطلب المدرب الذكي اتصالاً بالإنترنت

---

## النشر للإنتاج

### بناء EAS (iOS/Android)

```bash
npm install -g @expo/eas-cli
eas login
eas build:configure

# بناء iOS
eas build --platform ios

# بناء Android
eas build --platform android
```

### نشر الويب

```bash
# بناء تطبيق ويب ثابت
npx expo export --platform web
```
