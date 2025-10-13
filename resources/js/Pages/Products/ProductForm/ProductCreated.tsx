// Import Dependencies
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { router } from "@inertiajs/react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

// ----------------------------------------------------------------------

export function ProductCreated() {
  const { t } = useTranslation();

  const handleViewProducts = () => {
    router.visit(route('products.index'));
  };

  const handleCreateAnother = () => {
    router.reload();
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
        <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">
        Product Created Successfully!
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Your product has been created and is now available in the system.
      </p>
      <div className="mt-8 flex justify-center space-x-3">
        <Button
          variant="outlined"
          onClick={handleViewProducts}
        >
          View All Products
        </Button>
        <Button
          color="primary"
          onClick={handleCreateAnother}
        >
          Create Another Product
        </Button>
      </div>
    </div>
  );
}
