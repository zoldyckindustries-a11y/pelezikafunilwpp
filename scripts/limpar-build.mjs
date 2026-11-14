// Apaga a saída de build antes de compilar.
//
// O Cloudflare restaura um "build output cache" entre deploys, e o
// `next build` estoura com "Invariant: no direct app page entry found for
// /_not-found" quando roda sobre um .next de uma compilação anterior.
// Mesmo comportamento acontece localmente ao buildar duas vezes seguidas.
//
// Em Node em vez de `rm -rf` para funcionar igual no Windows e no Linux.

import { rmSync } from "node:fs";

for (const pasta of [".next", ".open-next"]) {
  rmSync(pasta, { recursive: true, force: true });
}

console.log("[limpar-build] .next e .open-next removidos");
