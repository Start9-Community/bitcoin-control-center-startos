import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.0.0:0',
  releaseNotes: {
    en_US: 'First release on the Start9 Community Registry.',
    es_ES: 'Primera versión en el registro de la comunidad de Start9.',
    de_DE: 'Erste Version in der Start9-Community-Registry.',
    pl_PL: 'Pierwsze wydanie w rejestrze społeczności Start9.',
    fr_FR: 'Première version sur le registre communautaire de Start9.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
