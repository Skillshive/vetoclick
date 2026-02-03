// Import Dependencies
import { useState } from "react";
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useForm } from "@inertiajs/react";

// Local Imports
import { Button, Input, Card } from "@/components/ui";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useTranslation } from "@/hooks/useTranslation";
import { passwordFormSchema } from "@/schemas/passwordSchema";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";

export default function Sessions() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidationErrors, setPasswordValidationErrors] = useState<{
    current_password?: string;
    password?: string;
    password_confirmation?: string;
  }>({});

  // Password update form
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
      error.errors?.forEach((err: any) => {
        validationErrors[err.path[0]] = err.message;
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
      <Page 
        title={t("common.metadata_titles.settings_sessions") || "Sessions"}
        description={t("common.page_descriptions.settings_sessions") || "View and manage active sessions. Monitor login activity and security."}
      >
      <div className="transition-content px-(--margin-x) pb-6 my-5">
        <Card className="px-8 py-6 mt-4">
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
        </Card>
      </div>
      </Page>
    </MainLayout>
  );
}
