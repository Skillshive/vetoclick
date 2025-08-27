import { useForm } from "@inertiajs/react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Button, Card } from "@/components/ui";
import { Checkbox, Input } from "@/components/ui/Form";
import { Page } from "@/components/shared/Page";
import { useState } from "react";
import { loginSchema } from "./schema";
import PasswordInput from "./PasswordInput";

export default function Login() {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

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
    <Page title="Connexion">
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-[26rem] p-4 sm:px-5">
          <div className="text-center">
            <img
              src="/assets/logo.jpg"
              alt="VetoClick Logo"
              className="mx-auto size-24 rounded-lg shadow"
            />
            <div className="mt-4">
              <h2 className="text-2xl font-semibold text-gray-600 dark:text-dark-100">
                Bienvenue !
              </h2>
              <p className="text-gray-400 dark:text-dark-300">
                Veuillez vous connecter pour continuer
              </p>
            </div>
          </div>
          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={onSubmit} autoComplete="off">
              <div className="space-y-4">
                <Input
                  label="Adresse e-mail"
                  placeholder="Entrez votre adresse e-mail"
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
                  name="password"
                  value={data.password}
                  onChange={onChange}
                  error={formErrors.password || errors.password}
                />
              </div>
              <div className="mt-4 flex items-center justify-between space-x-2">
                <Checkbox label="Se souvenir de moi" name="remember" checked={data.remember} onChange={onChange} />
                <a
                  href="#"
                  className="text-xs text-gray-400 transition-colors hover:text-gray-800 focus:text-gray-800 dark:text-dark-300 dark:hover:text-dark-100 dark:focus:text-dark-100"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <Button
                type="submit"
                className="mt-5 w-full"
                color="primary"
                disabled={processing}
              >
                {processing ? 'Connexion en cours...' : 'Se connecter'}
              </Button>
            </form>
          </Card>
          <div className="mt-8 flex justify-center text-xs text-gray-400 dark:text-dark-300">
            <a href="#">Politique de confidentialité</a>
            <div className="mx-2.5 my-0.5 w-px bg-gray-200 dark:bg-dark-500"></div>
            <a href="#">Conditions d'utilisation</a>
          </div>
        </div>
      </main>
    </Page>
  );
}
