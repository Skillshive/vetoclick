import React from 'react';
import { useForm as useInertiaForm } from '@inertiajs/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input, Textarea } from '@/components/ui';
import { Supplier, SupplierFormData } from '@/types/Suppliers';
import { useToast } from '@/components/common/Toast/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supplierSchema, SupplierFormValues } from '@/schemas/supplierSchema';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface SupplierFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier?: Supplier | null;
    errors?: Record<string, string>;
}

export default function SupplierFormModal({ isOpen, onClose, supplier, errors }: SupplierFormModalProps) {
    const { showToast } = useToast();
    const isEditing = !!supplier;
    
    // Inertia form for server submission
    const { post, put, processing } = useInertiaForm();
    
    // React Hook Form with Zod validation
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors: validationErrors, isValid }
    } = useForm<SupplierFormValues>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            name: supplier?.name || '',
            email: supplier?.email || '',
            phone: supplier?.phone || '',
            address: supplier?.address || '',
        },
        mode: 'onChange' // Real-time validation
    });

    React.useEffect(() => {
        if (supplier) {
            setValue('name', supplier.name);
            setValue('email', supplier.email || '');
            setValue('phone', supplier.phone || '');
            setValue('address', supplier.address || '');
        } else {
            reset();
        }
    }, [supplier, setValue, reset]);

    const onSubmit = (data: SupplierFormValues) => {
        if (isEditing) {
            // Update existing supplier using UUID
            put(route('suppliers.update', supplier.uuid), {
                data,
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: 'Fournisseur mis à jour avec succès',
                        duration: 3000,
                    });
                    onClose();
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: 'Erreur lors de la mise à jour du fournisseur',
                        duration: 3000,
                    });
                }
            });
        } else {
            // Create new supplier
            post(route('suppliers.store'), {
                data,
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: 'Fournisseur créé avec succès',
                        duration: 3000,
                    });
                    reset();
                    onClose();
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: 'Erreur lors de la création du fournisseur',
                        duration: 3000,
                    });
                }
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Transition show={isOpen}>
            <Dialog onClose={handleClose} className="relative z-50">
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <DialogTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {isEditing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                                    </DialogTitle>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    {isEditing 
                                        ? `Modifiez les informations du fournisseur "${supplier.name}"`
                                        : 'Créez un nouveau fournisseur dans le système'
                                    }
                                </p>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nom du fournisseur *
                                        </label>
                                        <Controller
                                            name="name"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    {...field}
                                                    placeholder="Ex: Vetoquinol, Royal Canin..."
                                                    className={validationErrors.name ? 'border-red-500' : ''}
                                                />
                                            )}
                                        />
                                        {validationErrors.name && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.name.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email
                                        </label>
                                        <Controller
                                            name="email"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    {...field}
                                                    placeholder="contact@fournisseur.com"
                                                    className={validationErrors.email ? 'border-red-500' : ''}
                                                />
                                            )}
                                        />
                                        {validationErrors.email && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.email.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Téléphone
                                        </label>
                                        <Controller
                                            name="phone"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    {...field}
                                                    placeholder="+33 1 23 45 67 89"
                                                    className={validationErrors.phone ? 'border-red-500' : ''}
                                                />
                                            )}
                                        />
                                        {validationErrors.phone && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.phone.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Adresse
                                        </label>
                                        <Controller
                                            name="address"
                                            control={control}
                                            render={({ field }) => (
                                                <Textarea
                                                    id="address"
                                                    {...field}
                                                    placeholder="Adresse complète du fournisseur"
                                                    rows={3}
                                                    className={validationErrors.address ? 'border-red-500' : ''}
                                                />
                                            )}
                                        />
                                        {validationErrors.address && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.address.message}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end space-x-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleClose}
                                            disabled={processing}
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing || !isValid}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {processing 
                                                ? (isEditing ? 'Mise à jour...' : 'Création...') 
                                                : (isEditing ? 'Mettre à jour' : 'Créer')
                                            }
                                        </Button>
                                    </div>
                                </form>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
