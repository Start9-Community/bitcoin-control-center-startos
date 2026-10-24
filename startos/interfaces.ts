import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiHostId, uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const uiMulti = sdk.MultiHost.of(effects, uiHostId)
  const uiOrigin = await uiMulti.bindPort(uiPort, { protocol: 'http' })

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
