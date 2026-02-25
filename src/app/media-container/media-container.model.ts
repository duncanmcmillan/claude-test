/** A single media item (image, video, or audio) from an AI API result. */
export interface MediaItem {
  url: string;
  content_type: string;
  width?: number;
  height?: number;
}

/** Shape of the data payload returned by FAL image models (e.g. fal-ai/flux/dev). */
export interface FalImageResult {
  images?: MediaItem[];
  prompt?: string;
  seed?: number;
  has_nsfw_concepts?: boolean[];
  timings?: Record<string, number>;
}
