import { useForm } from "@inertiajs/react";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Button, Card } from "@/components/ui";
import { Checkbox, Input } from "@/components/ui/Form";
import { Page } from "@/components/shared/Page";
import { CSSProperties, useState } from "react";
import { loginSchema } from "./schema";
import PasswordInput from "./PasswordInput";
import DashboardCheck from "@/assets/illustrations/dashboard-check.svg?react";
import { useThemeContext } from "@/contexts/theme/context";
import { useTranslation } from "@/hooks/useTranslation";
import { InertiaLocaleProvider } from "@/contexts/locale/InertiaLocaleProvider";

export default function Login() {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const {
    primaryColorScheme: primary,
    lightColorScheme: light,
    darkColorScheme: dark,
    isDark,
  } = useThemeContext();

  const { t } = useTranslation();
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setData(name as keyof typeof data, type === "checkbox" ? checked : value);
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }
    setFormErrors({});
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <InertiaLocaleProvider>
      <Page title={t('common.login')}>

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
                      {t('common.welcome_back')}
                    </h2>
                    <p className="dark:text-dark-300 text-gray-400">
                      {t('common.please_sign_in_to_continue')}
                    </p>
                  </div>
                </div>
            <form onSubmit={onSubmit} autoComplete="off">
                  <div className="space-y-4">
                    <Input
                  label={t('common.email_address')}
                  placeholder={t('common.enter_your_email')}
                  prefix={
                    <EnvelopeIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  name="email"
                  value={data.email}
                  onChange={onChange}
                  error={formErrors.email || errors.email}
                />
                <PasswordInput
                  label={t('common.password')}
                  placeholder={t('common.password')}
                  name="password"
                  value={data.password}
                  onChange={onChange}
                  error={formErrors.password || errors.password}
                />
                    <div className="flex items-center justify-between space-x-2">
                      <Checkbox label={t('common.remember_me')} />
                      <a
                        href="##"
                        className="dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100 text-xs text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800"
                      >
                        {t('common.forgot_password')}
                      </a>
                    </div>
                  </div>
              <Button
                type="submit"
                className="mt-5 w-full"
                color="primary"
                disabled={processing}
              >
                {processing ? t('common.signing_in') : t('common.sign_in')}
              </Button>
                </form>
               
      
                {/* <div className="text-tiny-plus my-7 flex items-center">
                  <div className="dark:bg-dark-500 h-px flex-1 bg-gray-200"></div>
                  <p className="mx-3">{t('common.or')}</p>
                  <div className="dark:bg-dark-500 h-px flex-1 bg-gray-200"></div>
                </div>
       */}
              {/* <div className="flex gap-4">
                <Button 
                  className="h-10 flex-1 gap-3" 
                  variant="outlined"
                  onClick={() => window.location.href = route('auth.google')}
                  type="button"
                >
                  <span>{t('common.google_login')}</span>
                  <img
                    className="size-5.5"
                    src="/assets/google.svg"
                    alt="logo"
                  />
                </Button>
              </div>
              */}
              </div>
      
              <div className="dark:text-dark-300 mt-5 mb-3 flex justify-center text-xs text-gray-400">
                <a href="##">{t('common.privacy_notice')}</a>
                <div className="dark:bg-dark-500 mx-2.5 my-0.5 w-px bg-gray-200"></div>
                <a href="##">{t('common.terms_of_service')}</a>
              </div>
            </div>
          </main>
      </Page>
    </InertiaLocaleProvider>
  );
}