import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';

/**
 * A button that only fires `completed` after being held for `durationMs`.
 * Works with mouse, touch (pointer events) and keyboard (Space or Enter held down).
 * Releasing early resets the progress.
 */
@Component({
  selector: 'app-hold-button',
  template: `
    <button
      type="button"
      class="btn btn-primary hold"
      [class.is-holding]="holding()"
      [disabled]="disabled()"
      (pointerdown)="start($event)"
      (pointerup)="cancel()"
      (pointerleave)="cancel()"
      (pointercancel)="cancel()"
      (keydown)="onKeyDown($event)"
      (keyup)="onKeyUp($event)"
      (contextmenu)="$event.preventDefault()"
    >
      <span class="hold-fill" aria-hidden="true" [style.transform]="'scaleX(' + progress() + ')'"></span>
      <span class="hold-label">{{ label() }}</span>
    </button>
  `,
})
export class HoldButton {
  readonly label = input.required<string>();
  readonly durationMs = input(2000);
  readonly disabled = input(false);
  readonly completed = output<void>();

  protected readonly progress = signal(0);
  protected readonly holding = signal(false);

  private startTime = 0;
  private frame = 0;

  constructor() {
    // Stop the animation loop if the component disappears mid-hold.
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.frame));
  }

  protected start(event?: PointerEvent): void {
    if (this.disabled() || this.holding()) return;
    // Keep receiving pointerup even if the finger slides slightly.
    if (event) (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    this.holding.set(true);
    this.startTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  protected cancel(): void {
    if (!this.holding()) return;
    cancelAnimationFrame(this.frame);
    this.holding.set(false);
    this.progress.set(0);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    // Holding a key fires keydown repeatedly: only the first one starts the hold.
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault();
      this.start();
    }
  }

  protected onKeyUp(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') this.cancel();
  }

  // Arrow function so `this` stays bound when the browser calls it.
  private tick = (now: number): void => {
    const p = Math.min((now - this.startTime) / this.durationMs(), 1);
    this.progress.set(p);
    if (p < 1) {
      this.frame = requestAnimationFrame(this.tick);
    } else {
      this.holding.set(false);
      this.progress.set(0);
      this.completed.emit();
    }
  };
}
