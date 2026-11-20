import { Component, ElementRef, afterNextRender, input, output, viewChild } from '@angular/core';

/**
 * The assistant's notification ("jit" condition only).
 * Opened with showModal(), like the permission dialog: the browser draws a veil
 * (::backdrop) over the page, makes the page behind unclickable and keeps keyboard
 * focus inside, so the participant has to press "Review" to continue.
 */
@Component({
  selector: 'app-assistant-notification',
  template: `
    <dialog #dlg class="assistant-note" aria-labelledby="note-name" (cancel)="$event.preventDefault()">
      <div class="assistant-avatar" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="11" r=".6" fill="currentColor"/><circle cx="15" cy="11" r=".6" fill="currentColor"/><path d="M9 14.5c1.6 1.4 4.4 1.4 6 0"/>
        </svg>
      </div>
      <div class="assistant-content">
        <p class="assistant-name" id="note-name">{{ assistantName() }}</p>
        @for (p of paragraphs(); track $index) {
          <p>{{ p }}</p>
        }
        <button type="button" class="btn btn-primary btn-small" (click)="review()">Review</button>
      </div>
    </dialog>
  `,
})
export class AssistantNotification {
  readonly assistantName = input.required<string>();
  readonly paragraphs = input.required<string[]>();
  readonly reviewed = output<void>();

  private readonly dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  constructor() {
    afterNextRender(() => this.dlg().nativeElement.showModal());
  }

  protected review(): void {
    this.dlg().nativeElement.close();
    this.reviewed.emit();
  }
}
