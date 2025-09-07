import MainLayout from '@/layouts/MainLayout';
import CategoryBlogDatatable from './datatable';
import { CategoryBlogManagementPageProps } from "./datatable/types";
import { Page } from '@/components/shared/Page';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index({categoryBlogs, parentCategories, filters}: CategoryBlogManagementPageProps) {
    const { t } = useTranslation();
console.log("categoryBlogs",categoryBlogs);

    return <MainLayout>
          <Page title={t('common.category_blogs')}>
            <CategoryBlogDatatable
              categoryBlogs={categoryBlogs.data}
              parentCategories={parentCategories}
              filters={{
                ...filters,
                per_page: filters.per_page || 10,
                sort_by: filters.sort_by || 'name',
                sort_direction: filters.sort_direction || 'asc'
              }}
            />
          </Page>
        </MainLayout>
}