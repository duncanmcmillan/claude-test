import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MediaContainerWidthService {
  /** Pixel width of the media container area, updated via ResizeObserver. */
  readonly containerWidth = signal(0);
}
