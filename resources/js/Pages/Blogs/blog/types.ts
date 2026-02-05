// Types
export interface CategoryBlog {
  uuid: string;
  name: string;
  desp?: string;
  created_at: string;
}

export interface Blog {
  uuid: string;
  title: string;
  body: string;
  caption: string;
  image: {
    id: number;
    path: string;
    url?: string;
  } | null;
  meta_title: string;
  meta_desc: string;
  meta_keywords: string;
  category_blog?: CategoryBlog;
  tags: string;
  created_at: string;
  is_published?: boolean;
  is_featured?: boolean;
  publish_date?: string;
  reading_time?: number;
  author_id?: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
}
export interface BlogFormData {
  title: string;
  body: string;
  caption: string;
  meta_title: string;
  meta_desc: string;
  meta_keywords: string;
  category_blog_id: string;
  tags: string;
}

export interface BlogData {
  data: Blog[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface BlogsProps {
  blogs?: BlogData;
  category_blogs?: CategoryBlog[];
  filters?: {
    search?: string;
  };
}