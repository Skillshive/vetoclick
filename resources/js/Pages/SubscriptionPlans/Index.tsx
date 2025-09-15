// Local Imports
import { Button, Card, Input, Pagination, PaginationItems, PaginationNext, PaginationPrevious, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { HiPlus } from "react-icons/hi2";
import { router } from "@inertiajs/react";
import { SubscriptionPlanCard } from "./partials/SubscriptionPlanCard";
import MainLayout from "@/layouts/MainLayout";
import { Page } from "@/components/shared/Page";
import { SubscriptionPlan, SubscriptionPlansProps } from "./types";
import { useState, useEffect } from "react";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { BreadcrumbItem, Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";

declare const route: (name: string, params?: any, absolute?: boolean) => string;

export default function Index({
  subscriptionPlans,
  featureGroups = [],
  allFeatures = [],
  filters = {}
}: SubscriptionPlansProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [totalActivePlansCount, setTotalActivePlansCount] = useState<number>(0);
  const { showToast } = useToast();
  const confirmContext = useConfirm();
  const { t } = useTranslation();
console.log('subscriptionPlans',subscriptionPlans);
  // Get plans list first
  const plansList: SubscriptionPlan[] = subscriptionPlans?.data.data || [];

  // Fetch total active plans count
  useEffect(() => {
    const fetchActivePlansCount = async () => {
      try {
        const response = await fetch(route('subscription-plans.count-active'));
        const data = await response.json();
        setTotalActivePlansCount(data.count || 0);
      } catch (error) {
        console.error('Error fetching active plans count:', error);
        // Fallback to counting current page plans
        const currentPageActiveCount = plansList.filter((plan: SubscriptionPlan) => plan.is_active).length;
        setTotalActivePlansCount(currentPageActiveCount);
      }
    };

    fetchActivePlansCount();
  }, [plansList]);

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
      // @ts-ignore
      router.delete(route('subscription-plans.destroy', plan.uuid), {
        onSuccess: () => {
          setDeletingPlanId(null);
          showToast({
            type: 'success',
            message: t('common.plan_deleted_success'),
            duration: 3000,
          });
          // Refresh the active count
          setTotalActivePlansCount(prev => Math.max(0, prev - 1));
          router.visit(route('subscription-plans.index'), {
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
    const wasActive = plan.is_active;
    
    // @ts-ignore
    router.patch(route('subscription-plans.toggle', plan.uuid), {
      onSuccess: (page: any) => {
        showToast({
          type: 'success',
          message: 'Subscription plan status updated successfully.',
          duration: 3000,
        });
        setTogglingPlanId(null);
        // Update the active count based on the toggle
        setTotalActivePlansCount(prev => wasActive ? Math.max(0, prev - 1) : prev + 1);
      },
      onError: (errors: any) => {
        showToast({
          type: 'error',
          message: errors.message || 'Failed to update subscription plan status.',
          duration: 3000,
        });
        setTogglingPlanId(null);
        // Revert the optimistic update on error
        router.visit(route('subscription-plans.index'), {
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
      router.visit(route('subscription-plans.index'), {
        data: { 
          search: value, 
          page: 1,
          per_page: 6
        },
        preserveState: true,
        preserveScroll: true,
      });
    }, 500);
    setSearchTimeout(timeout);
  };

  const meta = subscriptionPlans?.meta || null;
  const currentPageActiveCount = plansList.filter((plan: SubscriptionPlan) => plan.is_active).length;
  const canCreateNewPlan = totalActivePlansCount < 3;

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
                    router.visit(route('subscription-plans.create'));
                  }}
                  variant="filled"
                  color="primary"
                  className="h-8 gap-2 rounded-md px-3"
                >
                  <HiPlus className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    {t('common.max_active_plans_reached')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Plans Grid */}
          {plansList.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <HiPlus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('common.no_plans_found')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('common.create_first_plan')}
              </p>
              {canCreateNewPlan && (
                <Button
                  onClick={() => {
                    router.visit(route('subscription-plans.create'));
                  }}
                  variant="filled"
                  color="primary"
                  className="gap-2"
                >
                  <HiPlus className="w-4 h-4" />
                  {t('common.create_plan')}
                </Button>
              )}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plansList.map((plan: SubscriptionPlan) => (
                  <SubscriptionPlanCard
                    key={plan.uuid}
                    plan={plan}
                    onEdit={() => {
                      // @ts-ignore
                      router.visit(route('subscription-plans.edit', plan.uuid));
                    }}
                    onDelete={() => handleDeletePlan(plan)}
                    onToggle={handleTogglePlan}
                    isToggling={togglingPlanId === plan.uuid}
                    isDeleting={deletingPlanId === plan.uuid}
                  />
                ))}
              </div>

              {/* Pagination - Show when there are multiple pages */}
              {meta && meta.last_page > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    total={meta.last_page}
                    value={meta.current_page}
                    onChange={(page) => {
                      router.visit(route('subscription-plans.index'), {
                        data: { 
                          page: page, 
                          per_page: 6,
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
    </MainLayout>
  );
}
