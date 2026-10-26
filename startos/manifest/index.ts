import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  // Existing installs update in place only under this ID, so it outlives the display name.
  id: 'hoseki-sentinel',
  title: 'Bitcoin Control Center',
  license: 'Apache-2.0',
  packageRepo:
    'https://github.com/Start9-Community/bitcoin-control-center-startos',
  upstreamRepo: 'https://github.com/hoseki-inc/bitcoin-control-center',
  marketingUrl: 'https://www.bitcoincontrolcenter.com',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      // The same image the Umbrel package runs, published by the upstream release.
      source: { dockerTag: 'ghcr.io/hoseki-inc/bitcoin-control-center:1.2.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
