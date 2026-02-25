import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { ContentPreviewPanelComponent } from './content-preview-panel.component';
import { FalStore } from '../fal';
import type { FalJobResult } from '../fal';
import type { MediaItem } from '../media-container';

const mockFalStore = { result: signal<FalJobResult | null>(null) };

describe('ContentPreviewPanelComponent', () => {
  let fixture: ComponentFixture<ContentPreviewPanelComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    mockFalStore.result.set(null);

    await TestBed.configureTestingModule({
      imports: [ContentPreviewPanelComponent],
      providers: [
        provideNoopAnimations(),
        { provide: FalStore, useValue: mockFalStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentPreviewPanelComponent);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a mat-card element', () => {
    const card = compiled.querySelector('mat-card');
    expect(card).toBeTruthy();
  });

  it('should render the mat-card with outlined appearance', () => {
    const card = compiled.querySelector('mat-card');
    expect(card?.getAttribute('appearance')).toBe('outlined');
  });

  it('should apply the preview-panel class to the mat-card', () => {
    const card = compiled.querySelector('mat-card.preview-panel');
    expect(card).toBeTruthy();
  });

  it('should render no media containers when result is null', () => {
    expect(compiled.querySelectorAll('app-media-container').length).toBe(0);
  });

  it('should render a media container for each image in a FAL result', async () => {
    const images: MediaItem[] = [
      { url: 'https://cdn.fal.ai/img1.jpg', content_type: 'image/jpeg', width: 1024, height: 768 },
      { url: 'https://cdn.fal.ai/img2.jpg', content_type: 'image/jpeg', width: 1024, height: 768 },
    ];
    mockFalStore.result.set({ data: { images }, requestId: 'req-1' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelectorAll('app-media-container').length).toBe(2);
  });

  it('should accumulate media containers across multiple results', async () => {
    const result1: FalJobResult = {
      data: { images: [{ url: 'https://cdn.fal.ai/a.jpg', content_type: 'image/jpeg' }] },
      requestId: 'req-1',
    };
    const result2: FalJobResult = {
      data: { images: [{ url: 'https://cdn.fal.ai/b.jpg', content_type: 'image/jpeg' }] },
      requestId: 'req-2',
    };

    mockFalStore.result.set(result1);
    fixture.detectChanges();
    await fixture.whenStable();

    mockFalStore.result.set(result2);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelectorAll('app-media-container').length).toBe(2);
  });
});
