import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SerpApiService } from './serp-api.service';
import type { SerpApiRequestParams, SerpApiSearchRef, SerpApiSearchResponse } from './serp-api.model';

vi.mock('serpapi', () => ({
  getJson: vi.fn(),
  config: { api_key: '', timeout: 0 },
}));

import { getJson } from 'serpapi';

const mockSearchResponse: SerpApiSearchResponse = {
  search_metadata: {
    id: 'search-xyz',
    status: 'Success',
    created_at: '2026-02-24T00:00:00Z',
  },
  organic_results: [
    {
      position: 1,
      title: 'Angular Docs',
      link: 'https://angular.dev',
      snippet: 'The official Angular docs',
    },
  ],
};

const params: SerpApiRequestParams = { q: 'Angular signals', gl: 'us' };

describe('SerpApiService', () => {
  let service: SerpApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), SerpApiService],
    });
    service = TestBed.inject(SerpApiService);
  });

  afterEach(() => vi.clearAllMocks());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('request()', () => {
    it('emits SerpApiSearchRef with searchId and results on success', async () => {
      vi.mocked(getJson).mockResolvedValue(mockSearchResponse as never);

      const result = await firstValueFrom(service.request(params));

      expect(result.searchId).toBe('search-xyz');
      expect(result.results).toEqual(mockSearchResponse);
    });

    it('merges default engine=google into params', async () => {
      vi.mocked(getJson).mockResolvedValue(mockSearchResponse as never);

      await firstValueFrom(service.request(params));

      expect(getJson).toHaveBeenCalledWith(expect.objectContaining({ engine: 'google', q: 'Angular signals' }));
    });

    it('respects a user-supplied engine override', async () => {
      vi.mocked(getJson).mockResolvedValue(mockSearchResponse as never);
      const bingParams: SerpApiRequestParams = { q: 'Angular', engine: 'bing' };

      await firstValueFrom(service.request(bingParams));

      expect(getJson).toHaveBeenCalledWith(expect.objectContaining({ engine: 'bing' }));
    });

    it('emits SerpApiServiceError with message on Error', async () => {
      vi.mocked(getJson).mockRejectedValue(new Error('Invalid API key'));

      await expect(firstValueFrom(service.request(params)))
        .rejects.toMatchObject({ message: 'Invalid API key' });
    });

    it('emits default SerpApiServiceError on non-Error rejection', async () => {
      vi.mocked(getJson).mockRejectedValue(null);

      await expect(firstValueFrom(service.request(params)))
        .rejects.toMatchObject({ message: 'SerpAPI request failed' });
    });
  });

  describe('status()', () => {
    it('returns Success status when results are present', async () => {
      const searchRef: SerpApiSearchRef = { searchId: 'search-xyz', results: mockSearchResponse };

      const result = await firstValueFrom(service.status(searchRef));

      expect(result).toEqual({ searchId: 'search-xyz', status: 'Success' });
    });

    it('returns Processing status when results are absent', async () => {
      const searchRef: SerpApiSearchRef = { searchId: 'search-xyz' };

      const result = await firstValueFrom(service.status(searchRef));

      expect(result).toEqual({ searchId: 'search-xyz', status: 'Processing' });
    });
  });

  describe('getResult()', () => {
    it('emits SerpApiSearchResponse when results are present', async () => {
      const searchRef: SerpApiSearchRef = { searchId: 'search-xyz', results: mockSearchResponse };

      const result = await firstValueFrom(service.getResult(searchRef));

      expect(result).toEqual(mockSearchResponse);
    });

    it('emits SerpApiServiceError with searchId when results are absent', async () => {
      const searchRef: SerpApiSearchRef = { searchId: 'search-xyz' };

      await expect(firstValueFrom(service.getResult(searchRef)))
        .rejects.toMatchObject({ message: expect.stringContaining('search-xyz'), searchId: 'search-xyz' });
    });
  });
});
