import { Filters } from "./Filters";
import { PaginationLinks, PaginationMeta } from "./Pagination";

export interface OrderStatusInfo {
  value: number;
  label?: string;
  class?: string;
}

export interface OrderTypeInfo {
  value: number;
  label?: string;
}

export interface PaymentMethodInfo {
  value: number;
  label?: string;
  class?: string;
}

export interface OrderSupplier {
  uuid: string;
  name: string;
}

export interface Order {
  uuid: string;
  reference: string;
  supplier_id: number;
  supplier?: OrderSupplier | null;
  order_type: OrderTypeInfo;
  status: OrderStatusInfo;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  discount_percentage?: number | null;
  payment_due_date?: string | null;
  payment_method: PaymentMethodInfo;
  order_date: string;
  confirmed_delivery_date?: string | null;
  requested_by?: number | null;
  approved: boolean;
  approved_at?: string | null;
  received_at?: string | null;
  received_by?: number | null;
  receiving_notes?: string | null;
  cancellation_reason?: string | null;
  cancelled_by?: number | null;
  cancelled_at?: string | null;
  return_reason?: string | null;
  returned_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrdersResource {
  data: Order[];
  meta: PaginationMeta;
  links: PaginationLinks;
}

export interface OrdersPageProps {
  orders: OrdersResource;
  filters: Filters & {
    search?: string;
    status?: number[] | number;
    order_type?: number[] | number;
    supplier_ids?: number[] | number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: "asc" | "desc";
  };
  dictionaries: OrdersDictionaries;
}

export interface OrdersDictionaries {
  order_statuses: Record<number, string>;
  order_types: Record<number, string>;
  payment_methods: Record<number, string>;
  suppliers: Array<{
    id: number;
    uuid: string;
    name: string;
  }>;
}

export interface OrderFormData {
  reference?: string;
  supplier_id: number | "";
  order_type: number;
  status: number;
  subtotal: number | "";
  tax_amount: number | "";
  shipping_cost: number | "";
  discount_amount: number | "";
  total_amount: number | "";
  discount_percentage?: number | "" | null;
  payment_due_date?: string | null;
  payment_method: number;
  order_date: string;
  confirmed_delivery_date?: string | null;
  approved?: boolean;
  approved_at?: string | null;
  received_at?: string | null;
  received_by?: number | "" | null;
  receiving_notes?: string | null;
  cancellation_reason?: string | null;
  cancelled_by?: number | "" | null;
  cancelled_at?: string | null;
  return_reason?: string | null;
  returned_at?: string | null;
}

export interface OrderFormPageProps {
  order?: Order;
  dictionaries: OrdersDictionaries;
  defaults?: Partial<OrderFormData>;
}

