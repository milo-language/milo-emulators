// Browser-core conformance check: run the emit-js build of nes/webcore.milo over
// the same ROM and frame count as nes/webParity.milo and require identical
// per-frame framebuffer checksums.
//
// The point is that nothing else tests the JS backend against the emulator. The
// checked-in web/*-core.js is generated, so a compiler change can silently alter
// what the browser build computes and no native test notices.
//
//   bun tools/webParity.ts [path-to-milo-repo]
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MILO_REPO = process.argv[2] ?? join(process.env.HOME!, "git", "milo");
const HERE = join(import.meta.dir, "..");
const FRAMES = 30;
const ROM = join(HERE, "roms", "nes-test-roms", "other", "nestest.nes");

const dir = mkdtempSync(join(tmpdir(), "webparity-"));
try {
  const jsPath = join(dir, "core.js");
  const emit = Bun.spawnSync(
    ["bun", "run", join(MILO_REPO, "src", "main.ts"), "emit-js", join(HERE, "nes", "webcore.milo"), "-o", jsPath],
    { cwd: MILO_REPO },
  );
  if (emit.exitCode !== 0) throw new Error("emit-js failed:\n" + emit.stderr.toString());

  // The emitted module is a script, not an ES module: its functions are plain
  // top-level declarations, so eval it and hand the ones we need back out.
  const src = readFileSync(jsPath, "utf8") + "\n;return {createNes, setButtons, stepFrame};";
  const core = new Function(src)() as {
    createNes: (rom: number[]) => any;
    setButtons: (h: any, b: number) => void;
    stepFrame: (h: any) => void;
  };

  const rom = Array.from(readFileSync(ROM));
  const h = core.createNes(rom);
  const lines: string[] = [];
  for (let frame = 0; frame < FRAMES; frame++) {
    core.setButtons(h, 0);
    core.stepFrame(h);
    // FNV-1a, matching webParity.milo. Math.imul is the wrapping u32 multiply.
    let hash = 2166136261;
    const fb = h.bus.ppu.fb;
    for (let i = 0; i < 61440; i++) hash = Math.imul(hash ^ (fb[i] & 0xff), 16777619) >>> 0;
    lines.push(`${frame} ${hash}`);
  }
  const js = lines.join("\n");

  const nat = Bun.spawnSync(["bun", "run", join(MILO_REPO, "src", "main.ts"), "run", join(HERE, "nes", "webParity.milo")], { cwd: HERE });
  if (nat.exitCode !== 0) throw new Error("native run failed:\n" + nat.stderr.toString());
  const native = nat.stdout.toString().trim();

  if (native === js) {
    console.log(`webParity: ${FRAMES} frames identical (native == emit-js)`);
  } else {
    const n = native.split("\n"), j = js.split("\n");
    const bad = n.findIndex((l, i) => l !== j[i]);
    console.error(`webParity: MISMATCH at frame ${bad}\n  native: ${n[bad]}\n  js:     ${j[bad]}`);
    process.exit(1);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
