// Import Dependencies
import { ArrowUpIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Card, Select } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";

// ----------------------------------------------------------------------

interface Pack {
  name: string;
  quantity: number;
}

interface TopSoldPacksProps {
  packs: Pack[];
}

export function TopSoldPacks({ packs }: TopSoldPacksProps) {
  const { t } = useTranslation();

  // Demo fallback data
  const demoPacks: Pack[] = [
    { name: "Puppy Vaccine Pack", quantity: 120 },
    { name: "Adult Dog Checkup Pack", quantity: 95 },
    { name: "Cat Vaccination Pack", quantity: 80 },
    { name: "Deworming Pack", quantity: 65 },
    { name: "Senior Pet Wellness Pack", quantity: 40 },
  ];

  const packsToShow = packs.length > 0 ? packs : demoPacks;
  const totalQuantity = packsToShow.reduce((sum, item) => sum + item.quantity, 0);

  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  return (
    <Card className="px-4 pb-4">
      <div className="flex min-w-0 items-center justify-between gap-3 py-3">
        <h2 className="dark:text-dark-100 truncate font-medium tracking-wide text-gray-800">
          {t("common.top_sold_packs") || "Top Sold Packs"}
        </h2>
        <Select className="h-8 text-xs">
          <option value="current_year">{t("common.current_year") || "Current Year"}</option>
          <option value="last_year">{t("common.last_year") || "Last Year"}</option>
        </Select>
      </div>
      <p>
        <span className="dark:text-dark-100 text-3xl font-medium text-gray-800">
          {formatNumber(totalQuantity)}
        </span>{" "}
        <span className="text-success dark:text-success-lighter text-xs">
          {packsToShow.length} {t("common.packs") || "packs"}
        </span>
      </p>
      <p className="text-xs-plus dark:text-dark-300 mt-0.5 text-gray-400">
        {t("common.total_sold") || "Total Sold"}
      </p>
      <div className="mt-4 flex justify-between">
        <p className="dark:text-dark-300 text-xs text-gray-400 uppercase">
          {t("common.pack") || "Pack"}
        </p>
        <p className="dark:text-dark-300 text-xs text-gray-400 uppercase">
          {t("common.quantity") || "Quantity"}
        </p>
      </div>
      <div className="mt-2 space-y-2.5">
        {packsToShow.map((item) => (
          <div key={item.name} className="flex min-w-0 justify-between gap-4">
            <span className="truncate hover:opacity-80">{item.name}</span>
            <div className="flex items-center gap-1.5">
              <p className="text-sm-plus dark:text-dark-100 text-gray-800">
                {formatNumber(item.quantity)}
              </p>
              <ArrowUpIcon className="this:success text-this dark:text-this-lighter size-3 stroke-2" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}









