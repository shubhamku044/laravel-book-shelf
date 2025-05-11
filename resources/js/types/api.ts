export interface Book {
    id: number;
    title: string;
    author: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    sort_by: string;
    sort_order: string;
    query?: string;
}
