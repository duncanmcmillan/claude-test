import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FalStore } from '../../services/fal/fal.store';

@Component({
  selector: 'app-media-control-tab-bar',
  imports: [MatIconModule, MatProgressBarModule],
  templateUrl: './media-control-tab-bar.component.html',
  styleUrl: './media-control-tab-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaControlTabBarComponent {
  readonly tabs = ['Image', 'Video', 'Sound'] as const;
  readonly activeTab = signal<string>('Image');
  readonly promptText = input('');

  private readonly falStore = inject(FalStore);

  /**
   * Sets the currently active media tab.
   * @param tab - The tab label to activate (e.g. 'Image', 'Video', 'Sound').
   */
  setActive(tab: string): void {
    this.activeTab.set(tab);
  }

  /**
   * Handles a click on a tab label span.
   * Submits an image generation job to FalStore when the 'Image' tab is clicked.
   * @param tab - The label of the clicked tab (e.g. 'Image', 'Video', 'Sound').
   */
  onTabLabelClick(tab: string): void {
    if (tab === 'Image') {
      this.falStore.submit({ model: 'fal-ai/flux/dev', input: { prompt: this.promptText() } });
    }
  }
}
