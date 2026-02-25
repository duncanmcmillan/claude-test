import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FalStore } from '../fal';
import { MediaContainerComponent } from '../media-container';
import type { FalImageResult, MediaItem } from '../media-container';

@Component({
  selector: 'app-content-preview-panel',
  imports: [MatCardModule, MediaContainerComponent],
  templateUrl: './content-preview-panel.component.html',
  styleUrl: './content-preview-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentPreviewPanelComponent {
  private readonly falStore = inject(FalStore);

  /** Accumulated list of media items from all completed API calls. */
  readonly mediaItems = signal<MediaItem[]>([]);

  constructor() {
    effect(() => {
      const result = this.falStore.result();
      if (!result) return;
      const data = result.data as FalImageResult;
      const newItems = data.images ?? [];
      if (newItems.length > 0) {
        this.mediaItems.update(items => [...items, ...newItems]);
      }
    }, { allowSignalWrites: true });
  }
}
