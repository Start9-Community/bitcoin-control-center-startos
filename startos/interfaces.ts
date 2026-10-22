import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiHostId, uiPort, uiUsername } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const password = await storeJson.read((s) => s.uiPassword).const(effects)

  const uiMulti = sdk.MultiHost.of(effects, uiHostId)
  const uiOrigin = await uiMulti.bindPort(uiPort, {
    protocol: 'http',
    addSsl: password
      ? {
          auth: {
            type: 'basic',
            credentials: [{ username: uiUsername, password }],
            realm: 'Bitcoin Control Center',
          },
        }
      : undefined,
  })

  const webInterface = sdk.createInterface(effects, {
    name: i18n('Web Interface'),
    id: 'main',
    description: i18n('The Bitcoin Control Center web interface.'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await uiOrigin.export([webInterface])]
})
