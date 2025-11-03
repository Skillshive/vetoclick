export interface Appointment {
  uuid: string;
  client :{
    uuid:string;
    first_name: string;
    last_name: string;
    avatar:string
  };
  pet :{
    uuid:string;
    name: string;
    breed: string;
    avatar:string
  }
  appointment_type: string;
  appointment_date: Date;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  is_video_conseil: boolean;
  video_meeting_id: string;
  video_join_url: string;
  reason_for_visit: string;
  appointment_notes: string;
  created_at: string;
}

export interface Vet {
    id: number;
    first_name: string;
    last_name: string;
}

export interface Client {
    id: number;
    first_name: string;
    last_name: string;
}

export interface AppointmentPageProps {
  appointments: {
    data: Appointment[];
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
  };
  filters: {
    search: string;
    per_page: number;
    sort_by: string;
    sort_direction: string;
    page?: number;
    status?: string[];
    vet?: string[];
    client?: string[];
  };
  vets: Vet[];
  clients: Client[];
  statuses: { [key: number]: string };
  old?: any;
  errors?: any;
}
