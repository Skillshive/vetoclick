import { Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import {
  UsersIcon,
  CalendarIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@inertiajs/react";

// Declare route helper
declare const route: (name: string, params?: any, absolute?: boolean) => string;

export function QuickLinks() {
  const { t } = useTranslation();

  const links = [
    {
      title: t("common.users_management") || "Users",
      href: route("users.index"),
      icon: UsersIcon,
    },
    {
      title: t("common.appointments_breadcrumb") || "Appointments",
      href: route("appointments.index"),
      icon: CalendarIcon,
    },
    {
      title: t("common.clients_breadcrumb") || "Clients",
      href: route("clients.index"),
      icon: UserCircleIcon,
    },
    {
      title: t("common.pets_management") || "Pets",
      href: route("pets.index"),
      icon: BeakerIcon,
    },
    {
      title: t("common.products_breadcrumb") || "Products",
      href: route("products.index"),
      icon: ShoppingBagIcon,
    },
    {
      title: t("common.orders_breadcrumb") || "Orders",
      href: route("orders.index"),
      icon: ClipboardDocumentListIcon,
    },
    {
      title: t("common.settings") || "Settings",
      href: route("settings.index"),
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-dark-100">
        {t("common.quick_links") || "Quick Links"}
      </h3>
      <div className="space-y-2">
        {links.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              key={index}
              href={link.href}
              className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-dark-600 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700"
            >
              <div className={`rounded-lg bg-primary-50 dark:bg-primary-900/20 p-2`}>
                <Icon className={`size-5 text-primary-600 dark:text-primary-400`} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {link.title}
              </span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

