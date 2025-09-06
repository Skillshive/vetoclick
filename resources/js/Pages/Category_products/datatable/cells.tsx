import { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/common/Toast/ToastContext";
import { CategoryProduct } from "@/types/CategoryProducts";

interface CellProps {
  getValue: () => any;
}

interface ActionsCellProps {
  row: any;
  table: any;
  setSelectedCategoryProduct: (categoryProduct: CategoryProduct | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

export function CategoryProductNameCell({ getValue }: CellProps) {
  return (
    <div className="flex max-w-xs items-center space-x-4 rtl:space-x-reverse 2xl:max-w-sm">
      <div className="min-w-0">
        <p className="truncate">
          <a
            href="##"
            className="hover:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 font-medium text-gray-700 transition-colors"
          >
            {getValue()}
          </a>
        </p>
      </div>
    </div>
  );
}

export function DescriptionCell({ getValue }: CellProps) {
  const { t } = useTranslation();
  const description = getValue();
  return (
   <div className="max-w-xs">
      {description ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {description}
        </p>
      ) : (
        <p className="badge-base badge border border-gray-300 text-gray-900 dark:border-surface-1 dark:text-dark-50">
          {t('common.no_description')}
        </p>
      )}
    </div>
  );
}
export function CategoryCell({ getValue }: CellProps) {
  const { t } = useTranslation();
  const category_product = getValue();
  return (
    <div className="max-w-xs">
      {category_product ? (
        <p className="badge-base badge this:primary border border-this/30 text-this dark:border-this-lighter/30 dark:text-this-lighter">
          {category_product}
        </p>
      ) : (
        <p className="badge-base badge border border-gray-300 text-gray-900 dark:border-surface-1 dark:text-dark-50">
          {t('common.no_category_product')}
        </p>
      )}
    </div>
  );
}

export function CreatedAtCell({ getValue }: CellProps) {
  const { locale } = useTranslation();
  const createdAt = getValue();
  
  const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
  
  const formattedDate = new Date(createdAt).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      {formattedDate}
    </div>
  );
}

export function ActionsCell({ row, table, setSelectedCategoryProduct, setIsModalOpen }: ActionsCellProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const confirmMessages: ConfirmMessages = {
    pending: {
      description: t('common.confirm_delete_category_product'),
    },
    success: {
      title: t('common.category_product_deleted'),
      description: t('common.category_product_deleted_success'),
    },
  };

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRow = () => {
    setConfirmDeleteLoading(true);
    setTimeout(() => {
      table.options.meta?.deleteRow?.(row);
      setDeleteSuccess(true);
      setConfirmDeleteLoading(false);
      showToast({
        type: 'success',
        message: t('common.category_product_deleted_success'),
      });
    }, 1000);
  };

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <div className="flex justify-center items-center gap-2"> 
        <Button
          type="button"
          variant="flat"
          color="info"
          isIcon
          className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
          title={t('common.edit')}
          onClick={() => {
            setSelectedCategoryProduct(row.original);
            setIsModalOpen(true);
          }}
        >
          <PencilIcon className="size-4 stroke-1.5" />
        </Button>

        <Button
          type="button"
          variant="flat"
          color="error"
          isIcon
          className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20"
          title={t('common.delete')}
          onClick={openModal}
        >
          <TrashIcon className="size-4 stroke-1.5" />
        </Button>
      </div>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeModal}
        messages={confirmMessages}
        onOk={handleDeleteRow}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}
