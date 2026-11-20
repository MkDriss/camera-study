import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { TaskConfig } from './study.config';
import { HoldButton } from './hold-button';

/** 'home' or the index of a task (each task has its own tab). */
type Section = 'home' | number;

/**
 * The task screen: a task panel on the left (the "room"), the fake service on the right.
 * It only knows which task is current; the parent (App) decides what happens
 * after each task, which is where the "jit" camera request is triggered.
 *
 * Visual cues for the participant:
 *  1. the current task card is highlighted and has a "Go to …" button,
 *  2. the matching tab carries the task number,
 *  3. inside the tab, the area to act on is outlined,
 *  4. on any other tab, a banner points back to the right one.
 */
@Component({
  selector: 'app-workspace',
  imports: [HoldButton],
  templateUrl: './workspace.html',
})
export class Workspace {
  readonly tasks = input.required<TaskConfig[]>();
  readonly taskIndex = input.required<number>();
  /** True while the assistant notification or the permission dialog is open. */
  readonly blocked = input(false);
  readonly holdDurationMs = input(2000);
  readonly userName = input('');
  readonly completed = output<void>();

  protected readonly section = signal<Section>('home');
  /** Reported items, stored as "taskIndex:itemIndex". */
  protected readonly reported = signal<ReadonlySet<string>>(new Set());
  protected readonly selectedSlot = signal<string | null>(null);
  /** Slot confirmed per task index, shown once the task is done. */
  protected readonly confirmedSlots = signal<Record<number, string>>({});

  private readonly heading = viewChild<ElementRef<HTMLElement>>('sectionHeading');

  protected readonly progress = computed(() => Math.min(this.taskIndex() / this.tasks().length, 1));
  protected readonly allDone = computed(() => this.taskIndex() >= this.tasks().length);
  protected readonly onCurrentTab = computed(() => !this.allDone() && this.section() === this.taskIndex());

  protected isDone(i: number): boolean {
    return i < this.taskIndex();
  }

  protected isCurrent(i: number): boolean {
    return i === this.taskIndex();
  }

  /** Can the participant act in tab i right now? */
  protected isActive(i: number): boolean {
    return this.isCurrent(i) && !this.blocked();
  }

  protected goTo(s: Section): void {
    this.section.set(s);
    // Move keyboard/screen-reader focus to the new tab's heading once it renders.
    queueMicrotask(() => this.heading()?.nativeElement.focus());
  }

  // --- report ---------------------------------------------------------
  protected isReported(task: number, item: number): boolean {
    return this.reported().has(`${task}:${item}`);
  }

  protected report(task: number, item: number, total: number): void {
    const next = new Set(this.reported()).add(`${task}:${item}`);
    this.reported.set(next);
    const allDone = Array.from({ length: total }, (_, k) => next.has(`${task}:${k}`)).every(Boolean);
    if (allDone) this.completed.emit();
  }

  protected reportedCount(task: number, total: number): number {
    return Array.from({ length: total }, (_, k) => this.isReported(task, k)).filter(Boolean).length;
  }

  // --- appointment ------------------------------------------------------
  protected slotFree(task: TaskConfig, slot: string): boolean {
    return task.kind === 'appointment' && !task.unavailable.includes(slot);
  }

  protected confirmSlot(task: number): void {
    const slot = this.selectedSlot();
    if (!slot) return;
    this.confirmedSlots.update((c) => ({ ...c, [task]: slot }));
    this.selectedSlot.set(null);
    this.completed.emit();
  }
}
