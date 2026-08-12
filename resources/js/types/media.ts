export type MediaItem = {
    id: number;
    filename: string;
    alt: string | null;
    size?: number | null;
    products_count?: number;
    thumb: string;
    url?: string;
};
