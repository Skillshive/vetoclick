export interface Product {
  id: number;
  uuid: string;
  name: string;
  sku: string;
  brand?: string;
  description?: string;
  barcode?: string;
  type?: number;
  dosage_form?: string;
  target_species?: string[];
  administration_route?: string;
  prescription_required?: boolean;
  minimum_stock_level?: number;
  maximum_stock_level?: number;
  is_active?: boolean;
  availability_status?: number;
  notes?: string;
  image_id?: number;
  image?: {
    id: number;
    name: string;
    path: string;
  };
  // Vaccine-specific fields
  manufacturer?: string;
  batch_number?: string;
  expiry_date?: string;
  dosage_ml?: number;
  vaccine_instructions?: string;
  category?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  category_product_id?: number;
}

export interface ProductManagementPageProps {
  products: {
    data: Product[];
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
  categories: Category[];
  filters: {
    search: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
    page?: number;
  };
  old?: any;
  errors?: any;
}
