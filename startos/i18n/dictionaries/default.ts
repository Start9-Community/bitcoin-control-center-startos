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

  // actions/setPin.ts, init/requirePin.ts
  'Set PIN': 16,
  'Choose the 6-digit PIN you’ll use to open Bitcoin Control Center. Running this again replaces it and signs everyone out.': 17,
  PIN: 18,
  'Confirm PIN': 19,
  'Use exactly 6 digits.': 20,
  'The PINs don’t match.': 21,
  'Set a PIN before using Bitcoin Control Center': 22,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
