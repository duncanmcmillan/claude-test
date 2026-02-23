import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MediaControlTabBarComponent } from './media-control-tab-bar';
import { TextInputControlComponent } from './text-input-control';

@Component({
  selector: 'app-content-controls-panel',
  imports: [MatCardModule, MediaControlTabBarComponent, TextInputControlComponent],
  templateUrl: './content-controls-panel.component.html',
  styleUrl: './content-controls-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentControlsPanelComponent {}
