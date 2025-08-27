export interface Filters {
    search?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
}