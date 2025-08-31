import { Page } from "@/components/shared/Page";
import MainLayout from "@/layouts/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { useLocaleContext } from "@/contexts/locale/context";

export default function Dashboard() {
  const { t, isRTL } = useTranslation();
  const { isRtl } = useLocaleContext();

  return (
    <MainLayout>
      <Page title={t('common.dashboard')}>
        <div className={`transition-content w-full px-(--margin-x) pt-5 lg:pt-6 ${isRtl ? 'rtl' : 'ltr'}`}>
          <div className="mb-6">
            <h1 className={`text-2xl font-bold text-gray-900 dark:text-white ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('common.dashboard')}
            </h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('common.animals')}
              </h3>
              <p className={`text-gray-600 dark:text-gray-300 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('common.veterinary_clinic')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('common.appointments')}
              </h3>
              <p className={`text-gray-600 dark:text-gray-300 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('common.medical_records')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className={`text-lg font-semibold text-gray-900 dark:text-white mb-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('common.inventory')}
              </h3>
              <p className={`text-gray-600 dark:text-gray-300 ${isRtl ? 'text-right' : 'text-left'}`}>
                {t('common.products')} & {t('common.suppliers')}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className={`text-xl font-semibold text-gray-900 dark:text-white mb-4 ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('common.welcome')}
            </h2>
            <p className={`text-gray-600 dark:text-gray-300 ${isRtl ? 'text-right' : 'text-left'}`}>
              {t('common.welcome')} {t('common.veterinary_clinic')}! 
              {t('common.language')}: {t('common.english')} | {t('common.arabic')} | {t('common.french')}
            </p>
            
            <div className={`mt-4 flex flex-wrap gap-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {t('common.clients')}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {t('common.staff')}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {t('common.reports')}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {t('common.billing')}
              </span>
            </div>
          </div>
        </div>
      </Page>
    </MainLayout>
  );
}
