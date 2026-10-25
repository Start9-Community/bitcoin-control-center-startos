import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Records that the Set PIN action ran. Sentinel keeps the PIN itself, hashed, in its own database.
export const pinJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'start9/pin.json' },
  z.looseObject({ pinSetAt: z.number().nullable().catch(null) }),
)
