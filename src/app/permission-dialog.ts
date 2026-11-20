import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';

/**
 * Simulated camera permission request.
 * IMPORTANT: this never calls navigator.mediaDevices.getUserMedia.
 * No real camera access is requested, whatever the participant chooses.
 *
 * Uses the native <dialog> element: showModal() traps keyboard focus and
 * blocks the page behind it for free.
 */
@Component({
  selector: 'app-permission-dialog',
  template: `
    <dialog #dlg class="permission" aria-labelledby="perm-title" (cancel)="$event.preventDefault()">
      <div class="permission-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2l1.5-2h7.6l1.5 2h2.2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>
          <circle cx="12" cy="13" r="3.5"/>
        </svg>
      </div>
      <h2 id="perm-title">{{ title() }}</h2>
      <div class="permission-body">
        @for (p of paragraphs(); track $index) {
          <p>{{ p }}</p>
        }
      </div>
      <div class="permission-actions">
        <button type="button" class="btn btn-secondary" (click)="answer(false)">Don’t allow</button>
        <button type="button" class="btn btn-primary" (click)="answer(true)">Allow</button>
      </div>
    </dialog>
  `,
})
export class PermissionDialog {
  readonly title = input.required<string>();
  readonly paragraphs = input.required<string[]>();
  /** true = Allow, false = Don’t allow. Both continue the study. */
  readonly answered = output<boolean>();

  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    // The component is created when it must appear, so open it once rendered.
    afterNextRender(() => this.dlg().nativeElement.showModal());
  }

  protected answer(allowed: boolean): void {
    this.dlg().nativeElement.close();
    this.answered.emit(allowed);
  }
}
