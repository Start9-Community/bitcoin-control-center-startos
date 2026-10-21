import { sdk } from './sdk'

// Sentinel's database, its local encryption material and the StartOS settings all
// live on the main volume, so one copy restores them together.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main'),
)
