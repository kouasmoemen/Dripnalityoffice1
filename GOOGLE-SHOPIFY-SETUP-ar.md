# ربط Google وShopify لتسليم DRIPNALITY

## 1. تسجيل الدخول بحساب Google

زر Google موجود الآن في `/account`. لا تضع Google Client Secret في ملفات الموقع أو GitHub.

في **Google Cloud → Google Auth Platform**:

1. أنشئ OAuth Client من نوع **Web application**.
2. أضف Authorized JavaScript origins:
   - `https://dripnality.com`
   - رابط التطوير المحلي عند الحاجة فقط، مثل `http://localhost:3000`
3. أضف Authorized redirect URI التالي بالضبط:

```text
https://atlbvkuldauqetgyvwlq.supabase.co/auth/v1/callback
```

في **Supabase → Authentication → Sign In / Providers → Google**:

1. فعّل Google.
2. الصق Google Client ID وGoogle Client Secret هناك فقط.
3. في **Authentication → URL Configuration** أضف:

```text
https://dripnality.com/account
http://localhost:3000/account
```

بعد الحفظ، زر **Continue with Google** ينشئ الحساب الجديد أو يدخل للحساب الموجود تلقائياً.

## 2. Shopify: إرسال الطلبات إلى المتجر

صفحة `/checkout` تبني سلة Shopify ثم تنقل المشتري إلى Shopify Checkout. عند إتمام الدفع أو الدفع عند الاستلام، يظهر الطلب ومعلومات العميل في Shopify تلقائياً.

لا تستخدم **Client secret** الخاص بتطبيق Shopify الموجود في الصور؛ هذا مفتاح OAuth للتطبيق وليس مفتاح Checkout، وقد ظهر علناً ولذلك يجب تدويره من Shopify فوراً.

المطلوب هو:

1. اسم المتجر، مثال: `dripnality1.myshopify.com`.
2. Storefront access token من تطبيق Shopify مُعدّ لـ Storefront API.
3. أنشئ المنتج نفسه في Shopify، ثم أرسل Variant ID للـS وM وL، أو اجعلها Variants حقيقية في Shopify.
4. في إعدادات Shopify، أنشئ شحن Tunisia بسعر `8 TND` وفَعّل Cash on Delivery.

في منصة النشر أضف المتغيرات التالية (على الخادم فقط، وليست `NEXT_PUBLIC`):

```text
SHOPIFY_STORE_DOMAIN=dripnality1.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_TSHIRT_VARIANT_ID=gid://shopify/ProductVariant/...
```

بعد إضافتها، زر الدفع يحوّل الزبون مباشرة إلى Shopify Checkout ويصل إلى Shopify: المنتج، المقاس، البريد، الاسم، الهاتف، المدينة، والعنوان.

## 3. قاعدة البيانات والمنتجات

نفّذ بعد ملف الـcore migration هذا الملف مرة واحدة من **Supabase SQL Editor**:

```text
supabase/migrations/20260801_drop_02_tshirt.sql
```

الملف يضيف الرقم التسلسلي لكل منتج، يضبط الهوديز على `100 TND` وSold Out، ويضيف T-shirt رقم `DRP-TS-003` بسعر `60 TND`.
