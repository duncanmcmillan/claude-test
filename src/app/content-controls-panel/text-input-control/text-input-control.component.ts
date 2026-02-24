import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-input-control',
  imports: [TextFieldModule, MatFormFieldModule, MatInputModule],
  templateUrl: './text-input-control.component.html',
  styleUrl: './text-input-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextInputControlComponent {
  readonly instrumental = signal(false);
  readonly promptText = signal('');

  /**
   * Updates the instrumental signal based on a checkbox change event.
   * @param event - The DOM change event from the checkbox input.
   */
  setInstrumental(event: Event): void {
    this.instrumental.set((event.target as HTMLInputElement).checked);
  }

  /**
   * Updates the promptText signal from the main textarea's input event.
   * @param event - The DOM input event from the textarea.
   */
  updatePromptText(event: Event): void {
    this.promptText.set((event.target as HTMLTextAreaElement).value);
  }
}
