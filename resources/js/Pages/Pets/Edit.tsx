import React, { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import MainLayout from '@/layouts/MainLayout';
import { Page } from '@/components/shared/Page';
import { Card, Button, Input, Textarea, Avatar, Upload, Switch } from '@/components/ui';
import { useToast } from '@/Components/common/Toast/ToastContext';
import { useTranslation } from '@/hooks/useTranslation';
import { petFormSchema, PetFormValues } from '@/schemas/petSchema';
import { BreadcrumbItem, Breadcrumbs } from '@/components/shared/Breadcrumbs';
import ReactSelect from '@/components/ui/ReactSelect';
import 'react-datepicker/dist/react-datepicker.css';
import { PreviewImg } from "@/components/shared/PreviewImg";
import { HiPencil } from 'react-icons/hi';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  UserIcon,
  IdentificationIcon,
  ScaleIcon,
  PaintBrushIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartOffIcon, PawPrint, PawPrintIcon, TagsIcon } from 'lucide-react';
import { DatePicker } from '@/Components/shared/form/Datepicker';
import { BiCategory } from 'react-icons/bi';
import { getPetAvatarUrl } from '@/utils/imageHelper';
declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface Species {
  uuid: string;
  name: string;
  breeds?: Breed[];
}

interface Breed {
  uuid: string;
  name: string;
  breed_name?: string;
  species_id?: number;
}

interface Pet {
  uuid: string;
  name: string;
  breed_id?: string;
  sex?: number;
  neutered_status?: boolean;
  dob?: string;
  microchip_ref?: string;
  profile_img?: string;
  weight_kg?: number;
  bcs?: number;
  color?: string;
  notes?: string;
  deceased_at?: string;
  breed?: Breed & {
    species_id?: number;
    species?: {
      uuid: string;
      name: string;
    };
  };
}

interface EditProps {
  pet: Pet;
}

export default function Edit({ pet }: EditProps) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [processing, setProcessing] = useState(false);
  const [species, setSpecies] = useState<Species[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [dob, setDob] = useState<Date | null>(null);
  const [deceasedAt, setDeceasedAt] = useState<Date | null>(null);

  const { data, setData, reset } = useForm<PetFormValues>({
    name: pet?.name || '',
    breed_id: pet?.breed_id || pet?.breed?.uuid || '',
    species_id: '',
    sex: (pet?.sex === 1 ? 1 : 0) as 0 | 1,
    neutered_status: typeof pet?.neutered_status === 'boolean' 
      ? pet.neutered_status 
      : (pet?.neutered_status === 1 || pet?.neutered_status === '1' || pet?.neutered_status === true),
    dob: pet?.dob || '',
    microchip_ref: pet?.microchip_ref || null,
    profile_img: null,
    weight_kg: pet?.weight_kg || null,
    bcs: pet?.bcs || null,
    color: pet?.color || null,
    notes: pet?.notes || null,
    deceased_at: pet?.deceased_at || null,
  });

  // Fetch species on mount
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch(route('species.index') + '?per_page=0', {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
          },
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error('Response is not JSON');
        }

        const result = await response.json();
        const speciesData = result?.props?.species?.data || result?.species?.data || result?.data || [];
        
        setSpecies(speciesData.map((s: any) => ({
          uuid: s.uuid,
          name: s.name,
        })));
      } catch (error) {
        setSpecies([]);
      }
    };
    fetchSpecies();
  }, []);

  // Set initial species and breed when pet data is available
  useEffect(() => {
    if (pet?.breed && species.length > 0) {
      // If breed has species relationship, use it directly
      if (pet.breed.species) {
        const speciesUuid = pet.breed.species.uuid;
        setSelectedSpecies(speciesUuid);
        setData('species_id', speciesUuid);
        
        // Fetch breeds for this species
        const fetchBreeds = async () => {
          try {
            const response = await fetch(route('breeds.by-species', { speciesUuid }), {
              headers: {
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
              },
            });
            const result = await response.json();
            const breedsData = result?.data || [];
            setBreeds(breedsData.map((b: any) => ({
              uuid: b.uuid,
              name: b.breed_name || b.name,
            })));
            // Set the breed_id if not already set
            if (pet.breed_id || pet.breed?.uuid) {
              setData('breed_id', pet.breed_id || pet.breed?.uuid || '');
            }
          } catch (error) {
            console.error('Error fetching breeds:', error);
          }
        };
        fetchBreeds();
      } else {
        // Fallback: try to find the species from the breed
        const fetchBreedSpecies = async () => {
          try {
            for (const sp of species) {
              try {
                const response = await fetch(route('breeds.by-species', { speciesUuid: sp.uuid }), {
                  headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                  },
                });
                const result = await response.json();
                const breedsData = result?.data || [];
                const breed = breedsData.find((b: any) => b.uuid === pet.breed_id || b.uuid === pet.breed?.uuid);
                if (breed) {
                  setSelectedSpecies(sp.uuid);
                  setData('species_id', sp.uuid);
                  setBreeds(breedsData.map((b: any) => ({
                    uuid: b.uuid,
                    name: b.breed_name || b.name,
                  })));
                  break;
                }
              } catch (error) {
                continue;
              }
            }
          } catch (error) {
            console.error('Error finding breed species:', error);
          }
        };
        fetchBreedSpecies();
      }
    }
  }, [pet, species]);

  // Fetch breeds when species is selected
  useEffect(() => {
    const fetchBreeds = async () => {
      if (!selectedSpecies) {
        setBreeds([]);
        setData('breed_id', '');
        setData('species_id', '');
        return;
      }
      try {
        const response = await fetch(route('breeds.by-species', { speciesUuid: selectedSpecies }), {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
        });
        const result = await response.json();
        const breedsData = result?.data || [];
        setBreeds(breedsData.map((b: any) => ({
          uuid: b.uuid,
          name: b.breed_name || b.name,
        })));
      } catch (error) {
        console.error('Error fetching breeds:', error);
        setBreeds([]);
        setData('breed_id', '');
      }
    };
    fetchBreeds();
  }, [selectedSpecies]);

  // Set dates when pet data changes
  useEffect(() => {
    if (pet) {
      setDob(pet.dob ? new Date(pet.dob) : null);
      setDeceasedAt(pet.deceased_at ? new Date(pet.deceased_at) : null);
    }
  }, [pet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
console.log('data', data);
    const result = petFormSchema.safeParse(data);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const errorMap: Record<string, string> = {};
      Object.keys(errors).forEach((key) => {
        const fieldErrors = errors[key as keyof typeof errors];
        errorMap[key] = fieldErrors?.[0] ? t(fieldErrors[0]) : '';
      });
      setValidationErrors(errorMap);
      return;
    }


    setProcessing(true);

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('species_id', data.species_id || '');
    formData.append('breed_id', data.breed_id || '');
    formData.append('sex', String(data.sex));
    formData.append('dob', data.dob || '');
    formData.append('neutered_status', data.neutered_status ? '1' : '0');
    if (data.microchip_ref) {
      formData.append('microchip_ref', data.microchip_ref);
    }
    if (data.profile_img instanceof File) {
      formData.append('profile_img', data.profile_img);
    }
    if (data.weight_kg !== null && data.weight_kg !== undefined) {
      formData.append('weight_kg', String(data.weight_kg));
    }
    if (data.bcs !== null && data.bcs !== undefined) {
      formData.append('bcs', String(data.bcs));
    }
    if (data.color) {
      formData.append('color', data.color);
    }
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    if (data.deceased_at) {
      formData.append('deceased_at', data.deceased_at);
    }

    router.post(route('pets.update', pet.uuid) as any, formData as any, {
      onSuccess: () => {
        showToast({
          type: 'success',
          message: t('common.pet_updated_success') || 'Pet updated successfully',
          duration: 3000,
        });
        router.visit(route('pets.index'));
      },
      onError: (errors: any) => {
        const errorMap: Record<string, string> = {};
        Object.keys(errors).forEach((key) => {
          errorMap[key] = errors[key]?.[0] ? t(errors[key][0]) : '';
        });
        setValidationErrors(errorMap);
        showToast({
          type: 'error',
          message: t('common.pet_update_error') || 'Error updating pet',
          duration: 3000,
        });
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  const speciesOptions = species.map(s => ({
    value: s.uuid,
    label: s.name
  }));

  const breedOptions = breeds.map(b => ({
    value: b.uuid,
    label: b.name
  }));

  const genderOptions = [
    { value: '0', label: t('common.male') || 'Male' },
    { value: '1', label: t('common.female') || 'Female' },
  ];

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.pets') || 'Pets', path: route('pets.index') },
    { title: t('common.edit_pet') || 'Edit Pet' },
  ];

  return (
    <MainLayout>
      <Page title={t("common.edit_pet") || "Edit Pet"}>
        <div className="transition-content px-(--margin-x) pb-6">
          <div className="flex flex-col items-center justify-between space-y-4 py-5 sm:flex-row sm:space-y-0 lg:py-6">
            <div className="flex items-center gap-1">
              <div>
                <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.edit_pet_description') || 'Edit pet information'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
              <div className="col-span-12">
                <Card className="p-4 sm:px-5">
                  {/* Avatar Upload */}
                  <div className="flex flex-col space-y-2 mb-6">
                  <span className="dark:text-dark-100 text-base font-medium text-gray-800">
                {t('common.profile_img')}
              </span>
                    <Avatar
                      size={20}
                      imgComponent={PreviewImg}
                      imgProps={{ file: data.profile_img } as any}
                      src={getPetAvatarUrl({ ...data, profile_img: data.profile_img || pet?.profile_img })}
                      classNames={{
                        root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3",
                        display: "rounded-xl",
                      }}
                      indicator={
                        <div className="dark:bg-dark-700 absolute right-0 bottom-0 -m-1 flex items-center justify-center rounded-full bg-white">
                          {data.profile_img ? (
                            <Button
                              onClick={() => {
                                setData('profile_img', null);
                              }}
                              isIcon
                              className="size-6 rounded-full"
                            >
                              <XMarkIcon className="size-4" />
                            </Button>
                          ) : (
                            <Upload
                              name="profile_img"
                              onChange={(files: File[]) => {
                                const file = files?.[0] || null;
                                setData('profile_img', file);
                                const result = petFormSchema.safeParse({
                                  ...data,
                                  profile_img: file,
                                });
                                if (!result.success) {
                                  const errors = result.error.flatten().fieldErrors;
                                  setValidationErrors(prev => ({
                                    ...prev,
                                    profile_img: errors.profile_img?.[0] ? t(errors.profile_img[0]) : '',
                                  }));
                                } else {
                                  setValidationErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.profile_img;
                                    return newErrors;
                                  });
                                }
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
                    {(validationErrors.profile_img) && (
                      <p className="text-red-500 text-sm">{validationErrors.profile_img}</p>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3  lg:grid-cols-3 gap-4">

                    {/* Name */}
                    <div>
                      <Input
                        id="name"
                        type="text"
                        value={data.name}
                        required
                        label={t('common.name') || 'Name'}
                        prefix={<UserIcon className="size-4.5" />}
                        onChange={(e) => {
                          setData('name', e.target.value);
                          const result = petFormSchema.safeParse({
                            ...data,
                            name: e.target.value,
                          });
                          if (!result.success) {
                            const errors = result.error.flatten().fieldErrors;
                            setValidationErrors(prev => ({
                              ...prev,
                              name: errors.name?.[0] ? t(errors.name[0]) : '',
                            }));
                          } else {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.name;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder={t('common.pet_name_placeholder') || 'Enter pet name'}
                        className={validationErrors.name ? 'border-red-500' : ''}
                      />
                      {(validationErrors.name) && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                      )}
                    </div>

                    {/* Species */}
                    <div>
                      <ReactSelect
                        isRequired={true}
                        options={speciesOptions}
                        value={speciesOptions.find(opt => opt.value === selectedSpecies) || null}
                        onChange={(option: any) => {
                          const speciesUuid = option?.value || null;
                          setSelectedSpecies(speciesUuid);
                          setData('species_id', speciesUuid || '');
                          setData('breed_id', '');
                        }}
                        placeholder={t('common.select_species') || 'Select Species'}
                        label={t('common.species') || 'Species'}
                        leftIcon={<PawPrintIcon className="size-4.5" />}
                      />
                    </div>

                    {/* Breed */}
                    <div>
                      <ReactSelect
                        isRequired={true}
                        options={breedOptions}
                        value={breedOptions.find(opt => opt.value === data.breed_id) || null}
                        onChange={(option: any) => {
                          setData('breed_id', option?.value || '');
                        }}
                        placeholder={t('common.select_breed') || 'Select Breed'}
                        isDisabled={!selectedSpecies}
                        label={t('common.breed') || 'Breed'}
                        leftIcon={<BiCategory className="size-4.5" />}
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <ReactSelect
                        isRequired={true}
                        options={genderOptions}
                        value={genderOptions.find(opt => opt.value === String(data.sex)) || null}
                        onChange={(option: any) => {
                          setData('sex', option?.value === '1' ? 1 : 0);
                        }}
                        placeholder={t('common.select_gender') || 'Select Gender'}
                        label={t('common.gender') || 'Gender'}
                        leftIcon={<UserIcon className="size-4.5" />}
                      />
                    </div>
                    <div>
                      <span className="dark:text-dark-100 text-base font-medium text-gray-800">
                {t('common.date_of_birth')}
                <span className="text-error mx-1">*</span>

              </span>
                      <DatePicker
                        value={dob ? [dob] : []}
                        onChange={(dates: Date[]) => {
                          const date = dates[0] || null;
                          setDob(date);
                          setData('dob', date ? date.toISOString().split('T')[0] : '');
                        }}
                        placeholder={t('common.select_date') || 'Select Date'}
                        options={{
                          dateFormat: "Y-m-d",
                          maxDate: new Date(),
                        }}
                        required
                      />
                    </div>
                    
  {/* Microchip Reference */}
  <div>
                      <Input
                        id="microchip_ref"
                        type="text"
                        value={data.microchip_ref || ''}
                        label={t('common.microchip_number') || 'Microchip Number'}
                        prefix={<IdentificationIcon className="size-4.5" />}
                        onChange={(e) => {
                            setData('microchip_ref', e.target.value);
                            const result = petFormSchema.safeParse({
                              ...data,
                              microchip_ref: e.target.value,
                            });
                            if (!result.success) {
                              const errors = result.error.flatten().fieldErrors;
                              setValidationErrors(prev => ({
                                ...prev,
                                microchip_ref: errors.microchip_ref?.[0] ? t(errors.microchip_ref[0]) : '',
                              }));
                            } else {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.microchip_ref;
                                return newErrors;
                              });
                            }
                          }}
                        placeholder={t('common.microchip_placeholder') || 'Enter microchip number'}
                        maxLength={50}
                      />
                    </div>
                  


</div><div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-4">


                    {/* Weight */}
                    <div>
                      <Input
                        id="weight_kg"
                        type="number"
                        value={data.weight_kg || ''}
                        label={t('common.weight') || 'Weight (kg)'}
                        prefix={<ScaleIcon className="size-4.5" />}
                        onChange={(e) => {
                            setData('weight_kg', e.target.value);
                            const result = petFormSchema.safeParse({
                              ...data,
                              weight_kg: e.target.value,
                            });
                            if (!result.success) {
                              const errors = result.error.flatten().fieldErrors;
                              setValidationErrors(prev => ({
                                ...prev,
                                weight_kg: errors.weight_kg?.[0] ? t(errors.weight_kg[0]) : '',
                              }));
                            } else {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.weight_kg;
                                return newErrors;
                              });
                            }
                          }}
                        placeholder={t('common.weight_placeholder') || 'Enter weight'}
                        min="0"
                        step="0.1"
                      />
                    </div>

                    {/* BCS (Body Condition Score) */}
                    <div>
                      <Input
                        id="bcs"
                        type="number"
                        value={data.bcs || ''}
                        label={t('common.bcs') || 'Body Condition Score (1-9)'}
                        prefix={<PawPrint className="size-4.5" />}
                        onChange={(e) => {
                          const value = e.target.value;
                          setData('bcs', value ? parseInt(value, 10) : null);
                          const result = petFormSchema.safeParse({
                            ...data,
                            bcs: value ? parseInt(value, 10) : null,
                          });
                          if (!result.success) {
                            const errors = result.error.flatten().fieldErrors;
                            setValidationErrors(prev => ({
                              ...prev,
                              bcs: errors.bcs?.[0] ? t(errors.bcs[0]) : '',
                            }));
                          } else {
                            setValidationErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.bcs;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder="1-9"
                        min="1"
                        max="9"
                      />
                      {(validationErrors.bcs) && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.bcs}</p>
                      )}
                    </div>

                  


                    {/* Color */}
                    <div>
                      <Input
                        id="color"
                        type="text"
                        value={data.color || ''}
                        label={t('common.color') || 'Color'}
                        prefix={<PaintBrushIcon className="size-4.5" />}
                        onChange={(e) => {
                            setData('color', e.target.value);
                            const result = petFormSchema.safeParse({
                              ...data,
                              color: e.target.value,
                            });
                            if (!result.success) {
                              const errors = result.error.flatten().fieldErrors;
                              setValidationErrors(prev => ({
                                ...prev,
                                color: errors.color?.[0] ? t(errors.color[0]) : '',
                              }));
                            } else {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.color;
                                return newErrors;
                              });
                            }
                          }}
                        placeholder={t('common.color_placeholder') || 'Enter color'}
                        maxLength={50}
                      />
                    </div>

                    

  {/* Neutered Status */}
  <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2.5 py-2 bg-gray-50 dark:bg-dark-600 rounded-lg border border-gray-200 dark:border-dark-500 h-full">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`p-1.5 rounded-lg shrink-0 ${data.neutered_status ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-200 dark:bg-dark-500'}`}>
                            {data.neutered_status ? (
                              <HeartOffIcon className="w-4 h-4 text-primary-600 dark:text-gray-400" />
                            ) : (
                              <HeartIcon className="w-4 h-4 text-primary-600 dark:text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <label className="block text-xs font-medium text-gray-800 dark:text-dark-100 truncate">
                              {data.neutered_status 
                                ? t('common.neutered') || 'Neutered/Spayed'
                                : t('common.not_neutered') || 'Not Neutered/Spayed'}
                            </label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                              {data.neutered_status
                                ? t('common.neutered_desc') || 'Pet has been neutered or spayed'
                                : t('common.not_neutered_desc') || 'Pet has not been neutered or spayed'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={data.neutered_status}
                          onChange={(e) => {
                            setData('neutered_status', e.target.checked);
                          }}
                          color="primary"
                          variant="basic"
                        />
                      </div>
                    </div>
                      {/* Notes */}
                  
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('common.notes') || 'Notes'}
                    </label>
                    <Textarea
                      id="notes"
                      value={data.notes || ''}
                      onChange={(e) => {
                        setData('notes', e.target.value || null);
                      }} 
                      placeholder={t('common.notes_placeholder') || 'Enter notes...'}
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  {/* Form Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-4 mt-6">
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => router.get(route('pets.index'))}
                      disabled={processing}
                    >
                      {t('common.cancel') || 'Cancel'}
                    </Button>
                    <Button
                      type="submit"
                      variant="filled"
                      disabled={processing}
                      color="primary"
                    >
                      {processing
                        ? (t('common.processing') || 'Processing...')
                        : (t('common.update') || 'Update')}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </Page>
    </MainLayout>
  );
}

