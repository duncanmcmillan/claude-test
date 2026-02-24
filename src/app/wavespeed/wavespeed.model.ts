export interface WavespeedRequestInput {
  model: string;
  input: Record<string, unknown>;
}

export interface WavespeedPredictionRef {
  predictionId: string;
}

export type WavespeedPredictionStatus = 'created' | 'processing' | 'completed' | 'failed';

export interface WavespeedStatusResponse {
  id: string;
  status: WavespeedPredictionStatus;
  outputs?: string[];
}

export interface WavespeedResult {
  predictionId: string;
  outputs: string[];
}

export interface WavespeedApiResponse {
  code: number;
  message: string;
  data: {
    id: string;
    status: WavespeedPredictionStatus;
    outputs?: string[];
    error?: string;
  };
}

export interface WavespeedServiceError {
  message: string;
  predictionId?: string;
  code?: number;
}
