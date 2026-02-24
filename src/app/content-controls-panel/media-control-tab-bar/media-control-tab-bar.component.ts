import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

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

  /**
   * Sets the currently active media tab.
   * @param tab - The tab label to activate (e.g. 'Image', 'Video', 'Sound').
   */
  setActive(tab: string): void {
    this.activeTab.set(tab);
  }
}
