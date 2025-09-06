import { Column } from "@tanstack/react-table";
import { CategoryProduct } from "@/types/CategoryProducts";
import { FacedtedFilter } from "@/components/shared/table/FacedtedFilter";
import { router } from "@inertiajs/react";
import { useTranslation } from "@/hooks/useTranslation";

export function ParentCategoryFilter({
  column,
  options,
}: {
  column: Column<CategoryProduct>;
  options: CategoryProduct[];
}) {
    const filterOptions = options.map((cat) => ({
    label: cat.name,
    value: cat.uuid,
  }));

  const {t} = useTranslation();
  const handleFilterChange = (selectedValues: string[]) => {
    column.setFilterValue(selectedValues);

    router.get(
      route('category-products.index'),
      {
        search: new URLSearchParams(window.location.search).get('search') || '',
        per_page: new URLSearchParams(window.location.search).get('per_page') || '15',
        sort_by: new URLSearchParams(window.location.search).get('sort_by') || 'created_at',
        sort_direction: new URLSearchParams(window.location.search).get('sort_direction') || 'desc',
        parent_category: selectedValues.length ? selectedValues[0] : null,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
  };

  // Add "All" option (handled by clearing filter)
  return (
    <FacedtedFilter
      column={column}
      title={t('common.filter_by_parent_category')}
      options={filterOptions}
      labelField="label"
      valueField="value"
      showCheckbox={false}
      onFilterChange={handleFilterChange}
    />
  );
}