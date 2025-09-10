// Types
export interface User {
  uuid: string;
  name: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  image?: string;
  created_at: string;
}
export interface UserFormData {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  image?: File | null;
  created_at: string;
}

export interface UserData {
  data: User[];
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

export interface UsersProps {
  users?: UserData;
}