# تشغيل DRIPNALITY: الحسابات ولوحة التحكم

## تطبيق قاعدة البيانات

افتح **Supabase Dashboard → SQL Editor** للمشروع الصحيح، ثم انسخ محتوى الملف التالي ونفّذه مرة واحدة:

`supabase/migrations/20260725_dripnality_core.sql`

هذا ينشئ ملفات العملاء والمنتجات والدروبات والمفضلة والسلة والطلبات والدعم، مع صلاحيات RLS.

## تسجيل الدخول عبر Magic Link من Supabase

صفحة `/account` تستعمل Magic Link الافتراضي من Supabase. لا تحتاج إلى Resend أو SMTP أو إدخال رمز.

في **Supabase Dashboard → Authentication → URL Configuration**:

1. أضف رابط موقعك المنشور، مثل `https://your-domain.com/account`، إلى Redirect URLs.
2. اترك قالب Magic Link الافتراضي كما هو.
3. العميل يكتب البريد في `/account`، ثم يفتح رابط `Sign in` المرسل له. يعود للموقع مسجلاً دخوله تلقائياً.

## حدود المرسل الافتراضي

لا يلزم Resend لهذا المسار. Supabase هو الذي يرسل رابط الدخول ويتحقق منه.

ملاحظة مهمة: إذا استخدمت مرسل Supabase الافتراضي فسيظهر الاسم `Supabase Auth` ولا يمكن تغيير اسم المرسل من الكود. في الإنتاج، يلزم SMTP مخصص فقط إذا أردت اسم مرسل مثل DRIPNALITY أو إرسالاً بعدد كبير من العملاء.

## فتح لوحة التحكم لنفسك

1. أنشئ حسابك أولاً من `/account` وتحقق من الرمز.
2. في SQL Editor نفّذ هذا السطر بعد استبدال البريد ببريدك:

```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

3. افتح `https://your-domain.com/admin` بعد نشر الموقع. هذه الصفحة محمية؛ لا يراها إلا الحساب ذو الدور `admin`.

## قبل النشر

أضف متغيرات البيئة في منصة النشر نفسها:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-real-domain.com
```

لا تضع أي مفاتيح خاصة في GitHub أو JavaScript المتصفح.
