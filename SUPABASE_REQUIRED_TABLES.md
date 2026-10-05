# Supabase — Required Tables Reference

هذا الملف مرجع فقط. لا تقم بتشغيل أي SQL منه تلقائياً.

## الجداول التي يستعملها الموقع حالياً

- `services`
- `product_categories`
- `products`
- `appointments`
- `appointment_items`
- `orders`
- `order_items`
- `business_settings`
- `appointment_settings`
- `profiles`

## الدوال المطلوبة

- `get_multi_service_available_slots`
- `create_multi_service_appointment`
- `create_appointment`
- `create_order`

## Storage buckets المطلوبة

- `products`
- `services`

## الحقول التجارية المطلوبة في `business_settings`

القيم الجديدة المطلوبة:

- `business_name`: `FOUAD EL PELUQUERO DEL MUNDO`
- `address`: `41°32'24.5"N 2°25'28.9"E`
- `city`: `41.5401389, 2.4246944`
- `country`: `España`
- `phone`: `+34745086413`
- `email`: `Fouadelkholief1@gmail.com`
- `instagram_url`: `https://www.instagram.com/fouad_elkholif?stkn=Y29zaWl2Mmd5M3Fy&utm_source=qr`
- `facebook_url`: `NULL`
- `whatsapp_number`: `+34745086413`
- `google_maps_url`: `https://www.google.com/maps?q=41.5401389,2.4246944`
- `language_code`: `es`
- `currency_code`: `EUR`
- `currency_symbol`: `€`
- `text_direction`: `ltr`

## حقول غير موجودة في البنية السابقة

تحقق من وجود هذه الحقول قبل أي إضافة:

- `city`
- `country`
- `phone`
- `email`
- `language_code`
- `currency_code`
- `currency_symbol`
- `text_direction`

إذا كانت هذه الحقول ناقصة، أرسل كود SQL المقترح أولاً للمراجعة. لا تضف جداول جديدة ولا تغيّر RLS أو Auth أو الدوال الحالية بدون موافقة صريحة.
