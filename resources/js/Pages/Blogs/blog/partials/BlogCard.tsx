import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { router } from "@inertiajs/react";
import { Highlight } from "@/components/shared/Highlight";
import { Card } from "@/components/ui";
import { Blog } from "../types";
import { useToast } from "@/Components/common/Toast/ToastContext";
import { useConfirm } from "@/Components/common/Confirm/ConfirmContext";
import { useTranslation } from "@/hooks/useTranslation";
import { MdCategory } from "react-icons/md";
import { getImageUrl } from "@/utils/imageHelper";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface BlogCardProps {
  blog: Blog;
  onDelete?: (blog: Blog) => void;
}

export function BlogCard({
  blog,
  onDelete
}: BlogCardProps) {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { t } = useTranslation();

  const handleEdit = () => {
    router.visit(route('blogs.edit', blog.uuid) as string);
  };

  const handleDelete = async () => {
    // Use the confirmation context for a professional dialog
    const confirmed = await confirm({
      title: t('common.confirm_delete_blog'),
      message: `"${blog.title}"\n\n${t('common.this_action_cannot_be_undone')}`,
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      confirmVariant: 'danger',
    });
    
    if (confirmed) {
      if (onDelete) {
        onDelete(blog);
      } else {
        router.delete(route('blogs.destroy', blog.uuid) as string, {
          onSuccess: () => {
            showToast({
              type: 'success',
              message: t('common.blog_deleted_success'),
              duration: 3000,
            });
          },
          onError: () => {
            showToast({
              type: 'error',
              message: t('common.blog_delete_error'),
              duration: 3000,
            });
          }
        });
      }
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (!target.src.includes('data:image/svg+xml')) {
      // target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
    target.src = "/assets/1.png";
    }
  };

  const imageUrl = getImageUrl(blog.image?.path || null, "/images/1.png");

  const formatDate = (dateString: string) => {
    const date = dayjs(dateString);
    const now = dayjs();
    const diffInDays = now.diff(date, 'day');
    
    if (diffInDays === 0) {
      return t('common.today');
    } else if (diffInDays === 1) {
      return t('common.yesterday');
    } else if (diffInDays < 7) {
      return date.fromNow();
    } else {
      return date.format('MMM DD, YYYY');
    }
  };

  return (
    <Card data-post-id={blog.uuid} className="flex grow flex-col relative group overflow-hidden">
      <img
        className="h-72 w-full rounded-lg object-cover object-center transition-transform duration-300 group-hover:scale-105"
        src={imageUrl}
        alt={blog.title}
        // onError={handleImageError}
      />
      <div className="absolute inset-0 flex h-full w-full flex-col justify-end">
        <div className="rounded-lg bg-linear-to-t from-[#19213299] via-[#19213266] to-transparent px-4 pt-12 pb-3">
          <div className="line-clamp-2">
            <a
              href={route('blogs.show', blog.uuid) as string}
              className="text-base font-medium text-white hover:text-white/80"
            >
              <Highlight query="">{blog.title}</Highlight>
            </a>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center text-xs text-white/80">
              <div className="flex min-w-0 items-center gap-1">
                <MdCategory className="size-3.5 shrink-0" />
                 <span className="truncate">
                   <Highlight query="">{blog.category_blog?.name || t('common.no_category')}</Highlight>
                 </span>
              </div>
              <div className="mx-3 my-0.5 w-px self-stretch bg-white/20"></div>
              <p className="text-tiny-plus shrink-0">{formatDate(blog.created_at)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out transform translate-y-[-8px] group-hover:translate-y-0">
        <div className="flex flex-col gap-2">
          <button
            data-tooltip
            data-tooltip-content={t('common.edit')}
            onClick={handleEdit}
            className="size-10 rounded-full bg-white/95 hover:bg-white shadow-lg hover:shadow-xl border border-gray-200 hover:border-this transition-all duration-200 backdrop-blur-sm flex items-center justify-center group/btn"
          >
            <PencilIcon className="size-4 stroke-2 text-gray-700 group-hover/btn:text-this transition-colors duration-200" />
          </button>
          <button
            data-tooltip
            data-tooltip-content={t('common.delete')}
            onClick={handleDelete}
            className="size-10 rounded-full bg-red-500/95 hover:bg-red-600 shadow-lg hover:shadow-xl border border-red-400 hover:border-red-700 transition-all duration-200 backdrop-blur-sm flex items-center justify-center group/btn"
          >
            <TrashIcon className="size-4 stroke-2 text-white group-hover/btn:text-red-100 transition-colors duration-200" />
          </button>
        </div>
      </div>
    </Card>
  );
}
