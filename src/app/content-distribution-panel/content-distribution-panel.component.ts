import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-content-distribution-panel',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './content-distribution-panel.component.html',
  styleUrl: './content-distribution-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentDistributionPanelComponent {}
