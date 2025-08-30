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
];