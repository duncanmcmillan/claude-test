import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ContentDistributionPanelComponent } from './content-distribution-panel.component';

describe('ContentDistributionPanelComponent', () => {
  let fixture: ComponentFixture<ContentDistributionPanelComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentDistributionPanelComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentDistributionPanelComponent);
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the label "Content Distribution Panel"', () => {
    const label = compiled.querySelector('.component-label');
    expect(label?.textContent?.trim()).toBe('Content Distribution Panel');
  });

  it('should render a mat-card element', () => {
    const card = compiled.querySelector('mat-card');
    expect(card).toBeTruthy();
  });

  it('should use outlined mat-card appearance', () => {
    const card = compiled.querySelector('mat-card');
    expect(card?.getAttribute('appearance')).toBe('outlined');
  });

  it('should apply the distribution-card class to the mat-card', () => {
    const card = compiled.querySelector('mat-card');
    expect(card?.classList.contains('distribution-card')).toBe(true);
  });

  it('should render the component-label as the first child of the card', () => {
    const card = compiled.querySelector('mat-card');
    const firstChild = card?.firstElementChild;
    expect(firstChild?.classList.contains('component-label')).toBe(true);
  });
});
