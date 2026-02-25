import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { describe, it, expect, beforeEach } from 'vitest';
import { MediaContainerComponent } from './media-container.component';
import type { MediaItem } from './media-container.model';

const imageItem: MediaItem = {
  url: 'https://example.com/photo.jpg',
  content_type: 'image/jpeg',
  width: 1024,
  height: 768,
};

const videoItem: MediaItem = {
  url: 'https://example.com/clip.mp4',
  content_type: 'video/mp4',
};

const audioItem: MediaItem = {
  url: 'https://example.com/track.wav',
  content_type: 'audio/wav',
};

describe('MediaContainerComponent', () => {
  let fixture: ComponentFixture<MediaContainerComponent>;
  let compiled: HTMLElement;

  function setup(mediaItem: MediaItem): void {
    fixture = TestBed.createComponent(MediaContainerComponent);
    fixture.componentRef.setInput('mediaItem', mediaItem);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaContainerComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  it('should be created', () => {
    setup(imageItem);
    expect(fixture.componentInstance).toBeTruthy();
  });

  describe('image media', () => {
    beforeEach(() => setup(imageItem));

    it('should render an img element', () => {
      expect(compiled.querySelector('img')).toBeTruthy();
    });

    it('should set the img src to the media item url', () => {
      expect(compiled.querySelector('img')?.getAttribute('src')).toBe(imageItem.url);
    });

    it('should not render video or audio', () => {
      expect(compiled.querySelector('video')).toBeNull();
      expect(compiled.querySelector('audio')).toBeNull();
    });
  });

  describe('video media', () => {
    beforeEach(() => setup(videoItem));

    it('should render a video element', () => {
      expect(compiled.querySelector('video')).toBeTruthy();
    });

    it('should set the video src to the media item url', () => {
      expect(compiled.querySelector('video')?.getAttribute('src')).toBe(videoItem.url);
    });

    it('should not render img or audio', () => {
      expect(compiled.querySelector('img')).toBeNull();
      expect(compiled.querySelector('audio')).toBeNull();
    });
  });

  describe('audio media', () => {
    beforeEach(() => setup(audioItem));

    it('should render an audio element', () => {
      expect(compiled.querySelector('audio')).toBeTruthy();
    });

    it('should set the audio src to the media item url', () => {
      expect(compiled.querySelector('audio')?.getAttribute('src')).toBe(audioItem.url);
    });

    it('should not render img or video', () => {
      expect(compiled.querySelector('img')).toBeNull();
      expect(compiled.querySelector('video')).toBeNull();
    });
  });
});
