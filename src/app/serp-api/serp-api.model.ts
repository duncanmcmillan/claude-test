export interface SerpApiRequestParams {
  engine?: string;
  q: string;
  location?: string;
  hl?: string;
  gl?: string;
  num?: number;
  [key: string]: unknown;
}

export interface SerpApiSearchMetadata {
  id: string;
  status: 'Processing' | 'Success' | 'Error';
  created_at: string;
  processed_at?: string;
  total_time_taken?: number;
  google_url?: string;
}

export interface SerpApiOrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  displayed_link?: string;
  thumbnail?: string;
  date?: string;
}

export interface SerpApiSearchResponse {
  search_metadata: SerpApiSearchMetadata;
  organic_results: SerpApiOrganicResult[];
  [key: string]: unknown;
}

export interface SerpApiSearchRef {
  searchId: string;
  results?: SerpApiSearchResponse;
}

export interface SerpApiStatusResponse {
  searchId: string;
  status: SerpApiSearchMetadata['status'];
}

export interface SerpApiServiceError {
  message: string;
  searchId?: string;
}
