// Import Dependencies
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import clsx from "clsx";

// Local Imports
import { Button, Input, Avatar, Upload } from "@/components/ui";
import { useAppointmentFormContext } from "../AppointmentFormContext";
import { PetInfoType, petInfoSchema } from "../schema";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import ReactSelect from "@/components/ui/ReactSelect";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { 
  UserIcon,
  TagIcon,
  ScaleIcon,
  PaintBrushIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { BiCategory } from "react-icons/bi";
import { HiPencil } from "react-icons/hi";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { PawPrintIcon } from "lucide-react";
import { getPetAvatarUrl } from "@/utils/imageHelper";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface Species {
  uuid: string;
  name: string;
  breeds?: Breed[];
}

interface Breed {
  uuid: string;
  name: string;
  species_id?: number;
}

export function PetInfo({
  setCurrentStep,
}: {
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();
  const appointmentFormCtx = useAppointmentFormContext();
  const [species, setSpecies] = useState<Species[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [dob, setDob] = useState<Date | null>(null);
  
  const userPets = appointmentFormCtx.userPets || [];
  const hasExistingPets = userPets.length > 0;
  
  // If user has pets, default to selection mode; otherwise default to create mode
  const [createNewPet, setCreateNewPet] = useState(!hasExistingPets);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Helper function to translate validation messages
  const translateError = (message: string | undefined): string | undefined => {
    if (!message) return undefined;
    if (message.startsWith('validation.')) {
      return t(message as any) || message;
    }
    return message;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    control,
    getValues,
    trigger,
    reset,
  } = useForm<PetInfoType>({
    resolver: zodResolver(petInfoSchema),
    defaultValues: appointmentFormCtx.state.formData.petInfo,
    mode: "onChange",
  });

  const watchedValues = watch();

  // Reset form with context data when component mounts or context data changes
  // This ensures data persists when navigating back to this step
  useEffect(() => {
    reset(appointmentFormCtx.state.formData.petInfo);
  }, [reset, appointmentFormCtx.state.formData.petInfo]);
  const watchedImage = watch("profile_img");
  const watchedPreviewImage = watch("previewImage");
  const watchedDob = watch("dob");

  // Initialize dob from form data
  useEffect(() => {
    if (watchedDob && !dob) {
      const date = new Date(watchedDob);
      if (!isNaN(date.getTime())) {
        setDob(date);
      }
    }
  }, [watchedDob, dob]);

  // Fetch species on mount
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await fetch(route('species.index') + '?per_page=0', {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });
        const result = await response.json();
        if (result.data) {
          setSpecies(result.data);
        }
      } catch (error) {
        console.error('Error fetching species:', error);
      }
    };
    fetchSpecies();
  }, []);

  // Fetch breeds when species is selected
  useEffect(() => {
    const fetchBreeds = async () => {
      if (!selectedSpecies) {
        setBreeds([]);
        setValue('breed_id', '');
        return;
      }
      try {
        const response = await fetch(route('breeds.by-species', { speciesUuid: selectedSpecies }), {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });
        const result = await response.json();
        const breedsData = result?.data || [];
        setBreeds(breedsData.map((b: any) => ({
          uuid: b.uuid,
          name: b.breed_name || b.name, // Handle both breed_name and name
        })));
        // Reset breed selection when species changes
        setValue('breed_id', '');
      } catch (error) {
        console.error('Error fetching breeds:', error);
        setBreeds([]);
        setValue('breed_id', '');
      }
    };
    fetchBreeds();
  }, [selectedSpecies, setValue]);

  // Save to context only on unmount or when form is submitted
  // BUT: Don't overwrite if we've already saved via manual submit
  useEffect(() => {
    return () => {
      // Only save form values on unmount if we haven't already saved via manual submit
      // Check if petInfo step is already marked as done
      if (!appointmentFormCtx.state.stepStatus.petInfo.isDone) {
        const currentValues = getValues();
        // Only save if we have valid data (not empty form)
        if (currentValues.name && currentValues.breed_id) {
          appointmentFormCtx.dispatch({
            type: "SET_FORM_DATA",
            payload: { petInfo: currentValues },
          });
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (files: File[]) => {
    const file = files?.[0] || null;
    setValue("profile_img", file);
    if (file) {
      setValue("previewImage", URL.createObjectURL(file));
    }
  };

  // Handle selecting an existing pet
  const handleSelectExistingPet = async (petUuid: string) => {
    const selectedPet = userPets.find(p => p.uuid === petUuid);
    if (selectedPet) {
      setSelectedPetId(petUuid);
      setCreateNewPet(false);
      
      // Pre-fill form with selected pet data (all UUIDs now)
      setValue('pet_id', selectedPet.uuid || '');
      setValue('name', selectedPet.name || '');
      setValue('breed_id', selectedPet.breed_id || '');
      
      // Handle species_id - should already be a UUID string
      if (selectedPet.species_id) {
        setValue('species_id', selectedPet.species_id);
        setSelectedSpecies(selectedPet.species_id);
      }
      
      setValue('sex', selectedPet.sex ?? 0);
      setValue('neutered_status', selectedPet.neutered_status ?? 0);
      setValue('dob', selectedPet.dob || '');
      setValue('microchip_ref', selectedPet.microchip_ref || '');
      setValue('weight_kg', selectedPet.weight_kg);
      setValue('bcs', selectedPet.bcs);
      setValue('color', selectedPet.color || '');
      setValue('notes', selectedPet.notes || '');
      
      if (selectedPet.profile_img) {
        setValue('previewImage', selectedPet.profile_img);
      }
      
      // Set DOB date picker
      if (selectedPet.dob) {
        const date = new Date(selectedPet.dob);
        if (!isNaN(date.getTime())) {
          setDob(date);
        }
      }
      
      // Trigger validation to ensure form is valid
      const isFormValid = await trigger();
    }
  };

  // Handle switching to create new pet
  const handleCreateNewPet = () => {
    setCreateNewPet(true);
    setSelectedPetId(null);
    // Reset form to empty values
    setValue('pet_id', '');
    setValue('name', '');
    setValue('breed_id', '');
    setValue('species_id', '');
    setSelectedSpecies(null);
    setValue('sex', 0);
    setValue('neutered_status', 0);
    setValue('dob', '');
    setValue('microchip_ref', '');
    setValue('weight_kg', undefined);
    setValue('bcs', undefined);
    setValue('color', '');
    setValue('notes', '');
    setValue('profile_img', null);
    setValue('previewImage', null);
    setDob(null);
  };

  const onSubmit = (data: PetInfoType) => {
    
    let petData = data;
    if (selectedPetId && !createNewPet) {
      const selectedPet = userPets.find(p => p.uuid === selectedPetId);
      if (selectedPet) {
        petData = {
          ...data,
          pet_id: selectedPet.uuid,
          name: selectedPet.name,
          breed_id: selectedPet.breed_id || '',
          species_id: selectedPet.species_id,
          sex: selectedPet.sex ?? 0,
          neutered_status: selectedPet.neutered_status ?? 0,
          dob: selectedPet.dob,
          microchip_ref: selectedPet.microchip_ref || '',
          weight_kg: selectedPet.weight_kg,
          bcs: selectedPet.bcs,
          color: selectedPet.color || '',
          notes: selectedPet.notes || '',
        };
      }
    }
    
    
    appointmentFormCtx.dispatch({
      type: "SET_FORM_DATA",
      payload: { petInfo: petData },
    });
    
    appointmentFormCtx.dispatch({
      type: "SET_STEP_STATUS",
      payload: {
        petInfo: {
          isDone: true,
          hasErrors: false,
        },
      },
    });
    
    setCurrentStep((prev) => prev + 1); 
  };

  // Handle form submission errors
  const onError = (errors: any) => {
  };

  const handleManualSubmit = async () => {
    if (selectedPetId && !createNewPet) {
      const selectedPet = userPets.find(p => p.uuid === selectedPetId);
      if (selectedPet) {
        const currentValues = getValues();
        
        const toNumberOrUndefined = (value: any): number | undefined => {
          if (value === null || value === undefined || value === '') {
            return undefined;
          }
          const num = typeof value === 'string' ? parseFloat(value) : Number(value);
          return isNaN(num) ? undefined : num;
        };
        
        // Build pet data from selected pet with proper type conversions
        const petData: PetInfoType = {
          pet_id: selectedPet.uuid,
          name: selectedPet.name || '',
          breed_id: selectedPet.breed_id || '',
          species_id: selectedPet.species_id,
          sex: selectedPet.sex ?? 0,
          neutered_status: selectedPet.neutered_status ?? 0,
          dob: selectedPet.dob || '',
          microchip_ref: selectedPet.microchip_ref || '',
          weight_kg: toNumberOrUndefined(selectedPet.weight_kg),
          bcs: toNumberOrUndefined(selectedPet.bcs),
          color: selectedPet.color || '',
          notes: selectedPet.notes || '',
          profile_img: currentValues.profile_img,
          previewImage: selectedPet.profile_img || currentValues.previewImage,
        };
        
        
        try {
          petInfoSchema.parse(petData);

          appointmentFormCtx.dispatch({
            type: "SET_FORM_DATA",
            payload: { petInfo: petData },
          });
          
          appointmentFormCtx.dispatch({
            type: "SET_STEP_STATUS",
            payload: {
              petInfo: {
                isDone: true,
                hasErrors: false,
              },
            },
          });
          
          setTimeout(() => {
            const savedPetInfo = appointmentFormCtx.state.formData.petInfo;
            
            if (!savedPetInfo?.name || !savedPetInfo?.breed_id) {
              return; 
            }
            
            setCurrentStep((prev) => prev + 1);
          }, 0);
        } catch (validationError) {
        }
      }
    } else {
      // For new pets, use normal form submission
      handleSubmit(onSubmit, onError)();
    }
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

  const neuteredOptions = [
    { value: '0', label: t('common.no') || 'No' },
    { value: '1', label: t('common.yes') || 'Yes' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} autoComplete="off">
      <div className="mt-6 space-y-4">
        {/* Pet Selection - Show if user has existing pets */}
        {hasExistingPets && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-600 rounded-lg border border-gray-200 dark:border-dark-500">
            <div className={clsx("flex items-center justify-between mb-4", isRtl && "flex-row-reverse")}>
              <h4 className={clsx("dark:text-dark-100 text-base font-semibold text-gray-800", isRtl ? "text-right" : "text-left")}>
                {t('common.select_existing_pet') || 'Select Existing Pet'}
              </h4>
              <Button
                variant="outlined"
                color="primary"
                type="button"
                onClick={handleCreateNewPet}
              >
                {t('common.add_new_pet') || '+ Add New Pet'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userPets.map((pet) => (
                <button
                  key={pet.uuid}
                  type="button"
                  onClick={() => handleSelectExistingPet(pet.uuid)}
                  className={clsx(
                    "p-3 rounded-lg border-2 transition-all",
                    isRtl ? "text-right" : "text-left",
                    selectedPetId === pet.uuid
                      ? "border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-dark-500 bg-white dark:bg-dark-700 hover:border-primary-400 dark:hover:border-primary-600"
                  )}
                >
                  <div className={clsx("flex items-center gap-3", isRtl && "flex-row-reverse")}>
                    <div className="flex-shrink-0">
                      <img
                        src={getPetAvatarUrl({ profile_img: pet?.profile_img })}
                        alt={pet.name}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/default/pet-placeholder.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={clsx(
                        "font-medium text-sm truncate",
                        selectedPetId === pet.uuid
                          ? "text-primary-900 dark:text-primary-100"
                          : "text-gray-900 dark:text-dark-100"
                      )}>
                        {pet.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {pet.breed_name || pet.species_name || t('common.pet')}
                      </p>
                    </div>
                    {selectedPetId === pet.uuid && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pet Form - Show if creating new pet or if no existing pets */}
        {(createNewPet || !hasExistingPets) && (
          <>
        {/* Pet Image Upload */}
        <div className="flex flex-col space-y-2">
          <span className={clsx("dark:text-dark-100 text-base font-medium text-gray-800", isRtl ? "text-right" : "text-left")}>
            {t('common.profile_img')}
          </span>
          <div className="flex">
            <Upload
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
              className="inline-block"
            >
              {({ onClick, disabled }) => (
                <button
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl"
                >
                  <Avatar
                    size={20}
                    imgComponent={PreviewImg}
                    imgProps={{ file: watchedImage } as any}
                    src={getPetAvatarUrl({profile_img: watchedImage })}

                    classNames={{
                      root: "ring-primary-600 dark:ring-primary-500 dark:ring-offset-dark-700 rounded-xl ring-offset-[3px] ring-offset-white transition-all hover:ring-3 cursor-pointer",
                      display: "rounded-xl",
                    }}
                    indicator={
                      <div
                        className={clsx("absolute flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg ring-2 ring-white dark:ring-gray-800", isRtl ? "-bottom-1 -left-1" : "-bottom-1 -right-1")}
                      >
                        <HiPencil className="h-3 w-3" />
                      </div>
                    }
                  />
                </button>
              )}
            </Upload>
          </div>
          {errors?.profile_img && (
            <p className={clsx("mt-1 text-sm text-red-600", isRtl ? "text-right" : "text-left")}>
              {translateError(errors.profile_img.message)}
            </p>
          )}
        </div>

        {/* Pet Name */}
        <Input
          {...register("name")}
          label={t('common.pet_name')}
          leftIcon={<TagIcon className="h-5 w-5" />}
          error={translateError(errors?.name?.message)}
          placeholder={t('common.pet_name_placeholder')}
          required
        />

        {/* Species and Breed */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReactSelect
            isRequired={true}
            options={speciesOptions}
            value={speciesOptions.find(opt => opt.value === selectedSpecies) || null}
            onChange={(option: any) => {
              const speciesUuid = option?.value || null;
              setSelectedSpecies(speciesUuid);
              setValue('species_id', speciesUuid || '');
              setValue('breed_id', '');
            }}
            placeholder={t('common.select_species')}
            label={t('common.species')}
            leftIcon={<PawPrintIcon className="size-4.5" />}
          />
          <ReactSelect
            isRequired={true}
            options={breedOptions}
            value={breedOptions.find(opt => opt.value === watchedValues.breed_id) || null}
            onChange={(option: any) => {
              setValue('breed_id', option?.value || '');
            }}
            placeholder={t('common.select_breed')}
            isDisabled={!selectedSpecies}
            label={t('common.breed')}
            leftIcon={<BiCategory className="size-4.5" />}
          />
        </div>

        {/* Gender and Neutered Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReactSelect
            isRequired={true}
            options={genderOptions}
            value={genderOptions.find(opt => opt.value === String(watchedValues.sex)) || null}
            onChange={(option: any) => {
              setValue('sex', option?.value === '1' ? 1 : 0);
            }}
            placeholder={t('common.select_gender')}
            label={t('common.gender')}
            leftIcon={<UserIcon className="size-4.5" />}
          />
          <ReactSelect
            isRequired={true}
            options={neuteredOptions}
            value={neuteredOptions.find(opt => opt.value === String(watchedValues.neutered_status)) || null}
            onChange={(option: any) => {
              setValue('neutered_status', option?.value === '1' ? 1 : 0);
            }}
            placeholder={t('common.select_neutered_status')}
            label={t('common.neutered_status')}
            leftIcon={<UserIcon className="size-4.5" />}
          />

                {/* Date of Birth */}
        <div className="flex justify-between flex-col">
          <span className="input-label">
            {t('common.date_of_birth')}
            <span className="text-error mx-1">*</span>
          </span>
          <Controller
            name="dob"
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              const fieldValue = field.value ? new Date(field.value) : null;
              return (
                <DatePicker
                  value={fieldValue && !isNaN(fieldValue.getTime()) ? [fieldValue] : []}
                  onChange={(dates: Date[]) => {
                    const date = dates[0] || null;
                    setDob(date);
                    field.onChange(date ? date.toISOString().split('T')[0] : '');
                  }}
                  placeholder={t('common.select_date')}
                  options={{
                    dateFormat: "Y-m-d",
                    maxDate: new Date(),
                  }}
                  required
                />
              );
            }}
          />
          {errors?.dob && (
            <p className="text-red-500 text-sm mt-1">{translateError(errors.dob.message)}</p>
          )}
        </div>
        </div>

  

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            {...register("microchip_ref")}
            label={t('common.microchip_ref')}
            leftIcon={<TagIcon className="h-5 w-5" />}
            error={translateError(errors?.microchip_ref?.message)}
            placeholder={t('common.microchip_ref_placeholder')}
          />
          <Input
            {...register("weight_kg", { valueAsNumber: true })}
            type="number"
            label={t('common.weight_kg')}
            leftIcon={<ScaleIcon className="h-5 w-5" />}
            error={translateError(errors?.weight_kg?.message)}
            placeholder={t('common.weight_kg_placeholder')}
          />
          <Input
            {...register("color")}
            label={t('common.color')}
            leftIcon={<PaintBrushIcon className="h-5 w-5" />}
            error={translateError(errors?.color?.message)}
            placeholder={t('common.color_placeholder')}
          />
        </div>
        </>
        )}

        {/* Show form fields if existing pet is selected or creating new pet */}
        {(!createNewPet && selectedPetId) && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className={clsx("text-sm text-green-800 dark:text-green-200", isRtl ? "text-right" : "text-left")}>
              {t('common.pet_selected') || 'Pet selected. You can proceed to the next step or edit details below.'}
            </p>
          </div>
        )}

        <div className={clsx("mt-8 flex gap-3", isRtl ? "justify-start flex-row-reverse" : "justify-end")}>
          {/* Only show Previous button if PersonalInfo step exists (user is not logged in) */}
          {!appointmentFormCtx.state.stepStatus.personalInfo.isDone && (
            <Button 
              type="button" 
              variant="outlined" 
              onClick={() => {
                setCurrentStep(0);
              }}
            >
              {t('common.previous')}
            </Button>
          )}
          <Button 
            type={selectedPetId && !createNewPet ? "button" : "submit"}
            onClick={selectedPetId && !createNewPet ? handleManualSubmit : undefined}
            color="primary"
          >
            {t('common.next')}
          </Button>
        </div>
      </div>
    </form>
  );
}

