import { useState } from "react";
import clsx from "clsx";
import {
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { Button } from "@/components/ui";
import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { Species } from "./types";
import { getImageUrl } from "@/utils/imageHelper";

interface CellProps {
  getValue: () => any;
  row?: any;
}

interface ActionsCellProps {
  row: any;
  table: any;
  setSelectedSpecies: (species: Species | null) => void;
  setIsModalOpen: (open: boolean) => void;
}

export function SpeciesNameCell({ getValue, row }: CellProps) {
  const speciesName = getValue();
  const species = row?.original as Species;
  const imagePath = species?.image || null;

  const imageUrl = getImageUrl(imagePath, "/assets/default/species-placeholder.png");

  console.log("Final imageUrl:", imageUrl);
  return (
    <div className="flex max-w-xs items-center space-x-4 rtl:space-x-reverse 2xl:max-w-sm">
      <div className="avatar relative inline-flex shrink-0" style={{ height: "2.25rem", width: "2.25rem" }}>
       <img
        src={imageUrl}
        loading="lazy"
        alt="Species"
        className="avatar-image avatar-display relative h-full w-full before:absolute before:inset-0 before:rounded-[inherit] before:bg-gray-150 dark:before:bg-dark-600 mask is-squircle rounded-none text-sm"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/assets/default/species-placeholder.png";
        }}
      />
      </div>
      <div className="min-w-0">
        <p className="truncate">
          <a
            href="##"
            className="hover:text-primary-600 dark:hover:text-primary-400  transition-colors font-medium text-gray-800 dark:text-dark-100"
          >
            {speciesName}
          </a>
        </p>
      </div>
    </div>
  );
}

export function DescriptionCell({ getValue }: CellProps) {
  const { t } = useTranslation();
  const description = getValue();
  return (
    <div className="max-w-xs">
      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
        {description || t('common.no_description')}
      </p>
    </div>
  );
}

export function CreatedAtCell({ getValue }: CellProps) {
  const { locale } = useTranslation();
  const createdAt = getValue();
  
  // Use appropriate locale for date formatting
  const dateLocale = locale === 'ar' ? 'ar-SA' : locale === 'fr' ? 'fr-FR' : 'en-US';
  
  const formattedDate = new Date(createdAt).toLocaleDateString(dateLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      {formattedDate}
    </div>
  );
}

export function ActionsCell({ row, table, setSelectedSpecies, setIsModalOpen }: ActionsCellProps) {
  const { t } = useTranslation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const confirmMessages: ConfirmMessages = {
    pending: {
      description: t('common.confirm_delete_species'),
    },
    success: {
      title: t('common.species_deleted'),
      description: t('common.species_deleted_success'),
    },
  };

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const openModal = () => {
    setDeleteModalOpen(true);
    setDeleteError(false);
    setDeleteSuccess(false);
  };

  const handleDeleteRow = () => {
    setConfirmDeleteLoading(true);
    setTimeout(() => {
      table.options.meta?.deleteRow?.(row);
      setDeleteSuccess(true);
      setConfirmDeleteLoading(false);
    }, 1000);
  };

  const state = deleteError ? "error" : deleteSuccess ? "success" : "pending";

  return (
    <>
      <div className="flex justify-center">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton
            as={Button}
            variant="flat"
            isIcon
            className="size-7 rounded-full"
          >
            <EllipsisHorizontalIcon className="size-4.5" />
          </MenuButton>
          <Transition
            as={MenuItems}
            enter="transition ease-out"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-2"
            className="dark:border-dark-500 dark:bg-dark-750 absolute z-100 mt-1.5 min-w-[10rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none"
          >
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={() => {
                    setSelectedSpecies(row.original);
                    setIsModalOpen(true);
                  }}
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 rtl:space-x-reverse px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <EyeIcon className="size-4.5 stroke-1" />
                  <span>{t('common.view')}</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={() => {
                    setSelectedSpecies(row.original);
                    setIsModalOpen(true);
                  }}
                  className={clsx(
                    "flex h-9 w-full items-center space-x-3 rtl:space-x-reverse px-3 tracking-wide outline-hidden transition-colors",
                    focus &&
                      "dark:bg-dark-600 dark:text-dark-100 bg-gray-100 text-gray-800",
                  )}
                >
                  <PencilIcon className="size-4.5 stroke-1" />
                  <span>{t('common.edit')}</span>
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={openModal}
                  className={clsx(
                    "this:error text-this dark:text-this-light flex h-9 w-full items-center space-x-3 rtl:space-x-reverse px-3 tracking-wide outline-hidden transition-colors",
                    focus && "bg-this/10 dark:bg-this-light/10",
                  )}
                >
                  <TrashIcon className="size-4.5 stroke-1" />
                  <span>{t('common.delete')}</span>
                </button>
              )}
            </MenuItem>
          </Transition>
        </Menu>
      </div>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={closeModal}
        messages={confirmMessages}
        onOk={handleDeleteRow}
        confirmLoading={confirmDeleteLoading}
        state={state}
      />
    </>
  );
}