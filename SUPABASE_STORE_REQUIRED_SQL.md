# Supabase Store Required SQL Specification

هذا الملف تحليل للمتجر الحالي فقط. لا يحتوي SQL قابل للتنفيذ، ولم يتم تنفيذ أي استعلام أو تغيير في Supabase.

## 1. Tables Required

### product_categories
- الموقع يقرأ فقط: name.
- الاستعمال: العلاقة products -> product_categories في select('*, product_categories(name)').
- النوع المتوقع: text للاسم؛ المفتاح والـ FK غير مؤكدين من الكود.
- القراءة مطلوبة للزائر والإدارة؛ لا توجد عمليات كتابة حالية.
- الملفات: src/main.jsx و src/components/ProductDetails.jsx.

### products
الأعمدة المستعملة فعلياً:
- id — string/UUID — Required — مفاتيح React، تفاصيل المنتج، السلة، update/delete.
- name — text — Required — اسم المنتج وslug.
- description — text nullable — Optional — الوصف.
- price — numeric — Required — السعر والحساب المحلي.
- old_price — numeric nullable — Optional — السعر السابق.
- stock_quantity — integer/numeric — Required — التوفر وحدود السلة.
- sku — text nullable — Optional — لوحة الإدارة.
- main_image — text nullable — Optional — الصورة الرئيسية.
- images — json/jsonb array — Optional — gallery الصور الإضافية.
- is_active — boolean — Required — filter المتجر والتفعيل.
- is_featured — boolean — Optional — نموذج الإدارة.
- slug — text nullable — Optional — يرسل عند insert ولا يقرأ في storefront.
- created_at — timestamp — Required للاستعلام — ترتيب المنتجات.
- product category relation — Required للعلاقة فقط — جلب name.

Primary key و FK الدقيقان غير معروفين من الكود. الإدارة تنفذ insert/select، update، و delete على products. الملفات: src/main.jsx، src/components/ProductDetails.jsx، src/components/admin/AdminProductsPanel.jsx، src/components/admin/AdminLayout.jsx.

### product images / galleries
لا يوجد جدول مستقل للصور. main_image رابط نصي و images مصفوفة روابط. لا توجد calls إلى product_images أو product_galleries.

### cart
السلة React state محلي في src/main.jsx. لا جدول، لا RPC، لا Auth، ولا localStorage ظاهر في الكود. الحساب price * qty محلي.

### wishlist
لا توجد أي imports أو queries أو RPC أو Storage calls لـ wishlist. لا يحتاج المتجر الحالي جدول wishlist.

### orders
الإدارة الحالية تقرأ وتحدّث الطلبات فقط:
- id — string/UUID — Required — key و update filter.
- customer_name — text — Required للعرض.
- phone — text — Required للعرض.
- total — numeric — Required للعرض.
- city — text — Optional للعرض في نسخة الإدارة.
- address — text — Optional للعرض.
- status — text/enum — Required — العرض والتحديث.
- created_at — timestamp — Required للاستعلام والترتيب.
الاستعلام: select('*').order('created_at', ascending:false). التحديث: update({status}).eq('id',id). القيم الظاهرة: pending, confirmed, preparing, shipped, delivered, cancelled. الملفات: src/components/admin/AdminLayout.jsx و src/main.jsx.

### order_items
لا توجد أي query أو insert أو update أو delete في الكود الحالي. الأعمدة والـ FK غير قابلة للاستخراج، ولا ينبغي إضافة شيء اعتماداً على هذا التحليل.

### business_settings
المتجر لا يقرأه. هو مستعمل في لوحة إعدادات المحل العامة فقط. لا يحتاج Ecommerce إلى تعديل هذا الجدول.

## 2. RPC Functions Required

لا توجد RPC خاصة بالمتجر أو checkout مستعملة فعلياً.

create_order مذكور في ملفات/مراجع سابقة، لكن لا توجد call له في الكود الحالي؛ parameters و return غير قابلين للتحديد، وليس مطلوباً لتشغيل واجهة المتجر الحالية.

RPCs الموجودة فعلياً في المشروع تخص الحجز فقط: get_multi_service_available_slots و create_multi_service_appointment، وخارج نطاق Ecommerce.

## 3. Storage Required

### products
- الرفع: supabase.storage.from('products').upload(path, file, {upsert:false, contentType:file.type}).
- الرابط: getPublicUrl(path).
- الحفظ: الرابط في main_image أو داخل images.
- القراءة: روابط عامة في بيانات المنتج.
- المطلوب من طريقة الكود: Public read.
- الحذف: remove([cleanPath]).
- الملفات: صور؛ لوحة الإدارة تقبل jpeg/png/webp، والنسخة الأخرى تقبل image حتى 5MB.
- الملفات: src/services/storageService.js و src/components/admin/AdminProductsPanel.jsx.

### services
يستعمل لصور الخدمات فقط، وليس Ecommerce. لا يعتبر bucket إضافياً للمتجر.

## 4. RLS Requirements

products:
- SELECT عام للمنتجات النشطة، و SELECT للإدارة لكل المنتجات.
- INSERT/UPDATE/DELETE للإدارة المصادق عليها فقط.

product_categories:
- SELECT عام للاسم.
- لا توجد عمليات كتابة حالية، لذلك لا يمكن طلب صلاحيات كتابة من الكود.

orders:
- SELECT للإدارة المصادق عليها فقط حسب الاستعمال الحالي.
- UPDATE للإدارة المصادق عليها لتغيير status.
- لا يوجد INSERT أو DELETE حالي من المتجر.

order_items:
- لا توجد operations حالية؛ RLS غير قابلة للتحديد من الكود.

Storage products:
- القراءة العامة بسبب getPublicUrl.
- الرفع والحذف للمستخدم الإداري المصادق عليه.

Auth:
- لا يوجد Auth للسلة أو الطلب في storefront.
- Auth موجود للإدارة: getSession، onAuthStateChange، signInWithPassword، signOut.

## 5. Exact Missing Supabase Objects

### مطلوب التحقق من وجوده
- products.
- product_categories وعلاقة products معها.
- orders للقراءة والتحديث في الإدارة.
- Storage bucket products.
- Auth للمشرفين.

### غير موجود كوظيفة في الكود، وليس نقصاً يجب إصلاحه تلقائياً
- checkout فعلي.
- call إلى create_order.
- insert إلى orders أو order_items.
- wishlist.
- cart persistence.

### يحتاج تحقق مباشر من Supabase
- types و PK/FK الدقيقة.
- اسم FK الخاص بتصنيف المنتج.
- نوع images.
- status type في orders.
- وجود created_at.
- Public bucket و RLS policies.
- وجود order_items و create_order فعلياً.

لا يوجد اتصال مباشر بقاعدة البيانات في هذه المراجعة، لذلك لا أستطيع تصنيف أي object live على أنه موجود أو ناقص بشكل قطعي.

## 6. Final SQL Specification

إذا كان المطلوب تشغيل المتجر كما هو الآن، فيجب أن يتحقق SQL لاحقاً فقط من:

1. products يحتوي id, name, description, price, old_price, stock_quantity, sku, main_image, images, is_active, is_featured, slug, created_at.
2. توجد علاقة قابلة للاستعلام products -> product_categories(name).
3. الزائر يستطيع SELECT للمنتجات النشطة والتصنيفات.
4. الإدارة المصادق عليها تستطيع رفع/حذف صور products و insert/update/delete المنتجات.
5. bucket products موجود و Public read.
6. الإدارة المصادق عليها تستطيع قراءة orders وتحديث status.
7. لا يتم إنشاء cart أو wishlist أو order RPC، لأن الكود الحالي لا يستعملها.
8. لا يتم تغيير business_settings أو Auth أو booking system.

الخلاصة: النقص المحتمل محصور في التحقق من products، علاقة التصنيفات، bucket products، وRLS المناسبة. Checkout وwishlist وcart persistence غير موجودة في الكود الحالي.
