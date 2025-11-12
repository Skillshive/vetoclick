import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { useTranslation } from "@/hooks/useTranslation";
import { Button, Card, Input, Select, Textarea, Switch } from "@/components/ui";
import { useForm } from "@inertiajs/react";
import { orderFormSchema } from "@/schemas/orderSchema";
import type {
  Order,
  OrderFormData,
  OrdersDictionaries,
} from "@/types/Orders";
import { useState } from "react";

type RouteParams = Record<string, unknown> | string | number | Array<string | number>;
declare const route: (name: string, params?: RouteParams, absolute?: boolean) => string;

interface OrderFormProps {
  mode: "create" | "edit";
  dictionaries: OrdersDictionaries;
  order?: Order;
  defaults?: Partial<OrderFormData>;
}

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function toFormData(
  order?: Order,
  defaults?: Partial<OrderFormData>,
): OrderFormData {
  if (!order) {
    return {
      reference: defaults?.reference ?? "",
      supplier_id: defaults?.supplier_id ?? "",
      order_type: defaults?.order_type ?? 1,
      status: defaults?.status ?? 1,
      subtotal: defaults?.subtotal ?? "",
      tax_amount: defaults?.tax_amount ?? "",
      shipping_cost: defaults?.shipping_cost ?? "",
      discount_amount: defaults?.discount_amount ?? "",
      total_amount: defaults?.total_amount ?? "",
      discount_percentage: defaults?.discount_percentage ?? "",
      payment_due_date: defaults?.payment_due_date ?? null,
      payment_method: defaults?.payment_method ?? 1,
      order_date: defaults?.order_date ?? new Date().toISOString().slice(0, 10),
      confirmed_delivery_date: defaults?.confirmed_delivery_date ?? null,
      approved: defaults?.approved ?? false,
      approved_at: defaults?.approved_at ?? null,
      received_at: defaults?.received_at ?? null,
      received_by: defaults?.received_by ?? null,
      receiving_notes: defaults?.receiving_notes ?? "",
      cancellation_reason: defaults?.cancellation_reason ?? "",
      cancelled_by: defaults?.cancelled_by ?? null,
      cancelled_at: defaults?.cancelled_at ?? null,
      return_reason: defaults?.return_reason ?? "",
      returned_at: defaults?.returned_at ?? null,
    };
  }

  return {
    reference: order.reference ?? "",
    supplier_id: order.supplier_id ?? "",
    order_type: order.order_type.value,
    status: order.status.value,
    subtotal: order.subtotal ?? "",
    tax_amount: order.tax_amount ?? "",
    shipping_cost: order.shipping_cost ?? "",
    discount_amount: order.discount_amount ?? "",
    total_amount: order.total_amount ?? "",
    discount_percentage:
      order.discount_percentage === null ? "" : order.discount_percentage,
    payment_due_date: order.payment_due_date ?? "",
    payment_method: order.payment_method.value,
    order_date: order.order_date,
    confirmed_delivery_date: order.confirmed_delivery_date ?? "",
    approved: order.approved ?? false,
    approved_at: order.approved_at ?? "",
    received_at: order.received_at ?? "",
    received_by: order.received_by ?? "",
    receiving_notes: order.receiving_notes ?? "",
    cancellation_reason: order.cancellation_reason ?? "",
    cancelled_by: order.cancelled_by ?? "",
    cancelled_at: order.cancelled_at ?? "",
    return_reason: order.return_reason ?? "",
    returned_at: order.returned_at ?? "",
  };
}

export function OrderForm({ mode, dictionaries, order, defaults }: OrderFormProps) {
  const { t } = useTranslation();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const form = useForm<OrderFormData>(toFormData(order, defaults));

  const handleInputChange = <K extends keyof OrderFormData>(
    field: K,
    value: OrderFormData[K],
  ) => {
    form.setData(field, value);
    setValidationErrors((prev) => {
      const next = { ...prev };
      delete next[field as string];
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = orderFormSchema.safeParse(form.data);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const mappedErrors: Record<string, string> = {};
      Object.entries(fieldErrors).forEach(([field, [message]]) => {
        if (message) {
          mappedErrors[field] = t(message);
        }
      });
      setValidationErrors(mappedErrors);
      return;
    }

    setValidationErrors({});

    if (mode === "create") {
      form.post(route("orders.store"));
    } else if (order) {
      form.put(route("orders.update", order.uuid));
    }
  };

  const pageTitle =
    mode === "create" ? t("common.create_order") : t("common.edit_order");
  const description =
    mode === "create"
      ? t("common.create_order_description")
      : t("common.edit_order_description");

  return (
    <MainLayout>
      <Page title={pageTitle}>
        <form onSubmit={handleSubmit} className="transition-content px-(--margin-x) py-4">
          <div className="">
            <Card className="space-y-6 p-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-100">
                  {t("common.order_information")}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-dark-300">
                  {description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  label={t("common.order_reference")}
                  value={form.data.reference ?? ""}
                  onChange={(e) => handleInputChange("reference", e.target.value)}
                  placeholder={t("common.order_reference_placeholder")}
                  error={validationErrors.reference || form.errors.reference}
                />

                <Select
                  label={t("common.supplier")}
                  data={[
                    { value: "", label: t("common.select_supplier") },
                    ...dictionaries.suppliers.map((supplier) => ({
                      value: supplier.id,
                      label: supplier.name,
                    })),
                  ]}
                  value={form.data.supplier_id}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleInputChange(
                      "supplier_id",
                      value === "" ? "" : Number(value),
                    );
                  }}
                  error={validationErrors.supplier_id || form.errors.supplier_id}
                />

                <Select
                  label={t("common.order_type")}
                  data={Object.entries(dictionaries.order_types).map(
                    ([value, label]) => ({
                      value: Number(value),
                      label: t(`common.order_type_${label}`),
                    }),
                  )}
                  value={form.data.order_type}
                  onChange={(e) =>
                    handleInputChange("order_type", Number(e.target.value))
                  }
                  error={validationErrors.order_type || form.errors.order_type}
                />

                <Input
                  type="date"
                  label={t("common.order_date")}
                  value={form.data.order_date}
                  onChange={(e) => handleInputChange("order_date", e.target.value)}
                  error={validationErrors.order_date || form.errors.order_date}
                />

                <Input
                  type="date"
                  label={t("common.payment_due_date")}
                  value={form.data.payment_due_date ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "payment_due_date",
                      e.target.value === "" ? null : e.target.value,
                    )
                  }
                  error={
                    validationErrors.payment_due_date || form.errors.payment_due_date
                  }
                />

                <Input
                  type="date"
                  label={t("common.confirmed_delivery_date")}
                  value={form.data.confirmed_delivery_date ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "confirmed_delivery_date",
                      e.target.value === "" ? null : e.target.value,
                    )
                  }
                  error={
                    validationErrors.confirmed_delivery_date ||
                    form.errors.confirmed_delivery_date
                  }
                />

                <Select
                  label={t("common.payment_method")}
                  data={Object.entries(dictionaries.payment_methods).map(
                    ([value, label]) => ({
                      value: Number(value),
                      label: t(`common.payment_method_${label}`),
                    }),
                  )}
                  value={form.data.payment_method}
                  onChange={(e) =>
                    handleInputChange("payment_method", Number(e.target.value))
                  }
                  error={validationErrors.payment_method || form.errors.payment_method}
                />
                <Input
                  type="number"
                  step="0.01"
                  label={t("common.subtotal")}
                  value={form.data.subtotal}
                  onChange={(e) =>
                    handleInputChange("subtotal", e.target.value === "" ? "" : Number(e.target.value))
                  }
                  error={validationErrors.subtotal || form.errors.subtotal}
                />
                <Input
                  type="number"
                  step="0.01"
                  label={t("common.tax_amount")}
                  value={form.data.tax_amount}
                  onChange={(e) =>
                    handleInputChange("tax_amount", e.target.value === "" ? "" : Number(e.target.value))
                  }
                  error={validationErrors.tax_amount || form.errors.tax_amount}
                />
                <Input
                  type="number"
                  step="0.01"
                  label={t("common.shipping_cost")}
                  value={form.data.shipping_cost}
                  onChange={(e) =>
                    handleInputChange("shipping_cost", e.target.value === "" ? "" : Number(e.target.value))
                  }
                  error={validationErrors.shipping_cost || form.errors.shipping_cost}
                />
                <Input
                  type="number"
                  step="0.01"
                  label={t("common.discount_amount")}
                  value={form.data.discount_amount}
                  onChange={(e) =>
                    handleInputChange("discount_amount", e.target.value === "" ? "" : Number(e.target.value))
                  }
                  error={validationErrors.discount_amount || form.errors.discount_amount}
                />
                <Input
                  type="number"
                  step="0.01"
                  label={t("common.total_amount")}
                  value={form.data.total_amount}
                  onChange={(e) =>
                    handleInputChange("total_amount", e.target.value === "" ? "" : Number(e.target.value))
                  }
                  description={
                    typeof form.data.total_amount === "number"
                      ? currencyFormatter.format(form.data.total_amount)
                      : undefined
                  }
                  error={validationErrors.total_amount || form.errors.total_amount}
                />
                <Input
                  type="number"
                  step="0.01"
                  label={t("common.discount_percentage")}
                  value={form.data.discount_percentage ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      "discount_percentage",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  error={
                    validationErrors.discount_percentage ||
                    form.errors.discount_percentage
                  }
                />
              </div>
            </Card>

          </div>
          <div className="flex items-center justify-end space-x-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="outlined"
                                            >
                                            {t('common.cancel')}
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="filled"
                                            color="primary"
                                        >
                                            {t('common.save')}
                                        </Button>
                                    </div>
        </form>
      </Page>
    </MainLayout>
  );
}

