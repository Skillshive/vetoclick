export interface CategoryBlog {
    uuid: string;
    name: string;
    desp?: string;
    parent_category?: string;
    parent_category_id?: string;
    created_at: string;
    updated_at: string;
}

export interface CategoryBlogDatatableProps {
  categoryBlogs: {
    data: CategoryBlog[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
  };
  parentCategories?: CategoryBlog[];
  filters: {
    search?: string;
    per_page?: number;
    sort_by?: string;
    sort_direction?: string;
  };
  old?: any;
  errors?: any;
}

export interface TableSettings {
  enableFullScreen: boolean;
  enableRowDense: boolean;
  enableSorting?: boolean;
  enableColumnFilters?: boolean;
}

export interface CategoryBlogManagementPageProps {
  categoryBlogs: {
    data: {
      data: CategoryBlog[];
    };
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    };
    links: any;
  };
  parentCategories?: CategoryBlog[];
  filters: {
    search?: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
  };
  old?: any;
  errors?: any;
}