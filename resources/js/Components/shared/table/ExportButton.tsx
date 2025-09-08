import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface ExportButtonProps {
  onExport: () => void;
  label?: string;
  className?: string;
}

export const ExportButton = ({
  onExport,
  label,
  className
}: ExportButtonProps) => {
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      color="primary"
      className={`h-8 gap-2 rounded-md px-3 text-xs ${className || ""}`}
      onClick={onExport}
    >
      <ArrowDownTrayIcon className="size-4" />
      {/* <span>{label || t('common.export_csv')}</span> */}
    </Button>
  );
};