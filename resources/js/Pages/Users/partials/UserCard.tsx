// Import Dependencies
import { EnvelopeIcon, PencilSquareIcon, PhoneArrowDownLeftIcon, TrashIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { HiShieldCheck } from "react-icons/hi";

// Local Imports
import { Avatar, Button, Card, Badge } from "@/components/ui";
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
      title: t('common.are_you_sure'),
      message: t('common.confirm_delete_user', { name: user.name }),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      confirmVariant: "danger"
    });

    if (confirmed) {
      onDelete();
    }
  };

  const translateRoleName = (roleName: string) => {
    const translationKey = `role_names.${roleName}`;
    const translated = t(translationKey);
    if (translated === translationKey) {
      return roleName.charAt(0).toUpperCase() + roleName.slice(1);
    }
    return translated;
  };
  
  return (
    <Card className="flex grow flex-col items-center p-4 text-center sm:p-5 hover:shadow-lg hover:scale-105 transition-all duration-300 min-h-[200px]">
      <Avatar
        size={18}
        src={user.image ? getImageUrl(user.image, "/assets/default/person-placeholder.jpg") : "/assets/default/person-placeholder.jpg"}
        name={user.name}
        classNames={{ display: "text-xl" }}
        initialColor="auto"
      />

      <div className="my-2 grow w-full">
        <h3 className="dark:text-dark-100 text-base font-medium text-gray-800 mb-3">
          {user.name}
        </h3>
        
        <div className="space-y-2 w-full">
          {user.phone && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <PhoneArrowDownLeftIcon className="w-4 h-4 text-[#4DB9AD] flex-shrink-0" />
              <span className="truncate min-w-0">{user.phone}</span>
            </div>
          )}
         
          {user.email && (
            <div className="flex items-start justify-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <EnvelopeIcon className="w-4 h-4 text-[#4DB9AD] flex-shrink-0 mt-0.5" />
              <span 
                className="break-all text-center leading-tight"
                title={user.email}
              >
                {user.email}
              </span>
            </div>
          )}

          {user.roles && user.roles.length > 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <HiShieldCheck className="w-4 h-4 text-[#4DB9AD] flex-shrink-0" />
              <Badge
                color="primary"
                variant="soft"
                className="text-xs"
              >
                {translateRoleName(user.roles[0].name)}
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex justify-center space-x-1">
        <Button
          className="size-7 rounded-full"
          isIcon
          onClick={onEdit}
          aria-label={t('common.edit_user')}
        >
          <PencilSquareIcon className="size-4 stroke-2 text-[#4DB9AD]" />
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
