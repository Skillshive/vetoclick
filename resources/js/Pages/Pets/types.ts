// Types
export interface Breed {
  uuid: string;
  name: string;
}

export interface Client {
  uuid: string;
  first_name: string;
  last_name: string;
}

export interface Pet {
  uuid: string;
  name: string;
  profile_img?: string | null;
  breed?: Breed | null;
  client?: Client | null;
  sex: number;
  dob?: string | null;
  color?: string | null;
  weight_kg?: number | null;
  created_at: string;
}

export interface PetData {
  data: Pet[];
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

export interface PetsProps {
  pets?: PetData;
  filters?: {
    search?: string;
    client_id?: string;
    species_id?: string;
  };
}

