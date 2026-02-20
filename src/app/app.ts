import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContentCreationTabPanelComponent } from './content-creation-tab-panel';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContentCreationTabPanelComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
