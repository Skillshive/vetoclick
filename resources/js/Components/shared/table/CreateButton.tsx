import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface CreateButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export const CreateButton = ({
  onClick,
  label,
  className
}: CreateButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="filled"
      color="primary"
      className={`h-8 gap-2 rounded-md px-3 text-xs ${className || ""}`}
      onClick={onClick}
    >
      <PlusIcon className="size-4" />
      <span>{label || t('common.create')}</span>
    </Button>
  );
};