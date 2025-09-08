import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
  NameCell,
  DescriptionCell,
  CreatedAtCell,
  ActionsCell,
  CategoryCell
} from "./cells";
import { CategoryBlog } from "./types";

interface ColumnsProps {
  setSelectedCategoryBlog: (categoryBlog: CategoryBlog | null) => void;
  setIsModalOpen: (open: boolean) => void;
  onDeleteRow?: (row: any) => void;
  t: (key: string) => string;
}

export const createColumns = ({ setSelectedCategoryBlog, setIsModalOpen, onDeleteRow, t }: ColumnsProps): ColumnDef<CategoryBlog>[] => [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  },
  {
    id: "name",
    accessorKey: "name",
    header: t('common.category_blog_name'),
    cell: NameCell,
  },
  {
    id: "description",
    accessorKey: "desp",
    header: t('common.description'),
    cell: DescriptionCell,
  },
  {
    id: "parentCategory",
    accessorKey: "parent_category",
    header: t('common.parentCategory'),
    cell: CategoryCell,
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue || filterValue.length === 0) return true;
      const parentId = row.original.parent_category_id;
      return filterValue.includes(parentId);
    }
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: t('common.created_date'),
    cell: CreatedAtCell,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => (
      <ActionsCell
        row={row}
        table={table}
        setSelectedCategoryBlog={setSelectedCategoryBlog}
        setIsModalOpen={setIsModalOpen}
        onDeleteRow={onDeleteRow}
      />
    ),
  },
];
