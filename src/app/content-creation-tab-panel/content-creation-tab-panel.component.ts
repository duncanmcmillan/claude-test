import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ContentDistributionPanelComponent } from '../content-distribution-panel';

@Component({
  selector: 'app-content-creation-tab-panel',
  imports: [MatButtonModule, ContentDistributionPanelComponent],
  templateUrl: './content-creation-tab-panel.component.html',
  styleUrl: './content-creation-tab-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCreationTabPanelComponent {}
