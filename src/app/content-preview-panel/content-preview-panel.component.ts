import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, effect, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FalStore } from '../services/fal';
import { MediaContainerComponent, MediaContainerWidthService } from '../media-container';
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
  private readonly widthService = inject(MediaContainerWidthService);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

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

    afterNextRender(() => {
      const observer = new ResizeObserver(entries => {
        this.widthService.containerWidth.set(Math.round(entries[0].contentRect.width));
      });
      observer.observe(this.el.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
