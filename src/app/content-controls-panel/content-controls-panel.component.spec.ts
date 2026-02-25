import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { ContentControlsPanelComponent } from './content-controls-panel.component';
import { TextInputControlComponent } from './text-input-control';
import { FalStore } from '../services/fal/fal.store';

const mockFalStore = {
  submit: vi.fn(),
  loading: signal(false),
  status: signal(null),
  result: signal(null),
  error: signal(null),
};

describe('ContentControlsPanelComponent', () => {
  let fixture: ComponentFixture<ContentControlsPanelComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ContentControlsPanelComponent],
      providers: [
        provideNoopAnimations(),
        { provide: FalStore, useValue: mockFalStore },
      ],
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

  // ── viewChild wiring ───────────────────────────────────────────────────────

  it('should expose textInput viewChild as a TextInputControlComponent instance', () => {
    expect(fixture.componentInstance.textInput()).toBeInstanceOf(TextInputControlComponent);
  });

  it('should reflect promptText changes from the text input child', () => {
    const textInput = fixture.componentInstance.textInput()!;
    textInput.promptText.set('wiring test');
    fixture.detectChanges();
    expect(fixture.componentInstance.textInput()?.promptText()).toBe('wiring test');
  });
});
