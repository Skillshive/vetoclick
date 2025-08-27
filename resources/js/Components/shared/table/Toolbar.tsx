// Import Dependencies
import React from "react";
import { XMarkIcon, MagnifyingGlassIcon, } from "@heroicons/react/20/solid";
import { RiFilter3Line } from "react-icons/ri";
import { BsPlusCircleFill } from 'react-icons/bs';



import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import clsx from "clsx";
import { Input, Button } from "@/components/ui";

interface ToolBoxProps {
    title: string;
    searchQuery?: string;
    Fragment: typeof React.Fragment;
    placeholder?: string;
    sortBy?: string;
    sortOrder?: string;
    hasFilter?: boolean;
    handleFilterChange?: (field: string, order: 'asc' | 'desc') => void;
    handleClearFilters?: () => void;
    handleSearchChange: (query: string) => void;
    handleClearSearch: () => void;
    handleOpenCreateDialog: () => void;
    hasPermission: (permission: string) => boolean;
    permission: string;
}

export default function ToolBar({
    title,
    searchQuery,
    Fragment,
    sortBy,
    placeholder,
    sortOrder,
    hasFilter = false,
    permission,
    handleFilterChange,
    handleClearFilters,
    handleSearchChange,
    handleClearSearch,
    handleOpenCreateDialog,
    hasPermission = () => true,

}: ToolBoxProps) {
    return (
        <div className="flex items-center justify-between py-5 lg:py-6">
            <div className="flex items-center space-x-1">
                <h2 className="dark:text-dark-50 truncate text-xl font-medium text-gray-700 lg:text-2xl">
                    {title}
                </h2>
            </div>
            <div className="flex items-center space-x-1">
                <Input
                    placeholder={placeholder || "Rechercher..."}
                    value={searchQuery ?? ""}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="text-xs-plus h-9"
                    prefix={<MagnifyingGlassIcon className="size-4.5" />}
                    suffix={
                        searchQuery ? (
                            <XMarkIcon
                                className="size-4.5 cursor-pointer"
                                onClick={handleClearSearch}
                                data-tooltip
                                data-tooltip-content="Effacer la recherche"
                            />
                        ) : null
                    }
                />
                {hasFilter && (
                    <Menu as="div" className="relative">
                        <MenuButton
                            as={Button}
                            className="size-9 shrink-0 rounded-full"
                            isIcon
                            variant="flat"
                            data-tooltip
                            data-tooltip-variant="dark"
                            data-tooltip-content={`Filtrer les Types de Documents`}
                        >
                            <RiFilter3Line className="size-5" />
                        </MenuButton>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-gray-200 ring-opacity-5 focus:outline-none dark:bg-dark-700 dark:ring-dark-500">
                                <div className="py-1">
                                    <div className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-200 border-b border-gray-200 dark:border-dark-600">
                                        Trier par
                                    </div>
                                    <MenuItem>
                                        {({ focus }) => (
                                            <button
                                                onClick={() => handleFilterChange?.('name', 'asc')}
                                                className={clsx(
                                                    focus ? 'bg-gray-100 text-gray-900 dark:bg-dark-600 dark:text-dark-100' : 'text-gray-700 dark:text-dark-200',
                                                    'block px-4 py-2 text-sm w-full text-left',
                                                    sortBy === 'name' && sortOrder === 'asc' && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                )}
                                            >
                                                Nom (A-Z)
                                            </button>
                                        )}
                                    </MenuItem>
                                    <MenuItem>
                                        {({ focus }) => (
                                            <button
                                                onClick={() => handleFilterChange?.('name', 'desc')}
                                                className={clsx(
                                                    focus ? 'bg-gray-100 text-gray-900 dark:bg-dark-600 dark:text-dark-100' : 'text-gray-700 dark:text-dark-200',
                                                    'block px-4 py-2 text-sm w-full text-left',
                                                    sortBy === 'name' && sortOrder === 'desc' && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                )}
                                            >
                                                Nom (Z-A)
                                            </button>
                                        )}
                                    </MenuItem>
                                    <MenuItem>
                                        {({ focus }) => (
                                            <button
                                                onClick={() => handleFilterChange?.('created_at', 'desc')}
                                                className={clsx(
                                                    focus ? 'bg-gray-100 text-gray-900 dark:bg-dark-600 dark:text-dark-100' : 'text-gray-700 dark:text-dark-200',
                                                    'block px-4 py-2 text-sm w-full text-left',
                                                    sortBy === 'created_at' && sortOrder === 'desc' && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                )}
                                            >
                                                Plus récent
                                            </button>
                                        )}
                                    </MenuItem>
                                    <MenuItem>
                                        {({ focus }) => (
                                            <button
                                                onClick={() => handleFilterChange?.('created_at', 'asc')}
                                                className={clsx(
                                                    focus ? 'bg-gray-100 text-gray-900 dark:bg-dark-600 dark:text-dark-100' : 'text-gray-700 dark:text-dark-200',
                                                    'block px-4 py-2 text-sm w-full text-left',
                                                    sortBy === 'created_at' && sortOrder === 'asc' && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                )}
                                            >
                                                Plus ancien
                                            </button>
                                        )}
                                    </MenuItem>
                                    {(sortBy || sortOrder) && (
                                        <>
                                            <div className="border-t border-gray-200 dark:border-dark-600"></div>
                                            <MenuItem>
                                                {({ focus }) => (
                                                    <button
                                                        onClick={handleClearFilters}
                                                        className={clsx(
                                                            focus ? 'bg-gray-100 text-gray-900 dark:bg-dark-600 dark:text-dark-100' : 'text-gray-700 dark:text-dark-200',
                                                            'block px-4 py-2 text-sm w-full text-left'
                                                        )}
                                                    >
                                                        Effacer les filtres
                                                    </button>
                                                )}
                                            </MenuItem>
                                        </>
                                    )}
                                </div>
                            </MenuItems>
                        </Transition>
                    </Menu>
                )}
                {hasPermission(permission) && (
                    <Button
                        className="size-9 shrink-0 rounded-full"
                        isIcon
                        variant="flat"
                        onClick={handleOpenCreateDialog}  // Use the new create function
                        color={"primary"}
                        data-tooltip
                        data-tooltip-variant={"info"}
                        data-tooltip-content={`Ajouter`}
                    >
                        <div className="relative size-5">
                            <BsPlusCircleFill
                                className={`absolute inset-0 size-5 transition-all duration-300 rotate-0 scale-100 opacity-100`}
                            />
                        </div>
                    </Button>
                )}
            </div>
        </div>
    )
}
