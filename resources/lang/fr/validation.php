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
];