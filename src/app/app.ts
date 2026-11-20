import { Component, computed, signal } from '@angular/core';
import { AppProfile, Condition, LinkTarget, STUDY_CONFIG } from './study.config';
import { AssistantNotification } from './assistant-notification';
import { PermissionDialog } from './permission-dialog';
import { Workspace } from './workspace';

type Step = 'invalid' | 'instructions' | 'account' | 'terms' | 'tasks' | 'done';

/**
 * The whole study is a small state machine driven by the `step` signal.
 * There is deliberately no router: participants cannot go back with the
 * browser's Back button, and a reload starts the flow again from the beginning.
 *
 * Link format: ?v=<key from STUDY_CONFIG.links>&code=<participant code>
 */
@Component({
  selector: 'app-root',
  imports: [AssistantNotification, PermissionDialog, Workspace],
  templateUrl: './app.html',
  host: {
    '[style.--primary]': 'profile?.primary',
    '[style.--primary-dark]': 'profile?.primaryDark',
  },
})
export class App {
  protected readonly config = STUDY_CONFIG;

  // --- Read once from the URL -------------------------------------------
  private readonly params = new URLSearchParams(window.location.search);
  private readonly target: LinkTarget | undefined =
    (STUDY_CONFIG.links as Record<string, LinkTarget>)[this.params.get('v') ?? ''];
  protected readonly condition: Condition | undefined = this.target?.cond;
  protected readonly profile: AppProfile | undefined = this.target
    ? (STUDY_CONFIG.profiles as Record<string, AppProfile>)[this.target.app]
    : undefined;
  /** The code you generated and put in the participant's link. Never generated here. */
  protected readonly code = readCode(this.params.get('code'));

  // --- Flow state -------------------------------------------------------
  protected readonly step = signal<Step>(this.profile && this.condition && this.code ? 'instructions' : 'invalid');
  protected readonly taskIndex = signal(0);
  protected readonly termsDeclined = signal(false);
  protected readonly notificationVisible = signal(false);
  protected readonly dialogOpen = signal(false);
  /** What to do once the participant answers the permission dialog. */
  private afterDialog: () => void = () => {};

  protected readonly blocked = computed(() => this.notificationVisible() || this.dialogOpen());

  protected readonly formLink = computed(() =>
    !this.profile || this.profile.formUrl.startsWith('TODO') || !this.code
      ? null
      : this.profile.formUrl.replace('{code}', encodeURIComponent(this.code)),
  );

  /** Researcher warning: any text still starting with TODO. */
  protected readonly hasPlaceholders = [
    ...Object.values(STUDY_CONFIG.texts),
    this.profile?.permissionBody ?? '',
    this.profile?.formUrl ?? '',
  ].some((t) => t.startsWith('TODO'));

  // --- Text helpers -----------------------------------------------------
  /** Replace {service}/{assistant} and split on blank lines into paragraphs. */
  protected paras(text: string): string[] {
    return this.fill(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }

  protected fill(text: string): string {
    const p = this.profile;
    return p ? text.replaceAll('{service}', p.serviceName).replaceAll('{assistant}', p.assistantName) : text;
  }

  protected readonly termsParagraphs = computed(() => {
    const withCamera = this.condition === 'install' && STUDY_CONFIG.cameraSectionInTerms;
    return [
      ...this.paras(STUDY_CONFIG.texts.generalTerms),
      ...(withCamera ? this.paras(STUDY_CONFIG.texts.cameraTermsSection) : []),
    ];
  });

  // --- Transitions ------------------------------------------------------
  protected start(): void {
    this.step.set('account');
  }

  protected createAccount(): void {
    this.step.set('terms');
  }

  protected declineTerms(): void {
    this.termsDeclined.set(true);
  }

  protected acceptTerms(): void {
    if (this.condition === 'install') {
      // "install" condition: the camera request is part of the installation.
      this.openDialog(() => this.step.set('tasks'));
    } else {
      this.step.set('tasks');
    }
  }

  /** Called by the workspace each time the current task is finished. */
  protected completeTask(): void {
    const done = this.taskIndex() + 1;
    const isLast = done >= STUDY_CONFIG.tasks.length;
    // "jit" condition: the assistant notifies, then asks, at the moment it needs the camera.
    const trigger = this.condition === 'jit' && done === STUDY_CONFIG.jitAfterTask;

    this.taskIndex.set(done); // the task panel moves on (next task blocked while the request is open)

    if (trigger) {
      this.afterDialog = isLast ? () => this.step.set('done') : () => {};
      this.notificationVisible.set(true);
    } else if (isLast) {
      this.step.set('done');
    }
  }

  protected reviewNotification(): void {
    this.notificationVisible.set(false);
    this.openDialog(this.afterDialog);
  }

  private openDialog(then: () => void): void {
    this.afterDialog = then;
    this.dialogOpen.set(true);
  }

  /**
   * The answer is not stored anywhere: the brief requires data to be collected
   * with Microsoft tools, so ask about it in the MS Form if you need it.
   */
  protected onPermissionAnswer(_allowed: boolean): void {
    this.dialogOpen.set(false);
    this.afterDialog();
  }
}

/** Accepts only a plausible code (letters, digits, hyphens); anything else = invalid link. */
function readCode(fromUrl: string | null): string | null {
  return fromUrl && /^[A-Za-z0-9-]{3,20}$/.test(fromUrl) ? fromUrl.toUpperCase() : null;
}
