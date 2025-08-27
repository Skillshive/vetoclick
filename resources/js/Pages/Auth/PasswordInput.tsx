import { LockClosedIcon } from "@heroicons/react/24/outline";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { Input, Button } from "@/components/ui";
import { useDisclosure } from "@/hooks";

// Props for the password input
interface PasswordInputProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

const PasswordInput = ({
  label = "Mot de passe",
  name,
  value,
  onChange,
  error,
  placeholder = "Entrez votre mot de passe",
}: PasswordInputProps) => {
  const [show, { toggle }] = useDisclosure();

  return (
    <Input
      label={label}
      name={name}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={error}
      placeholder={placeholder}
      prefix={<LockClosedIcon className="size-5 transition-colors duration-200" strokeWidth="1" />}
      suffix={
        <Button
          variant="flat"
          className="pointer-events-auto size-6 shrink-0 rounded-full p-0"
          type="button"
          tabIndex={-1}
          onClick={toggle}
        >
          {show ? (
            <EyeSlashIcon className="size-4.5 text-gray-500 dark:text-dark-200" />
          ) : (
            <EyeIcon className="size-4.5 text-gray-500 dark:text-dark-200" />
          )}
        </Button>
      }
    />
  );
};

export default PasswordInput; 