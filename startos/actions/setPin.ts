import { pinJson } from '../fileModels/pin.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

const pinField = (name: string) =>
  sdk.Value.text({
    name,
    required: true,
    default: null,
    masked: true,
    minLength: 6,
    maxLength: 6,
    inputmode: 'tel',
    patterns: [
      { regex: '^[0-9]{6}$', description: i18n('Use exactly 6 digits.') },
    ],
  })

const inputSpec = sdk.InputSpec.of({
  pin: pinField(i18n('PIN')),
  confirm: pinField(i18n('Confirm PIN')),
})

export const setPin = sdk.Action.withInput(
  'set-pin',
  {
    name: i18n('Set PIN'),
    description: i18n(
      'Choose the 6-digit PIN you’ll use to open Bitcoin Control Center. Running this again replaces it and signs everyone out.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  // Never prefill a PIN.
  async () => null,
  async ({ effects, input }) => {
    if (input.pin !== input.confirm) {
      throw new Error(i18n('The PINs don’t match.'))
    }
    // Sentinel hashes the PIN, read from stdin so it never appears in a command line, and applies it when it
    // next starts. It runs as root because, before the first start, StartOS has left the volume root-owned;
    // data-owner hands the request file to node before Sentinel reads it.
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'main' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'set-pin',
      (subcontainer) =>
        subcontainer.execFail(['node', '/app/dist/cli.js', 'set-pin'], {
          env: { DATA_DIR: '/data' },
          input: input.pin,
          user: 'root',
        }),
    )
    // main watches this file, so writing it restarts Sentinel to apply the PIN.
    await pinJson.merge(effects, { pinSetAt: Date.now() })
    return null
  },
)
