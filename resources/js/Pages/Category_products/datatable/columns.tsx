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

interface ColumnsProps {
  setSelectedCategoryProduct: (categoryProduct: CategoryProduct | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

export const createColumns = ({ setSelectedCategoryProduct, setIsModalOpen }: ColumnsProps): ColumnDef<CategoryProduct>[] => [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Category Product",
    cell: CategoryProductNameCell,
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: DescriptionCell,
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Created Date",
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
