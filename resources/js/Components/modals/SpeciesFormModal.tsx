import React from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Button, Input, Textarea, Avatar, Upload } from '@/components/ui';
import { Species, SpeciesFormData } from '@/types/Species';
import { useToast } from '@/components/common/Toast/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { HiPencil } from 'react-icons/hi';
import { PawPrintIcon } from 'lucide-react';
import { PreviewImg } from "@/components/shared/PreviewImg";


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
    const { t } = useTranslation();
    const isEditing = !!species;
    
    const { data, setData, post, put, processing, reset } = useForm<SpeciesFormData>({
        name: species?.name || '',
        description: species?.description || '',
        image: null,
    });

    React.useEffect(() => {
        if (species) {
            setData({
                name: species.name,
                description: species.description || '',
                image: null,
            });
        } else {
            reset();
        }
    }, [species, setData, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing) {
            // Update existing species using UUID
            put(route('species.update', species.uuid), {
                onSuccess: () => {
                    showToast({
                        type: 'success',
                        message: t('common.species_updated'),
                        duration: 3000,
                    });
                    onClose();
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: t('common.error'),
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
                        message: t('common.species_created'),
                        duration: 3000,
                    });
                    reset();
                    onClose();
                },
                onError: () => {
                    showToast({
                        type: 'error',
                        message: t('common.error'),
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
                                        {isEditing ? t('common.edit_species') : t('common.create_species')}
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
                                        ? t('common.edit_species_info') + ` "${species.name}"`
                                        : t('common.create_new_species')
                                    }
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    
 <div className="mt-4 flex flex-col space-y-1.5">
              <span className="dark:text-dark-100 text-base font-medium text-gray-800">
                {t('common.avatar')}
              </span>
              <Avatar
                size={20}
                                            imgComponent={PreviewImg}
                imgProps={{ file: data.image } as any}
                                            src={data.image ? URL.createObjectURL(data.image) : (species?.image ? `/storage/${species.image}` : "/assets/default/species-placeholder.png")}
                classNames={{
                  root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
                  display: "rounded-xl",
                }}
                indicator={
                  <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                    {data.image  ? (
                      <Button
                        onClick={() => {
                                                            setData('image', null);
                        }}
                        isIcon
                        className="size-6 rounded-full"
                      >
                        <XMarkIcon className="size-4" />
                      </Button>
                    ) : (
                      <Upload
                        name="avatar"
                        onChange={(files) => {
                                                            setData('image', files[0] || null);
                        }}
                        accept="image/*"
                      >
                        {({ ...props }) => (
                          <Button isIcon className="size-6 rounded-full" {...props}>
                            <HiPencil className="size-3.5" />
                          </Button>
                        )}
                      </Upload>
                    )}
                  </div>
                }
              />
            </div>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('common.species_name')} *
                                        </label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={t('common.species_name')}
                                            className={errors?.name ? 'border-red-500' : ''}
                                            required
                                            leftIcon={<PawPrintIcon className="size-5" />}
                                        />
                                        {errors?.name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('common.species_description')}
                                        </label>
                                        <Textarea
                                            id="description"
                                            value={data.description || ''}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder={t('common.species_description')}
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
                                            variant="outlined"
                                            onClick={handleClose}
                                            disabled={processing}
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing 
                                                ? (isEditing ? t('common.updating') + '...' : t('common.creating') + '...') 
                                                : (isEditing ? t('common.update') : t('common.create'))
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