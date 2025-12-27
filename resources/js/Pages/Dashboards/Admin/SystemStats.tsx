import {
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "@/hooks/useTranslation";
import { Card } from "@/components/ui";
import { BiMoney } from "react-icons/bi";
import { PawPrint } from "lucide-react";

interface SystemStatsProps {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    totalVeterinarians: number;
    activeVeterinarians: number;
    totalAppointments: number;
    todayAppointments: number;
    pendingAppointments: number;
    completedAppointments: number;
    thisMonthAppointments: number;
    totalClients: number;
    newClientsThisMonth: number;
    totalPets: number;
    newPetsThisMonth: number;
    totalProducts: number;
    revenue: number;
    pendingRevenue: number;
    completedOrders: number;
    thisMonthOrders: number;
    totalConsultations: number;
    todayConsultations: number;
  };
}

export function SystemStats({ stats }: SystemStatsProps) {
  const { t } = useTranslation();
  const currency = t("common.currency") || "MAD";

  const formatNumber = (value?: number) => {
    const num = typeof value === "number" ? value : 0;
    return num.toLocaleString();
  };

  const formatCurrency = (value?: number) => {
    const num = typeof value === "number" ? value : 0;
    return `${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;
  };

  const statCards = [
    {
      title: t("common.revenue_summary"),
      value: formatCurrency(stats.revenue),
      change: `${formatCurrency(stats.pendingRevenue)} pending`,
      icon: BiMoney,
    },
    {
      title: t("common.total_users") || "Total Users",
      value: formatNumber(stats.totalUsers),
      change: `+${formatNumber(stats.newUsersThisMonth)} this month`,
      icon: UsersIcon,
    },
 
    {
      title: t("common.total_veterinarians") || "Veterinarians",
      value: formatNumber(stats.totalVeterinarians),
      change: `${formatNumber(stats.activeVeterinarians)} active`,
      icon: UserGroupIcon,
    },   {
      title: t("common.total_clients") || "Total Clients",
      value: formatNumber(stats.totalClients),
      change: `+${formatNumber(stats.newClientsThisMonth)} this month`,
      icon: UserCircleIcon,
    },   {
      title: t("common.total_pets") || "Total Pets",
      value: formatNumber(stats.totalPets),
      change: `+${formatNumber(stats.newPetsThisMonth)} this month`,
      icon: PawPrint,
    },
    {
      title: t("common.total_appointments") || "Total Appointments",
      value: formatNumber(stats.totalAppointments),
      change: `${formatNumber(stats.todayAppointments)} today`,
      icon: CalendarIcon,
    },

    {
      title: t("common.total_consultations") || "Consultations",
      value: formatNumber(stats.totalConsultations),
      change: `${formatNumber(stats.todayConsultations)} today`,
      icon: ChartBarIcon,
    },
    {
      title: t("common.total_products") || "Total Products",
      value: formatNumber(stats.totalProducts),
      icon: ShoppingBagIcon,
    },
 
 
  ];

  return (
    <div className="mb-6">
      <h2 className="mb-4 text-base font-medium tracking-wide text-gray-800 dark:text-dark-100">
        {t("common.system_overview") || "System Overview"}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs-plus text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-dark-100">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`rounded-lg bg-primary-50 dark:bg-primary-900/20 p-2`}>
                  <Icon className={`size-6 text-primary-600 dark:text-primary-400`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

