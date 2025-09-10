// Import Dependencies
import { EnvelopeIcon, PencilSquareIcon, PhoneArrowDownLeftIcon, TrashIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Avatar, Button, Card } from "@/components/ui";
import { useTranslation } from "@/hooks/useTranslation";
import { getImageUrl } from "@/utils/imageHelper";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import { User } from "../types";

export function UserCard({
  user,
  onEdit,
  onDelete
}:{   user: User;
  onEdit: () => void;
  onDelete: () => void; }) {
  const { t } = useTranslation();
  const confirmContext = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirmContext.confirm({
      title: t('common.confirm_delete'),
      message: t('common.confirm_delete_user', { name: user.name }),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      confirmVariant: "danger"
    });

    if (confirmed) {
      onDelete();
    }
  };
  
  return (
    <Card className="flex grow flex-col items-center p-4 text-center sm:p-5 hover:shadow-lg hover:scale-105 transition-all duration-300">
      <Avatar
        size={18}
        src={user.image ? getImageUrl(user.image, "/assets/default/person-placeholder.jpg") : "/assets/default/person-placeholder.jpg"}
        name={user.name}
        classNames={{ display: "text-xl" }}
        initialColor="auto"
      />

      <div className="my-2 grow">
        <h3 className="dark:text-dark-100 text-base font-medium text-gray-800">
          {user.name}
        </h3>
   <div className="space-y-2">
            {user.phone !== null && user.phone !== undefined && (
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <PhoneArrowDownLeftIcon className="w-4 h-4 text-blue-500" />
                <span>{t('common.phone')}: {user.phone}</span>
              </div>
            )}
         
            {user.email !== null && user.email !== undefined && (
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <EnvelopeIcon className="w-4 h-4 text-blue-500" />
                <span>{t('common.email')}: {user.email}</span>
              </div>
            )}
         
          </div>      </div>
      <div className="mt-3 flex justify-center space-x-1">
        <Button
          className="size-7 rounded-full"
          isIcon
                       onClick={onEdit}
          aria-label={t('common.edit_breed')}
        >
          <PencilSquareIcon className="size-4 stroke-2  text-green-500" />
        </Button>
        <Button
          className="size-7 rounded-full"
          isIcon
          onClick={handleDelete}
          aria-label={t('common.delete_user')}
        >
          <TrashIcon className="size-4 stroke-2 text-red-500" />
        </Button>
      
      </div>
    </Card>
  );
}
