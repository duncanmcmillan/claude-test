import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ContentControlsPanelComponent } from '../content-controls-panel';
import { ContentDistributionPanelComponent } from '../content-distribution-panel';
import { ContentPreviewPanelComponent } from '../content-preview-panel';

@Component({
  selector: 'app-content-creation-tab-panel',
  imports: [MatButtonModule, ContentControlsPanelComponent, ContentDistributionPanelComponent, ContentPreviewPanelComponent],
  templateUrl: './content-creation-tab-panel.component.html',
  styleUrl: './content-creation-tab-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentCreationTabPanelComponent {}
