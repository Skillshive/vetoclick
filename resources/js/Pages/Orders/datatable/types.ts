export interface OrderProduct {
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  tva: number;
  reduction_taux: number;
  total_price: number;
}

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
  products?: OrderProduct[];
  created_at?: string;
  approved?: boolean;
  approved_at?: string;
  received_at?: string;
  received_by?: {
    uuid: string;
    name: string;
  };
  receiving_notes?: string;
  cancellation_reason?: string;
  cancelled_by?: {
    uuid: string;
    name: string;
  };
  cancelled_at?: string;
  return_reason?: string;
  returned_at?: string;
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
    status?: string;
    supplier?: string;
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

