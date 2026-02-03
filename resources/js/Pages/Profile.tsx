// Import Dependencies
import { PhoneIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { EnvelopeIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { HiPencil } from "react-icons/hi";
import axios from "axios";

// Local Imports
import { Page } from "@/components/shared/Page";
import { PreviewImg } from "@/components/shared/PreviewImg";
import { Avatar, Button, Input, Upload, Card } from "@/components/ui";
import { useForm, usePage } from "@inertiajs/react";
import { useTranslation } from "@/hooks/useTranslation";
import MainLayout from "@/layouts/MainLayout";
import { profileFormSchema } from "@/schemas/profileSchema";
import { passwordFormSchema } from "@/schemas/passwordSchema";
import { getUserAvatarUrl } from "@/utils/imageHelper";
import { useToast } from "@/components/common/Toast/ToastContext";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

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

interface ProfilePageProps {
  user: User;
}


export default function Profile({ user }: ProfilePageProps) {
   const { t } = useTranslation();
   const { showToast } = useToast();
   const { confirm } = useConfirm();
   const { props } = usePage();
   const [avatar, setAvatar] = useState<File | null>(null);
   const [flashHandled, setFlashHandled] = useState(false);


  const { data, setData, post, processing, errors, reset } = useForm({
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    email: user.email || "",
    phone: user.phone || "",
    image: null as File | null,
  });

  // Password update form
    const { data: passwordData, setData: setPasswordData, post: postPassword, processing: passwordProcessing, errors: passwordErrors, reset: resetPassword } = useForm({
      current_password: "",
      password: "",
      password_confirmation: "",
    });

    const [profileValidationErrors, setProfileValidationErrors] = useState<{
      firstname?: string;
      lastname?: string;
      email?: string;
      phone?: string;
    }>({});

    const [passwordValidationErrors, setPasswordValidationErrors] = useState<{
      current_password?: string;
      password?: string;
      password_confirmation?: string;
    }>({});

    const avatarUrl = getUserAvatarUrl(user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate profile data
    const profileResult = profileFormSchema.safeParse(data);
    if (!profileResult.success) {
      const errors = profileResult.error.flatten().fieldErrors;
      setProfileValidationErrors({
        firstname: errors.firstname?.[0] ? t(errors.firstname[0]) : undefined,
        lastname: errors.lastname?.[0] ? t(errors.lastname[0]) : undefined,
        email: errors.email?.[0] ? t(errors.email[0]) : undefined,
        phone: errors.phone?.[0] ? t(errors.phone[0]) : undefined,
      });
      return;
    }

    post(route('profile.update'), {
      onSuccess: (page: any) => {
        setProfileValidationErrors({});
console.log('page?.props?.flash',page?.props?.flash);
        // Show toast with flash message from response
        const flashMessage = page?.props?.flash?.success || page?.flash?.success;
        if (flashMessage) {
          setFlashHandled(true);
          showToast({
            type: 'success',
            message: flashMessage,
            duration: 3000,
          });
        }
      },
      onError: (errors: any) => {
        setProfileValidationErrors({
                        firstname: errors.firstname ? t(errors.firstname) : undefined,
                        lastname: errors.lastname ? t(errors.lastname) : undefined,
                        email: errors.email ? t(errors.email) : undefined,
                        phone: errors.phone ? t(errors.phone) : undefined,
                    });
        showToast({
          type: 'error',
          message: t('common.error_occurred'),
        });
      },
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password data
    const passwordResult = passwordFormSchema.safeParse(passwordData);
    if (!passwordResult.success) {
      const errors = passwordResult.error.flatten().fieldErrors;
      setPasswordValidationErrors({
        current_password: errors.current_password?.[0] ? t(errors.current_password[0]) : undefined,
        password: errors.password?.[0] ? t(errors.password[0]) : undefined,
        password_confirmation: errors.password_confirmation?.[0] ? t(errors.password_confirmation[0]) : undefined,
      });
      return;
    }

    postPassword(route('profile.password.update'), {
      onSuccess: () => {
        resetPassword();
        setPasswordValidationErrors({});
        showToast({
          type: 'success',
          message: t('common.success'),
        });
      },
      onError: (errors: any) => {
                setPasswordValidationErrors({
                        current_password: errors.current_password ? t(errors.current_password) : undefined,
                        password: errors.password ? t(errors.password) : undefined,
                        password_confirmation: errors.password_confirmation ? t(errors.password_confirmation) : undefined,
                    });
        showToast({
          type: 'error',
          message: t('common.error_occurred'),
        });
      },
    });
  };

  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailability();
  }, []);

  // Handle flash messages (for page loads and redirects not handled in onSuccess)
  useEffect(() => {
    const flash = (props as any)?.flash;
    if (flash?.success && !flashHandled) {
      setFlashHandled(true);
      showToast({
        type: 'success',
        message: flash.success,
        duration: 3000,
      });
    }
    if (flash?.error) {
      showToast({
        type: 'error',
        message: flash.error,
        duration: 3000,
      });
    }
    // Reset flashHandled when flash changes
    if (!flash?.success) {
      setFlashHandled(false);
    }
  }, [(props as any)?.flash, flashHandled, showToast]);

  const fetchAvailability = async () => {
    try {
      const response = await axios.get(route('availability.getCurrentWeek'));
      if (response.data.success) {
        const formattedSlots = response.data.data.map((slot: any) => ({
          id: slot.uuid,
          title: 'Available',
          daysOfWeek: [getDayNumber(slot.day_of_week)],
          startTime: slot.start_time,
          endTime: slot.end_time,
          startRecur: getStartOfWeek(),
          endRecur: getEndOfWeek(),
          backgroundColor: slot.is_available ? '#15A093' : '#9e9e9e',
        }));
        setAvailabilitySlots(formattedSlots);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      showToast({
        type: 'error',
        message: t('common.error_loading_availability'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = async (selectInfo: any) => {
    const title = 'Available';
    const startTime = new Date(selectInfo.start).toTimeString().split(' ')[0];
    const endTime = new Date(selectInfo.end).toTimeString().split(' ')[0];
    const dayOfWeek = getDayName(selectInfo.start.getDay());

    try {
      const response = await axios.post(route('availability.store'), {
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
      });

      if (response.data.success) {
        setAvailabilitySlots(prev => [...prev, {
          id: response.data.data.uuid,
          title,
          daysOfWeek: [selectInfo.start.getDay()],
          startTime,
          endTime,
          startRecur: getStartOfWeek(),
          endRecur: getEndOfWeek(),
          backgroundColor: '#15A093'
        }]);
        
        showToast({
          type: 'success',
          message: t('common.availability_saved'),
        });
      }
    } catch (error) {
      console.error('Failed to save availability:', error);
      showToast({
        type: 'error',
        message: t('common.error_saving_availability'),
      });
    }
    
    selectInfo.view.calendar.unselect();
  };

  const handleEventClick = async (clickInfo: any) => {
    const confirmed = await confirm({
      title: t('common.are_you_sure'),
      message: t('common.confirm_delete_availability'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      confirmVariant: 'danger'
    });

    if (confirmed) {
      try {
        await axios.delete(route('availability.destroy', { uuid: clickInfo.event.id }));
        setAvailabilitySlots(prev =>
          prev.filter(slot => slot.id !== clickInfo.event.id)
        );
        showToast({
          type: 'success',
          message: t('common.availability_deleted'),
        });
      } catch (error) {
        console.error('Failed to delete availability:', error);
        showToast({
          type: 'error',
          message: t('common.error_deleting_availability'),
        });
      }
    }
  };

  // Helper functions
  const getDayNumber = (dayName: string): number => {
    const days: Record<string, number> = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0 };
    return days[dayName.toLowerCase()] ?? 0;
  };

  const getDayName = (dayNumber: number): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[dayNumber];
  };

  const getStartOfWeek = () => {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    return firstDay.toISOString().split('T')[0];
  };

  const getEndOfWeek = () => {
    const now = new Date();
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 7));
    return lastDay.toISOString().split('T')[0];
  };

  return (
        <MainLayout>
    <Page 
      title={t('common.metadata_titles.profile')}
      description={t("common.page_descriptions.profile") || "View and edit your profile information, change password, and manage account settings."}
    >
  <div className="transition-content px-(--margin-x) pb-6 my-5">
                  <div className="grid grid-cols-12 place-content-start gap-4 sm:gap-5 lg:gap-6">
                    <div className="col-span-12 lg:col-span-8">
                      <Card className="p-3 sm:px-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
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
                  value={data.firstname}
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
                  error={errors.firstname || profileValidationErrors.firstname}
                />
                <Input
                  placeholder={t('common.enter_last_name')}
                  label={t('common.last_name')}
                  className="rounded-xl"
                  prefix={<UserIcon className="size-4.5" />}
                  value={data.lastname}
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
                  disabled={processing || Object.values(profileValidationErrors).some(error => error) || !data.firstname.trim() || !data.lastname.trim() || !data.email.trim()}
                >
                  {processing ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </form>
</Card>
</div>
                    <div className="col-span-12 space-y-4 sm:space-y-5 lg:col-span-4 lg:space-y-6">
                      <Card className="p-4 sm:px-5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                <h6 className="dark:text-dark-100 text-base font-medium text-gray-800">
                  {t('common.change_password')}
                </h6>
                <p className="dark:text-dark-200 mt-0.5 text-sm text-gray-500">
                  {t('common.update_password_description')}
                </p>
                          <div className="dark:bg-dark-500 my-5 h-px bg-gray-200" />

              <form onSubmit={handlePasswordSubmit} className="mt-4">
                <div className="grid grid-cols-1 gap-4 [&_.prefix]:pointer-events-none">
                  <Input
                    type="password"
                    placeholder={t('common.current_password')}
                    label={t('common.current_password')}
                    className="rounded-xl"
                    prefix={<LockClosedIcon className="size-4.5" />}
                    value={passwordData.current_password}
                    onChange={(e) => {
                      setPasswordData('current_password', e.target.value);
                      const result = passwordFormSchema.safeParse({
                        ...passwordData,
                        current_password: e.target.value,
                      });
                      if (!result.success) {
                        const errors = result.error.flatten().fieldErrors;
                        setPasswordValidationErrors(prev => ({
                          ...prev,
                          current_password: errors.current_password?.[0] ? t(errors.current_password[0]) : undefined,
                        }));
                      } else {
                        setPasswordValidationErrors(prev => ({
                          ...prev,
                          current_password: undefined,
                        }));
                      }
                    }}
                    error={passwordErrors.current_password || passwordValidationErrors.current_password}
                  />
                    <Input
                      type="password"
                      placeholder={t('common.new_password')}
                      label={t('common.new_password')}
                      className="rounded-xl"
                      prefix={<LockClosedIcon className="size-4.5" />}
                      value={passwordData.password}
                      onChange={(e) => {
                        setPasswordData('password', e.target.value);
                        const result = passwordFormSchema.safeParse({
                          ...passwordData,
                          password: e.target.value,
                        });
                        if (!result.success) {
                          const errors = result.error.flatten().fieldErrors;
                          setPasswordValidationErrors(prev => ({
                            ...prev,
                            password: errors.password?.[0] ? t(errors.password[0]) : undefined,
                            password_confirmation: errors.password_confirmation?.[0] ? t(errors.password_confirmation[0]) : undefined,
                          }));
                        } else {
                          setPasswordValidationErrors(prev => ({
                            ...prev,
                            password: undefined,
                            password_confirmation: undefined,
                          }));
                        }
                      }}
                      error={passwordErrors.password || passwordValidationErrors.password}
                    />
                    <Input
                      type="password"
                      placeholder={t('common.confirm_password')}
                      label={t('common.confirm_password')}
                      className="rounded-xl"
                      prefix={<LockClosedIcon className="size-4.5" />}
                      value={passwordData.password_confirmation}
                      onChange={(e) => {
                        setPasswordData('password_confirmation', e.target.value);
                        const result = passwordFormSchema.safeParse({
                          ...passwordData,
                          password_confirmation: e.target.value,
                        });
                        if (!result.success) {
                          const errors = result.error.flatten().fieldErrors;
                          setPasswordValidationErrors(prev => ({
                            ...prev,
                            password: errors.password?.[0] ? t(errors.password[0]) : undefined,
                            password_confirmation: errors.password_confirmation?.[0] ? t(errors.password_confirmation[0]) : undefined,
                          }));
                        } else {
                          setPasswordValidationErrors(prev => ({
                            ...prev,
                            password: undefined,
                            password_confirmation: undefined,
                          }));
                        }
                      }}
                      error={passwordErrors.password_confirmation || passwordValidationErrors.password_confirmation}
                    />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    className="min-w-[7rem]"
                    onClick={() => {
                      resetPassword();
                      setPasswordValidationErrors({});
                    }}
                    type="button"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                                        type="submit"
                                            variant="filled"
                                            color="primary"
                    disabled={passwordProcessing || Object.values(passwordValidationErrors).some(error => error) || !passwordData.current_password.trim() || !passwordData.password.trim() || !passwordData.password_confirmation.trim()}
                  >
                    {passwordProcessing ? t('common.updating') : t('common.update_password')}
                  </Button>
                </div>
              </form>
</Card>
</div>
</div>


             <div className="row mt-6">
                      <Card className="p-3 sm:px-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                      <h5 className="dark:text-dark-50 text-lg font-medium text-gray-800">
              {t('common.availability')}
            </h5>
            <p className="dark:text-dark-200 mt-0.5 text-sm text-balance text-gray-500">
              {t('common.availability')}
            </p>

          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            firstDay={1}
            allDaySlot={false}
            slotMinTime="08:00:00"
            // slotMaxTime="20:00:00"
            selectMirror={true}
            selectable={true}
            editable={false}
            events={availabilitySlots}
            select={(selectInfo) => {
              handleDateSelect(selectInfo);
            }}
            eventClick={(clickInfo) => {
              handleEventClick(clickInfo);
            }}
            headerToolbar={{
              left: '',
              center: '',
              right: ''
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            selectAllow={(selectInfo) => {
    return selectInfo.start >= new Date(); 
  }}
   hiddenDays={[0]} 
    initialDate={(function () {
    const today = new Date();
    // if today is Sunday (0), jump to next Monday
    if (today.getDay() === 0) {
      today.setDate(today.getDate() + 1); // move to Monday
    }
    return today;
  })()}
    />
</Card>
</div>
</div>
          
    </Page>
        </MainLayout>
  );
}