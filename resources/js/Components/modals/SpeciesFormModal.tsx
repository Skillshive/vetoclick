import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input, Textarea } from '@/components/ui';
import { Species, SpeciesFormData } from '@/types/Species';
import { useToast } from '@/components/common/Toast/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface SpeciesFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    species?: Species | null;
    errors?: Record<string, string>;
}

export default function SpeciesFormModal({ isOpen, onClose, species, errors }: SpeciesFormModalProps) {
    const { showToast } = useToast();
    const isEditing = !!species;
    
    const { data, setData, post, put, processing, reset } = useForm<SpeciesFormData>({
        name: species?.name || '',
        description: species?.description || '',
    });

    React.useEffect(() => {
        if (species) {
            setData({
                name: species.name,
                description: species.description || '',
            });
        } else {
            reset();
        }
    }, [species]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            // Update existing species using UUID
            put(route('species.update', species.uuid), {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: 'Espèce mise à jour avec succès',
                        duration: 3000,
                    });
                    onClose();
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: 'Erreur lors de la mise à jour de l\'espèce',
                        duration: 3000,
                    });
                }
            });
        } else {
            // Create new species
            post(route('species.store'), {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: 'Espèce créée avec succès',
                        duration: 3000,
                    });
                    reset();
                    onClose();
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: 'Erreur lors de la création de l\'espèce',
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
                                        {isEditing ? 'Modifier l\'espèce' : 'Nouvelle espèce'}
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
                                        ? `Modifiez les informations de l'espèce "${species.name}"`
                                        : 'Créez une nouvelle espèce d\'animal dans le système'
                                    }
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nom de l'espèce *
                                        </label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Ex: Chien, Chat, Oiseau..."
                                            className={errors?.name ? 'border-red-500' : ''}
                                            required
                                        />
                                        {errors?.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Description
                                        </label>
                                        <Textarea
                                            id="description"
                                            value={data.description || ''}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Description de l'espèce (optionnel)"
                                            rows={3}
                                            className={errors?.description ? 'border-red-500' : ''}
                                        />
                                        {errors?.description && (
                                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
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
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
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
