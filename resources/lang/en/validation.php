<?php

return [
    'required' => 'The :attribute field is required.',
    'email' => 'The :attribute must be a valid email address.',
    'min' => [
        'string' => 'The :attribute must be at least :min characters.',
    ],
    'max' => [
        'string' => 'The :attribute may not be greater than :max characters.',
    ],
    'confirmed' => 'The :attribute confirmation does not match.',
    'unique' => 'The :attribute has already been taken.',
    'exists' => 'The selected :attribute is invalid.',
    'numeric' => 'The :attribute must be a number.',
    'integer' => 'The :attribute must be an integer.',
    'date' => 'The :attribute is not a valid date.',
    'boolean' => 'The :attribute field must be true or false.',
    'string' => 'The :attribute must be a string.',
    'array' => 'The :attribute must be an array.',
    'file' => 'The :attribute must be a file.',
    'image' => 'The :attribute must be an image.',
    'mimes' => 'The :attribute must be a file of type: :values.',
    'size' => [
        'file' => 'The :attribute must be :size kilobytes.',
    ],
    'between' => [
        'numeric' => 'The :attribute must be between :min and :max.',
        'string' => 'The :attribute must be between :min and :max characters.',
    ],
    'in' => 'The selected :attribute is invalid.',
    'not_in' => 'The selected :attribute is invalid.',
    'regex' => 'The :attribute format is invalid.',
    'same' => 'The :attribute and :other must match.',
    'different' => 'The :attribute and :other must be different.',
    'alpha' => 'The :attribute may only contain letters.',
    'alpha_dash' => 'The :attribute may only contain letters, numbers, dashes and underscores.',
    'alpha_num' => 'The :attribute may only contain letters and numbers.',
    'url' => 'The :attribute format is invalid.',
    'timezone' => 'The :attribute must be a valid zone.',
    'json' => 'The :attribute must be a valid JSON string.',
    'uuid' => 'The :attribute must be a valid UUID.',

    // Custom validation messages for category products
    'category_name_unique' => 'This category name is already taken.',
    'category_name_required' => 'Category name is required.',
    'category_name_min' => 'Category name must be at least :min characters.',
    'category_name_max' => 'Category name cannot be longer than :max characters.',
    'category_description_max' => 'Description cannot be longer than :max characters.',
    'category_parent_exists' => 'The selected parent category does not exist.',
    'category_parent_not_self' => 'A category cannot be its own parent.',
    'password' => 'The password is incorrect.',
    'current_password' => 'The password is incorrect.',
    
    'attributes' => [
        'name' => 'name',
        'email' => 'email address',
        'password' => 'password',
        'password_confirmation' => 'password confirmation',
        'phone' => 'phone number',
        'address' => 'address',
        'city' => 'city',
        'country' => 'country',
        'description' => 'description',
        'title' => 'title',
        'content' => 'content',
        'category' => 'category',
        'price' => 'price',
        'quantity' => 'quantity',
        'date' => 'date',
        'time' => 'time',
        'status' => 'status',
        'type' => 'type',
        'image' => 'image',
        'file' => 'file',
        
        // Species specific attributes
        'species.name' => 'species name',
        'species.description' => 'species description',

        // Category Product specific attributes
        'category_product.name' => 'category name',
        'category_product.description' => 'category description',
        'category_product.category_product_id' => 'parent category',
    ],
    
    // Custom validation messages for species
    'custom' => [
        'name' => [
            'required' => 'The species name is required.',
            'string' => 'The species name must be a valid text.',
            'max' => 'The species name cannot exceed 255 characters.',
            'unique' => 'A species with this name already exists.',
        ],
        'description' => [
            'string' => 'The species description must be a valid text.',
            'max' => 'The species description cannot exceed 1000 characters.',
        ],
    ],

  // Required field messages
        "first_name_required" => "First name is required",
        "last_name_required" => "Last name is required",
        "email_required" => "Email is required",
        "current_password_required" => "Current password is required",

        // Minimum length messages
        "first_name_min_length" => "First name must be at least 2 characters",
        "last_name_min_length" => "Last name must be at least 2 characters",
        "password_min_length" => "Password must be at least 8 characters",

        // Maximum length messages
        "first_name_max_length" => "First name must be less than 50 characters",
        "last_name_max_length" => "Last name must be less than 50 characters",

        // Format validation messages
        "first_name_invalid_chars" => "First name can only contain letters and spaces",
        "last_name_invalid_chars" => "Last name can only contain letters and spaces",
        "email_invalid" => "Please enter a valid email address",
        "phone_invalid" => "Please enter a valid phone number",

        // Password strength messages
        "password_uppercase_required" => "Password must contain at least one uppercase letter",
        "password_lowercase_required" => "Password must contain at least one lowercase letter",
        "password_number_required" => "Password must contain at least one number",
        "password_special_char_required" => "Password must contain at least one special character",

        // Password confirmation messages
        "password_confirmation_mismatch" => "Passwords do not match",


        // Category Product validation messages
        "category_name_required" => "Category name is required",
        "category_name_min_length" => "Category name must be at least 2 characters",
        "category_name_max_length" => "Category name must be less than 100 characters",
        "category_name_invalid_chars" => "Category name can only contain letters, spaces, hyphens and apostrophes",
        "description_max_length" => "Description must be less than 500 characters",
        "parent_category_invalid" => "Parent category must be a valid positive integer",

        
        // Search and pagination validation
        "search_max_length" => "Search query must be less than 255 characters",
        "per_page_invalid" => "Items per page must be a valid number",
        "per_page_min" => "Items per page must be at least 5",
        "per_page_max" => "Items per page cannot exceed 100",

        // Bulk operations validation
        "no_items_selected" => "No items selected for deletion",
        "too_many_items_selected" => "Cannot delete more than 50 items at once",
        "invalid_uuid" => "Invalid UUID format",

        // User validation messages
        "user_not_found" => "User not found",
        "user_email_unique" => "This email address is already taken",
        "user_phone_unique" => "This phone number is already taken",
        "user_image_required" => "User image is required",
        "user_image_invalid" => "Please upload a valid image file",
        "user_image_size" => "Image size must be less than 2MB",
        "user_image_type" => "Only JPG, JPEG, PNG, GIF, and WebP images are allowed"
];