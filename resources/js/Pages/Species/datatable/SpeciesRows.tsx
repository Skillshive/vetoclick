import { CellContext } from "@tanstack/react-table";
import { Fragment } from "react";

// Local Imports
import { Species } from "@/types/Species";
import { Button } from "@/components/ui";
import { Eye, SquarePen, Trash } from "lucide-react";
// Import Dependencies


export function SpeciesNameCell({ getValue, row, table }: CellContext<Species, unknown>) {
    const name = getValue() as string;
    const { copyToClipboard } = table.options.meta || {};

    return (
        <div className="flex items-center space-x-3">
            <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                    {name}
                </div>
            </div>
        </div>
    );
}

export function DescriptionCell({ getValue }: CellContext<Species, unknown>) {
    const description = getValue() as string;

    return (
        <div className="max-w-xs truncate text-gray-900 dark:text-gray-100">
            {description || 'Aucune description'}
        </div>
    );
}

export function CreatedAtCell({ getValue }: CellContext<Species, unknown>) {
    const createdAt = getValue() as string;
    const date = new Date(createdAt);
    
    return (
        <div className="text-gray-900 dark:text-gray-100">
            {date.toLocaleDateString('fr-FR')}
        </div>
    );
}

export function ActionsCell({ row, table }: CellContext<Species, unknown>) {
    const species = row.original;
    const handleEdit = () => {
        table?.options.meta?.onEdit?.(row);
    };

    const handleDelete = () => {
        table?.options.meta?.onDelete?.(row);
    };

    return (
        <div className="flex items-center space-x-2">
            <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
            >
                <SquarePen className="h-4 w-4" />
            </Button>
            
            <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
                <Trash className="h-4 w-4" />
            </Button>
        </div>
    );
}
