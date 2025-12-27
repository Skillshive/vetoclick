import { Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

interface FinancialOverviewProps {
  financialStats: {
    totalRevenue: number;
    pendingRevenue: number;
    averageOrderValue: number;
    monthlyRevenue: Array<{ month: string; total: number }>;
    revenueByStatus: Array<{ status: string; total: number }>;
  };
}

export function FinancialOverview({ financialStats }: FinancialOverviewProps) {
  const { t } = useTranslation();

  const currencyLabel = t("common.currency") || "MAD";
  const monthlyRevenue = financialStats.monthlyRevenue || [];
  const revenueByStatus = financialStats.revenueByStatus || [];

  const maxMonthlyTotal =
    monthlyRevenue.length > 0
      ? Math.max(...monthlyRevenue.map((item) => item.total))
      : 1;
  const maxStatusTotal =
    revenueByStatus.length > 0
      ? Math.max(...revenueByStatus.map((item) => item.total))
      : 1;

  const formatCurrency = (value: number) =>
    `${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currencyLabel}`;

  const formatMonth = (month: string) => {
    const [year, monthPart] = month.split("-");
    const date = new Date(Number(year), Number(monthPart) - 1, 1);
    return date.toLocaleDateString(undefined, { month: "short" });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
            {t("common.financial_overview") || "Financial Overview"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("common.revenue_summary") || "Revenue Summary"}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-dark-600 dark:bg-dark-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("common.total_revenue") || "Total Revenue"}
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-dark-50">
              {formatCurrency(financialStats.totalRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 p-4 dark:border-dark-600 dark:bg-dark-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("common.pending_revenue") || "Pending Amount"}
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-dark-50">
              {formatCurrency(financialStats.pendingRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 p-4 dark:border-dark-600 dark:bg-dark-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("common.average_order_value") || "Avg. Order Value"}
            </p>
            <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-dark-50">
              {formatCurrency(financialStats.averageOrderValue)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-800 dark:text-dark-100">
              {t("common.monthly_revenue") || "Monthly Revenue"}
            </h4>
          </div>

          {monthlyRevenue.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("common.no_financial_data") || "No financial data yet"}
            </p>
          ) : (
            <div className="flex h-48 items-end gap-4">
              {monthlyRevenue.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-md bg-primary-500/80 dark:bg-primary-400"
                      style={{
                        height: `${(item.total / maxMonthlyTotal) * 100}%`,
                        minHeight: "4px",
                      }}
                      aria-label={`${formatMonth(item.month)} revenue`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatMonth(item.month)}
                  </span>
                  <span className="text-[11px] text-gray-600 dark:text-gray-300">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-medium text-gray-800 dark:text-dark-100">
            {t("common.revenue_by_status") || "Revenue by Status"}
          </h3>
        </div>

        {revenueByStatus.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {t("common.no_financial_data") || "No financial data yet"}
          </p>
        ) : (
          <div className="space-y-4">
            {revenueByStatus.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between text-sm font-medium text-gray-800 dark:text-dark-100">
                  <span className="capitalize">{item.status}</span>
                  <span className="text-gray-600 dark:text-gray-300">{formatCurrency(item.total)}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100 dark:bg-dark-700">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${(item.total / maxStatusTotal) * 100}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

