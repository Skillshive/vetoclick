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

        // Field labels
        "firstname_label" => "First Name",
        "lastname_label" => "Last Name",
        "email_label" => "Email Address",
        "phone_label" => "Phone",
        "current_password_label" => "Current Password",
        "new_password_label" => "New Password",
        "confirm_password_label" => "Confirm Password",

        // Placeholder texts
        "firstname_placeholder" => "Enter first name",
        "lastname_placeholder" => "Enter last name",
        "email_placeholder" => "Enter your email address",
        "phone_placeholder" => "Enter phone number",
        "current_password_placeholder" => "Enter current password",
        "new_password_placeholder" => "Enter new password",
        "confirm_password_placeholder" => "Confirm new password"
];