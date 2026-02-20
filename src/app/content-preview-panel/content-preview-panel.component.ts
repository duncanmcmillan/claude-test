import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-content-preview-panel',
  imports: [MatCardModule],
  templateUrl: './content-preview-panel.component.html',
  styleUrl: './content-preview-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentPreviewPanelComponent {}
