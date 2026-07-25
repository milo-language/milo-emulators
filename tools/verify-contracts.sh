#!/usr/bin/env bash
# Static contract gate for the emulator cores. Runs `milo prove` over every .milo carrying
# a requires/ensures/invariant and fails if the verification story gets worse.
#
# What gates:
#   refuted beyond the baseline — a contract, or a call site, the prover can disprove.
#   proven below the floor      — a contract that quietly stopped being discharged.
#   errors above the ceiling    — a translator/solver error means an invalid query.
#
# What does not gate:
#   unknown — rises both when a contract stops being discharged and when previously
#             invisible obligations start being emitted; the tally cannot tell those apart,
#             and the first already trips the proven floor.
#
# CONDITIONAL PROOFS are reported per file. Modular verification lets a proof assume its
# callees' `ensures`, so when a callee's own postcondition is `unknown` the proof holds only
# if that assumption does. 8 of z80's 10 proofs are conditional on `rd`'s "every read yields
# a byte", which is true but sits behind an array index the translator cannot model. Real
# proofs, resting on an unchecked claim — worth seeing, not worth failing over.
#
# BASELINED REFUTATIONS. Every one is a TRUE fact the prover cannot establish, all of the
# same shape: the fact is a struct invariant fixed at a constructor or loader seam, and
# there is no way to state "this field always satisfies P" in the contract language.
#
#   nes/cpu.milo, 12x  prgOffset requires `bankSize <= prg.len`, i.e. the ROM holds at
#                      least one 16 KiB PRG bank. cartridge.milo:61 rejects `prg16k < 1`
#                      and checks the file covers PRG+CHR, so prg.len >= 16384 always —
#                      but that lives in a different function, behind a struct field.
#   nes/ppu.milo,  1x  chrPhys requires `chr.len > 0` for its `% chr.len`. newPpu pads a
#                      CHR-RAM cart (0 banks in the header) up to 8 KiB, so it is never 0.
#
# Retire both with struct invariants. Until then they are documented, not silent.
#
# Usage: tools/verify-contracts.sh [--update]
set -uo pipefail
cd "$(dirname "$0")/.."

MILO="${MILO:-milo}"
UPDATE=0
[ "${1:-}" = "--update" ] && UPDATE=1

# file:proven:failed:errors — proven is a floor, failed and errors are ceilings.
EXPECTED="
genesis/m68k.milo:1:0:0
genesis/render.milo:6:0:0
genesis/z80.milo:10:0:0
nes/cpu.milo:2:12:0
nes/ppu.milo:1:1:0
snes/cpu.milo:1:0:0
snes/ppu.milo:4:0:0
snes/spc.milo:1:0:0
snes/superfx.milo:4:0:0
"

fail=0
actual=""
files=$(grep -rlE '^[[:space:]]*(requires|ensures|invariant)' --include='*.milo' . | sed 's|^\./||' | sort)

if [ -z "$files" ]; then
    echo "no contract-bearing .milo files found — the discovery glob is broken"
    exit 1
fi

for f in $files; do
    out=$("$MILO" prove "$f" --solver=z3 2>&1)
    line=$(echo "$out" | grep -oE 'proven: [0-9]+  failed: [0-9]+  unknown: [0-9]+  errors: [0-9]+')
    if [ -z "$line" ]; then
        echo "FAIL $f: prove produced no tally (compile failure?)"
        echo "$out" | tail -20
        fail=1
        continue
    fi
    p=$(echo "$line" | sed -E 's/.*proven: ([0-9]+).*/\1/')
    fl=$(echo "$line" | sed -E 's/.*failed: ([0-9]+).*/\1/')
    u=$(echo "$line" | sed -E 's/.*unknown: ([0-9]+).*/\1/')
    e=$(echo "$line" | sed -E 's/.*errors: ([0-9]+).*/\1/')
    c=$(echo "$out" | grep -oE '^  [0-9]+ of [0-9]+ proofs are conditional' | grep -oE '^  [0-9]+' | tr -d ' ')
    [ -z "$c" ] && c=0
    printf '%-22s proven %-4s failed %-4s unknown %-4s errors %-4s conditional %s\n' "$f" "$p" "$fl" "$u" "$e" "$c"
    actual="$actual$f:$p:$fl:$e\n"

    exp=$(echo "$EXPECTED" | grep "^$f:" || true)
    if [ -z "$exp" ]; then
        echo "  note: not in the ratchet yet — add '$f:$p:$fl:$e' to EXPECTED"
        [ "$fl" -gt 0 ] && { echo "  FAIL: $fl refuted contract(s) in an untracked file"; fail=1; }
        continue
    fi
    ep=$(echo "$exp" | cut -d: -f2); ef=$(echo "$exp" | cut -d: -f3); ee=$(echo "$exp" | cut -d: -f4)
    [ "$p" -lt "$ep" ] && { echo "  FAIL: proven $p < $ep — a contract stopped being provable"; fail=1; }
    [ "$fl" -gt "$ef" ] && {
        echo "  FAIL: failed $fl > $ef — a NEW contract or call site is refuted:"
        echo "$out" | grep '✗' | sed 's/^/    /'
        fail=1
    }
    [ "$e" -gt "$ee" ] && { echo "  FAIL: errors $e > $ee — new translator/solver error"; fail=1; }
    if [ "$p" != "$ep" ] || [ "$fl" != "$ef" ] || [ "$e" != "$ee" ]; then
        echo "  drift: $ep/$ef/$ee -> $p/$fl/$e (proven/failed/errors) — run --update to lock it in"
    fi
done

if [ "$UPDATE" = "1" ]; then
    echo
    echo "--- EXPECTED (copy into this script) ---"
    printf "%b" "$actual"
    exit 0
fi

[ "$fail" = "0" ] && echo "contract gate: OK"
exit $fail
