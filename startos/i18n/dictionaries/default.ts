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
  'Leave blank to use the mempool service on this server, which is then required. Enter an HTTP(S) URL, such as https://mempool.space, to use another instance instead. Statements need it to be running; missing prices use public mempool.space only while "Allow fallbacks" is on in Settings.': 8,
  'Enter an HTTP or HTTPS URL without credentials, a query or a fragment.': 9,
  'Log Level': 10,
  Error: 11,
  Warning: 12,
  Info: 13,
  Debug: 14,
  Trace: 15,

  // actions/setPassword.ts, init/watchPassword.ts
  'Set Password': 16,
  'Generate a new random password for the web interface. Replaces any existing password.': 17,
  'This replaces the current password, and the old one stops working.': 18,
  'Web Interface Credentials': 19,
  'Your browser asks for these when you open the web interface.': 20,
  Username: 21,
  Password: 22,
  'Set a password before using Bitcoin Control Center': 23,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
