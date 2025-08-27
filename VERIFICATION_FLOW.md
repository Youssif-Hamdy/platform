# سير عمل التحقق من البريد الإلكتروني

## الخطوات:

### 1. التسجيل (SignIn.tsx)
- المستخدم يملأ نموذج التسجيل
- عند النجاح، يتم تخزين `token_to_verify` في localStorage
- يتم التوجيه لصفحة التحقق `/verify-email`
- تظهر رسالة "تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني"

### 2. التحقق من البريد الإلكتروني (VerifyEmail.tsx)
- الصفحة تتحقق من وجود `verificationToken` في localStorage
- المستخدم يدخل رمز التحقق المرسل إلى بريده الإلكتروني
- يتم إرسال طلب POST إلى `/api/verify-email/{token}/`
- في حالة النجاح:
  - يتم حذف `verificationToken` من localStorage
  - تظهر رسالة نجاح
  - التوجيه التلقائي لصفحة تسجيل الدخول بعد 5 ثوان
- في حالة الخطأ:
  - تظهر رسالة الخطأ
  - إمكانية إعادة المحاولة أو العودة لصفحة التسجيل

### 3. تسجيل الدخول
- المستخدم يعود لصفحة تسجيل الدخول
- يمكنه تسجيل الدخول بحسابه المُتحقق منه

## API Endpoints:

### التسجيل:
```
POST /api/register/
Body: {
  username: string,
  email: string,
  password: string,
  password_confirm: string,
  first_name: string,
  last_name: string
}
Response: {
  message: string,
  user: object,
  tokens: {
    refresh: string,
    access: string,
    token_to_verify: string
  }
}
```

### التحقق:
```
التحقق يتم محلياً بمقارنة الرمز المدخل مع الرمز المحفوظ في localStorage
```

## الملفات المعدلة:

1. `src/pages/SignIn.tsx` - إضافة تخزين token والتوجيه
2. `src/component/VerifyEmail.tsx` - إضافة واجهة إدخال الرمز والتحقق
3. `src/App.tsx` - إضافة مسار `/verify-email`

## الميزات:

- ✅ تخزين token في localStorage
- ✅ واجهة إدخال رمز التحقق
- ✅ التحقق من الرمز عبر API
- ✅ رسائل خطأ واضحة
- ✅ التوجيه التلقائي
- ✅ إمكانية العودة لصفحة التسجيل
- ✅ دعم الضغط على Enter
- ✅ تصميم متجاوب وجميل 