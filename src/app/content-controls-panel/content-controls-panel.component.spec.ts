import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ContentControlsPanelComponent } from './content-controls-panel.component';

describe('ContentControlsPanelComponent', () => {
  let fixture: ComponentFixture<ContentControlsPanelComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentControlsPanelComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentControlsPanelComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the label "contentControlsPanel"', () => {
    const label = compiled.querySelector('.panel-label');
    expect(label?.textContent?.trim()).toBe('contentControlsPanel');
  });

  it('should have a panel-label element in the top-left', () => {
    const label = compiled.querySelector('.panel-label');
    expect(label).toBeTruthy();
  });

  it('should render a mat-card container', () => {
    const card = compiled.querySelector('mat-card');
    expect(card).toBeTruthy();
  });

  it('should apply outlined appearance to the mat-card', () => {
    const card = compiled.querySelector('mat-card');
    expect(card?.getAttribute('appearance')).toBe('outlined');
  });

  it('should have a controls-card class on the mat-card', () => {
    const card = compiled.querySelector('.controls-card');
    expect(card).toBeTruthy();
  });

  it('should have a white background on the card', () => {
    const card = compiled.querySelector('.controls-card') as HTMLElement;
    expect(card.style.background).toBe('rgb(255, 255, 255)');
  });

  it('should render panel-label with black color', () => {
    const label = compiled.querySelector('.panel-label') as HTMLElement;
    const style = window.getComputedStyle(label);
    expect(style.color).toBe('rgb(0, 0, 0)');
  });
});
