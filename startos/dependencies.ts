import { configYaml } from './fileModels/config.yaml'
import { electrsDescription, mempoolDescription } from './manifest/i18n'
import { sdk } from './sdk'

/** Electrs supplies balances and history. */
const electrs = sdk.Dependency.required('electrs', {
  description: electrsDescription,
  metadata: {
    title: 'Electrs',
    icon: 'https://raw.githubusercontent.com/Start9Labs/electrs-startos/refs/heads/master/icon.svg',
  },
  // The range mempool's wrapper requires for the same plaintext Electrum bridge lookup.
  versionRange: '>=0.11.1:11',
  kind: 'running',
  healthChecks: ['electrs', 'sync'],
})

/** Mempool supplies statement prices and transaction details, unless Configure names another instance. */
const mempool = sdk.Dependency.optional('mempool', {
  description: mempoolDescription,
  metadata: {
    title: 'Mempool',
    icon: 'https://raw.githubusercontent.com/Start9Labs/mempool-startos/refs/heads/master/icon.svg',
  },
  // Its wrapper source at this release exports the web UI under host `main`.
  versionRange: '>=3.3.1:10',
  kind: 'running',
  healthChecks: ['webui'],
  enabled: async ({ effects }) =>
    !(await configYaml.read((c) => c['mempool-url']).const(effects)),
})

export const dependencies = sdk.Dependencies.of()
  .addDependency(electrs)
  .addDependency(mempool)
