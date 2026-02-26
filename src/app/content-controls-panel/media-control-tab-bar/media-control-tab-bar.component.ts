import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FalStore } from '../../services/fal/fal.store';
import { MediaContainerWidthService } from '../../media-container';

type FinalState = 'idle' | 'completed' | 'error';

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
  private readonly widthService = inject(MediaContainerWidthService);
  private readonly pollCount = signal(0);
  private readonly finalState = signal<FinalState>('idle');
  private finalTimer: ReturnType<typeof setTimeout> | null = null;

  /** Progress bar value from 0 to 100. Amber increments 20 per status poll (capped at 80), 100 on completion or error. */
  readonly progressValue = computed(() => {
    if (this.finalState() !== 'idle') return 100;
    return Math.min(this.pollCount() * 20, 80);
  });

  /** CSS colour for the progress bar active indicator (used in tests). */
  readonly progressColor = computed(() => {
    switch (this.finalState()) {
      case 'completed': return '#4caf50';
      case 'error':     return '#f44336';
      default:          return '#f57c28';
    }
  });

  /** Current terminal state, exposed for CSS class bindings in the template. */
  readonly progressState = computed(() => this.finalState());

  constructor() {
    effect(() => {
      const loading = this.falStore.loading();
      const status  = this.falStore.status();
      const result  = this.falStore.result();
      const error   = this.falStore.error();

      if (!loading && result) {
        this.scheduleFinal('completed');
      } else if (!loading && error) {
        this.scheduleFinal('error');
      } else if (loading && !status) {
        // New job started — reset progress
        this.clearFinalTimer();
        this.pollCount.set(0);
        this.finalState.set('idle');
      } else if (loading && status && status.status !== 'COMPLETED') {
        this.pollCount.update(n => n + 1);
      }
    }, { allowSignalWrites: true });
  }

  /**
   * Displays a terminal progress state for 2 seconds then resets to idle.
   * @param state - The terminal state to display ('completed' or 'error').
   */
  private scheduleFinal(state: 'completed' | 'error'): void {
    this.clearFinalTimer();
    this.finalState.set(state);
    this.finalTimer = setTimeout(() => {
      this.finalState.set('idle');
      this.pollCount.set(0);
      this.finalTimer = null;
    }, 2000);
  }

  /** Cancels any pending reset timer. */
  private clearFinalTimer(): void {
    if (this.finalTimer !== null) {
      clearTimeout(this.finalTimer);
      this.finalTimer = null;
    }
  }

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
   * Requests landscape dimensions: full container width × 100 px height.
   * @param tab - The label of the clicked tab (e.g. 'Image', 'Video', 'Sound').
   */
  onTabLabelClick(tab: string): void {
    if (tab === 'Image') {
      this.falStore.submit({
        model: 'fal-ai/flux/dev',
        input: {
          prompt: this.promptText(),
          image_size: { width: this.widthService.containerWidth(), height: 100 },
        },
      });
    }
  }
}
