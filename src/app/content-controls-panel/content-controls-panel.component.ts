import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-content-controls-panel',
  imports: [MatCardModule],
  templateUrl: './content-controls-panel.component.html',
  styleUrl: './content-controls-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentControlsPanelComponent {}
