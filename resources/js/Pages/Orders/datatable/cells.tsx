import { useMemo, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui";
import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { useToast } from "@/components/common/Toast/ToastContext";
import type { Order } from "@/types/Orders";
import { router } from "@inertiajs/react";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

interface CellProps<T = unknown> {
  getValue: () => T;
}

interface ActionsCellProps {
  row: any;
  table: any;
  onEdit: () => void;
}

const statusVariantMap: Record<string, string> = {
  draft: "badge-secondary",
  pending: "badge-warning",
  confirmed: "badge-info",
  shipped: "badge-primary",
  received: "badge-success",
  cancelled: "badge-error",
  returned: "badge-secondary",
};

const paymentVariantMap: Record<string, string> = {
  bank_transfer: "badge-primary",
  check: "badge-secondary",
  cash: "badge-warning",
  transfer: "badge-primary",
};

const orderTypeVariantMap: Record<string, string> = {
  regular: "badge-primary",
  emergency: "badge-error",
};

export function ReferenceCell({ getValue }: CellProps<string>) {
  const value = getValue();

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <span className="font-medium text-gray-800 dark:text-dark-100">
        {value || "—"}
      </span>
    </div>
  );
}

export function SupplierCell({ getValue }: CellProps<string | undefined>) {
  const value = getValue();
  return (
    <span className="text-sm text-gray-600 dark:text-gray-300">
      {value || "—"}
    </span>
  );
}

export function StatusCell({ getValue }: CellProps<Order["status"]>) {
  const { t } = useTranslation();
  const status = getValue();
  const variant = status?.label
    ? statusVariantMap[status.label] ?? "badge-secondary"
    : "badge-secondary";

  return (
    <span
      className={`badge ${variant} dark:border-transparent capitalize`}
    >
      {status?.label ? t(`common.order_status_${status.label}`) : "—"}
    </span>
  );
}

export function OrderTypeCell({ getValue }: CellProps<Order["order_type"]>) {
  const { t } = useTranslation();
  const orderType = getValue();
  const variant = orderType?.label
    ? orderTypeVariantMap[orderType.label] ?? "badge-secondary"
    : "badge-secondary";

  return (
    <span
      className={`badge ${variant} dark:border-transparent capitalize`}
    >
      {orderType?.label ? t(`common.order_type_${orderType.label}`) : "—"}
    </span>
  );
}

export function PaymentMethodCell({ getValue }: CellProps<Order["payment_method"]>) {
  const { t } = useTranslation();
  const payment = getValue();
  const variant = payment?.label
    ? paymentVariantMap[payment.label] ?? "badge-secondary"
    : "badge-secondary";

  return (
    <span
      className={`badge ${variant} dark:border-transparent capitalize`}
    >
      {payment?.label ? t(`common.payment_method_${payment.label}`) : "—"}
    </span>
  );
}

export function TotalAmountCell({ getValue }: CellProps<number>) {
  const amount = getValue();
  const formatted = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(amount ?? 0),
    [amount],
  );

  return (
    <span className="font-medium text-gray-800 dark:text-dark-100">
      {formatted}
    </span>
  );
}

export function DateCell({ getValue }: CellProps<string | null | undefined>) {
  const { locale } = useTranslation();
  const value = getValue();

  if (!value) {
    return <span className="text-sm text-gray-400">—</span>;
  }

  const dateLocale =
    locale === "ar" ? "ar-SA" : locale === "fr" ? "fr-FR" : "en-US";
  const formatted = new Date(value).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <span className="text-sm text-gray-600 dark:text-gray-300">
      {formatted}
    </span>
  );
}

export function ActionsCell({ row, table, onEdit }: ActionsCellProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const confirmMessages: ConfirmMessages = {
    pending: {
      description: t("common.confirm_delete_order"),
    },
    success: {
      title: t("common.order_deleted"),
      description: t("common.order_deleted_success"),
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
    router.delete(route("orders.destroy", row.original.uuid), {
      preserveScroll: true,
      onSuccess: () => {
        table.options.meta?.deleteRow?.(row);
        setDeleteSuccess(true);
        setConfirmDeleteLoading(false);
        showToast({
          type: "success",
          message: t("common.order_deleted_success"),
        });
      },
      onError: () => {
        setDeleteError(true);
        setConfirmDeleteLoading(false);
        showToast({
          type: "error",
          message: t("common.order_delete_error"),
        });
      },
    });
  };

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="flat"
          color="info"
          isIcon
          className="size-8 rounded-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
          title={t("common.edit")}
          onClick={onEdit}
        >
          <PencilIcon className="size-4 stroke-1.5" />
        </Button>

        <Button
          type="button"
          variant="flat"
          color="error"
          isIcon
          className="size-8 rounded-sm transition-all duration-200 hover:scale-105 hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20"
          title={t("common.delete")}
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

