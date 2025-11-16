// Import Dependencies
import { PhoneIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon, UserIcon, MapPinIcon,EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";

import { useState, useEffect } from "react";
import { HiPencil } from "react-icons/hi";

// Local Imports
import { Page } from "@/components/shared/Page";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { Avatar, Button, Input, Upload, Card } from "@/components/ui";
import { useForm, router } from "@inertiajs/react";
import { useTranslation } from "@/hooks/useTranslation";
import MainLayout from "@/layouts/MainLayout";
import { profileFormSchema } from "@/schemas/profileSchema";
import { getUserAvatarUrl } from "@/utils/imageHelper";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useAddressValidation } from "@/hooks/useAddressValidation";
import InlineAddressMap from "@/components/InlineAddressMap";
import { passwordFormSchema } from "@/schemas/passwordSchema";

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  image?: string;
  created_at: string;
  roles: Array<{ name: string }>;
}

interface VeterinaryInfo {
  id: number;
  license_number?: string;
  specialization?: string;
  years_experience?: number;
  clinic_name?: string;
  address?: string;
  profile_img?: string;
}

interface ProfilePageProps {
  user: User;
  isVeterinarian: boolean;
  veterinaryInfo?: VeterinaryInfo;
}


export default function General({ user, isVeterinarian, veterinaryInfo }: ProfilePageProps) {
   const { t } = useTranslation();
   const { showToast } = useToast();
   const [avatar, setAvatar] = useState<File | null>(null);
   const { isValidating, validationResult, validateAddress, clearValidation } = useAddressValidation();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<{
    current_password?: string;
    password?: string;
    password_confirmation?: string;
  }>({});

  const { data, setData, post, processing, errors, reset } = useForm({
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    email: user?.email || "",
    phone: user?.phone || "",
    image: null as File | null,
    // Veterinary fields
    license_number: veterinaryInfo?.license_number || "",
    specialization: veterinaryInfo?.specialization || "",
    years_experience: veterinaryInfo?.years_experience || "",
    clinic_name: veterinaryInfo?.clinic_name || "",
    address: veterinaryInfo?.address || "",
    });

  const [profileValidationErrors, setProfileValidationErrors] = useState<{
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    license_number?: string;
    specialization?: string;
    years_experience?: string;
    clinic_name?: string;
    address?: string;
  }>({});

  const [isWaitingForValidation, setIsWaitingForValidation] = useState(false);
  const [showMap, setShowMap] = useState(false);

    const avatarUrl = getUserAvatarUrl(user);

  useEffect(() => {
    if (!isVeterinarian || !data.address) {
      clearValidation();
      setIsWaitingForValidation(false);
      return;
    }

    // Only validate if address has at least 5 characters
    if (data.address.trim().length < 5) {
      clearValidation();
      setIsWaitingForValidation(false);
      return;
    }

    // Show waiting indicator
    setIsWaitingForValidation(true);

    const timeoutId = setTimeout(() => {
      validateAddress(data.address);
      setIsWaitingForValidation(false);
    }, 2000); // 2 second debounce - wait for user to stop typing

    return () => {
      clearTimeout(timeoutId);
      setIsWaitingForValidation(false);
    };
  }, [data.address, isVeterinarian, validateAddress, clearValidation]);

  // Handle address selection from map
  const handleAddressSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    setData('address', address);
    clearValidation();
    // Don't close the map, let user see the selected location
    // Trigger validation for the new address with isFromMap flag
    setTimeout(() => {
      validateAddress(address, true); // true indicates this is from map selection
    }, 100);
  };

  // Handle location selection from map
  const handleLocationSelect = (coordinates: { lat: number; lng: number }) => {
    // This will be handled by the map component's reverse geocoding
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if address validation is in progress or waiting
    if (isValidating || isWaitingForValidation) {
      showToast({
        type: 'warning',
        message: t('common.please_wait_address_validation'),
      });
      return;
    }

    // Check if address is invalid (only for veterinarians)
    if (isVeterinarian && data.address && validationResult && !validationResult.valid) {
      showToast({
        type: 'error',
        message: validationResult.message || t('common.invalid_address'),
      });
      return;
    }

    // Validate profile data
    const profileResult = profileFormSchema.safeParse(data);
    if (!profileResult.success) {
      const errors = profileResult.error.flatten().fieldErrors;
      setProfileValidationErrors({
        firstname: errors?.firstname?.[0] ? t(errors.firstname[0]) : undefined,
        lastname: errors?.lastname?.[0] ? t(errors.lastname[0]) : undefined,
        email: errors?.email?.[0] ? t(errors.email[0]) : undefined,
        phone: errors?.phone?.[0] ? t(errors.phone[0]) : undefined,
        license_number: errors?.license_number?.[0] ? t(errors.license_number[0]) : undefined,
        specialization: errors?.specialization?.[0] ? t(errors.specialization[0]) : undefined,
        years_experience: errors?.years_experience?.[0] ? t(errors.years_experience[0]) : undefined,
        clinic_name: errors?.clinic_name?.[0] ? t(errors.clinic_name[0]) : undefined,
        address: errors?.address?.[0] ? t(errors.address[0]) : undefined,
      });
      return;
    }

    post(route('profile.update'), {
      onSuccess: () => {
        setProfileValidationErrors({});
        showToast({
          type: 'success',
          message: t('common.success'),
        });
      },
      onError: (errors: any) => {
        setProfileValidationErrors({
                        firstname: errors?.firstname ? t(errors.firstname) : undefined,
                        lastname: errors?.lastname ? t(errors.lastname) : undefined,
                        email: errors?.email ? t(errors.email) : undefined,
                        phone: errors?.phone ? t(errors.phone) : undefined,
                    });
        showToast({
          type: 'error',
          message: t('common.error_occurred'),
        });
      },
    });
  };

 const { 
    data: passwordData, 
    setData: setPasswordData, 
    post: postPassword, 
    processing: passwordProcessing, 
    errors: passwordErrors, 
    reset: resetPassword 
  } = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous validation errors
    setPasswordValidationErrors({});
    
    // Validate form data
    try {
      passwordFormSchema.parse(passwordData);
    } catch (error: any) {
      const validationErrors: any = {};
      error.issues?.forEach((err: any) => {
        validationErrors[err.path[0]] = t(err.message);  
      });
      setPasswordValidationErrors(validationErrors);
      return;
    }

    postPassword(route('profile.password.update'), {
      onSuccess: () => {
        resetPassword();
        setPasswordValidationErrors({});
        showToast({
          type: 'success',
          message: t('common.sessions.password_updated_successfully'),
        });
      },
      onError: (errors: any) => {
        setPasswordValidationErrors({
          current_password: errors.current_password || undefined,
          password: errors.password || undefined,
          password_confirmation: errors.password_confirmation || undefined,
        });
      },
    });
  };

  return (
        <MainLayout>
    <Page title={t('common.profile')}>
  <div className="transition-content px-(--margin-x) pb-6 my-5">
                  <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 lg:col-span-8 px-8 py-6 mt-4">
                <div className="w-full max-w-3xl 2xl:max-w-5xl">
        <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
          {t('common.profile')}
        </h5>
        <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
          {t('common.profile_settings')}
        </p>
        <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />
            
            <div className="mt-4 flex flex-col space-y-1.5">
              <span className="dark:text-dark-100 text-base font-medium text-gray-800">
                {t('common.avatar')}
              </span>
              <Avatar
                size={20}
                imgComponent={PreviewImg}
                imgProps={{ file: avatar } as any}
                src={data.image ? URL.createObjectURL(data.image) : avatarUrl}
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
                        onChange={(files) => {
                          setAvatar(files[0]);
                          setData('image', files[0]);
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

            <form onSubmit={handleSubmit}>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
                <Input
                  placeholder={t('common.enter_first_name')}
                  label={t('common.first_name')}
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  value={data?.firstname}
                  onChange={(e) => {
                    setData('firstname', e.target.value);
                    const result = profileFormSchema.safeParse({
                      ...data,
                      firstname: e.target.value,
                    });
                    if (!result.success) {
                      const errors = result.error.flatten().fieldErrors;
                      setProfileValidationErrors(prev => ({
                        ...prev,
                        firstname: errors.firstname?.[0] ? t(errors.firstname[0]) : undefined,
                      }));
                    } else {
                      setProfileValidationErrors(prev => ({
                        ...prev,
                        firstname: undefined,
                      }));
                    }
                  }}
                  required={true}
                  error={errors?.firstname || profileValidationErrors.firstname}
                />
                <Input
                  placeholder={t('common.enter_last_name')}
                  label={t('common.last_name')}
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  value={data?.lastname}
                  onChange={(e) => {
                    setData('lastname', e.target.value);
                    const result = profileFormSchema.safeParse({
                      ...data,
                      lastname: e.target.value,
                    });
                    if (!result.success) {
                      const errors = result.error.flatten().fieldErrors;
                      setProfileValidationErrors(prev => ({
                        ...prev,
                        lastname: errors.lastname?.[0] ? t(errors.lastname[0]) : undefined,
                      }));
                    } else {
                      setProfileValidationErrors(prev => ({
                        ...prev,
                        lastname: undefined,
                      }));
                    }
                  }}
                                    required={true}
                  error={errors.lastname || profileValidationErrors.lastname}
                />
                <Input
                  placeholder={t('common.enter_your_email')}
                  label={t('common.email_address')}
                  className="rounded-xl"
                  prefix={<EnvelopeIcon className="size-4.5" />}
                  value={data.email}
                  onChange={(e) => {
                    setData('email', e.target.value);
                    const result = profileFormSchema.safeParse({
                      ...data,
                      email: e.target.value,
                    });
                    if (!result.success) {
                      const errors = result.error.flatten().fieldErrors;
                      setProfileValidationErrors(prev => ({
                        ...prev,
                        email: errors.email?.[0] ? t(errors.email[0]) : undefined,
                      }));
                    } else {
                      setProfileValidationErrors(prev => ({
                        ...prev,
                        email: undefined,
                      }));
                    }
                  }}
                                    required={true}
                  error={errors.email || profileValidationErrors.email}
                />
                <Input
                  placeholder={t('common.enter_phone_number')}
                  label={t('common.phone')}
                  className="rounded-xl"
                  prefix={<PhoneIcon className="size-4.5" />}
                  value={data.phone}
                  onChange={(e) => {
                    setData('phone', e.target.value);
                    const result = profileFormSchema.safeParse({
                      ...data,
                      phone: e.target.value,
                    });
                    if (!result.success) {
                      const errors = result.error.flatten().fieldErrors;
                      setProfileValidationErrors(prev => ({
                        ...prev,
                        phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
                      }));
                    } else {
                      setProfileValidationErrors(prev => ({
                        ...prev,
                        phone: undefined,
                      }));
                    }
                  }}
                                    required={true}
                  error={errors.phone || profileValidationErrors.phone}
                />
              </div>

              {/* Veterinary Information Section */}
              {isVeterinarian && (
                <>
                  <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />
                  
                  <div className="mt-6">
                    <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800 mb-4">
                      {t('common.veterinary_information')}
                    </h5>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
                      <Input
                        placeholder={t('common.enter_license_number')}
                        label={t('common.license_number')}
                        className="rounded-xl"
                        value={data?.license_number}
                        onChange={(e) => setData('license_number', e.target.value)}
                        error={errors?.license_number || profileValidationErrors.license_number}
                      />
                      
                      <Input
                        placeholder={t('common.enter_specialization')}
                        label={t('common.specialization')}
                        className="rounded-xl"
                        value={data?.specialization}
                        onChange={(e) => setData('specialization', e.target.value)}
                        error={errors?.specialization || profileValidationErrors.specialization}
                      />
                      
                      <Input
                        placeholder={t('common.enter_years_experience')}
                        label={t('common.years_experience')}
                        type="number"
                        className="rounded-xl"
                        value={data?.years_experience}
                        onChange={(e) => setData('years_experience', e.target.value)}
                        error={errors?.years_experience || profileValidationErrors.years_experience}
                      />
                      
                      <Input
                        placeholder={t('common.enter_clinic_name')}
                        label={t('common.clinic_name')}
                        className="rounded-xl"
                        value={data?.clinic_name}
                        onChange={(e) => {
                          setData('clinic_name', e.target.value);
                          const result = profileFormSchema.safeParse({
                            ...data,
                            clinic_name: e.target.value,
                          });
                          if (!result.success) {
                            const errors = result.error.flatten().fieldErrors;
                            setProfileValidationErrors(prev => ({
                              ...prev,
                              clinic_name: errors.clinic_name?.[0] ? t(errors.clinic_name[0]) : undefined,
                            }));
                          } else {
                            setProfileValidationErrors(prev => ({
                              ...prev,
                              clinic_name: undefined,
                            }));
                          }
                        }}
                        error={errors?.clinic_name || profileValidationErrors.clinic_name}
                      />
                      
                      <div className="sm:col-span-2">
                        <Input
                          placeholder={t('common.enter_address')}
                          label={t('common.address')}
                          className="rounded-xl"
                          prefix={<MapPinIcon className="size-4.5" />}
                          value={data?.address}
                          onChange={(e) => {
                            setData('address', e.target.value);
                            clearValidation();
                          }}
                          error={
                            errors?.address || 
                            profileValidationErrors.address || 
                            (validationResult && !validationResult.valid ? validationResult.message : undefined)
                          }
                          disabled={isValidating}
                        />
                        {isWaitingForValidation && (
                          <p className="mt-1 text-sm text-gray-500 flex items-center">
                            <svg className="animate-pulse -ml-1 mr-2 h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Waiting for you to finish typing...
                          </p>
                        )}
                        {isValidating && (
                          <p className="mt-1 text-sm text-gray-500 flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('common.validating_address')}...
                          </p>
                        )}
                        {validationResult && validationResult.valid && (
                          <p className="mt-1 text-sm text-green-600 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {validationResult.message}
                          </p>
                        )}
                        {validationResult && validationResult.suggestions && validationResult.suggestions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">Did you mean:</p>
                            <div className="space-y-1">
                              {validationResult.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                  onClick={() => {
                                    setData('address', suggestion.formatted_address);
                                    clearValidation();
                                  }}
                                >
                                  {suggestion.formatted_address}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Inline Map Component */}
                        <InlineAddressMap
                          address={data.address}
                          onAddressSelect={handleAddressSelect}
                          onLocationSelect={handleLocationSelect}
                          isVisible={showMap}
                          onToggle={() => setShowMap(!showMap)}
                          validationResult={validationResult}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="dark:bg-dark-500 my-7 h-px bg-gray-200" />
              
              <div className="mt-8 flex justify-end space-x-3">
                <Button
                  className="min-w-[7rem]"
                  onClick={() => {
                    reset();
                    setProfileValidationErrors({});
                  }}
                  type="button"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                    type="submit"
                    variant="filled"
                    color="primary"
                    className="disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-primary-300 disabled:text-white"
                  disabled={
                    Boolean(processing) || 
                    Object.values(profileValidationErrors).some(error => Boolean(error)) || 
                    !data?.firstname?.trim() || 
                    !data?.lastname?.trim() || 
                    !data?.email?.trim() ||
                    Boolean(isValidating) ||
                    Boolean(isWaitingForValidation) ||
                    Boolean(isVeterinarian && data.address && validationResult && !validationResult.valid)
                  }
                >
                  {processing ? t('common.saving') : t('common.save')}
                  </Button>
                </div>
              </form>
      </div>
    </Card>

            <Card className="col-span-12 lg:col-span-4 px-8 py-6 mt-4">
   <div className="w-full max-w-3xl 2xl:max-w-5xl">
            <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
              {t('common.sessions.password')}
            </h5>
            <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
              {t('common.sessions.manage_password_security')}
            </p>
            <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

            <div className="space-y-6">
              {/* Password Settings */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20">
                    <LockClosedIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
                      {t('common.sessions.change_password')}
                    </h6>
                    <p className="text-sm text-gray-600 dark:text-dark-300">
                      {t('common.sessions.update_password_description')}
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      {t('common.sessions.current_password')}
                    </label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData('current_password', e.target.value)}
                        className={`pr-10 ${passwordValidationErrors.current_password || passwordErrors.current_password ? 'border-red-500' : ''}`}
                        placeholder={t('common.sessions.enter_current_password')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {(passwordValidationErrors.current_password || passwordErrors.current_password) && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordValidationErrors.current_password || passwordErrors.current_password}
                      </p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      {t('common.sessions.new_password')}
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.password}
                        onChange={(e) => setPasswordData('password', e.target.value)}
                        className={`pr-10 ${passwordValidationErrors.password || passwordErrors.password ? 'border-red-500' : ''}`}
                        placeholder={t('common.sessions.enter_new_password')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {(passwordValidationErrors.password || passwordErrors.password) && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordValidationErrors.password || passwordErrors.password}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-gray-500 dark:text-dark-400">
                      {t('common.sessions.password_requirements')}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                      {t('common.sessions.confirm_new_password')}
                    </label>
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.password_confirmation}
                        onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                        className={`pr-10 ${passwordValidationErrors.password_confirmation || passwordErrors.password_confirmation ? 'border-red-500' : ''}`}
                        placeholder={t('common.sessions.confirm_new_password_placeholder')}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {(passwordValidationErrors.password_confirmation || passwordErrors.password_confirmation) && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordValidationErrors.password_confirmation || passwordErrors.password_confirmation}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                    variant="filled"
                    color="primary"
                      disabled={passwordProcessing}
                      className="disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-primary-300 disabled:text-white"
                    >
                      {passwordProcessing ? t('common.sessions.updating') : t('common.sessions.update_password')}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
</Card>      </div>
</div>

          
    </Page>
        </MainLayout>
  );
}