import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { MediaControlTabBarComponent } from './media-control-tab-bar.component';
import { FalStore } from '../../services/fal/fal.store';
import type { QueueStatus, FalJobResult, FalServiceError } from '../../services/fal';

const inQueueStatus: QueueStatus = {
  status: 'IN_QUEUE', request_id: 'req-1', queue_position: 0,
  response_url: '', status_url: '', cancel_url: '',
};
const inProgressStatus: QueueStatus = {
  status: 'IN_PROGRESS', request_id: 'req-1',
  response_url: '', status_url: '', cancel_url: '', logs: [],
};

describe('MediaControlTabBarComponent', () => {
  let fixture: ComponentFixture<MediaControlTabBarComponent>;
  let component: MediaControlTabBarComponent;
  let compiled: HTMLElement;

  const mockFalStore = {
    submit: vi.fn(),
    loading: signal(false),
    status: signal<QueueStatus | null>(null),
    result: signal<FalJobResult | null>(null),
    error: signal<FalServiceError | null>(null),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockFalStore.loading.set(false);
    mockFalStore.status.set(null);
    mockFalStore.result.set(null);
    mockFalStore.error.set(null);

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

  afterEach(() => {
    vi.useRealTimers();
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

  // ── Progress bar ───────────────────────────────────────────────────────────

  it('should start with progress value 0', () => {
    expect(component.progressValue()).toBe(0);
  });

  it('should start with amber colour', () => {
    expect(component.progressColor()).toBe('#f57c28');
  });

  it('should increment progress by 20 per non-completed status poll', async () => {
    mockFalStore.loading.set(true);
    mockFalStore.status.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    mockFalStore.status.set({ ...inQueueStatus });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.progressValue()).toBe(20);

    mockFalStore.status.set({ ...inProgressStatus });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.progressValue()).toBe(40);
  });

  it('should cap progress at 80 while polling', async () => {
    mockFalStore.loading.set(true);
    mockFalStore.status.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    for (let i = 0; i < 6; i++) {
      mockFalStore.status.set({ ...inProgressStatus, request_id: `r${i}` });
      fixture.detectChanges();
      await fixture.whenStable();
    }

    expect(component.progressValue()).toBe(80);
  });

  it('should reset progress to 0 when a new job starts', async () => {
    mockFalStore.loading.set(true);
    mockFalStore.status.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    mockFalStore.status.set({ ...inQueueStatus });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.progressValue()).toBe(20);

    // New job starts
    mockFalStore.status.set(null);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.progressValue()).toBe(0);
  });

  it('should show 100 and green colour when result arrives', async () => {
    vi.useFakeTimers();
    mockFalStore.result.set({ data: {}, requestId: 'req-1' });
    fixture.detectChanges();

    expect(component.progressValue()).toBe(100);
    expect(component.progressColor()).toBe('#4caf50');
  });

  it('should show 100 and red colour on error', async () => {
    vi.useFakeTimers();
    mockFalStore.error.set({ message: 'FAL request failed' });
    fixture.detectChanges();

    expect(component.progressValue()).toBe(100);
    expect(component.progressColor()).toBe('#f44336');
  });

  it('should reset progress to 0 and amber after 2 seconds on completion', async () => {
    vi.useFakeTimers();
    mockFalStore.result.set({ data: {}, requestId: 'req-1' });
    fixture.detectChanges();

    expect(component.progressValue()).toBe(100);

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();

    expect(component.progressValue()).toBe(0);
    expect(component.progressColor()).toBe('#f57c28');
  });

  it('should reset progress to 0 and amber after 2 seconds on error', async () => {
    vi.useFakeTimers();
    mockFalStore.error.set({ message: 'FAL request failed' });
    fixture.detectChanges();

    expect(component.progressValue()).toBe(100);

    vi.advanceTimersByTime(2000);
    fixture.detectChanges();

    expect(component.progressValue()).toBe(0);
    expect(component.progressColor()).toBe('#f57c28');
  });
});
