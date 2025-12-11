import { useForm, router } from "@inertiajs/react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/Form";
import { Page } from "@/components/shared/Page";
import { CSSProperties, useState } from "react";
import PasswordInput from "./PasswordInput";
import DashboardCheck from "@/assets/illustrations/dashboard-check.svg?react";
import { useThemeContext } from "@/contexts/theme/context";
import { useTranslation } from "@/hooks/useTranslation";
import { InertiaLocaleProvider } from "@/contexts/locale/InertiaLocaleProvider";
import { Link } from "@inertiajs/react";

export default function Register() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get CSRF token from meta tag or cookie
  const getCsrfToken = () => {
    // First try meta tag (most reliable)
    const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (metaToken) return metaToken;
    
    // Fallback: get from cookie (XSRF-TOKEN)
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value);
      }
    }
    
    // Last resort: try _token meta tag
    const tokenMeta = document.querySelector('meta[name="_token"]')?.getAttribute('content');
    if (tokenMeta) return tokenMeta;
    
    return '';
  };

  const { data, setData, processing, errors } = useForm({
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const {
    primaryColorScheme: primary,
    lightColorScheme: light,
    darkColorScheme: dark,
    isDark,
  } = useThemeContext();

  const { t } = useTranslation();
  const [formErrors, setFormErrors] = useState<{ 
    email?: string; 
    phone?: string; 
    password?: string; 
    password_confirmation?: string;
  }>({});

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(name as keyof typeof data, value);
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    setError('');
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: typeof formErrors = {};
    
    if (!data.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!data.phone) {
      newErrors.phone = "Phone number is required.";
    } else {
      const phoneRegex = /^(\+212|0)[0-9]{9}$/;
      if (!phoneRegex.test(data.phone)) {
        newErrors.phone = "Please enter a valid phone number (e.g., +212XXXXXXXXX or 0XXXXXXXXX)";
      }
    }
    
    if (!data.password) {
      newErrors.password = "Password is required.";
    } else if (data.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    
    if (!data.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password.";
    } else if (data.password !== data.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match.";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    
    setFormErrors({});
    setSendingOtp(true);
    setError('');
    setSuccess('');
    
    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        setError('CSRF token not found. Please refresh the page.');
        setSendingOtp(false);
        return;
      }

      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin', // Include cookies for CSRF
        body: JSON.stringify({ phone: data.phone }),
      });

      const result = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setStep('otp');
        setSuccess('OTP sent successfully to your phone number.');
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    setError('');
    setSuccess('');

    try {
      const csrfToken = getCsrfToken();
      if (!csrfToken) {
        setError('CSRF token not found. Please refresh the page.');
        setVerifyingOtp(false);
        return;
      }

      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin', // Include cookies for CSRF
        body: JSON.stringify({
          phone: data.phone,
          otp: otp,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Phone verified successfully! Redirecting...');
        // Session is now set on backend, do full page redirect to dashboard
        // Use setTimeout to show success message briefly
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        setError(result.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <InertiaLocaleProvider>
      <Page title={t('common.register') || 'Register'}>
        <main className="min-h-100vh flex">
          <div className="hidden w-full place-items-center lg:grid">
            <div className="w-full max-w-lg p-6">
              <DashboardCheck
                style={
                  {
                    "--primary": primary[500],
                    "--dark-500": isDark ? dark[500] : light[200],
                    "--dark-600": isDark ? dark[600] : light[100],
                    "--dark-700": isDark ? dark[700] : light[300],
                    "--dark-450": isDark ? dark[450] : light[400],
                    "--dark-800": isDark ? dark[800] : light[400],
                  } as CSSProperties
                }
                className="w-full"
              />
            </div>
          </div>
          <div className="border-gray-150 dark:bg-dark-700 flex w-full flex-col items-center bg-white lg:max-w-md ltr:border-l rtl:border-r dark:border-transparent">
            <div className="flex w-full max-w-sm grow flex-col justify-center p-5">
              <div className="mb-2 flex flex-col">
                <img
                  src="/assets/logo.png"
                  alt="VetoClick Logo"
                  style={{ width: "10rem" }}
                />
                <div className="mt-4 lg:mt-2">
                  <h2 className="dark:text-dark-100 text-2xl font-semibold text-gray-600">
                    {step === 'form' 
                      ? (t('common.create_account') || 'Create an account')
                      : (t('common.verify_phone') || 'Verify Phone Number')
                    }
                  </h2>
                  <p className="dark:text-dark-300 text-gray-400">
                    {step === 'form'
                      ? (t('common.enter_your_information') || 'Enter your information to get started')
                      : `Enter the OTP sent to ${data.phone}`
                    }
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-md bg-green-50 dark:bg-green-900/20 p-3">
                  <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                </div>
              )}

              {step === 'form' ? (
                <form onSubmit={sendOtp} autoComplete="off">
                  <div className="space-y-4">
                    <Input
                      label={t('common.email_address') || 'Email Address'}
                      placeholder={t('common.enter_your_email') || 'Enter your email'}
                      prefix={
                        <EnvelopeIcon
                          className="size-5 transition-colors duration-200"
                          strokeWidth="1"
                        />
                      }
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={onChange}
                      error={formErrors.email || errors.email}
                      disabled={sendingOtp}
                    />
                    <Input
                      label={t('common.phone_number') || 'Phone Number'}
                      placeholder="+212XXXXXXXXX or 0XXXXXXXXX"
                      name="phone"
                      type="tel"
                      value={data.phone}
                      onChange={onChange}
                      error={formErrors.phone || errors.phone}
                      disabled={sendingOtp}
                    />
                    <PasswordInput
                      label={t('common.password') || 'Password'}
                      placeholder={t('common.password') || 'Password'}
                      name="password"
                      value={data.password}
                      onChange={onChange}
                      error={formErrors.password || errors.password}
                      disabled={sendingOtp}
                    />
                    <PasswordInput
                      label={t('common.confirm_password') || 'Confirm Password'}
                      placeholder={t('common.confirm_password') || 'Confirm Password'}
                      name="password_confirmation"
                      value={data.password_confirmation}
                      onChange={onChange}
                      error={formErrors.password_confirmation || errors.password_confirmation}
                      disabled={sendingOtp}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="mt-5 w-full"
                    color="primary"
                    disabled={sendingOtp || processing}
                  >
                    {sendingOtp ? (t('common.sending_otp') || 'Sending OTP...') : (t('common.continue') || 'Continue')}
                  </Button>
                </form>
              ) : (
                <form onSubmit={verifyOtp} autoComplete="off">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
                        {t('common.enter_otp') || 'Enter OTP'} sent to {data.phone}
                      </label>
                      <Input
                        placeholder="000000"
                        name="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                          setError('');
                        }}
                        maxLength={6}
                        disabled={verifyingOtp}
                        className="text-center text-2xl tracking-widest"
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form');
                        setOtp('');
                        setOtpSent(false);
                        setError('');
                        setSuccess('');
                      }}
                      className="dark:text-dark-300 dark:hover:text-dark-100 text-sm text-gray-600 underline hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={verifyingOtp}
                    >
                      {t('common.back') || 'Back'}
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={sendOtp}
                        className="dark:text-dark-300 dark:hover:text-dark-100 text-sm text-gray-600 underline hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={sendingOtp || verifyingOtp}
                      >
                        {sendingOtp ? (t('common.sending') || 'Sending...') : (t('common.resend_otp') || 'Resend OTP')}
                      </button>
                      <Button
                        type="submit"
                        color="primary"
                        disabled={verifyingOtp || otp.length !== 6}
                      >
                        {verifyingOtp ? (t('common.verifying') || 'Verifying...') : (t('common.verify_otp') || 'Verify OTP')}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              <div className="mt-5 flex justify-center">
                <Link
                  href={route('login')}
                  className="dark:text-dark-300 dark:hover:text-dark-100 text-sm text-gray-600 underline hover:text-gray-800"
                >
                  {t('common.already_registered') || 'Already registered?'} {t('common.sign_in') || 'Sign in'}
                </Link>
              </div>
            </div>

            <div className="dark:text-dark-300 mt-5 mb-3 flex justify-center text-xs text-gray-400">
              <a href="##">{t('common.privacy_notice') || 'Privacy Notice'}</a>
              <div className="dark:bg-dark-500 mx-2.5 my-0.5 w-px bg-gray-200"></div>
              <a href="##">{t('common.terms_of_service') || 'Terms of service'}</a>
            </div>
          </div>
        </main>
      </Page>
    </InertiaLocaleProvider>
  );
}

