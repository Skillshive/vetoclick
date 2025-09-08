import { Column } from "@tanstack/react-table";
import { CategoryBlog } from "./types";
import { FacedtedFilter } from "@/components/shared/table/FacedtedFilter";
import { router } from "@inertiajs/react";
import { useTranslation } from "@/hooks/useTranslation";

export function ParentCategoryFilter({
  column,
  options,
}: {
  column: Column<CategoryBlog>;
  options?: CategoryBlog[];
}) {
    const filterOptions = (options || []).map((cat) => ({
    label: cat.name,
    value: cat.uuid,
  }));

  const {t} = useTranslation();
  const handleFilterChange = (selectedValues: string[]) => {
    console.log("selectedValues", selectedValues);
    column.setFilterValue(selectedValues);

    router.visit(route('category-blogs.index', {
      search: new URLSearchParams(window.location.search).get('search') || '',
      per_page: new URLSearchParams(window.location.search).get('per_page') || '15',
      sort_by: new URLSearchParams(window.location.search).get('sort_by') || 'created_at',
      sort_direction: new URLSearchParams(window.location.search).get('sort_direction') || 'desc',
      parent_category: selectedValues.length ? selectedValues : null,
    }), {
      preserveScroll: false,
      preserveState: false,
      replace: true
    });
  };

  // Add "All" option (handled by clearing filter)
  return (
    <FacedtedFilter
      column={column}
      title={t('common.filter_by_parent_category')}
      options={filterOptions}
      labelField="label"
      valueField="value"
      showCheckbox={true}
      onFilterChange={handleFilterChange}
    />
  );
}