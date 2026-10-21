# Updating the upstream version

This package runs the image that [hoseki-inc/bitcoin-control-center](https://github.com/hoseki-inc/bitcoin-control-center) publishes as `ghcr.io/hoseki-inc/bitcoin-control-center` in its Release 3 workflow.

## Determining the upstream version

```sh
gh release view -R hoseki-inc/bitcoin-control-center --json tagName -q .tagName
```

Upstream tags look like `v1.0.0_0` (StartOS version `1.0.0:0`). The image tag drops the revision when it is 0 and writes it after a hyphen otherwise: `v1.0.0_0` is image `1.0.0`, `v1.0.0_1` is image `1.0.0-1`. The release notes print the exact `image:` line.

## Applying the bump

1. Set `dockerTag` in `startos/manifest/index.ts` to `ghcr.io/hoseki-inc/bitcoin-control-center:<image tag>`.
2. Set `version` in `startos/versions/current.ts` to the matching StartOS version, and replace `releaseNotes` in every locale.
3. A migration belongs to the version that introduced it: if the outgoing `current.ts` carries one, move it to its own `startos/versions/v<version>.ts` first and list it in `startos/versions/index.ts` (see Start9's versions guide).
