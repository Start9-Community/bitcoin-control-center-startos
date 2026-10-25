import { resolveElectrs } from './electrs'
import { configYaml } from './fileModels/config.yaml'
import { pinJson } from './fileModels/pin.json'
import { i18n } from './i18n'
import { resolveMempoolUrl } from './mempool'
import { sdk } from './sdk'
import { appUser, uiHostId, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Bitcoin Control Center'))

  // The SDK resolves only enabled addresses. Watching the resulting hostnames
  // restarts Sentinel when an interface is enabled, disabled, or changes IP.
  const allowedHosts = await sdk.host
    .getOwn(effects, uiHostId, (host) =>
      [
        ...new Set(
          host?.bindings[uiPort]?.interfaces.main?.addressInfo.hostnames.map(
            ({ hostname }) => hostname,
          ) ?? [],
        ),
      ]
        .sort()
        .join(','),
    )
    .const()

  const config = await configYaml.read().const(effects)
  // Set PIN writes this file after leaving the new PIN for Sentinel, so watching it restarts Sentinel to apply it.
  await pinJson.read().const(effects)
  const mempoolUrl = await resolveMempoolUrl(effects, config?.['mempool-url'])
  const electrs = await resolveElectrs(effects)

  const sentinel = sdk.SubContainer.of(
    effects,
    { imageId: 'main' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'sentinel',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('data-owner', {
      subcontainer: sentinel,
      // The image runs Sentinel as its non-root user, but StartOS creates the volume,
      // and restores it, as root.
      exec: {
        command: ['chown', '-R', `${appUser}:${appUser}`, '/data'],
        user: 'root',
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: sentinel,
      exec: {
        command: ['node', '--enable-source-maps', '/app/dist/cli.js'],
        env: {
          SENTINEL_ALLOWED_HOSTS: allowedHosts,
          MEMPOOL_API_URL: mempoolUrl,
          ELECTRUM_HOST: electrs.host,
          ELECTRUM_PORT: electrs.port,
          ELECTRUM_PROTOCOL: 'tcp',
          BITCOIN_NETWORK: 'mainnet',
          LOG_LEVEL: config?.['log-level'] ?? 'info',
          // Every route needs the PIN, set from the Set PIN action and accepted over HTTPS or Tor only.
          SENTINEL_PIN: 'startos',
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n(
              'Bitcoin Control Center is running and responding.',
            ),
            errorMessage: i18n('Bitcoin Control Center is not responding.'),
          }),
      },
      requires: ['data-owner'],
    })
})
