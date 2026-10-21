export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Bitcoin Control Center': 0,
  'Web Interface': 1,
  'Bitcoin Control Center is running and responding.': 2,
  'Bitcoin Control Center is not responding.': 3,

  // interfaces.ts
  'The Bitcoin Control Center web interface.': 4,

  // actions/configure.ts
  Configure: 5,
  'Configure the mempool source and application logging.': 6,
  'Mempool URL Override': 7,
  'Leave blank to use the installed mempool service, or public mempool.space when it is not installed. Enter an HTTP(S) URL to use another instance. Statements need it to be running; missing prices use public mempool.space only while "Allow fallbacks" is on in Settings.': 8,
  'Enter an HTTP or HTTPS URL without credentials, a query or a fragment.': 9,
  'Log Level': 10,
  Error: 11,
  Warning: 12,
  Info: 13,
  Debug: 14,
  Trace: 15,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
