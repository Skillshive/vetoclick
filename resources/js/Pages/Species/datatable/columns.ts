import { ColumnDef} from "@tanstack/react-table";

// Local Imports
import { Species } from "@/types/Species";
import {
    SelectCell,
    SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import {
    SpeciesNameCell,
    DescriptionCell,
    CreatedAtCell,
    ActionsCell,
} from "./SpeciesRows";
import { useRoleBasedMenu } from "@/hooks/useRoleBasedMenu";



export const useSpeciesColumns = (): ColumnDef<Species>[] => {

    return [
        {
            id: "select",
            header: SelectHeader,
            cell: SelectCell,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            label: "Nom",
            header: "Nom",
            cell: SpeciesNameCell,
            enableSorting: true,
        },
        {
            accessorKey: "description",
            label: "Description",
            header: "Description",
            cell: DescriptionCell,
            enableSorting: false,
        },
        {
            accessorKey: "created_at",
            label: "Date de création",
            header: "Date de création",
            cell: CreatedAtCell,
            enableSorting: true,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ActionsCell,
            enableSorting: false,
            enableHiding: false,
        },
    ];
};
