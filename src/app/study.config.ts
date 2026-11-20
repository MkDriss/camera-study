/**
 * STUDY CONFIGURATION
 * -------------------
 * Everything that belongs to the study design lives in this file.
 * The components only display what is written here, so you can change
 * the study without touching the rest of the code.
 *
 * Any text that starts with "TODO" is shown to participants with a warning
 * banner, so a forgotten placeholder cannot slip into a pilot unnoticed.
 *
 * Paragraphs: separate them with a blank line ("\n\n").
 * {service} and {assistant} are replaced with the profile's names.
 */

/** When the camera request is shown. Chosen per participant through ?v= in the URL. */
export type Condition = 'install' | 'jit';

/** A visual identity, so that a participant who sees both conditions sees two different apps. */
export interface AppProfile {
  serviceName: string;
  assistantName: string;
  /** Main colour (header, buttons). Must keep enough contrast with white text. */
  primary: string;
  /** Darker shade used for hover and pressed states. */
  primaryDark: string;
  /**
   * Body of the camera permission dialog for this version. Both versions must have
   * the same structure (same number and type of facts, same length); only the
   * details change, so a participant who does both apps cannot reuse answers.
   */
  permissionBody: string;
  /** MS Form for this version's questionnaire. {code} is replaced with the participant code. */
  formUrl: string;
}

/** Fields shared by every task. `section` is the name of the tab where the task lives. */
interface TaskBase {
  section: string;
  title: string;
  instruction: string;
}

/**
 * The tasks are distractors: each one lives in its own tab of the fake service.
 * - report:      a list of problems, each with a Report button (done when all are reported)
 * - appointment: a weekly calendar, pick a free slot then confirm it
 * - hold:        a document signed by pressing and holding a button
 * - click:       a single button
 */
export type TaskConfig =
  | (TaskBase & { kind: 'report'; items: string[] })
  | (TaskBase & { kind: 'appointment'; days: string[]; times: string[]; unavailable: string[]; confirmLabel: string })
  | (TaskBase & { kind: 'hold'; documentName: string; buttonLabel: string })
  | (TaskBase & { kind: 'click'; buttonLabel: string });

/** What a participant link opens: which profile, which condition. */
export interface LinkTarget {
  app: string;
  cond: Condition;
}

export const STUDY_CONFIG = {
  /**
   * Participant links look like:  ?v=q3&code=K7Q2MD
   * - v    : a key below, so the condition never appears in the address bar.
   *          Replace these example keys with your own before sending links.
   * - code : the participant code YOU generate. Required: a link without it is refused.
   */
  links: {
    q3: { app: 'a', cond: 'install' },
    q8: { app: 'a', cond: 'jit' },
    t2: { app: 'b', cond: 'install' },
    t5: { app: 'b', cond: 'jit' },
  } satisfies Record<string, LinkTarget>,

  /** Visual identities, referenced by `app` in the links above. Rename freely. */
  profiles: {
    a: {
      serviceName: 'Northvale Home',
      assistantName: 'Vale Assistant',
      primary: '#1f4e8c',
      primaryDark: '#163a69',
      permissionBody:
        '{assistant} can check your front door when it detects movement.\nTo do this, it needs to use your camera.\n\n' +
        'Each time there is movement, {assistant} records a 10-second video clip and works out whether it shows a person, a parcel or an animal.\n\nIf it shows a person, {assistant} also tries to recognise their face. \nIt keeps a list of the faces it has seen, so it can tell you whether someone it knows or someone new is at the door. This includes visitors and people who are just walking past.\n\n' +
        'Clips and the list of faces are kept for 30 days and then deleted. Some clips may be watched by {service} staff to check that the system works properly.\n\n' +
        '{assistant} does not record sound, does not record all the time and does not share clips with other companies.\n\n' +
        'You can turn the camera off at any time in Settings.',
      formUrl: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=3c9X5zUfV0Svj3ycaxQ341Qq2sZOovNBsPCH30pTeGdUQVFURVExWjc4MThWS1NETVQzM0lHQVdFWC4u',
    },
    b: {
      serviceName: 'Kestrel Home',
      assistantName: 'Kestrel Assistant',
      primary: '#2d6a4f',
      primaryDark: '#1f4c38',
      permissionBody:
        '{assistant} can check your front door when it detects movement. To do this, it needs to use your camera.\n\n' +
        'Each time there is movement, {assistant} records a 15-second video clip and works out whether it shows a person, a car or an animal. If it shows a person, {assistant} also tries to recognise their face. It keeps a list of the faces it has seen, so it can tell you whether someone it knows or someone new is at the door. This includes visitors and people who are just walking past.\n\n' +
        'Clips and the list of faces are kept for 14 days and then deleted. Some clips may be watched by {service} staff to check that the system works properly.\n\n' +
        '{assistant} does not record sound, does not record all the time and does not share clips with other companies.\n\n' +
        'You can turn the camera off at any time in Settings.',
      formUrl: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=3c9X5zUfV0Svj3ycaxQ341Qq2sZOovNBsPCH30pTeGdUN0pCUElEMFpPS0ZJSllSRDRDVTQzT0FORy4u',
    },
  } satisfies Record<string, AppProfile>,

  /**
   * Fictional identity shown (read-only) on the account screen,
   * so participants never type personal information.
   * example.org is a domain reserved for examples: it cannot belong to anyone.
   */
  fictionalIdentity: {
    fullName: 'Sam Taylor',
    email: 'sam.taylor@example.org',
    reference: 'NV-204 118',
  },

  texts: {
    instructions:
      'Thank you for taking part in this experiment.\n\n' +
      'You are going to test {service}, a website featuring a simulated AI agent, designed for people with smart home devices.\n\nFirst of all, you will be shown some terms and conditions, which you will need to accept in order to continue with the experience. Then you will do three small tasks by clicking on the screen. When you have finished, you will get a code and a link to a short questionnaire.\n\n' +
      'This is only a demonstration. All the names and details you see are fake, so you never need to type anything about yourself. At some point you may see a message asking to use devices such as camera or microphone. It is not real: nothing on your device is used, and they will stay off the whole time.\n\n' +
      'Please read and click the way you normally would. There are no right or wrong ways to do the tasks. This part takes about 10 minutes, including the questionnaire.',

    generalTerms:
      'These are the terms for {service}. By using the service, you agree to them.\n\n' +
      '1. What the service does. {service} lets you check your smart home devices, report problems with them, book visits from a technician and sign a document by holding a button.\n\n' +
      '2. Your information. Please make sure the details you give us are correct.\n\n' +
      '3. Updates. We may update the service or these terms from time to time. The latest version is always on this page.\n\n' +
      '4. When the service is down. The service may sometimes stop working, for example during maintenance. We are not responsible for delays caused by this.\n\n' +
      '5. Help. If you have a question, please contact the administrator by email at "driss.meskini@northumbria.ac.uk".',

    cameraTermsSection:
      'Camera. If you allow it, {assistant} can use your front door camera. You will see the details when it asks.',

    permissionTitle: 'Allow {assistant} to use your front door camera?',

    notificationText: 'Movement detected at your front door. {assistant} has a request.',

    endMessage:
      'Thank you, you have finished this part. Write down your participant code: you will need it in the questionnaire.',
  },

  /**
   * false (default): in both conditions, the camera information is only in the
   * permission dialog, so both groups read exactly the same words.
   * true: the "install" condition also gets cameraTermsSection inside the terms,
   * which means that group reads more text about the camera than the other.
   */
  cameraSectionInTerms: false,

  /** The tasks, in order. Each one gets its own tab in the service. Edit freely. */
  tasks: [
    {
      kind: 'report',
      section: 'Report a problem',
      title: 'Report device problems',
      instruction: 'Report each problem in the list.',
      items: [
        'The lamp in the living room is broken',
        'Thermostat shows the wrong temperature',
        'Smoke alarm in the hall beeps every few minutes',
      ],
    },
    {
      kind: 'appointment',
      section: 'Technician visits',
      title: 'Book a technician visit',
      instruction: 'Pick any free slot in the calendar, then confirm it.',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      times: ['09:00', '11:00', '14:00', '16:00'],
      unavailable: ['Mon 09:00', 'Mon 11:00', 'Tue 14:00', 'Wed 09:00', 'Wed 16:00', 'Thu 11:00', 'Fri 09:00', 'Fri 14:00'],
      confirmLabel: 'Confirm visit',
    },
    {
      kind: 'hold',
      section: 'Documents',
      title: 'Sign your service plan',
      instruction: 'Press and hold the button until it fills to sign the plan.',
      documentName: 'Annual service plan',
      buttonLabel: 'Hold to sign',
    },
  ] satisfies TaskConfig[] as TaskConfig[],

  holdDurationMs: 2000,

  /**
   * "jit" condition only: after how many completed tasks the notification appears.
   * 1 = between task 1 and task 2, 3 = after the last task.
   * This changes the delay between reading the camera text and the questionnaire,
   * so think about it alongside the "install" condition.
   */
  jitAfterTask: 1,
};
