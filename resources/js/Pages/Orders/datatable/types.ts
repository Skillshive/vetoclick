export interface Order {
  uuid: string;
  reference: string;
  supplier: {
    uuid: string;
    name: string;
  };
  order_type: string;
  status: string;
  subtotal: string;
  tax_amount: string;
  shipping_cost: string;
  discount_amount: string;
  total_amount: string;
  discount_percentage: string;
  payment_due_date: string;
  payment_method: string;
  order_date: string;
  confirmed_delivery_date: string;
  requested_by: string;
  created_at?: string;
}

export interface Supplier {
  uuid: string;
  name: string;
}

export interface OrderPageProps {
  orders: {
    data: Order[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
    links: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
  };
  filters: {
    search: string;
    per_page: number;
    sort_by?: string;
    sort_direction?: string;
    page?: number;
  };
  suppliers: Supplier[];
  statistics?: {
    totalOrders: number;
    draftOrders: number;
    confirmedOrders: number;
    receivedOrders: number;
    cancelledOrders: number;
    totalAmount: string;
  };
  old?: any;
  errors?: any;
}

