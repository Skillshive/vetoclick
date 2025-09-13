// Local Imports
import { Button, Card, Input, Pagination, PaginationItems, PaginationNext, PaginationPrevious, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPlus } from "react-icons/hi2";
import { router } from "@inertiajs/react";
import { SubscriptionPlanCard } from "./partials/SubscriptionPlanCard";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { SubscriptionPlan, SubscriptionPlansProps } from "./types";
import SubscriptionPlanFormModal from "@/components/modals/SubscriptionPlanFormModal";
import { useState } from "react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";

export default function Index({
  subscriptionPlans,
  featureGroups = [],
  allFeatures = [],
  filters = {}
}: SubscriptionPlansProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const { showToast } = useToast();
  const confirmContext = useConfirm();
  const { t } = useTranslation();

  const handleDeletePlan = async (plan: SubscriptionPlan) => {
    if (deletingPlanId === plan.uuid) {
      return;
    }

    setDeletingPlanId(plan.uuid);
    
    const confirmed = await confirmContext.confirm({
      title: t('common.confirm_delete_plan'),
      message: t('common.confirm_delete_plan_message', { name: typeof plan.name === 'string' ? plan.name : plan.name.en }),
    });

    if (confirmed) {
      router.delete(route('subscription-plans.destroy', plan.uuid) as any, {
        onSuccess: () => {
          setDeletingPlanId(null);
          showToast({
            type: 'success',
            message: t('common.plan_deleted_success'),
            duration: 3000,
          });
          router.reload({
            preserveScroll: true
          });
        },
        onError: () => {
          setDeletingPlanId(null);
          showToast({
            type: 'error',
            message: t('common.plan_delete_error'),
            duration: 3000,
          });
        }
      });
    } else {
      setDeletingPlanId(null);
    }
  };

  const handleTogglePlan = async (plan: SubscriptionPlan) => {
    setTogglingPlanId(plan.uuid);
    
    router.patch(route('subscription-plans.toggle', plan.uuid) as any, {
      onSuccess: (page: any) => {
        showToast({
          type: 'success',
          message: 'Subscription plan status updated successfully.',
          duration: 3000,
        });
        setTogglingPlanId(null);
      },
      onError: (errors: any) => {
        showToast({
          type: 'error',
          message: errors.message || 'Failed to update subscription plan status.',
          duration: 3000,
        });
        setTogglingPlanId(null);
        // Revert the optimistic update on error
        router.reload({
          preserveScroll: true
        });
      }
    });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    const timeout = setTimeout(() => {
      router.visit(route('subscription-plans.index') as any, {
        data: { 
          search: value, 
          page: 1 
        },
        preserveState: true,
        preserveScroll: true,
      });
    }, 500);
    setSearchTimeout(timeout);
  };

  const plansList = subscriptionPlans?.data.data || [];
  const meta = subscriptionPlans?.meta || null;
  const activePlansCount = plansList.filter((plan: SubscriptionPlan) => plan.is_active).length;
  const canCreateNewPlan = activePlansCount < 3;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t('common.dashboard'), path: "/" },
    { title: t('common.subscription_plans') },
  ];

  return (
    <MainLayout>
      <Page title={t('common.subscription_plans')}>
        <div className="transition-content px-(--margin-x) pb-6 my-5">
          {/* Header with Search and Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <Breadcrumbs items={breadcrumbs} className="max-sm:hidden" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.manage_subscription_plans')}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
            <Input
                classNames={{
                  input: "text-xs-plus h-9 rounded-full",
                  root: "max-sm:hidden",
                }}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('common.search_plans')}
                className=""
                prefix={<MagnifyingGlassIcon className="size-4.5" />}
              />

              {canCreateNewPlan ? (
                <Button
                  onClick={() => {
                    setSelectedPlan(null);
                    setIsModalOpen(true);
                  }}
                  variant="filled"
                  color="primary"
                  className="h-8 gap-2 rounded-md px-3"
                >
                  <HiPlus className="w-4 h-4" />
                </Button>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('common.max_active_plans_reached')}
                </div>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          {plansList.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-500">{t('common.no_plans_found')}</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {plansList.map((plan: SubscriptionPlan) => (
                  <SubscriptionPlanCard
                    key={plan.uuid}
                    plan={plan}
                    onEdit={() => {
                      setSelectedPlan(plan);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDeletePlan(plan)}
                    onToggle={handleTogglePlan}
                    isToggling={togglingPlanId === plan.uuid}
                    isDeleting={deletingPlanId === plan.uuid}
                  />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.last_page > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    total={meta.last_page}
                    value={meta.current_page}
                    onChange={(page) => {
                      router.visit(route('subscription-plans.index') as any, {
                        data: { 
                          page: page, 
                          per_page: meta.per_page,
                          search: searchQuery
                        },
                        preserveState: true,
                        preserveScroll: true,
                      });
                    }}
                    className="flex items-center gap-1"
                  >
                    <PaginationPrevious />
                    <PaginationItems />
                    <PaginationNext />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </Page>

      <SubscriptionPlanFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        featureGroups={featureGroups}
        allFeatures={allFeatures}
      />
    </MainLayout>
  );
}
