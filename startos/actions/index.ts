import { sdk } from '../sdk'
import { configure } from './configure'
import { setPassword } from './setPassword'

export const actions = sdk.Actions.of()
  .addAction(setPassword)
  .addAction(configure)
