<?php

return [
    'required' => 'Le champ :attribute est requis.',
    'email' => 'Le :attribute doit être une adresse email valide.',
    'min' => [
        'string' => 'Le :attribute doit contenir au moins :min caractères.',
    ],
    'max' => [
        'string' => 'Le :attribute ne peut pas dépasser :max caractères.',
    ],
    'confirmed' => 'La confirmation de :attribute ne correspond pas.',
    'unique' => 'Le :attribute est déjà utilisé.',
    'exists' => 'Le :attribute sélectionné est invalide.',
    'numeric' => 'Le :attribute doit être un nombre.',
    'integer' => 'Le :attribute doit être un entier.',
    'date' => 'Le :attribute n\'est pas une date valide.',
    'boolean' => 'Le champ :attribute doit être vrai ou faux.',
    'string' => 'Le :attribute doit être une chaîne de caractères.',
    'array' => 'Le :attribute doit être un tableau.',
    'file' => 'Le :attribute doit être un fichier.',
    'image' => 'Le :attribute doit être une image.',
    'mimes' => 'Le :attribute doit être un fichier de type : :values.',
    'size' => [
        'file' => 'Le :attribute doit faire :size kilo-octets.',
    ],
    'between' => [
        'numeric' => 'Le :attribute doit être entre :min et :max.',
        'string' => 'Le :attribute doit contenir entre :min et :max caractères.',
    ],
    'in' => 'Le :attribute sélectionné est invalide.',
    'not_in' => 'Le :attribute sélectionné est invalide.',
    'regex' => 'Le format du :attribute est invalide.',
    'same' => 'Le :attribute et :other doivent correspondre.',
    'different' => 'Le :attribute et :other doivent être différents.',
    'alpha' => 'Le :attribute ne peut contenir que des lettres.',
    'alpha_dash' => 'Le :attribute ne peut contenir que des lettres, des chiffres, des tirets et des underscores.',
    'alpha_num' => 'Le :attribute ne peut contenir que des lettres et des chiffres.',
    'url' => 'Le format du :attribute est invalide.',
    'timezone' => 'Le :attribute doit être une zone valide.',
    'json' => 'Le :attribute doit être une chaîne JSON valide.',
    'uuid' => 'Le :attribute doit être un UUID valide.',
    'password' => 'Le mot de passe est incorrect.',
    'current_password' => 'Le mot de passe est incorrect.',
    
    'attributes' => [
        'name' => 'nom',
        'email' => 'adresse email',
        'password' => 'mot de passe',
        'password_confirmation' => 'confirmation du mot de passe',
        'phone' => 'numéro de téléphone',
        'address' => 'adresse',
        'city' => 'ville',
        'country' => 'pays',
        'description' => 'description',
        'title' => 'titre',
        'content' => 'contenu',
        'category' => 'catégorie',
        'price' => 'prix',
        'quantity' => 'quantité',
        'date' => 'date',
        'time' => 'heure',
        'status' => 'statut',
        'type' => 'type',
        'image' => 'image',
        'file' => 'fichier',
        
        // Species specific attributes
        'species.name' => 'nom de l\'espèce',
        'species.description' => 'description de l\'espèce',
    ],
    
    // Custom validation messages for species
    'custom' => [
        'name' => [
            'required' => 'Le nom de l\'espèce est requis.',
            'string' => 'Le nom de l\'espèce doit être un texte valide.',
            'max' => 'Le nom de l\'espèce ne peut pas dépasser 255 caractères.',
            'unique' => 'Une espèce avec ce nom existe déjà.',
        ],
        'description' => [
            'string' => 'La description de l\'espèce doit être un texte valide.',
            'max' => 'La description de l\'espèce ne peut pas dépasser 1000 caractères.',
        ],
    ],

      // Required field messages
        "first_name_required" => "Le prénom est requis",
        "last_name_required" => "Le nom de famille est requis",
        "email_required" => "L'email est requis",
        "current_password_required" => "Le mot de passe actuel est requis",

        // Minimum length messages
        "first_name_min_length" => "Le prénom doit contenir au moins 2 caractères",
        "last_name_min_length" => "Le nom de famille doit contenir au moins 2 caractères",
        "password_min_length" => "Le mot de passe doit contenir au moins 8 caractères",

        // Maximum length messages
        "first_name_max_length" => "Le prénom doit contenir moins de 50 caractères",
        "last_name_max_length" => "Le nom de famille doit contenir moins de 50 caractères",

        // Format validation messages
        "first_name_invalid_chars" => "Le prénom ne peut contenir que des lettres et des espaces",
        "last_name_invalid_chars" => "Le nom de famille ne peut contenir que des lettres et des espaces",
        "email_invalid" => "Veuillez saisir une adresse email valide",
        "phone_invalid" => "Veuillez saisir un numéro de téléphone valide",

        // Password strength messages
        "password_uppercase_required" => "Le mot de passe doit contenir au moins une lettre majuscule",
        "password_lowercase_required" => "Le mot de passe doit contenir au moins une lettre minuscule",
        "password_number_required" => "Le mot de passe doit contenir au moins un chiffre",
        "password_special_char_required" => "Le mot de passe doit contenir au moins un caractère spécial",

        // Password confirmation messages
        "password_confirmation_mismatch" => "Les mots de passe ne correspondent pas",

        // Field labels
        "firstname_label" => "Prénom",
        "lastname_label" => "Nom de famille",
        "email_label" => "Adresse email",
        "phone_label" => "Téléphone",
        "current_password_label" => "Mot de passe actuel",
        "new_password_label" => "Nouveau mot de passe",
        "confirm_password_label" => "Confirmer le mot de passe",

        // Placeholder texts
        "firstname_placeholder" => "Entrez le prénom",
        "lastname_placeholder" => "Entrez le nom de famille",
        "email_placeholder" => "Entrez votre adresse email",
        "phone_placeholder" => "Entrez le numéro de téléphone",
        "current_password_placeholder" => "Entrez le mot de passe actuel",
        "new_password_placeholder" => "Entrez le nouveau mot de passe",
        "confirm_password_placeholder" => "Confirmez le nouveau mot de passe"
    
];