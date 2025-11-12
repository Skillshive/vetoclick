import { OrderForm } from "./OrderForm";
import type { OrderFormPageProps } from "@/types/Orders";

export default function CreateOrderPage({ dictionaries, defaults }: OrderFormPageProps) {
  return (
    <OrderForm
      mode="create"
      dictionaries={dictionaries}
      defaults={defaults}
    />
  );
}

