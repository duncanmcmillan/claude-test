import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ContentCreationTabPanelComponent } from './content-creation-tab-panel.component';

describe('ContentCreationTabPanelComponent', () => {
  let fixture: ComponentFixture<ContentCreationTabPanelComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentCreationTabPanelComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentCreationTabPanelComponent);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the title "Content Creation Manager"', () => {
    const title = compiled.querySelector('.panel-title');
    expect(title?.textContent?.trim()).toBe('Content Creation Manager');
  });

  it('should render exactly three buttons', () => {
    const buttons = compiled.querySelectorAll('.button-bar button');
    expect(buttons.length).toBe(3);
  });

  it('should render buttons in correct order: Controls, Preview, Distribution', () => {
    const buttons = Array.from(compiled.querySelectorAll('.button-bar button'));
    const labels = buttons.map((b) => b.textContent?.trim());
    expect(labels).toEqual(['Controls', 'Preview', 'Distribution']);
  });

  it('should have a panel container element', () => {
    const panel = compiled.querySelector('.panel');
    expect(panel).toBeTruthy();
  });

  it('should have a button bar element', () => {
    const buttonBar = compiled.querySelector('.button-bar');
    expect(buttonBar).toBeTruthy();
  });

  it('should apply Material raised-button style to all buttons', () => {
    const buttons = Array.from(compiled.querySelectorAll('.button-bar button'));
    buttons.forEach((btn) => {
      expect(btn.hasAttribute('mat-raised-button')).toBe(true);
    });
  });
});
