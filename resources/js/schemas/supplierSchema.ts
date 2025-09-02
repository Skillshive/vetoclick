import { z } from 'zod';

export const supplierSchema = z.object({
    name: z.string()
        .min(1, 'Le nom du fournisseur est requis')
        .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
    email: z.string()
        .email('Format d\'email invalide')
        .max(255, 'L\'email ne peut pas dépasser 255 caractères')
        .optional()
        .or(z.literal('')),
    phone: z.string()
        .max(20, 'Le téléphone ne peut pas dépasser 20 caractères')
        .optional()
        .or(z.literal('')),
    address: z.string()
        .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
        .optional()
        .or(z.literal(''))
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
