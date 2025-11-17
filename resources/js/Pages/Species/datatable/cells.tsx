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
import { Badge, Button } from "@/components/ui";
import {
  ConfirmModal,
  type ConfirmMessages,
} from "@/components/shared/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { Species } from "./types";
import { getImageUrl } from "@/utils/imageHelper";
import { router } from "@inertiajs/react";

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
        {description ? (
          description
        ) : (
          <Badge color="neutral">
            {t('common.no_description')}
          </Badge>
        )}
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

  const handleEditClick = () => {
  router.visit(route('species.edit', row.original.uuid), {
    preserveState: true,
    preserveScroll: true, 
  });
};

  return (
    <>
    <div className="flex justify-center items-center gap-2"> 
            <Button 
              component="a"
              onClick={()=>{
                handleEditClick()
              }}
              type="button"
              variant="flat"
              color="info"
              isIcon
              className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md"
              title={t('common.edit')}
            >
              <PencilIcon className="size-4 stroke-1.5" />
            </Button>
    
            <Button
              type="button"
              variant="flat"
              color="error"
              isIcon
              className="size-8 rounded-sm hover:scale-105 transition-all duration-200 hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/20"
              title={t('common.delete')}
              onClick={openModal}
            >
              <TrashIcon className="size-4 stroke-1.5" />
            </Button>
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