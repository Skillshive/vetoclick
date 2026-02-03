// Local Imports
import { Page } from "@/components/shared/Page";
import MainLayout from "@/layouts/MainLayout";
import { usePage } from "@inertiajs/react";
import { useTranslation } from "@/hooks/useTranslation";
import { Overview } from "./Overview";
import { Statistics } from "./Statistics";
import { Projects } from "./Projects";
import { CustomerSatisfaction } from "./CustomerSatisfaction";
import { TopSellers } from "./TopSellers";
import { UsersActivity } from "./UsersActivity";
import { BandwidthReport } from "./BandwidthReport";

// ----------------------------------------------------------------------

interface AdminDashboardProps {
  stats?: {
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
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    thisMonthOrders: number;
    totalConsultations: number;
    todayConsultations: number;
  };
  financialStats?: {
    totalRevenue: number;
    pendingRevenue: number;
    averageOrderValue: number;
  };
  yearlyRevenue?: Array<{ month: number; total: number }>;
  monthlyRevenue?: Record<number, number>;
  topSoldPacks?: Array<{ name: string; quantity: number }>;
  topVeterinarians?: Array<{
    id: number;
    name: string;
    avatar?: string;
    appointments: number;
    clients: number;
    pets: number;
    progress: number;
  }>;
  recentClients?: Array<{
    id: number;
    firstname?: string;
    lastname?: string;
    avatar?: string | null;
  }>;
}

export default function AdminDashboard() {
  const { props } = usePage();
  const { t } = useTranslation();
  
  // Demo data for development
  const demoStats = {
    totalUsers: 1250,
    newUsersThisMonth: 45,
    totalVeterinarians: 12,
    activeVeterinarians: 8,
    totalAppointments: 3420,
    todayAppointments: 28,
    pendingAppointments: 156,
    completedAppointments: 2980,
    thisMonthAppointments: 245,
    totalClients: 890,
    newClientsThisMonth: 32,
    totalPets: 1245,
    newPetsThisMonth: 28,
    totalProducts: 156,
    totalOrders: 2340,
    pendingOrders: 45,
    completedOrders: 2180,
    thisMonthOrders: 189,
    totalConsultations: 1890,
    todayConsultations: 15,
  };

  const demoFinancialStats = {
    totalRevenue: 125000,
    pendingRevenue: 8500,
    averageOrderValue: 53.4,
  };

  const demoYearlyRevenue = [
    { month: 1, total: 8500 },
    { month: 2, total: 9200 },
    { month: 3, total: 10800 },
    { month: 4, total: 11200 },
    { month: 5, total: 12500 },
    { month: 6, total: 11800 },
    { month: 7, total: 13200 },
    { month: 8, total: 12800 },
    { month: 9, total: 14200 },
    { month: 10, total: 13800 },
    { month: 11, total: 15200 },
    { month: 12, total: 14500 },
  ];

  const demoMonthlyRevenue: Record<number, number> = {};
  for (let day = 1; day <= 30; day++) {
    demoMonthlyRevenue[day] = Math.floor(Math.random() * 800) + 200;
  }

  const demoTopSoldPacks = [
    { name: 'Basic Health Pack', quantity: 245 },
    { name: 'Premium Care Pack', quantity: 189 },
    { name: 'Emergency Pack', quantity: 156 },
    { name: 'Wellness Pack', quantity: 134 },
    { name: 'Complete Care Pack', quantity: 98 },
  ];

  const demoTopVeterinarians = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      avatar: '/assets/default/image-placeholder.jpg',
      appointments: 342,
      clients: 156,
      pets: 189,
      progress: 85,
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      avatar: '/assets/default/image-placeholder.jpg',
      appointments: 298,
      clients: 134,
      pets: 167,
      progress: 78,
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      avatar: '/assets/default/image-placeholder.jpg',
      appointments: 267,
      clients: 128,
      pets: 145,
      progress: 72,
    },
  ];

  const demoRecentClients = [
    { id: 1, firstname: "John", lastname: "Doe", avatar: null },
    { id: 2, firstname: "Jane", lastname: "Smith", avatar: null },
    { id: 3, firstname: "Bob", lastname: "Johnson", avatar: null },
    { id: 4, firstname: "Alice", lastname: "Williams", avatar: null },
    { id: 5, firstname: "Charlie", lastname: "Brown", avatar: null },
  ];

  // Use demo data if props are not provided (except topSoldPacks - only from DB)
  const stats = props.stats || demoStats;
  const financialStats = props.financialStats || demoFinancialStats;
  const yearlyRevenue = props.yearlyRevenue?.length ? props.yearlyRevenue : demoYearlyRevenue;
  const monthlyRevenue = Object.keys(props.monthlyRevenue || {}).length ? props.monthlyRevenue : demoMonthlyRevenue;
  // Top Sold Packs should only come from database, no demo data
  const topSoldPacks = props.topSoldPacks || [];
  const topVeterinarians = props.topVeterinarians?.length ? props.topVeterinarians : demoTopVeterinarians;
  const recentClients = props.recentClients?.length ? props.recentClients : demoRecentClients;

  return (
    <MainLayout>
      <Page 
        title={t("common.metadata_titles.admin_dashboard") || "Admin Dashboard"}
        description={t("common.admin_dashboard.page_description") || "Monitor system statistics, manage users, track revenue, and oversee all aspects of your veterinary clinic operations."}
      >
        <div className="overflow-hidden pb-8">
          <div className="transition-content mt-4 grid grid-cols-12 gap-4 px-(--margin-x) sm:mt-5 sm:gap-5 lg:mt-6 lg:gap-6">
            <Overview 
              yearlyRevenue={yearlyRevenue}
              monthlyRevenue={monthlyRevenue}
              totalRevenue={financialStats.totalRevenue || 0}
            />
            <Statistics stats={stats} financialStats={financialStats} />
            <Projects topVeterinarians={topVeterinarians} recentClients={recentClients} />
            <CustomerSatisfaction topSoldPacks={topSoldPacks} />
          </div>
        {/* <TopSellers /> 
          <div className="transition-content mt-4 grid grid-cols-1 gap-4 px-(--margin-x) sm:mt-5 sm:grid-cols-2 sm:gap-5 lg:mt-6 lg:gap-6">
            <BandwidthReport />
            <UsersActivity />
          </div>*/}
        </div>
      </Page>
    </MainLayout>
  );
}
