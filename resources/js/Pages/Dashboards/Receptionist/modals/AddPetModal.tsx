import React, { useState, Fragment, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { CalendarIcon, PaintBrushIcon, ScaleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/common/Toast/ToastContext';
import { DatePicker } from '@/components/shared/form/Datepicker';
import ReactSelect from '@/components/ui/ReactSelect';
import { petSchema, PetFormData } from '@/schemas/petSchema';
import { z } from 'zod';
import { DogIcon, PawPrintIcon } from 'lucide-react';
import { BiMaleFemale } from 'react-icons/bi';

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface AddPetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPetAdded: (pet: { uuid: string; name: string }) => void;
    clientId: string;
}

export function AddPetModal({ isOpen, onClose, onPetAdded, clientId }: AddPetModalProps) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [saving, setSaving] = useState(false);
    const [species, setSpecies] = useState<any[]>([]);
    const [breeds, setBreeds] = useState<any[]>([]);
    const [loadingBreeds, setLoadingBreeds] = useState(false);
    const [formData, setFormData] = useState<PetFormData>({
        name: '',
        species_id: '',
        breed_id: '',
        sex: '0', // 0 = Male, 1 = Female
        dob: '',
        weight_kg: '',
        color: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof PetFormData, string>>>({});

    // Real-time validation on change
    const validateField = (field: keyof PetFormData, value: any) => {
        try {
            petSchema.shape[field].parse(value);
            setErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.issues[0]?.message;
                setErrors(prev => ({ ...prev, [field]: errorMessage }));
            }
        }
    };

    const handleFieldChange = (field: keyof PetFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        validateField(field, value);
    };

    // Load species on mount
    useEffect(() => {
        if (isOpen) {
            fetch(route('species.index') + '?per_page=0', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    // Handle different response structures
                    const speciesData = result?.props?.species?.data || result?.species?.data || result?.data || [];
                    setSpecies(speciesData.map((s: any) => ({
                        uuid: s.uuid,
                        name: s.name,
                    })));
                })
                .catch(error => {
                    console.error('Failed to load species:', error);
                    setSpecies([]);
                });
        }
    }, [isOpen]);

    // Load breeds when species changes
    useEffect(() => {
        if (formData.species_id) {
            setLoadingBreeds(true);
            fetch(route('breeds.by-species', { speciesUuid: formData.species_id }), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(result => {
                    // Handle response structure - breeds are in result.data
                    const breedsData = result?.data || [];
                    setBreeds(breedsData.map((b: any) => ({
                        uuid: b.uuid,
                        breed_name: b.breed_name || b.name,
                    })));
                })
                .catch(error => {
                    console.error('Failed to load breeds:', error);
                    setBreeds([]);
                })
                .finally(() => setLoadingBreeds(false));
        } else {
            setBreeds([]);
        }
    }, [formData.species_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate client is selected
        if (!clientId) {
            showToast({
                type: 'error',
                message: t('common.please_select_client_first') || 'Please select a client first',
                duration: 3000,
            });
            return;
        }

        // Validate with Zod
        const result = petSchema.safeParse(formData);
        
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            const newErrors: Partial<Record<keyof PetFormData, string>> = {};
            
            Object.keys(fieldErrors).forEach((key) => {
                const field = key as keyof PetFormData;
                const errorMessages = fieldErrors[field];
                if (errorMessages && errorMessages.length > 0) {
                    newErrors[field] = errorMessages[0];
                }
            });
            
            setErrors(newErrors);
            
            const firstError = Object.values(fieldErrors)[0];
            if (firstError && firstError.length > 0) {
                showToast({
                    type: 'error',
                    message: t(firstError[0]) || t('common.please_fill_required_fields') || 'Please fill required fields',
                    duration: 3000,
                });
            }
            return;
        }

        setSaving(true);

        try {
            const response = await fetch(route('pets.store'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    client_id: clientId,
                    name: formData.name,
                    breed_id: formData.breed_id,
                    sex: parseInt(formData.sex),
                    dob: formData.dob || null,
                    weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
                    color: formData.color || null,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                
                showToast({
                    type: 'success',
                    message: t('common.pet_created_success') || 'Pet created successfully',
                    duration: 3000,
                });

                // Pass new pet to parent
                if (data.pet) {
                    onPetAdded({
                        uuid: data.pet.uuid,
                        name: data.pet.name,
                    });
                }

                // Reset form
                setFormData({
                    name: '',
                    species_id: '',
                    breed_id: '',
                    sex: '0',
                    dob: '',
                    weight_kg: '',
                    color: '',
                });

                onClose();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create pet');
            }
        } catch (error: any) {
            showToast({
                type: 'error',
                message: error.message || t('common.failed_to_save') || 'Failed to save',
                duration: 3000,
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 dark:bg-black/50" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-dark-700 p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-100 flex justify-between items-center"
                                >
                                    {t('common.add_pet')}
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </DialogTitle>

                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4"> {t('common.add_pet_description_for_client')}

                                </div>
                                <form onSubmit={handleSubmit} className="mt-4">
                                    <div className="space-y-4">
                                        {/* Pet Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                {t('common.pet_name')}
                                                <span className="text-red-500 mx-1">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                                placeholder={t('common.pet_name') || 'Pet name'}
                                                className={errors.name ? 'border-red-500' : ''}
                                                leftIcon={<PawPrintIcon className="size-4" />}
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-xs text-red-500">{t(errors.name)}</p>
                                            )}
                                        </div>

                                        {/* Species & Breed */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.species')}
                                                    <span className="text-red-500 mx-1">*</span>
                                                </label>
                                                <ReactSelect
                                                    value={formData.species_id ? { value: formData.species_id, label: species.find(s => s.uuid === formData.species_id)?.name || '' } : null}
                                                    onChange={(option: any) => {
                                                        const value = option?.value || '';
                                                        setFormData({ ...formData, species_id: value, breed_id: '' });
                                                        validateField('species_id', value);
                                                    }}
                                                    options={species.map(s => ({ value: s.uuid, label: s.name }))}
                                                    placeholder={t('common.select_species') || 'Select species'}
                                                    isRequired
                                                    leftIcon={<DogIcon className="size-4" />}
                                                />
                                                {errors.species_id && (
                                                    <p className="mt-1 text-xs text-red-500">{t(errors.species_id)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.breed')}
                                                    <span className="text-red-500 mx-1">*</span>
                                                </label>
                                                <ReactSelect
                                                    value={formData.breed_id ? { value: formData.breed_id, label: breeds.find(b => b.uuid === formData.breed_id)?.breed_name || '' } : null}
                                                    onChange={(option: any) => {
                                                        const value = option?.value || '';
                                                        setFormData({ ...formData, breed_id: value });
                                                        validateField('breed_id', value);
                                                    }}
                                                    options={breeds.map(b => ({ value: b.uuid, label: b.breed_name }))}
                                                    placeholder={t('common.select_breed') || 'Select breed'}
                                                    isDisabled={!formData.species_id || loadingBreeds}
                                                    isRequired
                                                    leftIcon={<PawPrintIcon className="size-4" />}
                                                />
                                                {errors.breed_id && (
                                                    <p className="mt-1 text-xs text-red-500">{t(errors.breed_id)}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gender & DOB */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.gender')}
                                                    <span className="text-red-500 mx-1">*</span>
                                                </label>
                                                <ReactSelect
                                                    value={{ value: formData.sex, label: formData.sex === '1' ? t('common.female') : t('common.male') }}
                                                    onChange={(option: any) => setFormData({ ...formData, sex: option?.value || '0' })}
                                                    options={[
                                                        { value: '0', label: t('common.male') || 'Male' },
                                                        { value: '1', label: t('common.female') || 'Female' },
                                                    ]}
                                                    isRequired
                                                    leftIcon={<BiMaleFemale className="size-4" />}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.date_of_birth')}
                                                </label>
                                                <DatePicker
                                                    value={formData.dob}
                                                    onChange={(dates: Date[]) => {
                                                        if (dates && dates.length > 0) {
                                                            const date = dates[0];
                                                            const year = date.getFullYear();
                                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                                            const day = String(date.getDate()).padStart(2, '0');
                                                            setFormData({ ...formData, dob: `${year}-${month}-${day}` });
                                                        } else {
                                                            setFormData({ ...formData, dob: '' });
                                                        }
                                                    }}
                                                    placeholder={t('common.date_of_birth') || 'Date of birth'}
                                                    hasCalenderIcon
                                                    leftIcon={<CalendarIcon className="size-4" />}
                                                    options={{ dateFormat: 'Y-m-d', maxDate: new Date() }}
                                                />
                                            </div>
                                        </div>

                                        {/* Weight & Color */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.weight')} 
                                                </label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.weight_kg}
                                                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                                                    placeholder="0.00"
                                                    leftIcon={<ScaleIcon className="size-4" />}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                                    {t('common.color')}
                                                </label>
                                                <Input
                                                    type="text"
                                                    value={formData.color}
                                                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                    placeholder={t('common.color') || 'Color'}
                                                    leftIcon={<PaintBrushIcon className="size-4" />}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            onClick={onClose}
                                            disabled={saving}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="primary"
                                            disabled={saving}
                                        >
                                            {saving ? t('common.saving') || 'Saving...' : t('common.save')}
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

