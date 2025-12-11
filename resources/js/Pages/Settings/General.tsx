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
  phoneVerified: boolean;
}


export default function General({ user, isVeterinarian, veterinaryInfo, phoneVerified: initialPhoneVerified }: ProfilePageProps) {
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
  
  // Phone OTP verification state
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [verifyingPhoneOtp, setVerifyingPhoneOtp] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneOtpError, setPhoneOtpError] = useState('');

  const avatarUrl = getUserAvatarUrl(user);
  
  // Get CSRF token
  const getCsrfToken = () => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) return token;
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    return '';
  };
  
  // Check if phone has changed from original
  useEffect(() => {
    const originalPhone = user?.phone || '';
    const normalizedOriginal = originalPhone.startsWith('+212') ? originalPhone : 
                              originalPhone.startsWith('0') ? '+212' + originalPhone.substring(1) : '+212' + originalPhone;
    const normalizedCurrent = data.phone.startsWith('+212') ? data.phone : 
                             data.phone.startsWith('0') ? '+212' + data.phone.substring(1) : '+212' + data.phone;
    
    if (normalizedCurrent !== normalizedOriginal && normalizedCurrent !== '+212' && data.phone.trim() !== '') {
      setPhoneChanged(true);
      setPhoneVerified(false);
      setPhoneOtpSent(false);
      setPhoneOtp('');
    } else {
      setPhoneChanged(false);
      // Use the initialPhoneVerified prop from backend if phone hasn't changed
      setPhoneVerified(initialPhoneVerified);
    }
  }, [data.phone, user?.phone, initialPhoneVerified]);

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

  // Send OTP for phone update or verification
  const sendPhoneUpdateOtp = async () => {
    if (!data.phone || data.phone.trim() === '') {
      setPhoneOtpError('Phone number is required');
      return;
    }

    setSendingPhoneOtp(true);
    setPhoneOtpError('');
    
    try {
      const response = await fetch('/api/otp/phone-update/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({ phone: data.phone }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPhoneOtpSent(true);
        showToast({
          type: 'success',
          message: result.message || 'OTP sent successfully to your phone number.',
        });
      } else {
        setPhoneOtpError(result.message || 'Failed to send OTP');
        showToast({
          type: 'error',
          message: result.message || 'Failed to send OTP',
        });
      }
    } catch (err) {
      setPhoneOtpError('Failed to send OTP. Please try again.');
      showToast({
        type: 'error',
        message: 'Failed to send OTP. Please try again.',
      });
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  // Verify OTP for phone update
  const verifyPhoneUpdateOtp = async () => {
    if (phoneOtp.length !== 6) {
      setPhoneOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingPhoneOtp(true);
    setPhoneOtpError('');

    try {
      const response = await fetch('/api/otp/phone-update/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          phone: data.phone,
          otp: phoneOtp,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPhoneVerified(true);
        setPhoneOtpSent(false);
        setPhoneOtp('');
        showToast({
          type: 'success',
          message: result.message || t('common.phone_verified_successfully'),
        });
        // Use Inertia router to reload props from backend (no full page refresh)
        router.visit(window.location.pathname, {
          only: ['phoneVerified', 'user'],
          preserveScroll: true,
          preserveState: false,
        });
      } else {
        setPhoneOtpError(result.message || t('common.invalid_otp'));
        showToast({
          type: 'error',
          message: result.message || t('common.invalid_otp'),
        });
      }
    } catch (err) {
      setPhoneOtpError(t('common.verification_failed'));
      showToast({
        type: 'error',
        message: t('common.verification_failed'),
      });
    } finally {
      setVerifyingPhoneOtp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if phone changed but not verified
    if (phoneChanged && !phoneVerified) {
      showToast({
        type: 'warning',
        message: t('common.please_verify_new_phone_number_with_otp_before_saving'),
      });
      return;
    }

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
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-200">
                      {t('common.phone')}
                      {user?.phone && (
                        <span className="ml-2">
                          {phoneVerified && !phoneChanged ? (
                            <span className="inline-flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          ) : !phoneChanged && !phoneVerified ? (
                            <span className="inline-flex items-center text-xs font-medium text-yellow-600 dark:text-yellow-400">
                              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Not Verified
                            </span>
                          ) : null}
                        </span>
                      )}
                    </label>
                  </div>
                  <Input
                    placeholder={t('common.enter_phone_number')}
                    className="rounded-xl"
                    prefix={<PhoneIcon className="size-4.5" />}
                    value={data.phone}
                    onChange={(e) => {
                      setData('phone', e.target.value);
                      setPhoneOtpError('');
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
                    error={errors.phone || profileValidationErrors.phone || phoneOtpError}
                    disabled={verifyingPhoneOtp}
                  />
                  
                  {/* Show verification prompt for existing unverified phone */}
                  {!phoneChanged && !phoneVerified && user?.phone && !phoneOtpSent && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                        Your phone number is not verified. Verify it to ensure account security.
                      </p>
                      <Button
                        type="button"
                        onClick={sendPhoneUpdateOtp}
                        disabled={sendingPhoneOtp}
                        color="primary"
                        className="text-sm"
                      >
                        {sendingPhoneOtp ? 'Sending OTP...' : 'Verify Phone Number'}
                      </Button>
                    </div>
                  )}
                  
                  {/* Phone OTP Verification UI - for both changed phone and unverified phone */}
                  {((phoneChanged && !phoneVerified) || (!phoneChanged && !phoneVerified && phoneOtpSent)) && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
                        Phone number changed. Please verify your new phone number with OTP.
                      </p>
                      
                      {!phoneOtpSent ? (
                        <Button
                          type="button"
                          onClick={sendPhoneUpdateOtp}
                          disabled={sendingPhoneOtp || !data.phone}
                          color="primary"
                          className="w-full sm:w-auto"
                        >
                          {sendingPhoneOtp ? 'Sending OTP...' : 'Send OTP to Verify'}
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
                              Enter OTP sent to {data.phone}
                            </label>
                            <Input
                              placeholder="000000"
                              type="text"
                              value={phoneOtp}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setPhoneOtp(value);
                                setPhoneOtpError('');
                              }}
                              maxLength={6}
                              disabled={verifyingPhoneOtp}
                              className="text-center text-2xl tracking-widest"
                            />
                            {phoneOtpError && (
                              <p className="mt-1 text-sm text-red-600">{phoneOtpError}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={verifyPhoneUpdateOtp}
                              disabled={verifyingPhoneOtp || phoneOtp.length !== 6}
                              color="primary"
                              className="flex-1"
                            >
                              {verifyingPhoneOtp ? 'Verifying...' : 'Verify OTP'}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                setPhoneOtpSent(false);
                                setPhoneOtp('');
                                setPhoneOtpError('');
                              }}
                              disabled={verifyingPhoneOtp}
                              variant="outlined"
                            >
                              Resend
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {phoneChanged && phoneVerified && (
                    <p className="mt-2 text-sm text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Phone number verified
                    </p>
                  )}
                </div>
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
                    Boolean(isVeterinarian && data.address && validationResult && !validationResult.valid) ||
                    Boolean(phoneChanged && !phoneVerified)
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