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
];