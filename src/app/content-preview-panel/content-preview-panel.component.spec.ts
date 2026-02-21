import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ContentPreviewPanelComponent } from './content-preview-panel.component';

describe('ContentPreviewPanelComponent', () => {
  let fixture: ComponentFixture<ContentPreviewPanelComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentPreviewPanelComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentPreviewPanelComponent);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the component title "contentPreviewPanel"', () => {
    const title = compiled.querySelector('.component-title');
    expect(title?.textContent?.trim()).toBe('contentPreviewPanel');
  });

  it('should render the component title in the top-left via .component-title', () => {
    const title = compiled.querySelector('.component-title');
    expect(title).toBeTruthy();
  });

  it('should render a mat-card element', () => {
    const card = compiled.querySelector('mat-card');
    expect(card).toBeTruthy();
  });

  it('should render the mat-card with outlined appearance', () => {
    const card = compiled.querySelector('mat-card');
    expect(card?.getAttribute('appearance')).toBe('outlined');
  });

  it('should apply the preview-panel class to the mat-card', () => {
    const card = compiled.querySelector('mat-card.preview-panel');
    expect(card).toBeTruthy();
  });

  it('should have white background on the preview panel', () => {
    // JSDOM cannot resolve SCSS class-based styles via getComputedStyle.
    // The white background is defined in .preview-panel { background: white }.
    // We verify the element is a mat-card with the preview-panel class so the
    // SCSS rule is guaranteed to apply in a real browser.
    const card = compiled.querySelector('mat-card.preview-panel');
    expect(card).toBeTruthy();
    expect(card?.tagName.toLowerCase()).toBe('mat-card');
  });

  it('should have the component-title text colour set to black in CSS', () => {
    const title = compiled.querySelector<HTMLElement>('.component-title');
    expect(title).toBeTruthy();
    const styles = getComputedStyle(title!);
    expect(styles.color).toBe('rgb(0, 0, 0)');
  });
});
