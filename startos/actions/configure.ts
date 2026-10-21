import { configYaml } from '../fileModels/config.yaml'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const inputSpec = sdk.InputSpec.of({
  'mempool-url': sdk.Value.text({
    name: i18n('Mempool URL Override'),
    description: i18n(
      'Leave blank to use the installed mempool service, or public mempool.space when it is not installed. Enter an HTTP(S) URL to use another instance. Statements need it to be running; missing prices use public mempool.space only while "Allow fallbacks" is on in Settings.',
    ),
    required: false,
    default: null,
    patterns: [
      {
        regex: '^https?://[^\\s@?#]+$',
        description: i18n(
          'Enter an HTTP or HTTPS URL without credentials, a query or a fragment.',
        ),
      },
    ],
  }),
  'log-level': sdk.Value.select({
    name: i18n('Log Level'),
    default: 'info',
    values: {
      error: i18n('Error'),
      warn: i18n('Warning'),
      info: i18n('Info'),
      debug: i18n('Debug'),
      trace: i18n('Trace'),
    },
  }),
})

export const configure = sdk.Action.withInput(
  'configure',
  {
    name: i18n('Configure'),
    description: i18n('Configure the mempool source and application logging.'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  async ({ effects }) => configYaml.read().once(),
  async ({ effects, input }) => {
    await configYaml.merge(effects, input)
    return null
  },
)
