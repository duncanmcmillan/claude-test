import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TextInputControlComponent } from './text-input-control.component';

describe('TextInputControlComponent', () => {
  let fixture: ComponentFixture<TextInputControlComponent>;
  let component: TextInputControlComponent;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextInputControlComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TextInputControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Structure ──────────────────────────────────────────────────────────────

  it('should render the control wrapper', () => {
    expect(compiled.querySelector('.control-wrapper')).toBeTruthy();
  });

  it('should render the main mat-form-field', () => {
    expect(compiled.querySelector('.main-field')).toBeTruthy();
  });

  it('should render a textarea with matInput inside the main field', () => {
    const field = compiled.querySelector('.main-field');
    const textarea = field?.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('should render the input row', () => {
    expect(compiled.querySelector('.input-row')).toBeTruthy();
  });

  it('should render the inline mat-form-field inside the input row', () => {
    const row = compiled.querySelector('.input-row');
    expect(row?.querySelector('.inline-field')).toBeTruthy();
  });

  it('should render a textarea with matInput inside the inline field', () => {
    const field = compiled.querySelector('.inline-field');
    const textarea = field?.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('should render the toggle wrapper inside the input row', () => {
    const row = compiled.querySelector('.input-row');
    expect(row?.querySelector('.toggle-wrapper')).toBeTruthy();
  });

  it('should render the toggle input as a checkbox', () => {
    const toggle = compiled.querySelector('.toggle-input') as HTMLInputElement;
    expect(toggle).toBeTruthy();
    expect(toggle.type).toBe('checkbox');
  });

  it('should render the Instrumental label', () => {
    const label = compiled.querySelector('.toggle-label');
    expect(label?.textContent?.trim()).toBe('Instrumental');
  });

  // ── Toggle layout: label above toggle ─────────────────────────────────────

  it('should render the toggle label before the toggle element in the DOM', () => {
    const wrapper = compiled.querySelector('.toggle-wrapper');
    const children = Array.from(wrapper?.children ?? []);
    const labelIdx = children.findIndex(el => el.classList.contains('toggle-label'));
    const toggleIdx = children.findIndex(el => el.classList.contains('toggle'));
    expect(labelIdx).toBeGreaterThanOrEqual(0);
    expect(toggleIdx).toBeGreaterThan(labelIdx);
  });

  // ── Signal state ───────────────────────────────────────────────────────────

  it('should default instrumental signal to false', () => {
    expect(component.instrumental()).toBe(false);
  });

  it('should reflect false state on toggle checkbox', () => {
    const toggle = compiled.querySelector('.toggle-input') as HTMLInputElement;
    expect(toggle.checked).toBe(false);
  });

  // ── Interaction ────────────────────────────────────────────────────────────

  it('should set instrumental signal to true when checkbox is checked', () => {
    const toggle = compiled.querySelector('.toggle-input') as HTMLInputElement;
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.instrumental()).toBe(true);
  });

  it('should set instrumental signal back to false when checkbox is unchecked', () => {
    const toggle = compiled.querySelector('.toggle-input') as HTMLInputElement;
    toggle.checked = true;
    toggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    toggle.checked = false;
    toggle.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.instrumental()).toBe(false);
  });

  // ── Layout ─────────────────────────────────────────────────────────────────

  it('should place toggle wrapper after inline-field in the row', () => {
    const row = compiled.querySelector('.input-row');
    const children = Array.from(row?.children ?? []);
    const inlineIdx = children.findIndex(el => el.classList.contains('inline-field'));
    const toggleIdx = children.findIndex(el => el.classList.contains('toggle-wrapper'));
    expect(inlineIdx).toBeGreaterThanOrEqual(0);
    expect(toggleIdx).toBeGreaterThan(inlineIdx);
  });

  it('should render control-wrapper as first child of host', () => {
    const wrapper = compiled.querySelector('.control-wrapper');
    expect(wrapper?.parentElement).toBe(compiled);
  });

  // ── promptText signal ─────────────────────────────────────────────────────

  it('should default promptText signal to empty string', () => {
    expect(component.promptText()).toBe('');
  });

  it('should update promptText when the main textarea receives an input event', () => {
    const textarea = compiled.querySelector('.main-field textarea') as HTMLTextAreaElement;
    textarea.value = 'a golden hour landscape';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.promptText()).toBe('a golden hour landscape');
  });

  it('should not update promptText when the inline textarea receives an input event', () => {
    const textarea = compiled.querySelector('.inline-field textarea') as HTMLTextAreaElement;
    textarea.value = 'should be ignored';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.promptText()).toBe('');
  });

  it('should update promptText on each successive input event', () => {
    const textarea = compiled.querySelector('.main-field textarea') as HTMLTextAreaElement;
    textarea.value = 'first';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    textarea.value = 'second';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.promptText()).toBe('second');
  });
});
