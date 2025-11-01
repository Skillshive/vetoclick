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
        'uuid' => 'Le champ :attribute doit être un UUID valide.',

    // Messages de validation personnalisés pour les catégories de produits
    'category_name_unique' => 'Ce nom de catégorie est déjà utilisé.',
    'category_name_required' => 'Le nom de la catégorie est requis.',
    'category_name_min' => 'Le nom de la catégorie doit comporter au moins :min caractères.',
    'category_name_max' => 'Le nom de la catégorie ne peut pas dépasser :max caractères.',
    'category_description_max' => 'La description ne peut pas dépasser :max caractères.',
    'category_parent_exists' => 'La catégorie parente sélectionnée n\\\'existe pas.',
    'category_parent_not_self' => 'Une catégorie ne peut pas être sa propre catégorie parente.',

    // Messages de validation personnalisés pour les catégories de produits
    'category_name_unique' => 'Ce nom de catégorie est déjà utilisé.',
    'category_name_required' => 'Le nom de la catégorie est requis.',
    'category_name_min' => 'Le nom de la catégorie doit comporter au moins :min caractères.',
    'category_name_max' => 'Le nom de la catégorie ne peut pas dépasser :max caractères.',
    'category_description_max' => 'La description ne peut pas dépasser :max caractères.',
    'category_parent_exists' => 'La catégorie parente sélectionnée n\'existe pas.',
    'category_parent_not_self' => 'Une catégorie ne peut pas être sa propre catégorie parente.',

    // Messages de validation personnalisés pour les catégories de produits
    'category_name_unique' => 'Ce nom de catégorie est déjà utilisé',
    'category_name_required' => 'Le nom de la catégorie est requis',
    'category_name_min' => 'Le nom de la catégorie doit comporter au moins :min caractères',
    'category_name_max' => 'Le nom de la catégorie ne peut pas dépasser :max caractères',
    'category_description_max' => 'La description ne peut pas dépasser :max caractères',
    'category_parent_exists' => 'La catégorie parente sélectionnée n\'existe pas',
    'category_parent_not_self' => 'Une catégorie ne peut pas être sa propre catégorie parente',

    // Messages de validation personnalisés pour les catégories de produits
    'category_name_unique' => 'Ce nom de catégorie est déjà utilisé.',
    'category_name_required' => 'Le nom de la catégorie est requis.',
    'category_name_min' => 'Le nom de la catégorie doit comporter au moins :min caractères.',
    'category_name_max' => 'Le nom de la catégorie ne peut pas dépasser :max caractères.',
    'category_description_max' => 'La description ne peut pas dépasser :max caractères.',
    'category_parent_exists' => 'La catégorie parente sélectionnée n\'existe pas.',
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

        // Category Product specific attributes
        'category_product.name' => 'nom de la catégorie',
        'category_product.description' => 'description de la catégorie',
        'category_product.category_product_id' => 'catégorie parente',
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

        // Category Product validation messages
        "category_name_required" => "Le nom de la catégorie est requis",
        "category_name_min_length" => "Le nom de la catégorie doit contenir au moins 2 caractères",
        "category_name_max_length" => "Le nom de la catégorie doit contenir moins de 100 caractères",
        "category_name_invalid_chars" => "Le nom de la catégorie ne peut contenir que des lettres, des espaces, des tirets et des apostrophes",
        "description_max_length" => "La description doit contenir moins de 500 caractères",
        "parent_category_invalid" => "La catégorie parente doit être un entier positif valide",

        // Search and pagination validation
        "search_max_length" => "La requête de recherche doit contenir moins de 255 caractères",
        "per_page_invalid" => "Le nombre d'éléments par page doit être un nombre valide",
        "per_page_min" => "Le nombre d'éléments par page doit être d'au moins 5",
        "per_page_max" => "Le nombre d'éléments par page ne peut pas dépasser 100",

        // Bulk operations validation
        "no_items_selected" => "Aucun élément sélectionné pour la suppression",
        "too_many_items_selected" => "Impossible de supprimer plus de 50 éléments à la fois",
        "invalid_uuid" => "Format UUID invalide",

        // User validation messages
        "user_not_found" => "Utilisateur non trouvé",
        "user_email_unique" => "Cette adresse email est déjà utilisée",
        "user_phone_unique" => "Ce numéro de téléphone est déjà utilisé",
        "user_image_required" => "L'image de l'utilisateur est requise",
        "user_image_invalid" => "Veuillez télécharger un fichier image valide",
        "user_image_size" => "La taille de l'image doit être inférieure à 2 Mo",
        "user_image_type" => "Seules les images JPG, JPEG, PNG, GIF et WebP sont autorisées",

        // Role validation messages
        "role_name_required" => "Le nom du rôle est requis.",
        "role_name_unique" => "Le nom du rôle est déjà pris.",
        "role_name_max" => "Le nom du rôle ne peut pas dépasser :max caractères.",
        "role_description_max" => "La description du rôle ne peut pas dépasser :max caractères.",
        "permissions_array" => "Les permissions doivent être un tableau.",
        "permissions_exists" => "Une ou plusieurs permissions sélectionnées n'existent pas.",
        
        // Subscription Plan validation messages
        "subscription_plan_name_en_required" => "Le nom en anglais est requis.",
        "subscription_plan_name_ar_required" => "Le nom en arabe est requis.",
        "subscription_plan_name_fr_required" => "Le nom en français est requis.",
        "subscription_plan_description_en_required" => "La description en anglais est requise.",
        "subscription_plan_description_ar_required" => "La description en arabe est requise.",
        "subscription_plan_description_fr_required" => "La description en français est requise.",
        "subscription_plan_price_required" => "Le prix est requis.",
        "subscription_plan_price_min" => "Le prix doit être supérieur à 0.",
        "subscription_plan_sort_order_min" => "L'ordre de tri doit être non négatif.",
        "subscription_plan_yearly_price_required" => "Le prix annuel est requis.",
        "subscription_plan_max_clients_required" => "Le nombre maximum de clients est requis.",
        "subscription_plan_max_pets_required" => "Le nombre maximum d'animaux est requis.",
        "subscription_plan_max_appointments_required" => "Le nombre maximum de rendez-vous est requis.",
        "name_required" => "Le nom est requis",
        "name_min_length" => "Le nom est trop court",
"name_max_length" => "Le nom est trop long",
"name_invalid_chars" => "Le nom contient des caractères non valides",
        'client_id_required' => 'Le champ client est obligatoire.',
    'client_id_exists' => 'Le client sélectionné n’existe pas.',

    'pet_id_required' => 'Le champ animal est obligatoire.',
    'pet_id_exists' => 'L’animal sélectionné n’existe pas.',

    'veterinary_id_required' => 'Le champ vétérinaire est obligatoire.',
    'veterinary_id_exists' => 'Le vétérinaire sélectionné n’existe pas.',

    'appointment_date_required' => 'La date du rendez-vous est obligatoire.',
    'appointment_date_date' => 'La date du rendez-vous doit être une date valide.',

    'start_time_required' => 'L’heure de début est obligatoire.',
    'start_time_date_format' => 'L’heure de début doit être au format HH:MM.',

    'is_video_conseil_boolean' => 'Le champ de consultation vidéo doit être vrai ou faux.',

    'reason_for_visit_string' => 'Le motif de la visite doit être un texte valide.',
    'appointment_notes_string' => 'Les notes du rendez-vous doivent être un texte valide.',
];