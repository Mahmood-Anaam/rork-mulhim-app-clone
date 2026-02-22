# دليل تشغيل تطبيق مُلهم

## المتطلبات الأساسية

| الأداة | الإصدار الأدنى |
|---|---|
| Node.js | 18 LTS |
| npm / bun | أي إصدار حديث |
| Expo CLI | مثبَّت عالمياً (`npm i -g expo-cli`) أو عبر `npx expo` |

---

## 1. استنساخ المستودع

```bash
git clone https://github.com/Mahmood-Anaam/rork-mulhim-app-clone.git
cd rork-mulhim-app-clone
```

---

## 2. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع (مُدرَج في `.gitignore`):

```bash
cp .env.example .env
```

ثم أضف بيانات الاعتماد:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-proj-...
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 3. تثبيت الاعتماديات

```bash
npm install
# أو
bun install
```

---

## 4. تشغيل التطبيق

| الأمر | الهدف |
|---|---|
| `npm start` | خادم Expo التطويري (امسح QR بتطبيق Expo Go) |
| `npm run android` | محاكي/جهاز Android |
| `npm run ios` | محاكي/جهاز iOS (macOS فقط) |
| `npm run web` | المتصفح |

```bash
npm start
```

---

## 5. فحص الكود (Lint)

```bash
npm run lint
```

---

## نظرة عامة على المعمارية

راجع [`docs/ar/ARCHITECTURE.md`](./ARCHITECTURE.md) للاطلاع على توثيق دورة حياة البيانات وهيكل المجلدات الكامل.
