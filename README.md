<p align="center">
  <img src="icon.svg" alt="Bitcoin Control Center Logo" width="21%">
</p>

# Bitcoin Control Center on StartOS

> Everything not listed in this document should behave the same as upstream
> Bitcoin Control Center. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Bitcoin Control Center](https://github.com/hoseki-inc/bitcoin-control-center) is privacy-first Bitcoin accounting: it tracks balances across hardware wallets, watch-only accounts, exchanges and ETFs, and produces proof-of-ownership statements. This package runs its server, Sentinel, which also serves the web app, against the Electrs and mempool services on the same StartOS server.

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

| Item          | Value                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| Image         | `ghcr.io/hoseki-inc/bitcoin-control-center`, upstream unmodified          |
| Architectures | x86_64, aarch64                                                          |
| Entrypoint    | Overridden: `node --enable-source-maps /app/dist/cli.js`, without the image's tini wrapper, since StartOS reaps orphaned processes itself |
| User          | The image's non-root `node` user                                         |

One subcontainer, `sentinel`, runs two steps in order: `data-owner`, a short root `chown` of `/data` to `node`, then the `primary` daemon, Sentinel itself.

## Volume and Data Layout

All state lives on one volume, mounted read-write at `/data` (`DATA_DIR`).

| Path on `main`        | Contents                                                                 |
| --------------------- | ------------------------------------------------------------------------ |
| `/data` (root)        | Sentinel's embedded SQLite database and the local key that encrypts saved exchange credentials |
| `/data/start9/config.yaml` | Settings written by the Configure action                            |

StartOS creates and restores the volume as root. The `data-owner` step hands everything under `/data` to the `node` user on every start, so a restored or hand-copied file is never left unwritable.

## File Models

The package owns one file, `start9/config.yaml` on the `main` volume, in YAML.

- **Seeding:** none. On a new install the file does not exist until the Configure action first runs, and both keys use their defaults until then. Installs updated from earlier versions keep the file they already had.
- **Writer:** only the Configure action, which merges its input into the file, so keys it does not manage survive.
- **Keys:** `mempool-url` (an HTTP(S) URL, or null to discover the local mempool) and `log-level` (`error`, `warn`, `info`, `debug` or `trace`; default `info`). An invalid value reads as its default rather than stopping the service.
- **Hand edits:** survive, and take effect on the next start. The package re-asserts nothing in this file.

Everything else reaches Sentinel as environment variables that the package sets on every start, so they cannot be overridden by hand: `ELECTRUM_HOST`, `ELECTRUM_PORT`, `ELECTRUM_PROTOCOL` (`tcp`), `MEMPOOL_API_URL`, `SENTINEL_ALLOWED_HOSTS`, `BITCOIN_NETWORK` (`mainnet`) and `LOG_LEVEL`. Electrum server settings saved in the app itself would take precedence over the Electrum variables, but the web app only offers those settings on desktop.

## Dependencies

Both dependencies are required and must be running. Neither mounts a volume; both are reached over the internal StartOS bridge.

| Dependency | Health checks     | Why it is needed                                                                 |
| ---------- | ----------------- | -------------------------------------------------------------------------------- |
| Electrs    | `electrs`, `sync` | Address balances and transaction history over the Electrum protocol, plaintext on the bridge |
| mempool    | `webui`           | Historical BTC prices and transaction details for statements, through its web UI's API proxy |

StartOS shows Electrs as unmet while it is still indexing, because its `sync` check is not yet passing. While Electrs is not installed at all, Sentinel is pointed at an address in its own container that nothing answers, so it can never fall back to another Electrum server on the same machine. When mempool is not installed, or the Configure action names another URL, statements use that URL or public `mempool.space` instead.

## Network Access and Interfaces

One interface serves both the web app and Sentinel's API.

| Interface id | Type | Port | Protocol | Purpose                                   |
| ------------ | ---- | ---- | -------- | ----------------------------------------- |
| `main`       | ui   | 3400 | HTTP     | The Bitcoin Control Center web app and API |

Sentinel accepts requests only for the addresses StartOS has enabled for this interface. The package passes that list as `SENTINEL_ALLOWED_HOSTS` and restarts Sentinel whenever it changes, so turning an address on or off takes effect within a restart.

## Installation and First-Run Flow

There is no setup step in StartOS: no generated credentials, no wizard and no tasks. Install Electrs and mempool, then start the service. Bitcoin Control Center has no login; anyone who can reach an enabled address can use it, so enable only addresses you trust.

On the first start, Sentinel creates its database and encryption key on the `main` volume. Self-custody accounts begin synchronizing once Electrs has finished indexing.

## Actions

One action, available in any service state.

**Configure.** Run it to point statements at a different mempool instance, or to raise logging while diagnosing a problem. It changes `start9/config.yaml` only. Saving restarts Sentinel within seconds, which briefly interrupts the web app. Safe to repeat; saving the same values changes nothing.

## Tasks

None. The package never raises a task, so the service's ordinary controls are always available.

## Health Checks

One check, shown as **Web Interface**.

| Check     | Probes                              | Failure means                                                                 |
| --------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| `primary` | Whether Sentinel listens on port 3400 | Sentinel exited or has not started. It waits for Electrs to answer before it starts listening, so a check that stays failing while Electrs is stopped, missing or indexing is expected and clears on its own once Electrs is ready. Otherwise, check the logs. |

## Backups and Restore

The whole `main` volume is copied file by file (`ofVolumes`). That includes the database, the encryption key for saved exchange credentials and `start9/config.yaml`, so they always restore together. Nothing is excluded.

A restored instance needs nothing re-entered. On its first start, `data-owner` fixes file ownership, and accounts resume synchronizing from Electrs.

## Limitations and Differences

1. **Mainnet only.** The package always runs Sentinel on Bitcoin mainnet.
2. **Electrs only.** Balances and history always come from the Electrs service on this server; the desktop app's choice of Electrum server is not offered here.
3. **The web app is unavailable while Electrs is not ready.** Sentinel waits for Electrs before it serves anything, so while Electrs is stopped, missing or still indexing, the web app does not load.
4. **No login.** Access is limited only by which StartOS addresses are enabled.

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
startos_managed_env_vars:
  - ELECTRUM_HOST
  - ELECTRUM_PORT
  - ELECTRUM_PROTOCOL
  - MEMPOOL_API_URL
  - SENTINEL_ALLOWED_HOSTS
  - BITCOIN_NETWORK
  - LOG_LEVEL
dependencies: [electrs, mempool]
interfaces:
  main: { type: ui, port: 3400 }
actions:
  - configure
tasks: []
health_checks:
  - primary
```
