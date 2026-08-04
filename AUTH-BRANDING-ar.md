# إزالة نطاق Supabase من شاشة Google

النص الظاهر في شاشة Google ليس API key ولا يكشف أي سر. إنه نطاق مشروع Supabase الافتراضي المستخدم كعنوان رجوع آمن لتسجيل الدخول.

لا يمكن إخفاؤه بوساطة CSS أو JavaScript في الموقع، لأن شاشة اختيار حساب Google تكون خارج موقع DRIPNALITY. الحل الاحترافي هو ربط نطاق مصادقة مخصص.

1. من لوحة Supabase، فعّل **Custom Domain** واختر نطاقاً مثل `auth.dripnality.com`. هذه الميزة تتطلب خطة مدفوعة في Supabase.
2. أضف سجل DNS الذي تعرضه Supabase للنطاق الفرعي، ثم انتظر حالة التحقق والـ SSL.
3. في Google Cloud Console، أضف عنوان الرجوع الجديد مع العنوان السابق:

```text
https://auth.dripnality.com/auth/v1/callback
```

4. في Google Auth Platform > Branding، اجعل اسم التطبيق `DRIPNALITY`، أضف الشعار وبريد الدعم، ثم أضف `dripnality.com` كنطاق معتمد.
5. في Supabase Authentication > URL Configuration، تأكد أن الموقع والـ redirect المسموح بهما يتضمنان `https://dripnality.com/account`.

بعد ذلك ستعرض شاشة Google نطاق DRIPNALITY الخاص بدلاً من نطاق المشروع الافتراضي. لا تحذف عنوان Supabase القديم من Google Cloud قبل اختبار تسجيل الدخول بالنطاق المخصص بنجاح.
