import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
  CategoryProductNameCell,
  DescriptionCell,
  CreatedAtCell,
  ActionsCell
} from "./cells";
import { CategoryProduct } from "@/types/CategoryProducts";
import { useTranslation } from "@/hooks/useTranslation";

interface ColumnsProps {
  setSelectedCategoryProduct: (categoryProduct: CategoryProduct | null) => void;
  setIsModalOpen: (open: boolean) => void;
  t: (key: string) => string;
}

export const createColumns = ({ setSelectedCategoryProduct, setIsModalOpen, t }: ColumnsProps): ColumnDef<CategoryProduct>[] => [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  },
  {
    id: "name",
    accessorKey: "name",
    header: t('common.category_product_name'),
    cell: CategoryProductNameCell,
  },
  {
    id: "description",
    accessorKey: "description",
    header: t('common.description'),
    cell: DescriptionCell,
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
        setSelectedCategoryProduct={setSelectedCategoryProduct}
        setIsModalOpen={setIsModalOpen}
      />
    ),
  },
];
