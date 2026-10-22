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
| `/data/start9/store.json`  | The web interface password, written by the Set Password action                                 |

StartOS creates and restores the volume as root. The `data-owner` step hands everything under `/data` to the `node` user on every start, so a restored or hand-copied file is never left unwritable.

## File Models

The package owns two files on the `main` volume.

### `start9/config.yaml`

- **Seeding:** none. On a new install the file does not exist until the Configure action first runs, and both keys use their defaults until then. Installs updated from earlier versions keep the file they already had.
- **Writer:** only the Configure action, which merges its input into the file, so keys it does not manage survive.
- **Keys:** `mempool-url` (an HTTP(S) URL, or null to use the local mempool, which makes mempool a required dependency) and `log-level` (`error`, `warn`, `info`, `debug` or `trace`; default `info`). An invalid value reads as its default rather than stopping the service.
- **Hand edits:** survive, and take effect on the next start. The package re-asserts nothing in this file.

### `start9/store.json`

- **Seeding:** none. Until the Set Password action first runs, the file does not exist and a critical task blocks startup.
- **Writer:** only the Set Password action, which stores a generated `uiPassword`.
- **Keys:** `uiPassword`, kept in cleartext because the StartOS reverse proxy checks it on each request. It never reaches Sentinel.
- **Hand edits:** survive and apply immediately; the proxy re-reads the password whenever the file changes. Removing the key raises the critical task again.

Everything else reaches Sentinel as environment variables that the package sets on every start, so they cannot be overridden by hand: `ELECTRUM_HOST`, `ELECTRUM_PORT`, `ELECTRUM_PROTOCOL` (`tcp`), `MEMPOOL_API_URL`, `SENTINEL_ALLOWED_HOSTS`, `BITCOIN_NETWORK` (`mainnet`) and `LOG_LEVEL`. Electrum server settings saved in the app itself would take precedence over the Electrum variables, but the web app only offers those settings on desktop.

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

Bitcoin Control Center has no login of its own, so the StartOS reverse proxy gates the interface with HTTP basic auth: username `admin` and the password from the Set Password action. The browser shows its own sign-in prompt, and a request without the credentials gets `401` before it reaches Sentinel. The proxy enforces it on every TLS address, LAN and public domains alike; a plain-HTTP request to a domain is redirected to HTTPS first.

The gate does not cover the interface's plain-HTTP port on the internal StartOS bridge, which other services on the same server, and a Tor onion address added without SSL, reach directly.

Sentinel also accepts requests only for the addresses StartOS has enabled for this interface. The package passes that list as `SENTINEL_ALLOWED_HOSTS` and restarts Sentinel whenever it changes, so turning an address on or off takes effect within a restart.

## Installation and First-Run Flow

Install Electrs, and mempool unless you will point the Configure action at another instance. A critical **Set Password** task blocks startup until it runs; it returns the `admin` credentials once. Then start the service and sign in when the browser asks.

On the first start, Sentinel creates its database and encryption key on the `main` volume. Self-custody accounts begin synchronizing once Electrs has finished indexing.

## Actions

Two actions, both available in any service state.

**Set Password.** Generates a new random 32-character password for the web interface and returns it with the username `admin`. Run it at first install, and again to rotate the password or recover a lost one. It changes `start9/store.json` only and applies without a restart; the old password stops working at once. Each run replaces the password, so the UI asks for confirmation once one exists.

**Configure.** Run it to point statements at a different mempool instance, or to raise logging while diagnosing a problem. It changes `start9/config.yaml`, and setting or clearing the override removes or restores the mempool dependency. Saving restarts Sentinel within seconds, which briefly interrupts the web app. Safe to repeat; saving the same values changes nothing.

## Tasks

One task, **Set Password**, of `critical` severity. The package raises it while `start9/store.json` holds no password: on a fresh install, or on an existing install that has never set one. It blocks startup until the Set Password action runs, which clears it.

## Health Checks

One check, shown as **Web Interface**.

| Check     | Probes                                | Failure means                                                                                                                                                                                                                                                  |
| --------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `primary` | Whether Sentinel listens on port 3400 | Sentinel exited or has not started. It waits for Electrs to answer before it starts listening, so a check that stays failing while Electrs is stopped, missing or indexing is expected and clears on its own once Electrs is ready. Otherwise, check the logs. |

## Backups and Restore

The whole `main` volume is copied file by file (`ofVolumes`). That includes the database, the encryption key for saved exchange credentials, `start9/config.yaml` and the web interface password in `start9/store.json`, so they always restore together. Nothing is excluded.

A restored instance needs nothing re-entered. On its first start, `data-owner` fixes file ownership, and accounts resume synchronizing from Electrs.

## Limitations and Differences

1. **Mainnet only.** The package always runs Sentinel on Bitcoin mainnet.
2. **Electrs only.** Balances and history always come from the Electrs service on this server; the desktop app's choice of Electrum server is not offered here.
3. **The web app is unavailable while Electrs is not ready.** Sentinel waits for Electrs before it serves anything, so while Electrs is stopped, missing or still indexing, the web app does not load.
4. **Login is StartOS basic auth, not an app account.** There is one user, `admin`, and the password comes from the Set Password action.
5. **The internal plain-HTTP port is not password-protected.** Other services on the server, and an onion address added without SSL, reach the web app without the password.

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
  - start9/store.json
startos_managed_env_vars:
  - ELECTRUM_HOST
  - ELECTRUM_PORT
  - ELECTRUM_PROTOCOL
  - MEMPOOL_API_URL
  - SENTINEL_ALLOWED_HOSTS
  - BITCOIN_NETWORK
  - LOG_LEVEL
dependencies:
  electrs: required
  mempool: optional # required while mempool-url is unset
interfaces:
  main: { type: ui, port: 3400 }
auth: startos-basic-auth # user admin, password from set-password
actions:
  - set-password
  - configure
tasks:
  - set-password: critical # while no password is stored
health_checks:
  - primary
```
