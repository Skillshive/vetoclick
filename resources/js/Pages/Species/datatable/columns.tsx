import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
  SpeciesNameCell,
  DescriptionCell,
  CreatedAtCell,
  ActionsCell
} from "./cells";
import { Species } from "./types";

interface ColumnsProps {
  setSelectedSpecies: (species: Species | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

export const createColumns = ({ setSelectedSpecies, setIsModalOpen }: ColumnsProps): ColumnDef<Species>[] => {
  return [
    {
      id: "select",
      header: SelectHeader,
      cell: SelectCell,
      enableHiding: false,
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Species Name",
      cell: ({ getValue, row }) => <SpeciesNameCell getValue={getValue} row={row} />,
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
          setSelectedSpecies={setSelectedSpecies}
          setIsModalOpen={setIsModalOpen}
        />
      ),
      enableHiding: false,
    },
  ];
};