// Import Dependencies
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { HiPencil, HiPlus } from "react-icons/hi";

// Local Imports
import { Page } from "@/components/shared/Page";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { Avatar, Button, Input, Upload, Card } from "@/components/ui";
import { useForm, router } from "@inertiajs/react";
import { useTranslation } from "@/hooks/useTranslation";
import MainLayout from "@/layouts/MainLayout";
import { useToast } from "@/components/common/Toast/ToastContext";
import { useConfirm } from "@/components/common/Confirm/ConfirmContext";
import { getImageUrl } from "@/utils/imageHelper";
import Breeds from "./Breeds/Index";
import { BackwardIcon } from "@heroicons/react/24/outline";
import { breedsSchema, speciesSchema } from "@/schemas/speciesSchema";

interface Breed {
  uuid: string;
  breed_name: string;
  avg_weight_kg?: number;
  life_span_years?: number;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface Species {
  data:{
  id: number;
  uuid: string;
  name: string;
  description?: string;
  image?: string;
  created_at: string;
  updated_at: string;
  breeds?: {
    data: Breed[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
    links: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
  };
  }
}

interface SpeciesEditPageProps {
  species: Species;
}

export default function SpeciesEdit({ species }: SpeciesEditPageProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [avatar, setAvatar] = useState<File | null>(null);

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    description?: string;
    image?: string;
  }>({});
  
  const [breedsValidationErrors, setBreedsValidationErrors] = useState<{
   breed_name?: string;
   avg_weight_kg?: string;
   life_span_years?: string;
   image?: string;
 }>({});

  const [breedImage, setBreedImage] = useState<File | null>(null);
  const [editingBreed, setEditingBreed] = useState<Breed | null>(null);
  const [isEditingBreed, setIsEditingBreed] = useState(false);

  const specie = species.data;

  const { data, setData, post, processing, errors, reset } = useForm({
    name: specie.name || "",
    description: specie.description || "",
    image: null as File | null,
  });
  
  // Breed form
  const { data: breedData, setData: setBreedData, post: postBreed, processing: breedProcessing, errors: breedErrors, reset: resetBreed ,clearErrors: clearBreedErrors} = useForm({
    breed_name: "",
    avg_weight_kg: null,
    life_span_years: null,
    species_id: specie.uuid,
    image: null as File | null,
  });

  const imageUrl = getImageUrl(specie.image || null, "/assets/default/species-placeholder.png");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = speciesSchema.safeParse(data);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setValidationErrors({
        name: errors.name?.[0] ? t(errors.name[0]) : undefined,
        description: errors.description?.[0] ? t(errors.description[0]) : undefined,
        image: errors.image?.[0] ? t(errors.image[0]) : undefined,
      });
      return;
    }
    post(route('species.update', specie.uuid), {
      onSuccess: () => {
        setValidationErrors({});
        showToast({
          type: 'success',
          message: t('common.species_updated'),
        });
      },
      onError: (errors) => {
        setValidationErrors({
          name: errors.name ? t(errors.name) : undefined,
          description: errors.description ? t(errors.description) : undefined,
          image: errors.image ? t(errors.image) : undefined,
        });

        showToast({
          type: 'error',
          message: t('common.error_occurred'),
        });
      },
    });
  };

  // Breed form handlers
  const handleBreedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
 const result = breedsSchema.safeParse(breedData);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setBreedsValidationErrors({
        breed_name: errors.breed_name?.[0] ? t(errors.breed_name[0]) : undefined,
        avg_weight_kg: errors.avg_weight_kg?.[0] ? t(errors.avg_weight_kg[0]) : undefined,
        life_span_years: errors.life_span_years?.[0] ? t(errors.life_span_years[0]) : undefined,
        image: errors.image?.[0] ? t(errors.image[0]) : undefined,
      });
      return;
    }

    const submitData = {
      ...breedData,
      avg_weight_kg: breedData.avg_weight_kg ? Number(breedData.avg_weight_kg) : null,
      life_span_years: breedData.life_span_years ? Number(breedData.life_span_years) : null,
      species_id: specie.uuid ?specie.uuid : null,
    };

    if (isEditingBreed && editingBreed?.uuid) {
      postBreed(route('breeds.update', editingBreed.uuid), {
        data: submitData,
        onSuccess: () => {
          setBreedsValidationErrors({});
          showToast({
            type: 'success',
            message: t('common.breed_updated'),
          });
          handleResetBreedForm();
           router.visit(window.location.href, {
                                preserveState: false, 
                                preserveScroll: true
                              });
        },
        onError: (errors: any, response?: any) => {
           setBreedsValidationErrors({
          breed_name: errors.breed_name ? t(errors.breed_name) : undefined,
          avg_weight_kg: errors.avg_weight_kg ? t(errors.avg_weight_kg) : undefined,
          life_span_years: errors.life_span_years ? t(errors.life_span_years) : undefined,
          image: errors.image ? t(errors.image) : undefined,
        });

          showToast({
            type: 'error',
            message: t('common.error_occurred'),
          });
        },
      });
    } else {
      postBreed(route('breeds.store'), {
        data: submitData,
        onSuccess: () => {
          setBreedsValidationErrors({});
          showToast({
            type: 'success',
            message: t('common.breed_created'),
          });
          handleResetBreedForm();
           router.visit(window.location.href, {
                                preserveState: false, 
                                preserveScroll: true
                              });
        },
        onError: (errors: any, response?: any) => {
            setBreedsValidationErrors({
          breed_name: errors.breed_name ? t(errors.breed_name) : undefined,
          avg_weight_kg: errors.avg_weight_kg ? t(errors.avg_weight_kg) : undefined,
          life_span_years: errors.life_span_years ? t(errors.life_span_years) : undefined,
          image: errors.image ? t(errors.image) : undefined,
        });
          showToast({
            type: 'error',
            message: t('common.error_occurred'),
          });
        },
      });
    }
  };

  const handleEditBreed = (breed: Breed) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleResetBreedForm ()
    setEditingBreed(breed);    
    setIsEditingBreed(true);
    setBreedData('breed_name', breed.breed_name);
    setBreedData('avg_weight_kg', Number(breed.avg_weight_kg) || "");
    setBreedData('life_span_years', Number(breed.life_span_years) || "");
    setBreedData('species_id', specie.uuid);
    setBreedData('image', null);
    setBreedImage(null);
    showToast({
      type: 'info',
      message: t('common.editing_breed', { name: breed.breed_name }),
    });
  };

  const handleResetBreedForm = () => {
    resetBreed();
    setBreedData('breed_name', '');
    setBreedData('avg_weight_kg', '');
    setBreedData('life_span_years', '');
    setBreedData('image', null);
    setEditingBreed(null);
    setIsEditingBreed(false);
    setBreedsValidationErrors({});
    setBreedImage(null);
    clearBreedErrors();
  };

  return (
    <MainLayout>
      <Page title={`${t('common.edit_species')} - ${specie.name}`}>
        <div className="transition-content px-(--margin-x) pb-6 my-5">
          <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
            <div className="col-span-12 lg:col-span-8">
              <Card className="p-3 sm:px-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
                  {t('common.edit_species')}
                </h5>
                <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
                  {t('common.edit_species_info')}
                </p>
                <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

                <form onSubmit={handleSubmit}>
                  <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Avatar Column */}
                    <div className="lg:col-span-1 flex flex-col items-center space-y-3">
                      <Avatar
                        size={24}
                        imgComponent={PreviewImg}
                        imgProps={{ file: avatar } as any}
                        src={data.image ? URL.createObjectURL(data.image) : imageUrl}
                        classNames={{
                          root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
                          display: "rounded-xl",
                        }}
                        indicator={
                          <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                            {avatar ? (
                              <Button
                                onClick={() => {
                                  setAvatar(null);
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
                                onChange={(files: FileList | null) => {
                                  const file = files?.[0] || null;

                                  // update form data
                                  setData('image', file);

                                  // validate with zod schema
                                  const result = speciesSchema.safeParse({
                                    ...data,
                                    image: file,
                                  });

                                  if (!result.success) {
                                    const errors = result.error.flatten().fieldErrors;
                                    setValidationErrors(prev => ({
                                      ...prev,
                                      image: errors.image?.[0] ? t(errors.image[0]) : undefined,
                                    }));
                                  } else {
                                    setValidationErrors(prev => ({
                                      ...prev,
                                      image: undefined,
                                    }));
                                  }
                                }}
                                accept="image/*"
                                className={errors?.image || validationErrors.image ? 'border-red-500' : ''}                            >
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
                      {
                        (errors?.image || validationErrors.image) && (
                          <p className="text-red-500 text-sm mt-1">{errors?.image || validationErrors.image}</p>
                        )
                      }
                    </div>

                    {/* Form Fields Column */}
                    <div className="lg:col-span-3 space-y-4">
                      <div>
                        <Input
                          placeholder={t('common.species_name')}
                          label={t('common.species_name')}
                          value={data.name}
                          onChange={(e) => {
                            setData('name', e.target.value);
                            const result = speciesSchema.safeParse({
                              ...data,
                              name: e.target.value,
                            });
                            if (!result.success) {
                              const errors = result.error.flatten().fieldErrors;
                              setValidationErrors(prev => ({
                                ...prev,
                                name: errors.name?.[0] ? t(errors.name[0]) : undefined,
                              }));
                            } else {
                              setValidationErrors(prev => ({
                                ...prev,
                                name: undefined,
                              }));
                            }
                          }}
                          className={errors?.name || validationErrors.name ? 'border-red-500 rounded-xl' : 'rounded-xl'}
                          required={true}
                        />
                        {
                          (errors?.name || validationErrors.name) && (
                            <p className="text-red-500 text-sm mt-1">{errors?.name || validationErrors.name}</p>
                          )
                        }
                      </div>

                      <div>
                        <label className="dark:text-dark-100 block text-sm font-medium text-gray-700">
                          {t('common.species_description')}
                        </label>
                        <textarea
                          placeholder={t('common.species_description')}
                          className="dark:bg-dark-900 dark:border-dark-600 dark:text-dark-100 mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          rows={4}
                          value={data.description}
                          onChange={(e) => {
                            setData('description', e.target.value);
                            if (validationErrors.description) {
                              setValidationErrors(prev => ({ ...prev, description: undefined }));
                            }
                          }}
                        />
                        {(errors.description || validationErrors.description) && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.description || validationErrors.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />

                  <div className="mt-8 flex justify-end space-x-3">
                    <Button
                      className="min-w-[7rem]"
                      onClick={() => {
                        reset();
                        setValidationErrors({});
                      }}
                      type="button"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      className="min-w-[7rem]"
                      color="primary"
                      type="submit"
                      disabled={processing || !data.name.trim()}
                    >
                      {processing ? t('common.updating') : t('common.update')}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
            <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
              <Card className="p-4 sm:px-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <div className="flex items-center justify-between">
                  <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800 my-0">
                    {isEditingBreed ? t('common.edit_breed') : t('common.create_breed')}
                  </h5>
                  {isEditingBreed && (
                    <Button
                      onClick={handleResetBreedForm}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <BackwardIcon className="w-4 h-4" />
                      <span>{t('common.reset')}</span>
                    </Button>
                  )}
                </div>
                <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500 my-0">
                  {isEditingBreed ? t('common.edit_breed_info') : t('common.create_breed_info')}
                </p>
                <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

                <form onSubmit={handleBreedSubmit}>
                  {/* Breed Image Upload */}
                  <div className="flex flex-col items-center space-y-3 mb-2">
                    <Avatar
                      size={18}
                      imgComponent={PreviewImg}
                      imgProps={{ file: breedImage } as any}
                      src={breedImage ? URL.createObjectURL(breedImage) : (editingBreed?.image ? getImageUrl(editingBreed.image, "/assets/default/species-placeholder.png") : "/assets/default/species-placeholder.png")}
                      classNames={{
                        root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
                        display: "rounded-xl",
                      }}
                      indicator={
                        <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                          {breedImage ? (
                            <Button
                              onClick={() => {
                                setBreedImage(null);
                                setBreedData('image', null);
                              }}
                              isIcon
                              className="size-6 rounded-full"
                            >
                              <XMarkIcon className="size-4" />
                            </Button>
                          ) : (
                            <Upload
                              name="breed_image"
                              onChange={(files: FileList | null) => {
                                  const file = files?.[0] || null;
setBreedImage(file);
setBreedData('image', file);

const result = breedsSchema.safeParse({
  ...breedData,
  image: file,
});

setBreedsValidationErrors((prev) => {
                                    if (!result.success) {
                                      const fieldErrors = result.error.flatten().fieldErrors;
                                      
                                      if (fieldErrors.image && fieldErrors.image[0]) {
                                        return {
                                          ...prev,
                                          image: t(fieldErrors.image[0]), 
                                        };
                                      }
                                    }
                                
                                    clearBreedErrors('image');

                                    return {
                                      ...prev,
                                      image: undefined,
                                    };
                                  });

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
                        
                    /><div>
                        {
                            (breedErrors?.image || breedsValidationErrors.image) && (
                                <p className="text-red-500 text-sm mt-1">{breedErrors?.image || breedsValidationErrors.image}</p>
                            )
                            }
                        </div>
                  </div>

                  <div className="space-y-3">
                    <div>

                    <Input
                      label={t('common.breed_name')}
                      placeholder={t('common.breed_name')}
                      value={breedData.breed_name}
                      onChange={(e) => {
                            setBreedData('breed_name', e.target.value);
                            const result = breedsSchema.safeParse({
                              ...breedData,
                              breed_name: e.target.value,
                            });
                            if (!result.success) {
                              const errors = result.error.flatten().fieldErrors;
                              setBreedsValidationErrors(prev => ({
                                ...prev,
                                breed_name: errors.breed_name?.[0] ? t(errors.breed_name[0]) : undefined,
                              }));
                            } else {
                              setBreedsValidationErrors(prev => ({
                                ...prev,
                                breed_name: undefined,
                              }));
                            }
                          }}
                      required
                    />
{
                                        (breedErrors?.breed_name || breedsValidationErrors.breed_name) && (
                                            <p className="text-red-500 text-sm mt-1">{breedErrors?.breed_name || breedsValidationErrors.breed_name}</p>
                                        )
                                        }
                      </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                      <Input
                        label={t('common.avg_weight_kg')}
                        placeholder={t('common.weight')}
                        type="number"
                        step="0.01"
                        value={breedData.avg_weight_kg}
                          onChange={(e) => {
                             const value = e.target.value;
                             const numValue = value ? parseFloat(value) : undefined;
                             setBreedData('avg_weight_kg', numValue);
                             const result = breedsSchema.safeParse({
                               ...breedData,
                               avg_weight_kg: numValue,
                             });
                             if (!result.success) {
                               const errors = result.error.flatten().fieldErrors;
                               setBreedsValidationErrors(prev => ({
                                 ...prev,
                                 avg_weight_kg: errors.avg_weight_kg?.[0] ? t(errors.avg_weight_kg[0]) : undefined,
                               }));
                             } else {
                               setBreedsValidationErrors(prev => ({
                                 ...prev,
                                 avg_weight_kg: undefined,
                               }));
                             }
                           }}
                        />
                        {
                                        (breedErrors?.avg_weight_kg || breedsValidationErrors.avg_weight_kg) && (
                                            <p className="text-red-500 text-sm mt-1">{breedErrors?.avg_weight_kg || breedsValidationErrors.avg_weight_kg}</p>
                                        )
                                        }
                        </div>
<div>

                      <Input
                        label={t('common.life_span_years')}
                        placeholder={t('common.life_span')}
                        type="number"
                        value={breedData.life_span_years}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value ? parseFloat(value) : undefined;
                            setBreedData('life_span_years', numValue);
                            const result = breedsSchema.safeParse({
                              ...breedData,
                              life_span_years: numValue,
                            });
                            if (!result.success) {
                              const errors = result.error.flatten().fieldErrors;
                              setBreedsValidationErrors(prev => ({
                                ...prev,
                                life_span_years: errors.life_span_years?.[0] ? t(errors.life_span_years[0]) : undefined,
                              }));
                            } else {
                              setBreedsValidationErrors(prev => ({
                                ...prev,
                                life_span_years: undefined,
                              }));
                            }
                          }}
                        />
                        {
                                        (breedErrors?.life_span_years || breedsValidationErrors.life_span_years) && (
                                            <p className="text-red-500 text-sm mt-1">{breedErrors?.life_span_years || breedsValidationErrors.life_span_years}</p>
                                        )
                                        }
                        </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    {!isEditingBreed && (
                      <Button
                        type="button"
                        onClick={handleResetBreedForm}
                        disabled={breedProcessing}
                      >
                        {t('common.reset')}
                      </Button>
                    )}
                    <Button
                      type="submit"
                      color="primary"
                      disabled={breedProcessing}
                      className="flex items-center space-x-2"
                    >
                      <HiPlus className="w-4 h-4" />
                      <span>
                        {breedProcessing
                          ? (isEditingBreed ? t('common.updating') : t('common.creating'))
                          : (isEditingBreed ? t('common.update') : t('common.create'))
                        }
                      </span>
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>


        <Breeds
          breedsData={specie.breeds}
          speciesId={specie.id}
          speciesUuid={specie.uuid}
          onCreateBreed={() => {
            handleResetBreedForm();
          }}
          onEditBreed={handleEditBreed}
          onDeleteBreed={async (breed) => {
            const confirmed = await confirm({
              title: t('common.confirm_delete'),
              message: t('common.confirm_delete_breed', { name: breed.breed_name }),
              confirmLabel: t('common.delete'),
            });

            if (confirmed) {
              // Handle breed deletion
              router.delete(route('breeds.destroy', breed.uuid), {
                onSuccess: () => {
                  showToast({
                    type: 'success',
                    message: t('common.breed_deleted'),
                  });
                    router.visit(window.location.href, {
                                preserveState: false, 
                                preserveScroll: true
                              });
                },
                onError: () => {
                  showToast({
                    type: 'error',
                    message: t('common.error_occurred'),
                  });
                },
              });
            }
          }}
        />
      </Page>
    </MainLayout>
  );
}
