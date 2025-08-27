# إعداد Proxy المحلي لحل مشكلة CORS

## ما هو الـ Proxy؟

الـ Proxy هو وسيط بين المتصفح والخادم الخارجي. في حالتنا، نحن نستخدم Vite Dev Server كـ proxy لتجنب مشاكل CORS.

## كيفية عمل الـ Proxy:

1. **بدلاً من الاتصال المباشر**:
   ```
   https://web-0bben6p5dii9.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/login/
   ```

2. **نستخدم الـ proxy المحلي**:
   ```
   http://localhost:5173/api/login/
   ```

3. **Vite يقوم بتحويل الطلب**:
   - يأخذ الطلب من `/api/login/`
   - يرسله إلى `https://web-0bben6p5dii9.up-de-fra1-k8s-1.apps.run-on-seenode.com/api/login/`
   - يعيد الـ response للمتصفح

## إعداد الـ Proxy:

تم إعداد الـ proxy في ملف `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://web-0bben6p5dii9.up-de-fra1-k8s-1.apps.run-on-seenode.com',
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/api/, '/api'),
    }
  }
}
```

## كيفية الاستخدام:

1. **تشغيل الخادم المحلي**:
   ```bash
   npm run dev
   ```

2. **استخدام URLs المحلية**:
   - Login: `/api/login/`
   - Register: `/api/register/`
   - Refresh Token: `/api/token/refresh/`

## مميزات الـ Proxy:

✅ **حل مشكلة CORS** - لا توجد مشاكل CORS مع الـ proxy المحلي
✅ **سهولة التطوير** - يمكنك استخدام URLs بسيطة
✅ **مراقبة الطلبات** - يمكنك رؤية جميع الطلبات في console
✅ **أمان أفضل** - الطلبات تمر عبر الخادم المحلي

## استكشاف الأخطاء:

إذا لم يعمل الـ proxy:

1. **تأكد من تشغيل الخادم المحلي**:
   ```bash
   npm run dev
   ```

2. **تحقق من الـ console**:
   - ستجد رسائل عن الطلبات والاستجابات
   - يمكنك رؤية أي أخطاء تحدث

3. **تأكد من صحة الـ API URL**:
   - تأكد أن الـ target URL صحيح
   - تأكد أن الـ API يعمل في Postman

## ملاحظات مهمة:

- الـ proxy يعمل فقط في development mode
- في production، ستحتاج إلى إعداد proxy على الخادم
- تأكد من أن الـ API يدعم الطلبات من الخادم المحلي 