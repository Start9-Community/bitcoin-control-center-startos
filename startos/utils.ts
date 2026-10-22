export const uiPort = 3400

/** Host id and port of the Sentinel web interface binding. */
export const uiHostId = 'ui'

/**
 * Electrs host id and plaintext Electrum port. electrs-startos binds port 50001
 * under host `electrum`; it is not an npm dependency here, so the id is written out.
 */
export const electrsHostId = 'electrum'
export const electrsPort = 50001

/** Mempool web UI host id and port, from mempool-startos (host `main`, port 8080). */
export const mempoolHostId = 'main'
export const mempoolPort = 8080

export const uiUsername = 'admin'

/** The image's non-root user, which owns the data folder. */
export const appUser = 'node'
