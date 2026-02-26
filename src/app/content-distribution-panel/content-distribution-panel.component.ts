import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { SocialMediaContainerComponent } from './social-media-container';

@Component({
  selector: 'app-content-distribution-panel',
  standalone: true,
  imports: [MatCardModule, SocialMediaContainerComponent],
  templateUrl: './content-distribution-panel.component.html',
  styleUrl: './content-distribution-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentDistributionPanelComponent {}
