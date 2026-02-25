import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MediaControlTabBarComponent } from './media-control-tab-bar.component';
import { FalStore } from '../../services/fal/fal.store';

describe('MediaControlTabBarComponent', () => {
  let fixture: ComponentFixture<MediaControlTabBarComponent>;
  let component: MediaControlTabBarComponent;
  let compiled: HTMLElement;

  const mockFalStore = { submit: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MediaControlTabBarComponent],
      providers: [
        provideNoopAnimations(),
        { provide: FalStore, useValue: mockFalStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MediaControlTabBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Structure ──────────────────────────────────────────────────────────────

  it('should render three tab buttons', () => {
    expect(compiled.querySelectorAll('.tab').length).toBe(3);
  });

  it('should render Image, Video and Sound tab labels', () => {
    const texts = Array.from(compiled.querySelectorAll('.tab-label'))
      .map(el => el.textContent?.trim());
    expect(texts).toEqual(['Image', 'Video', 'Sound']);
  });

  it('should mark Image tab active by default', () => {
    const buttons = Array.from(compiled.querySelectorAll('.tab'));
    expect(buttons[0].classList.contains('active')).toBe(true);
    expect(buttons[1].classList.contains('active')).toBe(false);
    expect(buttons[2].classList.contains('active')).toBe(false);
  });

  // ── setActive ──────────────────────────────────────────────────────────────

  it('should update activeTab signal when setActive is called', () => {
    component.setActive('Video');
    expect(component.activeTab()).toBe('Video');
  });

  it('should switch active class when a tab button is clicked', () => {
    const buttons = compiled.querySelectorAll<HTMLButtonElement>('.tab');
    buttons[1].click();
    fixture.detectChanges();
    expect(buttons[1].classList.contains('active')).toBe(true);
    expect(buttons[0].classList.contains('active')).toBe(false);
  });

  // ── promptText input ───────────────────────────────────────────────────────

  it('should default promptText to empty string', () => {
    expect(component.promptText()).toBe('');
  });

  it('should reflect updated promptText via setInput', () => {
    fixture.componentRef.setInput('promptText', 'a snowy mountain');
    expect(component.promptText()).toBe('a snowy mountain');
  });

  // ── onTabLabelClick – Image ────────────────────────────────────────────────

  it('should call falStore.submit with fal-ai/flux/dev and prompt when Image span is clicked', () => {
    fixture.componentRef.setInput('promptText', 'a red sunset');
    fixture.detectChanges();

    const imageSpan = Array.from(compiled.querySelectorAll<HTMLSpanElement>('.tab-label'))
      .find(s => s.textContent?.trim() === 'Image')!;
    imageSpan.click();

    expect(mockFalStore.submit).toHaveBeenCalledOnce();
    expect(mockFalStore.submit).toHaveBeenCalledWith({
      model: 'fal-ai/flux/dev',
      input: { prompt: 'a red sunset' },
    });
  });

  it('should submit with empty prompt when promptText is not set', () => {
    const imageSpan = Array.from(compiled.querySelectorAll<HTMLSpanElement>('.tab-label'))
      .find(s => s.textContent?.trim() === 'Image')!;
    imageSpan.click();

    expect(mockFalStore.submit).toHaveBeenCalledWith({
      model: 'fal-ai/flux/dev',
      input: { prompt: '' },
    });
  });

  // ── onTabLabelClick – non-Image tabs ──────────────────────────────────────

  it('should not call falStore.submit when Video span is clicked', () => {
    const videoSpan = Array.from(compiled.querySelectorAll<HTMLSpanElement>('.tab-label'))
      .find(s => s.textContent?.trim() === 'Video')!;
    videoSpan.click();
    expect(mockFalStore.submit).not.toHaveBeenCalled();
  });

  it('should not call falStore.submit when Sound span is clicked', () => {
    const soundSpan = Array.from(compiled.querySelectorAll<HTMLSpanElement>('.tab-label'))
      .find(s => s.textContent?.trim() === 'Sound')!;
    soundSpan.click();
    expect(mockFalStore.submit).not.toHaveBeenCalled();
  });
});
