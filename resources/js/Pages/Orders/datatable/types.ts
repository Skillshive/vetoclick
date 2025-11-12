import { OrdersDictionaries, OrdersResource } from "@/types/Orders";

export interface OrderDatatableProps {
  orders: OrdersResource;
  filters: {
    search?: string;
    per_page: number;
    sort_by: string;
    sort_direction: "asc" | "desc";
    status?: number[] | number;
    order_type?: number[] | number;
    supplier_ids?: number[] | number;
  };
  dictionaries: OrdersDictionaries;
}

export interface TableSettings {
  enableFullScreen: boolean;
  enableRowDense: boolean;
  enableSorting?: boolean;
  enableColumnFilters?: boolean;
}

