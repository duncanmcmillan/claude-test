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

  it('should render a mat-card container', () => {
    const card = compiled.querySelector('mat-card');
    expect(card).toBeTruthy();
  });

  it('should have a controls-card class on the mat-card', () => {
    const card = compiled.querySelector('.controls-card');
    expect(card).toBeTruthy();
  });

  it('should render the media-control-tab-bar child component', () => {
    const tabBar = compiled.querySelector('app-media-control-tab-bar');
    expect(tabBar).toBeTruthy();
  });

  it('should render the tab bar inside a top-bar wrapper', () => {
    const topBar = compiled.querySelector('.top-bar');
    expect(topBar).toBeTruthy();
    const tabBar = topBar?.querySelector('app-media-control-tab-bar');
    expect(tabBar).toBeTruthy();
  });

  it('should place the top-bar as the first child of the card', () => {
    const card = compiled.querySelector('.controls-card');
    const firstChild = card?.firstElementChild;
    expect(firstChild?.classList.contains('top-bar')).toBe(true);
  });
});
