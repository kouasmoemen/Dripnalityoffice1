# تشغيل وتسليم DRIPNALITY

## تسجيل الحساب والدخول برمز البريد الإلكتروني

صفحة `/account` تستعمل تسجيل دخول بلا كلمة مرور: يكتب العميل بريده، يستلم رمزاً من 6 أرقام، ثم يكتبه في الموقع. المسار نفسه يعمل للحساب الجديد والحساب الموجود، ولا يعتمد على رابط تسجيل الدخول.

### 1. إعداد إرسال البريد في Supabase

في **Supabase Dashboard → Authentication → Emails → SMTP settings**:

- فعّل **Enable custom SMTP**.
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: مفتاح Resend API الخاص بك.
- Sender name: `Dripnality`
- Sender email: استخدم عنواناً من دومين تم التحقق منه في Resend، مثل `team@dripnality.com` أو `support@dripnality.com`.

لا تضع `Dripnality@gmail.com` هنا إلا إذا كان Gmail نفسه مزود SMTP الذي أعددته. مع Resend يجب أن يكون العنوان المرسل من دومين تم التحقق منه لدى Resend، وإلا قد يفشل الإرسال أو يصل بشكل غير موثوق.

اضغط **Save changes**. تأكد داخل Resend أن حالة الدومين `dripnality.com` هي **Verified** وأن تتبع الروابط البريدية معطّل لرسائل المصادقة.

### 2. اجعل OTP هو المسار الوحيد للحسابات

في **Authentication → Sign In / Providers → Email** عطّل خيار **Confirm email** ثم احفظ.

هذا لا يلغي أمان الحسابات: رمز OTP المرسل إلى البريد هو التحقق من ملكية البريد نفسه. لكنه يمنع Supabase من إنشاء رسالة تأكيد تسجيل منفصلة، ويجعل كل تسجيل جديد وكل تسجيل دخول يستعملان تدفق OTP نفسه. بعد تغيير هذا الإعداد، استخدم بريداً جديداً للاختبار أو احذف حساب الاختبار غير المؤكد من **Authentication → Users**.

في الصفحة نفسها، اجعل **Email OTP expiration** على `3600` ثانية (ساعة واحدة). لا تضع قيمة قصيرة مثل 3 أو 10 ثوانٍ؛ هذا الحقل يحدد صلاحية الرمز وليس مهلة وصول البريد.

### 3. التعديل الضروري: قالبان وليس قالباً واحداً

Supabase يرسل قالباً مختلفاً عندما يكون البريد لحساب جديد. لذلك يجب تعديل القالبين التاليين في:

**Supabase Dashboard → Authentication → Emails**

#### أ. Confirm signup

هذا القالب هو الذي ظهر لك في الصورة بعنوان **Confirm your email address**. اجعل الحقلين كما يلي:

Subject:

```text
{{ .Token }} is your DRIPNALITY access code
```

Body (اضغط **Source** ثم الصق):

```html
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#ffffff;color:#111111">
  <p style="font-size:11px;letter-spacing:3px;font-weight:700">DRIPNALITY® / PRIVATE ACCESS</p>
  <h1 style="font-size:32px;margin:28px 0 12px">Your access code</h1>
  <p style="font-size:16px;line-height:1.6">Use this code to confirm your email and enter DRIPNALITY.</p>
  <div style="margin:28px 0;padding:20px;border:1px solid #111;text-align:center;font-size:34px;letter-spacing:10px;font-weight:700">{{ .Token }}</div>
  <p style="font-size:13px;color:#666">This code expires shortly and can only be used once. Do not share it with anyone.</p>
</div>
```

#### ب. Magic link or OTP

ضع **نفس** العنوان والمحتوى السابق تماماً في قالب **Magic link or OTP**.

مهم: احذف أي `{{ .ConfirmationURL }}` من القالبين. وجوده يعيد إرسال رابط بدلاً من الرمز. اضغط **Save changes** لكل قالب.

### 4. اختبار صحيح

1. افتح `/account` في نافذة خاصة أو بعد تسجيل الخروج.
2. اكتب بريداً لم يُستخدم سابقاً، واضغط **Send secure code**.
3. يجب أن يصل بريد بعنوان يتضمن رمزاً، ومن اسم `Dripnality` وعنوان المرسل الذي ضبطته في SMTP.
4. اكتب نفس الرمز فوراً في الحقل. سيظهر الحساب ويسجل الدخول.
5. جرّب بريداً آخر للتأكد أن الإرسال ليس مقتصراً على بريدك: طالما أن SMTP والدومين في Resend موثّقان، يرسل Supabase لكل بريد يدخل في الموقع.

إذا وصل بريد بعنوان **Confirm your email address** أو زر **Confirm email address**، فهذا يعني أن قالب **Confirm signup** لم يُحفظ أو لم يُعدّل بعد. لا تستخدم الرمز من ذلك البريد في الموقع؛ اطلب رمزاً جديداً بعد حفظ القالب الصحيح.

لا تطلب رمزاً جديداً قبل إدخال الرمز السابق: كل طلب جديد يلغي الرمز السابق لنفس البريد، وهذا هو السبب الأكثر شيوعاً لرسالة “invalid or expired”.

## قاعدة البيانات ولوحة التحكم

نفّذ ملف قاعدة البيانات مرة واحدة من **Supabase Dashboard → SQL Editor**:

```text
supabase/migrations/20260725_dripnality_core.sql
```

بعد إنشاء حساب المدير وتأكيده، عيّنه مديراً من SQL Editor (غيّر البريد):

```sql
update public.profiles
set role = 'admin'
where email = 'your-admin-email@example.com';
```

بعد النشر افتح `https://your-domain.com/admin` بالحساب المدير.

## قبل النشر

ضع هذه القيم نفسها في منصة النشر، ولا تنشر مفاتيح Resend الخاصة أبداً:

```text
NEXT_PUBLIC_SUPABASE_URL=https://atlbvkuldauqetgyvwlq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_SITE_URL=https://dripnality.com
RESEND_API_KEY=re_...                 # للخادم فقط، لإرسال رسائل الدعم
SUPPORT_FROM_EMAIL=DRIPNALITY <support@dripnality.com>
```

تغيير SMTP أو قوالب Auth يتم داخل Supabase ولا يحتاج تعديل كود الموقع أو إعادة بنائه.
