<?php

return [
    'required' => 'حقل :attribute مطلوب.',
    'email' => 'يجب أن يكون :attribute عنوان بريد إلكتروني صحيح.',
    'min' => [
        'string' => 'يجب أن يكون :attribute على الأقل :min أحرف.',
    ],
    'max' => [
        'string' => 'يجب ألا يزيد :attribute عن :max أحرف.',
    ],
    'confirmed' => 'تأكيد :attribute غير متطابق.',
    'unique' => ':attribute مُستخدم بالفعل.',
    'exists' => ':attribute المحدد غير صحيح.',
    'numeric' => 'يجب أن يكون :attribute رقماً.',
    'integer' => 'يجب أن يكون :attribute عدداً صحيحاً.',
    'date' => ':attribute ليس تاريخاً صحيحاً.',
    'boolean' => 'يجب أن يكون حقل :attribute صحيح أو خطأ.',
    'string' => 'يجب أن يكون :attribute نصاً.',
    'array' => 'يجب أن يكون :attribute مصفوفة.',
    'file' => 'يجب أن يكون :attribute ملفاً.',
    'image' => 'يجب أن يكون :attribute صورة.',
    'mimes' => 'يجب أن يكون :attribute ملفاً من نوع: :values.',
    'size' => [
        'file' => 'يجب أن يكون :attribute بحجم :size كيلوبايت.',
    ],
    'between' => [
        'numeric' => 'يجب أن يكون :attribute بين :min و :max.',
        'string' => 'يجب أن يكون :attribute بين :min و :max أحرف.',
    ],
    'in' => ':attribute المحدد غير صحيح.',
    'not_in' => ':attribute المحدد غير صحيح.',
    'regex' => 'تنسيق :attribute غير صحيح.',
    'same' => 'يجب أن يتطابق :attribute و :other.',
    'different' => 'يجب أن يكون :attribute و :other مختلفين.',
    'alpha' => 'يجب أن يحتوي :attribute على أحرف فقط.',
    'alpha_dash' => 'يجب أن يحتوي :attribute على أحرف وأرقام وشرطات وشرطات سفلية فقط.',
    'alpha_num' => 'يجب أن يحتوي :attribute على أحرف وأرقام فقط.',
    'url' => 'تنسيق :attribute غير صحيح.',
    'timezone' => 'يجب أن يكون :attribute منطقة زمنية صحيحة.',
    'json' => 'يجب أن يكون :attribute نص JSON صحيح.',
    'uuid' => 'يجب أن يكون :attribute UUID صحيح.',
    'password' => 'كلمة المرور غير صحيحة.',
    'current_password' => 'كلمة المرور غير صحيحة.',
    
    'attributes' => [
        'name' => 'الاسم',
        'email' => 'عنوان البريد الإلكتروني',
        'password' => 'كلمة المرور',
        'password_confirmation' => 'تأكيد كلمة المرور',
        'phone' => 'رقم الهاتف',
        'address' => 'العنوان',
        'city' => 'المدينة',
        'country' => 'البلد',
        'description' => 'الوصف',
        'title' => 'العنوان',
        'content' => 'المحتوى',
        'category' => 'الفئة',
        'price' => 'السعر',
        'quantity' => 'الكمية',
        'date' => 'التاريخ',
        'time' => 'الوقت',
        'status' => 'الحالة',
        'type' => 'النوع',
        'image' => 'الصورة',
        'file' => 'الملف',
        
        // Species specific attributes
        'species.name' => 'اسم النوع',
        'species.description' => 'وصف النوع',

        // Category Product specific attributes
        'category_product.name' => 'اسم الفئة',
        'category_product.description' => 'وصف الفئة',
        'category_product.category_product_id' => 'الفئة الأم',
    ],
    
    // Custom validation messages for species
    'custom' => [
        'name' => [
            'required' => 'اسم النوع مطلوب.',
            'string' => 'اسم النوع يجب أن يكون نصاً صحيحاً.',
            'max' => 'اسم النوع لا يمكن أن يتجاوز 255 حرفاً.',
            'unique' => 'يوجد نوع بهذا الاسم مسبقاً.',
        ],
        'description' => [
            'string' => 'وصف النوع يجب أن يكون نصاً صحيحاً.',
            'max' => 'وصف النوع لا يمكن أن يتجاوز 1000 حرف.',
        ],
    ],

       // Required field messages
        "first_name_required" => "الاسم الأول مطلوب",
        "last_name_required" => "اسم العائلة مطلوب",
        "email_required" => "البريد الإلكتروني مطلوب",
        "current_password_required" => "كلمة المرور الحالية مطلوبة",

        // Minimum length messages
        "first_name_min_length" => "يجب أن يحتوي الاسم الأول على حرفين على الأقل",
        "last_name_min_length" => "يجب أن يحتوي اسم العائلة على حرفين على الأقل",
        "password_min_length" => "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل",

        // Maximum length messages
        "first_name_max_length" => "يجب أن يحتوي الاسم الأول على أقل من 50 حرفاً",
        "last_name_max_length" => "يجب أن يحتوي اسم العائلة على أقل من 50 حرفاً",

        // Format validation messages
        "first_name_invalid_chars" => "يمكن أن يحتوي الاسم الأول على الحروف والمسافات فقط",
        "last_name_invalid_chars" => "يمكن أن يحتوي اسم العائلة على الحروف والمسافات فقط",
        "email_invalid" => "يرجى إدخال عنوان بريد إلكتروني صحيح",
        "phone_invalid" => "يرجى إدخال رقم هاتف صحيح",

        // Password strength messages
        "password_uppercase_required" => "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل",
        "password_lowercase_required" => "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل",
        "password_number_required" => "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل",
        "password_special_char_required" => "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل",

        // Password confirmation messages
        "password_confirmation_mismatch" => "كلمات المرور غير متطابقة",

         // Category Product validation messages
        "category_name_required" => "اسم الفئة مطلوب",
        "category_name_min_length" => "يجب أن يحتوي اسم الفئة على حرفين على الأقل",
        "category_name_max_length" => "يجب أن يحتوي اسم الفئة على أقل من 100 حرف",
        "category_name_invalid_chars" => "يمكن أن يحتوي اسم الفئة على الحروف والمسافات والشرطات والعلامات فقط",
        "description_max_length" => "يجب أن يحتوي الوصف على أقل من 500 حرف",
        "parent_category_invalid" => "الفئة الأم يجب أن تكون رقماً صحيحاً موجباً",

        // Search and pagination validation
        "search_max_length" => "يجب أن تحتوي استعلام البحث على أقل من 255 حرف",
        "per_page_invalid" => "عدد العناصر في الصفحة يجب أن يكون رقماً صحيحاً",
        "per_page_min" => "عدد العناصر في الصفحة يجب أن يكون 5 على الأقل",
        "per_page_max" => "عدد العناصر في الصفحة لا يمكن أن يتجاوز 100",

        // Bulk operations validation
        "no_items_selected" => "لم يتم تحديد أي عناصر للحذف",
        "too_many_items_selected" => "لا يمكن حذف أكثر من 50 عنصراً في المرة الواحدة",
        "invalid_uuid" => "تنسيق UUID غير صحيح",

        // User validation messages
        "user_not_found" => "لم يتم العثور على المستخدم",
        "user_email_unique" => "عنوان البريد الإلكتروني هذا مُستخدم بالفعل",
        "user_phone_unique" => "رقم الهاتف هذا مُستخدم بالفعل",
        "user_image_required" => "صورة المستخدم مطلوبة",
        "user_image_invalid" => "يرجى تحميل ملف صورة صحيح",
        "user_image_size" => "يجب أن يكون حجم الصورة أقل من 2 ميجابايت",
        "user_image_type" => "يُسمح بصور JPG وJPEG وPNG وGIF وWebP فقط",

    // Role validation messages
    "role_name_required" => "اسم الدور مطلوب.",
    "role_name_unique" => "اسم الدور مستخدم بالفعل.",
    "role_name_max" => "اسم الدور لا يمكن أن يكون أكثر من :max حرف.",
    "role_description_max" => "وصف الدور لا يمكن أن يكون أكثر من :max حرف.",
    "permissions_array" => "الصلاحيات يجب أن تكون مصفوفة.",
    "permissions_exists" => "واحدة أو أكثر من الصلاحيات المحددة غير موجودة.",
    
    // Subscription Plan validation messages
    "subscription_plan_name_en_required" => "الاسم بالإنجليزية مطلوب.",
    "subscription_plan_name_ar_required" => "الاسم بالعربية مطلوب.",
    "subscription_plan_name_fr_required" => "الاسم بالفرنسية مطلوب.",
    "subscription_plan_description_en_required" => "الوصف بالإنجليزية مطلوب.",
    "subscription_plan_description_ar_required" => "الوصف بالعربية مطلوب.",
    "subscription_plan_description_fr_required" => "الوصف بالفرنسية مطلوب.",
    "subscription_plan_price_required" => "السعر مطلوب.",
        "subscription_plan_price_min" => "السعر يجب أن يكون أكبر من 0.",
        "subscription_plan_sort_order_min" => "ترتيب الفرز يجب أن يكون غير سالب.",
        "subscription_plan_yearly_price_required" => "السعر السنوي مطلوب.",
        "subscription_plan_max_clients_required" => "الحد الأقصى للعملاء مطلوب.",
        "subscription_plan_max_pets_required" => "الحد الأقصى للحيوانات الأليفة مطلوب.",
        "subscription_plan_max_appointments_required" => "الحد الأقصى للمواعيد مطلوب.",
];