import { setPin } from '../actions/setPin'
import { pinJson } from '../fileModels/pin.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Fresh installs, and installs updated from before PINs, stop here until the owner sets one.
export const requirePin = sdk.setupOnInit(async (effects) => {
  if ((await pinJson.read((p) => p.pinSetAt).const(effects)) == null) {
    await sdk.action.createOwnTask(effects, setPin, 'critical', {
      reason: i18n('Set a PIN before using Bitcoin Control Center'),
    })
  }
})
