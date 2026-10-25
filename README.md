<p align="center">
  <img src="icon.svg" alt="Bitcoin Control Center Logo" width="21%">
</p>

# Bitcoin Control Center on StartOS

> Everything not listed in this document should behave the same as upstream
> Bitcoin Control Center. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Bitcoin Control Center is privacy-first Bitcoin accounting: it tracks balances across hardware wallets, watch-only accounts, exchanges and ETFs, and produces proof-of-ownership statements. This package runs its server, Sentinel, which also serves the web app, against the Electrs and mempool services on the same StartOS server.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs the upstream image unmodified: the same multi-arch image the Umbrel package uses, published to GHCR by the upstream release.

| Item          | Value                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Image         | `ghcr.io/hoseki-inc/bitcoin-control-center`, upstream unmodified                                                                          |
| Architectures | x86_64, aarch64                                                                                                                           |
| Entrypoint    | Overridden: `node --enable-source-maps /app/dist/cli.js`, without the image's tini wrapper, since StartOS reaps orphaned processes itself |
| User          | The image's non-root `node` user                                                                                                          |

One subcontainer, `sentinel`, runs two steps in order: `data-owner`, a short root `chown` of `/data` to `node`, then the `primary` daemon, Sentinel itself.

## Volume and Data Layout

All state lives on one volume, mounted read-write at `/data` (`DATA_DIR`).

| Path on `main`             | Contents                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `/data` (root)             | Sentinel's embedded SQLite database and the local key that encrypts saved exchange credentials |
| `/data/start9/config.yaml` | Settings written by the Configure action                                                       |
| `/data/start9/pin.json`    | When the Set PIN action last ran; the PIN itself is only a hash in Sentinel's database         |

StartOS creates and restores the volume as root. The `data-owner` step hands everything under `/data` to the `node` user on every start, so a restored or hand-copied file is never left unwritable.

## File Models

The package owns two files on the `main` volume.

### `start9/config.yaml`

- **Seeding:** none. On a new install the file does not exist until the Configure action first runs, and both keys use their defaults until then. Installs updated from earlier versions keep the file they already had.
- **Writer:** only the Configure action, which merges its input into the file, so keys it does not manage survive.
- **Keys:** `mempool-url` (an HTTP(S) URL, or null to use the local mempool, which makes mempool a required dependency) and `log-level` (`error`, `warn`, `info`, `debug` or `trace`; default `info`). An invalid value reads as its default rather than stopping the service.
- **Hand edits:** survive, and take effect on the next start. The package re-asserts nothing in this file.

### `start9/pin.json`

- **Seeding:** none. Until the Set PIN action first runs, the file does not exist and a critical task blocks startup.
- **Writer:** only the Set PIN action, which records `pinSetAt` after leaving the hashed PIN in `/data/new-pin` for Sentinel to apply.
- **Keys:** `pinSetAt`, a timestamp. The PIN never appears here.
- **Hand edits:** survive. Sentinel restarts whenever the file changes; removing `pinSetAt` raises the critical task again but leaves the current PIN in place.

Everything else reaches Sentinel as environment variables that the package sets on every start, so they cannot be overridden by hand: `ELECTRUM_HOST`, `ELECTRUM_PORT`, `ELECTRUM_PROTOCOL` (`tcp`), `MEMPOOL_API_URL`, `SENTINEL_ALLOWED_HOSTS`, `BITCOIN_NETWORK` (`mainnet`), `LOG_LEVEL` and `SENTINEL_PIN` (`startos`). Electrum server settings saved in the app itself would take precedence over the Electrum variables, but the web app only offers those settings on desktop.

## Dependencies

Electrs is always required. mempool is required only while the Configure action's Mempool URL Override is blank; setting it removes the dependency. Both must be running when required. Neither mounts a volume; both are reached over the internal StartOS bridge.

| Dependency | Required                     | Health checks     | Why it is needed                                                                             |
| ---------- | ---------------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| Electrs    | Always                       | `electrs`, `sync` | Address balances and transaction history over the Electrum protocol, plaintext on the bridge |
| mempool    | While no override URL is set | `webui`           | Historical BTC prices and transaction details for statements, through its web UI's API proxy |

StartOS shows Electrs as unmet while it is still indexing, because its `sync` check is not yet passing. While Electrs is not installed at all, Sentinel is pointed at an address in its own container that nothing answers, so it can never fall back to another Electrum server on the same machine. With an override set, statements use that URL; with none set and mempool not installed, they use public `mempool.space`.

## Network Access and Interfaces

One interface serves both the web app and Sentinel's API.

| Interface id | Type | Port | Protocol | Purpose                                    |
| ------------ | ---- | ---- | -------- | ------------------------------------------ |
| `main`       | ui   | 3400 | HTTP     | The Bitcoin Control Center web app and API |

Sentinel requires the PIN: every API route except sign-in and health needs a session started with it, and it accepts the PIN only over HTTPS or a Tor onion address. Wrong PINs are delayed: five free tries, then 30 seconds doubling up to an hour, counted across all devices. Sessions end when the tab closes or locks, on Sign out everywhere, and whenever Sentinel restarts.

Sentinel also accepts requests only for the addresses StartOS has enabled for this interface. The package passes that list as `SENTINEL_ALLOWED_HOSTS` and restarts Sentinel whenever it changes, so turning an address on or off takes effect within a restart.

## Installation and First-Run Flow

Install Electrs, and mempool unless you will point the Configure action at another instance. A critical **Set PIN** task blocks startup until the owner chooses a 6-digit PIN, on a fresh install and on an install updated from a version without PINs. Then start the service, open the web interface at an `https://` or `.onion` address and enter the PIN.

On the first start, Sentinel creates its database and encryption key on the `main` volume. Self-custody accounts begin synchronizing once Electrs has finished indexing.

## Actions

Two actions, both available in any service state.

**Set PIN.** Asks for a 6-digit PIN twice and hands it to Sentinel, which stores it hashed. Run it at first install, and again to replace a forgotten PIN; each run signs everyone out and keeps all data. It writes `start9/pin.json`, which restarts Sentinel to apply the PIN.

**Configure.** Run it to point statements at a different mempool instance, or to raise logging while diagnosing a problem. It changes `start9/config.yaml`, and setting or clearing the override removes or restores the mempool dependency. Saving restarts Sentinel within seconds, which briefly interrupts the web app. Safe to repeat; saving the same values changes nothing.

## Tasks

One task, **Set PIN**, of `critical` severity. The package raises it while `start9/pin.json` records no PIN: on a fresh install, or on an install updated from a version without PINs. It blocks startup until the Set PIN action runs, which clears it.

## Health Checks

One check, shown as **Web Interface**.

| Check     | Probes                                | Failure means                                                                                                                                                                                                                                                  |
| --------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primary` | Whether Sentinel listens on port 3400 | Sentinel exited or has not started. It waits for Electrs to answer before it starts listening, so a check that stays failing while Electrs is stopped, missing or indexing is expected and clears on its own once Electrs is ready. Otherwise, check the logs. |

## Backups and Restore

The whole `main` volume is copied file by file (`ofVolumes`). That includes the database, the encryption key for saved exchange credentials, `start9/config.yaml` and `start9/pin.json`, so they always restore together. Nothing is excluded.

A restored instance needs nothing re-entered. On its first start, `data-owner` fixes file ownership, and accounts resume synchronizing from Electrs.

## Limitations and Differences

1. **Mainnet only.** The package always runs Sentinel on Bitcoin mainnet.
2. **Electrs only.** Balances and history always come from the Electrs service on this server; the desktop app's choice of Electrum server is not offered here.
3. **The web app is unavailable while Electrs is not ready.** Sentinel waits for Electrs before it serves anything, so while Electrs is stopped, missing or still indexing, the web app does not load.
4. **One PIN for the whole app.** There are no separate users or profiles; the PIN comes from the Set PIN action.

---

## Quick Reference for AI Consumers

```yaml
package_id: hoseki-sentinel
image: ghcr.io/hoseki-inc/bitcoin-control-center
architectures: [x86_64, aarch64]
subcontainers: [sentinel]
volumes:
  main: /data
file_models:
  - start9/config.yaml
  - start9/pin.json
startos_managed_env_vars:
  - ELECTRUM_HOST
  - ELECTRUM_PORT
  - ELECTRUM_PROTOCOL
  - MEMPOOL_API_URL
  - SENTINEL_ALLOWED_HOSTS
  - BITCOIN_NETWORK
  - LOG_LEVEL
  - SENTINEL_PIN
dependencies:
  electrs: required
  mempool: optional # required while mempool-url is unset
interfaces:
  main: { type: ui, port: 3400 }
auth: sentinel-pin # 6 digits, from set-pin; https or onion only
actions:
  - set-pin
  - configure
tasks:
  - set-pin: critical # while no PIN is set
health_checks:
  - primary
```
