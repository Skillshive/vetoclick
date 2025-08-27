import { Page } from "@/components/shared/Page";
import MainLayout from "@/layouts/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout>
      <Page title="Tableau de bord">
        <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tableau de bord
          </h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-600 dark:text-gray-300">
              Bienvenue sur votre tableau de bord !
            </p>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}
