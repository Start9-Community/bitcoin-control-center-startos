# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

- **Keep the package ID `hoseki-sentinel`.** Installs only update in place under the same ID; a new ID is a separate app with empty data. The display name is Bitcoin Control Center, and the config stays at `start9/config.yaml` for the same reason.
- **The image is upstream's, unmodified.** `ghcr.io/hoseki-inc/bitcoin-control-center` is the same image the Umbrel package runs. Anything StartOS needs goes in `startos/`, not in a wrapper Dockerfile; a change the image itself needs belongs upstream, where Umbrel shares it.
- **The image tag is the Umbrel-style version**, `1.0.0` for `1.0.0:0` and `1.0.0-1` for revision 1. See `UPDATING.md`.
- **`data-owner` must stay ahead of `primary`.** The image runs as `node`, but StartOS creates and restores the volume as root.
- **Host and interface ids feed the host allowlist.** `main.ts` reads interface `main` on host `ui`, port 3400; renaming either silently empties `SENTINEL_ALLOWED_HOSTS`.
- **Dependency host ids are written out**, because electrs-startos and mempool-startos aren't npm dependencies here: Electrs is host `electrum` on 50001 and mempool is host `main` on 8080, both plaintext on the bridge (`ssl: false`).
- **Don't add `fallbackPort` to the Electrs lookup.** Port 50001 on the server can belong to Fulcrum; while Electrs is absent, Sentinel points at its own loopback instead.
