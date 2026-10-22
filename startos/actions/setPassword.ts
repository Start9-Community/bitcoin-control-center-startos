import { utils } from '@start9labs/start-sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { uiUsername } from '../utils'

export const setPassword = sdk.Action.withoutInput(
  'set-password',

  async ({ effects }) => ({
    name: i18n('Set Password'),
    description: i18n(
      'Generate a new random password for the web interface. Replaces any existing password.',
    ),
    warning: (await storeJson.read((s) => s.uiPassword).const(effects))
      ? i18n(
          'This replaces the current password, and the old one stops working.',
        )
      : null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const uiPassword = utils.getDefaultString({
      charset: 'a-z,A-Z,0-9',
      len: 32,
    })
    await storeJson.merge(effects, { uiPassword })

    return {
      version: '1',
      title: i18n('Web Interface Credentials'),
      message: i18n(
        'Your browser asks for these when you open the web interface.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: uiUsername,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: uiPassword,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
