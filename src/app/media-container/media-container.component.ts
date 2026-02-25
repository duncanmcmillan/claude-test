import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { MediaItem } from './media-container.model';

@Component({
  selector: 'app-media-container',
  imports: [],
  templateUrl: './media-container.component.html',
  styleUrl: './media-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaContainerComponent {
  /** The media item to display. */
  readonly mediaItem = input.required<MediaItem>();

  /** True when the item is an image (content_type starts with "image/"). */
  readonly isImage = computed(() => this.mediaItem().content_type.startsWith('image/'));

  /** True when the item is a video (content_type starts with "video/"). */
  readonly isVideo = computed(() => this.mediaItem().content_type.startsWith('video/'));

  /** True when the item is audio (content_type starts with "audio/"). */
  readonly isAudio = computed(() => this.mediaItem().content_type.startsWith('audio/'));
}
