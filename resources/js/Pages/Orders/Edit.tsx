import { OrderForm } from "./OrderForm";
import type { OrderFormPageProps } from "@/types/Orders";

export default function EditOrderPage({ order, dictionaries }: OrderFormPageProps) {
  return (
    <OrderForm
      mode="edit"
      dictionaries={dictionaries}
      order={order}
    />
  );
}

