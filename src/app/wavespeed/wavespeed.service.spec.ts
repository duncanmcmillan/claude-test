import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WavespeedService } from './wavespeed.service';
import type { WavespeedApiResponse, WavespeedRequestInput } from './wavespeed.model';

const BASE = 'https://api.wavespeed.ai/api/v3';

const makeApiResponse = (overrides: Partial<WavespeedApiResponse['data']> = {}): WavespeedApiResponse => ({
  code: 200,
  message: 'ok',
  data: {
    id: 'pred-abc',
    status: 'created',
    ...overrides,
  },
});

describe('WavespeedService', () => {
  let service: WavespeedService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), WavespeedService],
    });
    service = TestBed.inject(WavespeedService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('request()', () => {
    const jobInput: WavespeedRequestInput = { model: 'wavespeed-ai/flux-dev', input: { prompt: 'test' } };

    it('POSTs to correct URL and maps to WavespeedPredictionRef', async () => {
      const promise = firstValueFrom(service.request(jobInput));

      const req = httpMock.expectOne(`${BASE}/${jobInput.model}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toMatch(/^Bearer /);
      req.flush(makeApiResponse());

      const result = await promise;
      expect(result).toEqual({ predictionId: 'pred-abc' });
    });

    it('emits WavespeedServiceError on HTTP error', async () => {
      const promise = firstValueFrom(service.request(jobInput));

      const req = httpMock.expectOne(`${BASE}/${jobInput.model}`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await expect(promise).rejects.toMatchObject({ message: expect.any(String) });
    });
  });

  describe('status()', () => {
    it('GETs from correct URL and maps to WavespeedStatusResponse', async () => {
      const response = makeApiResponse({ status: 'processing' });
      const promise = firstValueFrom(service.status('pred-abc'));

      const req = httpMock.expectOne(`${BASE}/predictions/pred-abc/result`);
      expect(req.request.method).toBe('GET');
      req.flush(response);

      const result = await promise;
      expect(result).toEqual({ id: 'pred-abc', status: 'processing', outputs: undefined });
    });

    it('includes outputs when present', async () => {
      const response = makeApiResponse({ status: 'completed', outputs: ['https://example.com/out.mp4'] });
      const promise = firstValueFrom(service.status('pred-abc'));

      httpMock.expectOne(`${BASE}/predictions/pred-abc/result`).flush(response);

      const result = await promise;
      expect(result.outputs).toEqual(['https://example.com/out.mp4']);
    });

    it('emits WavespeedServiceError with predictionId on HTTP error', async () => {
      const promise = firstValueFrom(service.status('pred-abc'));

      httpMock.expectOne(`${BASE}/predictions/pred-abc/result`)
        .flush('', { status: 404, statusText: 'Not Found' });

      await expect(promise).rejects.toMatchObject({ predictionId: 'pred-abc' });
    });
  });

  describe('getResult()', () => {
    it('maps completed prediction to WavespeedResult', async () => {
      const response = makeApiResponse({ status: 'completed', outputs: ['https://example.com/out.mp4'] });
      const promise = firstValueFrom(service.getResult('pred-abc'));

      httpMock.expectOne(`${BASE}/predictions/pred-abc/result`).flush(response);

      const result = await promise;
      expect(result).toEqual({ predictionId: 'pred-abc', outputs: ['https://example.com/out.mp4'] });
    });

    it('emits error when prediction is not yet completed', async () => {
      const response = makeApiResponse({ status: 'processing' });
      const promise = firstValueFrom(service.getResult('pred-abc'));

      httpMock.expectOne(`${BASE}/predictions/pred-abc/result`).flush(response);

      await expect(promise).rejects.toMatchObject({ message: expect.stringContaining('pred-abc') });
    });

    it('emits WavespeedServiceError with predictionId on HTTP error', async () => {
      const promise = firstValueFrom(service.getResult('pred-abc'));

      httpMock.expectOne(`${BASE}/predictions/pred-abc/result`)
        .flush('', { status: 503, statusText: 'Service Unavailable' });

      await expect(promise).rejects.toMatchObject({ predictionId: 'pred-abc' });
    });
  });
});
