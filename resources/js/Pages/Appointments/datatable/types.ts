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
    avatar:string;
    microchip:string;
    species:string;
    gender:string;
    dob:Date;
    wieght:number;
  }
  appointment_type: string;
  appointment_date: Date;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  is_video_conseil: boolean;
  video_provider?: string | null;
  video_auto_record?: boolean;
  video_meeting_id: string;
  video_join_url: string;
  video_start_url?: string | null;
  video_password?: string | null;
  video_recording_status?: string | null;
  video_recording_url?: string | null;
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
