import { z } from 'zod';

const orderProductSchema = z.object({
  product_id: z.string().min(1, 'validation.product_required'),
  product_name: z.string().optional(),
  quantity: z.number().min(1, 'validation.quantity_min'),
  unit_price: z.number().min(0, 'validation.unit_price_min'),
  tva: z.number().min(0, 'validation.tva_min').max(100, 'validation.tva_max'),
  reduction_taux: z.number().min(0, 'validation.reduction_min').max(100, 'validation.reduction_max'),
  total_price: z.number().min(0, 'validation.total_price_min'),
});

export const orderSchema = z.object({
  reference: z.string().optional(),
  supplier_id: z.string().min(1, 'validation.supplier_required'),
  order_type: z.string().min(1, 'validation.order_type_required'),
  order_date: z.string().min(1, 'validation.order_date_required'),
  shipping_cost: z.string().optional(),
  discount_percentage: z.string().optional(),
  payment_method: z.string().optional(),
  payment_due_date: z.string().optional(),
  confirmed_delivery_date: z.string().optional(),
  products: z.array(orderProductSchema).min(1, 'validation.products_required'),
  subtotal: z.string().optional(),
  tax_amount: z.string().optional(),
  discount_amount: z.string().optional(),
  total_amount: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
export type OrderProductFormValues = z.infer<typeof orderProductSchema>;

