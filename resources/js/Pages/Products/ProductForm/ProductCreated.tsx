// Import Dependencies
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";
import { router } from "@inertiajs/react";
import clsx from "clsx";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

export function ProductCreated() {
  const { t } = useTranslation();
  const { isRtl } = useLocaleContext();

  const handleViewProducts = () => {
    router.visit(route('products.index'));
  };

  const handleCreateAnother = () => {
    router.reload();
  };

  return (
    <div className={clsx("text-center", isRtl && "text-right")} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">
        {t('common.products.form.created.success_title')}
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {t('common.products.form.created.success_message')}
      </p>
      <div className={clsx("mt-8 flex justify-center", isRtl ? "space-x-reverse space-x-3" : "space-x-3")}>
        <Button
          variant="outlined"
          onClick={handleViewProducts}
        >
          {t('common.products.form.created.view_all')}
        </Button>
        <Button
          color="primary"
          onClick={handleCreateAnother}
        >
          {t('common.products.form.created.create_another')}
        </Button>
      </div>
    </div>
  );
}
