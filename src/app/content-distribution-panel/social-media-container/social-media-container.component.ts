import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SocialPlatform = 'tiktok' | 'youtube' | 'facebook';

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
};

/**
 * A fixed-size, vertically scrollable container representing a single
 * social media platform feed, displaying the platform's brand icon.
 */
@Component({
  selector: 'app-social-media-container',
  standalone: true,
  imports: [],
  templateUrl: './social-media-container.component.html',
  styleUrl: './social-media-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"platform-" + platform()',
  },
})
export class SocialMediaContainerComponent {
  /** The social media platform this container represents. */
  platform = input.required<SocialPlatform>();

  /** Human-readable platform label derived from the platform signal. */
  protected readonly platformLabel = computed(() => PLATFORM_LABELS[this.platform()]);
}
