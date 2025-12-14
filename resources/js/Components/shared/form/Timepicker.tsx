// Import Dependencies
import { DatePicker } from "@/components/shared/form/Datepicker";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

interface TimepickerProps {
  value?: string | Date | Date[];
  onChange?: (dates: Date[], dateStr: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  options?: any;
}


const Timepicker = ({
  value,
  onChange,
  className,
  disabled,
  options = {},
  ...props
}: TimepickerProps) => {
  const { t } = useTranslation();

  return (
    <DatePicker
      value={value}
      onChange={onChange}
      placeholder={t('common.choose_time')}
      className={className}
      disabled={disabled}
      options={{
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        ...options,
      }}
      hasCalenderIcon={false}
      {...props}
    />
  );
};

export { Timepicker };

