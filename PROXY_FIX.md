# حل مشكلة البروكسي في تسجيل الدخول

## المشكلة:
عند محاولة تسجيل الدخول، تظهر رسالة خطأ في البروكسي.

## الحل:

### 1. إعادة تشغيل الخادم المحلي:
```bash
# أوقف الخادم الحالي (Ctrl+C)
# ثم شغل الخادم من جديد
npm run dev
```

### 2. تأكد من إعدادات البروكسي:
تم تحديث ملف `vite.config.ts` ليشمل:
- بروكسي للـ `/user` endpoints
- بروكسي للـ `/api` endpoints

### 3. استخدام URLs المحلية:
الآن يتم استخدام:
- `/user/login/` بدلاً من `https://educational-platform-qg3zn6tpl-youssefs-projects-e2c35ebf.vercel.app/user/login/`
- `/user/register/` بدلاً من `https://educational-platform-qg3zn6tpl-youssefs-projects-e2c35ebf.vercel.app/user/register/`

### 4. خطوات التشغيل:
1. تأكد من أن الخادم يعمل على `http://localhost:5173`
2. افتح المتصفح واذهب إلى `http://localhost:5173`
3. جرب تسجيل الدخول الآن

### 5. إذا استمرت المشكلة:
- تحقق من console المتصفح (F12) لرؤية الأخطاء
- تأكد من أن الـ API يعمل في Postman
- تحقق من إعدادات الشبكة

## ملاحظات:
- البروكسي يعمل فقط في development mode
- تأكد من أن الخادم المحلي يعمل قبل محاولة تسجيل الدخول


