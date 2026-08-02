"use strict";

// runtime
const __out = [];
function __print(s) { __out.push(String(s)); }
function __flush() { if (__out.length === 0) return; const text = __out.join(''); __out.length = 0; if (typeof process !== 'undefined') process.stdout.write(__obytes(text)); else if (typeof console !== 'undefined') console.log(__otext(text)); }
function __eprint(s) { if (typeof process !== 'undefined' && process.stderr) process.stderr.write(__obytes(String(s))); else if (typeof console !== 'undefined') console.error(__otext(String(s))); }
function __assert(cond, msg) { if (!cond) throw new Error('assertion failed: ' + msg); }
function __trap(m) { const e = new Error('milo: ' + m); e.__milo_trap = true; throw e; }
function __ovf(v, lo, hi) { if (!(v >= lo && v <= hi)) __trap('runtime error: integer overflow'); return v; }
function __idiv(a, b) { if (b === 0) __trap('division by zero'); return Math.trunc(a / b); }
function __irem(a, b) { if (b === 0) __trap('division by zero'); return a % b; }
function __idx(a, i) { if (!(i >= 0 && i < a.length)) __trap('array index out of bounds: ' + i + '/' + a.length); return a[i]; }
function __idxSet(a, i, v) { if (!(i >= 0 && i < a.length)) __trap('array index out of bounds: ' + i + '/' + a.length); a[i] = v; return v; }
function __sh(s, bits) { if (!(s >= 0 && s < bits)) __trap('shift amount out of range (>= ' + bits + ')'); return s; }
function __unwrap(o) { if (o.tag !== 0) __trap('unwrap called on ' + (o.data === undefined ? 'None' : 'Err')); return o.data[0]; }
function __obytes(s) { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xFF; return u; }
function __otext(s) { return typeof TextDecoder !== 'undefined' ? new TextDecoder().decode(__obytes(s)) : s; }
function __sbyte(s, i) { if (!(i >= 0 && i < s.length)) __trap('string index out of bounds: ' + i + '/' + s.length); return s.charCodeAt(i); }
function __gfmt(x, p) { if (x === 0) return Object.is(x, -0) ? '-0' : '0'; const es = x.toExponential(p - 1); const ei = es.indexOf('e'); const e = Number(es.slice(ei + 1)); if (e < -4 || e >= p) { let m = es.slice(0, ei); if (m.indexOf('.') >= 0) m = m.replace(/0+$/, '').replace(/\.$/, ''); let ea = String(Math.abs(e)); if (ea.length < 2) ea = '0' + ea; return m + 'e' + (e < 0 ? '-' : '+') + ea; } let s = x.toFixed(Math.max(0, p - 1 - e)); if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, ''); return s; }
function __fmtG(x) { if (Number.isNaN(x)) return 'nan'; if (!isFinite(x)) return x > 0 ? 'inf' : '-inf'; let dig = 1, pow = 10; const av = Math.abs(x); while (dig < 17 && av >= pow) { dig++; pow *= 10; } for (let p = dig; p < 17; p++) { const s = __gfmt(x, p); if (Number(s) === x) return s; } return __gfmt(x, 17); }
function __propagate(r) { if (r.tag !== 0) throw { __milo_prop: r }; return r.data[0]; }
function __displayVal(v) { if (typeof v === 'string') return JSON.stringify(v); if (typeof v === 'boolean') return String(v); if (typeof v === 'number') return Number.isInteger(v) ? String(v) : __fmtG(v); if (v && typeof v === 'object' && v.constructor && v.constructor.name !== 'Object') return __displayStruct(v); return String(v); }
function __displayStruct(v) { const ks = Object.keys(v); return v.constructor.name + ' { ' + ks.map(k => k + ': ' + __displayVal(v[k])).join(', ') + ' }'; }
function __displayEnum(v, name) { const e = __enumMeta[name][v.tag]; return e[1] === 0 ? e[0] : e[0] + '(' + v.data.map(__displayVal).join(', ') + ')'; }
function __clone(v) { if (v === null || typeof v !== 'object') return v; if (Array.isArray(v)) return v.map(__clone); if (v instanceof Map) return new Map(Array.from(v, ([k, x]) => [k, __clone(x)])); const o = Object.create(Object.getPrototypeOf(v)); for (const k of Object.keys(v)) o[k] = __clone(v[k]); return o; }
function __eq(a, b) { if (a === b) return true; if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return a === b; if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => __eq(v, b[i])); if (a instanceof Map || b instanceof Map) { if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) return false; for (const [k, v] of a) { if (!b.has(k) || !__eq(v, b.get(k))) return false; } return true; } const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every(k => __eq(a[k], b[k])); }

class Unit {
  constructor() {
  }
}

class SnesHandle {
  constructor(cpu, m, fb, rgba, apuBuf, samples) {
    this.cpu = cpu;
    this.m = m;
    this.fb = fb;
    this.rgba = rgba;
    this.apuBuf = apuBuf;
    this.samples = samples;
  }
}

class Cpu {
  constructor(a, x, y, s, d, pc, p, dbr, pbr, e) {
    this.a = a;
    this.x = x;
    this.y = y;
    this.s = s;
    this.d = d;
    this.pc = pc;
    this.p = p;
    this.dbr = dbr;
    this.pbr = pbr;
    this.e = e;
  }
}

class Mem {
  constructor(addr, val, testMode, wram, rom, romMask, sram, sramMask, mapMode, mmio, nmitimen, htime, vtime, timeup, wmadd, wrmpya, wrdiv, rddiv, rdmpy, vblankToggle, hcounter, scanline, joy1, joy2, apuSpc, apuMem, ppu, fxEnabled, fx) {
    this.addr = addr;
    this.val = val;
    this.testMode = testMode;
    this.wram = wram;
    this.rom = rom;
    this.romMask = romMask;
    this.sram = sram;
    this.sramMask = sramMask;
    this.mapMode = mapMode;
    this.mmio = mmio;
    this.nmitimen = nmitimen;
    this.htime = htime;
    this.vtime = vtime;
    this.timeup = timeup;
    this.wmadd = wmadd;
    this.wrmpya = wrmpya;
    this.wrdiv = wrdiv;
    this.rddiv = rddiv;
    this.rdmpy = rdmpy;
    this.vblankToggle = vblankToggle;
    this.hcounter = hcounter;
    this.scanline = scanline;
    this.joy1 = joy1;
    this.joy2 = joy2;
    this.apuSpc = apuSpc;
    this.apuMem = apuMem;
    this.ppu = ppu;
    this.fxEnabled = fxEnabled;
    this.fx = fx;
  }
}

class Spc {
  constructor(a, x, y, sp, pc, psw) {
    this.a = a;
    this.x = x;
    this.y = y;
    this.sp = sp;
    this.pc = pc;
    this.psw = psw;
  }
}

class SpcMem {
  constructor(addr, val, testMode, ram, ipl, iplEnabled, inPort, outPort, tEnable, tTarget, tDiv, tCount, tOut, dspAddr, dsp, vBrrPtr, vInterp, vBuf, vPrev0, vPrev1, vEnv, vPhase, vKonPrev) {
    this.addr = addr;
    this.val = val;
    this.testMode = testMode;
    this.ram = ram;
    this.ipl = ipl;
    this.iplEnabled = iplEnabled;
    this.inPort = inPort;
    this.outPort = outPort;
    this.tEnable = tEnable;
    this.tTarget = tTarget;
    this.tDiv = tDiv;
    this.tCount = tCount;
    this.tOut = tOut;
    this.dspAddr = dspAddr;
    this.dsp = dsp;
    this.vBrrPtr = vBrrPtr;
    this.vInterp = vInterp;
    this.vBuf = vBuf;
    this.vPrev0 = vPrev0;
    this.vPrev1 = vPrev1;
    this.vEnv = vEnv;
    this.vPhase = vPhase;
    this.vKonPrev = vKonPrev;
  }
}

class Ppu {
  constructor(vram, cgram, oam, inidisp, obsel, oamaddr, oamLatch, oamHi, bgmode, bgsc0, bgsc1, bgsc2, bgsc3, bg12nba, bg34nba, bghofs, bgvofs, scrollLatch, scrollHi, vmain, vmaddr, vmLatch, cgaddr, cgLatch, cgHi, tm, ts, cgadsub, coldR, coldG, coldB, m7a, m7b, m7c, m7d, m7x, m7y, m7hofs, m7vofs, m7sel, m7Latch, hdmaOn, lineBright, lineColdR, lineColdG, lineColdB, w12sel, w34sel, wh0, wh1, wh2, wh3, wbglog, tmw, tsw, lineWH0, lineWH1) {
    this.vram = vram;
    this.cgram = cgram;
    this.oam = oam;
    this.inidisp = inidisp;
    this.obsel = obsel;
    this.oamaddr = oamaddr;
    this.oamLatch = oamLatch;
    this.oamHi = oamHi;
    this.bgmode = bgmode;
    this.bgsc0 = bgsc0;
    this.bgsc1 = bgsc1;
    this.bgsc2 = bgsc2;
    this.bgsc3 = bgsc3;
    this.bg12nba = bg12nba;
    this.bg34nba = bg34nba;
    this.bghofs = bghofs;
    this.bgvofs = bgvofs;
    this.scrollLatch = scrollLatch;
    this.scrollHi = scrollHi;
    this.vmain = vmain;
    this.vmaddr = vmaddr;
    this.vmLatch = vmLatch;
    this.cgaddr = cgaddr;
    this.cgLatch = cgLatch;
    this.cgHi = cgHi;
    this.tm = tm;
    this.ts = ts;
    this.cgadsub = cgadsub;
    this.coldR = coldR;
    this.coldG = coldG;
    this.coldB = coldB;
    this.m7a = m7a;
    this.m7b = m7b;
    this.m7c = m7c;
    this.m7d = m7d;
    this.m7x = m7x;
    this.m7y = m7y;
    this.m7hofs = m7hofs;
    this.m7vofs = m7vofs;
    this.m7sel = m7sel;
    this.m7Latch = m7Latch;
    this.hdmaOn = hdmaOn;
    this.lineBright = lineBright;
    this.lineColdR = lineColdR;
    this.lineColdG = lineColdG;
    this.lineColdB = lineColdB;
    this.w12sel = w12sel;
    this.w34sel = w34sel;
    this.wh0 = wh0;
    this.wh1 = wh1;
    this.wh2 = wh2;
    this.wh3 = wh3;
    this.wbglog = wbglog;
    this.tmw = tmw;
    this.tsw = tsw;
    this.lineWH0 = lineWH0;
    this.lineWH1 = lineWH1;
  }
}

class Fx {
  constructor(reg, vSign, vZero, vCarry, vOverflow, running, irqPending, alt1, alt2, bflag, sreg, dreg, pbr, rombr, rambr, cbr, color, por, scbr, scmr, cfgr, clsr, bramr, romBuffer, pipe, cacheActive, lastRamAdr, rom, romMask, nRomBanks, ram, ramMask, nRamBanks, cache, mode, screenHeight, realHeight) {
    this.reg = reg;
    this.vSign = vSign;
    this.vZero = vZero;
    this.vCarry = vCarry;
    this.vOverflow = vOverflow;
    this.running = running;
    this.irqPending = irqPending;
    this.alt1 = alt1;
    this.alt2 = alt2;
    this.bflag = bflag;
    this.sreg = sreg;
    this.dreg = dreg;
    this.pbr = pbr;
    this.rombr = rombr;
    this.rambr = rambr;
    this.cbr = cbr;
    this.color = color;
    this.por = por;
    this.scbr = scbr;
    this.scmr = scmr;
    this.cfgr = cfgr;
    this.clsr = clsr;
    this.bramr = bramr;
    this.romBuffer = romBuffer;
    this.pipe = pipe;
    this.cacheActive = cacheActive;
    this.lastRamAdr = lastRamAdr;
    this.rom = rom;
    this.romMask = romMask;
    this.nRomBanks = nRomBanks;
    this.ram = ram;
    this.ramMask = ramMask;
    this.nRamBanks = nRamBanks;
    this.cache = cache;
    this.mode = mode;
    this.screenHeight = screenHeight;
    this.realHeight = realHeight;
  }
}

class Cart {
  constructor(rom, map) {
    this.rom = rom;
    this.map = map;
  }
}

const Result_Cart_string = {
  Ok(_0) { return { tag: 0, data: [_0] }; },
  Err(_0) { return { tag: 1, data: [_0] }; },
};

const __enumMeta = {
  "Result_Cart_string": [["Ok", 1], ["Err", 1]],
  "Option": [["Some", 1], ["None", 0]],
  "Result": [["Ok", 1], ["Err", 1]]
};

const SNES_W = 256;
const SNES_H = 224;
const APU_FRAME = 535;
const FC = 1;
const FZ = 2;
const FI = 4;
const FD = 8;
const FX = 16;
const FM = 32;
const FV = 64;
const FN = 128;
let joyLatch1 = 0;
let joyCnt1 = 0;
let joyLatch2 = 0;
let joyCnt2 = 0;
let cpuWaiting = false;
let fxIrqAck = false;
let ophctHi = false;
let opvctHi = false;
let badOp = __ovf((-1), -9223372036854775808, 9223372036854775807);
let badOpPc = 0;
let fxFrameBudget = 0;
const PC_ = 1;
const PZ = 2;
const PI = 4;
const PH = 8;
const PB = 16;
const PP = 32;
const PV = 64;
const PN = 128;
let oamReload = 0;
let fxDbgStarts = 0;
let fxDbgSteps = 0;
let fxDbgStops = 0;
let fxDbgPlots = 0;

function strContains(haystack, needle) {
  return (strIndexOfFrom(haystack, needle, 0) >= 0);
}

function strIndexOf(haystack, needle) {
  return strIndexOfFrom(haystack, needle, 0);
}

function strIndexOfFrom(haystack, needle, pos) {
  if ((needle.length == 0)) {
    return pos;
  }
  if ((pos < Math.trunc(0))) {
    return __ovf((-1), -9223372036854775808, 9223372036854775807);
  }
  if ((__ovf((pos + needle.length), -9223372036854775808, 9223372036854775807) > haystack.length)) {
    return __ovf((-1), -9223372036854775808, 9223372036854775807);
  }
  const base = Math.trunc(haystack);
  const nptr = needle;
  const c0 = (__sbyte(needle, 0) | 0);
  const last = __ovf((haystack.length - needle.length), -9223372036854775808, 9223372036854775807);
  let i = pos;
  while ((i <= last)) {
    let hit = 0;
    const p = memchr(__ovf((base + i), -9223372036854775808, 9223372036854775807), c0, __ovf((__ovf((last - i), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807));
    hit = Math.trunc(p);
    if ((hit == 0)) {
      return __ovf((-1), -9223372036854775808, 9223372036854775807);
    }
    i = __ovf((hit - base), -9223372036854775808, 9223372036854775807);
    let cmp = 0;
    cmp = memcmp(__ovf((base + i), -9223372036854775808, 9223372036854775807), nptr, needle.length);
    if ((cmp == 0)) {
      return i;
    }
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return __ovf((-1), -9223372036854775808, 9223372036854775807);
}

function strIndexOfFromIgnoreCase(haystack, needle, pos) {
  if ((needle.length == 0)) {
    return pos;
  }
  if ((__ovf((pos + needle.length), -9223372036854775808, 9223372036854775807) > haystack.length)) {
    return __ovf((-1), -9223372036854775808, 9223372036854775807);
  }
  const base = Math.trunc(haystack);
  const last = __ovf((haystack.length - needle.length), -9223372036854775808, 9223372036854775807);
  let anchor = 0;
  let k = 0;
  while ((k < needle.length)) {
    if ((!asciiIsAlpha(__sbyte(needle, k)))) {
      anchor = k;
      break;
    }
    k = __ovf((k + 1), -9223372036854775808, 9223372036854775807);
  }
  const ab = __sbyte(needle, anchor);
  const c1 = (asciiToLower(ab) | 0);
  let c2 = c1;
  if (asciiIsAlpha(ab)) {
    c2 = (asciiToUpper(ab) | 0);
  }
  let h1 = __ovf((-1), -9223372036854775808, 9223372036854775807);
  let h2 = __ovf((-1), -9223372036854775808, 9223372036854775807);
  if ((c2 == c1)) {
    h2 = __ovf((-2), -9223372036854775808, 9223372036854775807);
  }
  let s = pos;
  while ((s <= last)) {
    if ((h1 == __ovf((-1), -9223372036854775808, 9223372036854775807))) {
      let p = 0;
      p = Math.trunc(memchr(__ovf((__ovf((base + s), -9223372036854775808, 9223372036854775807) + anchor), -9223372036854775808, 9223372036854775807), c1, __ovf((__ovf((last - s), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807)));
      if ((p == 0)) {
        h1 = __ovf((-2), -9223372036854775808, 9223372036854775807);
      } else {
        h1 = __ovf((p - base), -9223372036854775808, 9223372036854775807);
      }
    }
    if ((h2 == __ovf((-1), -9223372036854775808, 9223372036854775807))) {
      let p = 0;
      p = Math.trunc(memchr(__ovf((__ovf((base + s), -9223372036854775808, 9223372036854775807) + anchor), -9223372036854775808, 9223372036854775807), c2, __ovf((__ovf((last - s), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807)));
      if ((p == 0)) {
        h2 = __ovf((-2), -9223372036854775808, 9223372036854775807);
      } else {
        h2 = __ovf((p - base), -9223372036854775808, 9223372036854775807);
      }
    }
    let h = __ovf((-2), -9223372036854775808, 9223372036854775807);
    if ((h1 >= 0)) {
      h = h1;
    }
    if (((h2 >= 0) && ((h < 0) || (h2 < h)))) {
      h = h2;
    }
    if ((h < 0)) {
      return __ovf((-1), -9223372036854775808, 9223372036854775807);
    }
    const start = __ovf((h - anchor), -9223372036854775808, 9223372036854775807);
    let j = 0;
    while ((j < needle.length)) {
      if ((asciiToLower(__sbyte(haystack, __ovf((start + j), -9223372036854775808, 9223372036854775807))) != asciiToLower(__sbyte(needle, j)))) {
        break;
      }
      j = __ovf((j + 1), -9223372036854775808, 9223372036854775807);
    }
    if ((j == needle.length)) {
      return start;
    }
    if ((h1 == h)) {
      h1 = __ovf((-1), -9223372036854775808, 9223372036854775807);
    }
    if ((h2 == h)) {
      h2 = __ovf((-1), -9223372036854775808, 9223372036854775807);
    }
    s = __ovf((start + 1), -9223372036854775808, 9223372036854775807);
  }
  return __ovf((-1), -9223372036854775808, 9223372036854775807);
}

function strContainsIgnoreCase(haystack, needle) {
  return (strIndexOfFromIgnoreCase(haystack, needle, 0) >= 0);
}

function strLastIndexOf(haystack, needle) {
  if ((needle.length == 0)) {
    return haystack.length;
  }
  if ((needle.length > haystack.length)) {
    return __ovf((-1), -9223372036854775808, 9223372036854775807);
  }
  let i = __ovf((haystack.length - needle.length), -9223372036854775808, 9223372036854775807);
  while ((i >= Math.trunc(0))) {
    let j = 0;
    while ((j < needle.length)) {
      if ((__sbyte(haystack, __ovf((i + j), -9223372036854775808, 9223372036854775807)) != __sbyte(needle, j))) {
        break;
      }
      j = __ovf((j + 1), -9223372036854775808, 9223372036854775807);
    }
    if ((j == needle.length)) {
      return i;
    }
    i = __ovf((i - 1), -9223372036854775808, 9223372036854775807);
  }
  return __ovf((-1), -9223372036854775808, 9223372036854775807);
}

function strStartsWith(s, prefix) {
  if ((prefix.length > s.length)) {
    return false;
  }
  const _t0 = 0;
  const _t1 = prefix.length;
  for (let i = _t0; i < _t1; i++) {
    if ((__sbyte(s, i) != __sbyte(prefix, i))) {
      return false;
    }
  }
  return true;
}

function strEndsWith(s, suffix) {
  if ((suffix.length > s.length)) {
    return false;
  }
  const offset = __ovf((s.length - suffix.length), -9223372036854775808, 9223372036854775807);
  const _t2 = 0;
  const _t3 = suffix.length;
  for (let i = _t2; i < _t3; i++) {
    if ((__sbyte(s, __ovf((offset + i), -9223372036854775808, 9223372036854775807)) != __sbyte(suffix, i))) {
      return false;
    }
  }
  return true;
}

function strToLower(s) {
  let result = "";
  const _t4 = 0;
  const _t5 = s.length;
  for (let i = _t4; i < _t5; i++) {
    const ch = __sbyte(s, i);
    if (((ch >= 65) && (ch <= 90))) {
      (result += String.fromCharCode(__ovf((ch + 32), 0, 255)));
    } else {
      (result += String.fromCharCode(ch));
    }
  }
  return result;
}

function strToUpper(s) {
  let result = "";
  const _t6 = 0;
  const _t7 = s.length;
  for (let i = _t6; i < _t7; i++) {
    const ch = __sbyte(s, i);
    if (((ch >= 97) && (ch <= 122))) {
      (result += String.fromCharCode(__ovf((ch - 32), 0, 255)));
    } else {
      (result += String.fromCharCode(ch));
    }
  }
  return result;
}

function strTrim(s) {
  let start = 0;
  while ((start < s.length)) {
    const ch = __sbyte(s, start);
    if (((((ch != 32) && (ch != 9)) && (ch != 10)) && (ch != 13))) {
      break;
    }
    start = __ovf((start + 1), -9223372036854775808, 9223372036854775807);
  }
  let end = s.length;
  while ((end > start)) {
    const ch = __sbyte(s, __ovf((end - 1), -9223372036854775808, 9223372036854775807));
    if (((((ch != 32) && (ch != 9)) && (ch != 10)) && (ch != 13))) {
      break;
    }
    end = __ovf((end - 1), -9223372036854775808, 9223372036854775807);
  }
  if ((start >= end)) {
    return "";
  }
  return s.slice(start, end);
}

function strTrimStart(s) {
  let start = 0;
  while ((start < s.length)) {
    const ch = __sbyte(s, start);
    if (((((ch != 32) && (ch != 9)) && (ch != 10)) && (ch != 13))) {
      break;
    }
    start = __ovf((start + 1), -9223372036854775808, 9223372036854775807);
  }
  if ((start >= s.length)) {
    return "";
  }
  return s.slice(start, s.length);
}

function strTrimEnd(s) {
  let end = s.length;
  while ((end > Math.trunc(0))) {
    const ch = __sbyte(s, __ovf((end - 1), -9223372036854775808, 9223372036854775807));
    if (((((ch != 32) && (ch != 9)) && (ch != 10)) && (ch != 13))) {
      break;
    }
    end = __ovf((end - 1), -9223372036854775808, 9223372036854775807);
  }
  if ((end <= Math.trunc(0))) {
    return "";
  }
  return s.slice(Math.trunc(0), end);
}

function strSplit(s, sep) {
  let result = [];
  if ((sep.length == 0)) {
    const _t8 = 0;
    const _t9 = s.length;
    for (let i = _t8; i < _t9; i++) {
      result.push(s.slice(i, __ovf((i + 1), -9223372036854775808, 9223372036854775807)));
    }
    return result;
  }
  let pos = 0;
  while ((pos <= s.length)) {
    const found = strIndexOfFrom(s, sep, pos);
    if ((found < 0)) {
      result.push(s.slice(pos, s.length));
      break;
    }
    const idx = found;
    result.push(s.slice(pos, idx));
    pos = __ovf((idx + sep.length), -9223372036854775808, 9223372036854775807);
  }
  return result;
}

function strRepeat(s, n) {
  let result = "";
  const _t10 = 0;
  const _t11 = n;
  for (let i = _t10; i < _t11; i++) {
    result = (result + s);
  }
  return result;
}

function strPadStart(s, targetLen, padStr) {
  if (((s.length >= targetLen) || (padStr.length == 0))) {
    return s;
  }
  let padding = "";
  let needed = __ovf((targetLen - s.length), -9223372036854775808, 9223372036854775807);
  while ((padding.length < needed)) {
    let i = 0;
    while (((i < padStr.length) && (padding.length < needed))) {
      (padding += String.fromCharCode(__sbyte(padStr, i)));
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
  }
  return (padding + s);
}

function strPadEnd(s, targetLen, padStr) {
  if (((s.length >= targetLen) || (padStr.length == 0))) {
    return s;
  }
  let result = s;
  let needed = __ovf((targetLen - s.length), -9223372036854775808, 9223372036854775807);
  let added = 0;
  while ((added < needed)) {
    let i = 0;
    while (((i < padStr.length) && (added < needed))) {
      (result += String.fromCharCode(__sbyte(padStr, i)));
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
      added = __ovf((added + 1), -9223372036854775808, 9223372036854775807);
    }
  }
  return result;
}

function strReplace(s, old, newVal) {
  if ((old.length == 0)) {
    return s;
  }
  let result = "";
  let pos = 0;
  while ((pos < s.length)) {
    const found = strIndexOfFrom(s, old, pos);
    if ((found < 0)) {
      result = (result + s.slice(pos, s.length));
      break;
    }
    const idx = found;
    if ((idx > pos)) {
      result = (result + s.slice(pos, idx));
    }
    result = (result + newVal);
    pos = __ovf((idx + old.length), -9223372036854775808, 9223372036854775807);
  }
  return result;
}

function asciiIsWhitespace(ch) {
  return ((((ch == 32) || (ch == 9)) || (ch == 10)) || (ch == 13));
}

function asciiIsDigit(ch) {
  return ((ch >= 48) && (ch <= 57));
}

function asciiIsAlpha(ch) {
  return (((ch >= 65) && (ch <= 90)) || ((ch >= 97) && (ch <= 122)));
}

function asciiIsAlphanumeric(ch) {
  return (asciiIsAlpha(ch) || asciiIsDigit(ch));
}

function asciiIsLower(ch) {
  return ((ch >= 97) && (ch <= 122));
}

function asciiIsUpper(ch) {
  return ((ch >= 65) && (ch <= 90));
}

function asciiIsPunctuation(ch) {
  return (((((ch >= 33) && (ch <= 47)) || ((ch >= 58) && (ch <= 64))) || ((ch >= 91) && (ch <= 96))) || ((ch >= 123) && (ch <= 126)));
}

function asciiIsHexDigit(ch) {
  return ((asciiIsDigit(ch) || ((ch >= 97) && (ch <= 102))) || ((ch >= 65) && (ch <= 70)));
}

function asciiIsPrintable(ch) {
  return ((ch >= 32) && (ch < 127));
}

function asciiIsControl(ch) {
  return ((ch < 32) || (ch == 127));
}

function asciiToLower(ch) {
  if (asciiIsUpper(ch)) {
    return __ovf((ch + 32), 0, 255);
  }
  return ch;
}

function asciiToUpper(ch) {
  if (asciiIsLower(ch)) {
    return __ovf((ch - 32), 0, 255);
  }
  return ch;
}

function strSplitWords(s) {
  let result = [];
  let word = "";
  const _t12 = 0;
  const _t13 = s.length;
  for (let i = _t12; i < _t13; i++) {
    const ch = __sbyte(s, i);
    if (asciiIsAlpha(ch)) {
      if (((ch >= 65) && (ch <= 90))) {
        (word += String.fromCharCode(__ovf((ch + 32), 0, 255)));
      } else {
        (word += String.fromCharCode(ch));
      }
    } else {
      if ((word.length > 0)) {
        result.push(word);
        word = "";
      }
    }
  }
  if ((word.length > 0)) {
    result.push(word);
  }
  return result;
}

function strSplitWhitespace(s) {
  let result = [];
  let token = "";
  const _t14 = 0;
  const _t15 = s.length;
  for (let i = _t14; i < _t15; i++) {
    const ch = __sbyte(s, i);
    if (asciiIsWhitespace(ch)) {
      if ((token.length > 0)) {
        result.push(token);
        token = "";
      }
    } else {
      (token += String.fromCharCode(ch));
    }
  }
  if ((token.length > 0)) {
    result.push(token);
  }
  return result;
}

function vecJoin(parts, sep) {
  let result = "";
  const _t16 = 0;
  const _t17 = parts.length;
  for (let i = _t16; i < _t17; i++) {
    if ((i > 0)) {
      result = (result + sep);
    }
    result = (result + __idx(parts, i));
  }
  return result;
}

function strIsEmpty(s) {
  return (s.length == 0);
}

function strCharAt(s, idx) {
  return s.slice(idx, __ovf((idx + 1), -9223372036854775808, 9223372036854775807));
}

function strReverse(s) {
  let result = "";
  let i = s.length;
  while ((i > 0)) {
    let start = __ovf((i - 1), -9223372036854775808, 9223372036854775807);
    while (((start > 0) && (((__sbyte(s, start) & 192) & 0xFF) == 128))) {
      start = __ovf((start - 1), -9223372036854775808, 9223372036854775807);
    }
    let j = start;
    while ((j < i)) {
      (result += String.fromCharCode(__sbyte(s, j)));
      j = __ovf((j + 1), -9223372036854775808, 9223372036854775807);
    }
    i = start;
  }
  return result;
}

function strParseInt(s) {
  let result = 0;
  let i = 0;
  let negative = false;
  if (((s.length > 0) && (__sbyte(s, 0) == 45))) {
    negative = true;
    i = 1;
  }
  while ((i < s.length)) {
    const ch = __sbyte(s, i);
    if (((ch < 48) || (ch > 57))) {
      break;
    }
    const digit = Math.trunc(__ovf((ch - 48), 0, 255));
    result = __ovf((__ovf((result * 10), -9223372036854775808, 9223372036854775807) + digit), -9223372036854775808, 9223372036854775807);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  if (negative) {
    return __ovf((0 - result), -9223372036854775808, 9223372036854775807);
  }
  return result;
}

function strReplaceFirst(s, old, newVal) {
  const found = strIndexOf(s, old);
  if ((found < 0)) {
    return s;
  }
  const idx = found;
  return ((s.slice(0, idx) + newVal) + s.slice(__ovf((idx + old.length), -9223372036854775808, 9223372036854775807), s.length));
}

function createSnes(rom) {
  let data = [];
  let mapMode = 0;
  const _t18 = parseCart(rom);
  if (_t18.tag === 0) {
    const c = _t18.data[0];
    data = c.rom;
    mapMode = c.map;
  } else if (_t18.tag === 1) {
    const e = _t18.data[0];
    __print(("SNES ROM parse failed: " + e) + "\n");
  }
  let m = busNew(data, mapMode);
  let cpu = newCpuReset(m);
  let fb = [];
  let rgba = [];
  let i = 0;
  while ((i < __ovf((SNES_W * SNES_H), -9223372036854775808, 9223372036854775807))) {
    fb.push(0);
    rgba.push(0);
    rgba.push(0);
    rgba.push(0);
    rgba.push(255);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  let apuBuf = [];
  let k = 0;
  while ((k < __ovf((APU_FRAME * 2), -9223372036854775808, 9223372036854775807))) {
    apuBuf.push(0);
    k = __ovf((k + 1), -9223372036854775808, 9223372036854775807);
  }
  let samples = [];
  return new SnesHandle(cpu, m, fb, rgba, apuBuf, samples);
}

function setButtons(h, j) {
  h.m.joy1 = j;
}

function setButtons2(h, j) {
  h.m.joy2 = j;
}

function advanceFrame(h) {
  stepFrame(h.cpu, h.m);
  dspGenerate(h.m.apuMem, h.apuBuf, APU_FRAME);
  let s = 0;
  while ((s < __ovf((APU_FRAME * 2), -9223372036854775808, 9223372036854775807))) {
    h.samples.push(((__idx(h.apuBuf, s) << 16) >> 16));
    s = __ovf((s + 1), -9223372036854775808, 9223372036854775807);
  }
  renderFrame(h.m.ppu, h.fb);
  let i = 0;
  while ((i < __ovf((SNES_W * SNES_H), -9223372036854775808, 9223372036854775807))) {
    const c = __idx(h.fb, i);
    const dst = __ovf((i * 4), -9223372036854775808, 9223372036854775807);
    __idxSet(h.rgba, dst, (((Math.floor(c / 2 ** (__sh(16, 64))) & 255) >>> 0) & 0xFF));
    __idxSet(h.rgba, __ovf((dst + 1), -9223372036854775808, 9223372036854775807), (((Math.floor(c / 2 ** (__sh(8, 64))) & 255) >>> 0) & 0xFF));
    __idxSet(h.rgba, __ovf((dst + 2), -9223372036854775808, 9223372036854775807), (((c & 255) >>> 0) & 0xFF));
    __idxSet(h.rgba, __ovf((dst + 3), -9223372036854775808, 9223372036854775807), 255);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
}

function frameW(h) {
  return SNES_W;
}

function frameH(h) {
  return SNES_H;
}

function main() {
  return 0;
}

function lastBadOp() {
  return badOp;
}

function lastBadOpPc() {
  return badOpPc;
}

function newApuSpc() {
  return new Spc(0, 0, 0, 0, 0, 0);
}

function memNew() {
  return new Mem([], [], true, [], [], 0, [], 0, 0, [], 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, newApuSpc(), spcMemNew(), newPpu(), false, fxNew([]));
}

function vecZeros(n) {
  let v = [];
  let i = 0;
  while ((i < n)) {
    v.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function busNew(rom, mapMode) {
  const len = rom.length;
  let mask = 1;
  while ((mask < len)) {
    mask = Math.trunc(mask * 2 ** (__sh(1, 64)));
  }
  mask = __ovf((mask - 1), -9223372036854775808, 9223372036854775807);
  const hdrRam = (() => {
  if ((mapMode == 1)) {
    return 65496;
  } else {
    return 32728;
  }
  })();
  let sramMask = 32767;
  if ((hdrRam < len)) {
    const rs = Math.trunc(__idx(rom, hdrRam));
    if ((rs == 0)) {
      sramMask = 0;
    } else {
      let sz = Math.trunc(1024 * 2 ** (__sh(rs, 64)));
      if ((sz > 32768)) {
        sz = 32768;
      }
      sramMask = __ovf((sz - 1), -9223372036854775808, 9223372036854775807);
    }
  }
  const fxOn = isSuperFx(rom);
  const gsu = (() => {
  if (fxOn) {
    return fxNew(cloneBytes(rom));
  } else {
    return fxNew([]);
  }
  })();
  let mem = new Mem([], [], false, vecZeros(131072), rom, mask, vecZeros(32768), sramMask, mapMode, vecZeros(16384), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, newApuSpc(), spcMemReal(), newPpu(), fxOn, gsu);
  mem.apuSpc.pc = 65472;
  mem.apuSpc.sp = 239;
  mem.apuSpc.psw = 2;
  return mem;
}

function runApu(m, n) {
  if (m.testMode) {
    return;
  }
  let i = 0;
  while ((i < n)) {
    spcStep(m.apuSpc, m.apuMem);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
}

function busReadCgram(m, a) {
  return ppuCgram(m.ppu, a);
}

function busReadVram(m, a) {
  return ppuVram(m.ppu, a);
}

function scratch(m, addr) {
  return Math.trunc(__idx(m.mmio, __ovf((addr - 8192), -9223372036854775808, 9223372036854775807)));
}

function setScratch(m, addr, v) {
  __idxSet(m.mmio, __ovf((addr - 8192), -9223372036854775808, 9223372036854775807), (((v & 255) >>> 0) & 0xFF));
}

function dmaPatternOffset(pattern, count) {
  if ((pattern == 0)) {
    return 0;
  }
  if ((pattern == 1)) {
    return ((count & 1) >>> 0);
  }
  if ((pattern == 2)) {
    return 0;
  }
  if ((pattern == 3)) {
    return Math.floor(((count & 3) >>> 0) / 2 ** (__sh(1, 64)));
  }
  if ((pattern == 4)) {
    return ((count & 3) >>> 0);
  }
  return ((count & 1) >>> 0);
}

function runDMA(m, channels) {
  let ch = 0;
  while ((ch < 8)) {
    if ((((Math.floor(channels / 2 ** (__sh(ch, 64))) & 1) >>> 0) != 0)) {
      const base = __ovf((17152 + __ovf((ch * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
      const dmap = scratch(m, __ovf((base + 0), -9223372036854775808, 9223372036854775807));
      const bbad = scratch(m, __ovf((base + 1), -9223372036854775808, 9223372036854775807));
      let aaddr = ((scratch(m, __ovf((base + 2), -9223372036854775808, 9223372036854775807)) | Math.trunc(scratch(m, __ovf((base + 3), -9223372036854775808, 9223372036854775807)) * 2 ** (__sh(8, 64)))) >>> 0);
      const abank = scratch(m, __ovf((base + 4), -9223372036854775808, 9223372036854775807));
      let size = ((scratch(m, __ovf((base + 5), -9223372036854775808, 9223372036854775807)) | Math.trunc(scratch(m, __ovf((base + 6), -9223372036854775808, 9223372036854775807)) * 2 ** (__sh(8, 64)))) >>> 0);
      if ((size == 0)) {
        size = 65536;
      }
      const dir = ((Math.floor(dmap / 2 ** (__sh(7, 64))) & 1) >>> 0);
      const pattern = ((dmap & 7) >>> 0);
      const amode = ((Math.floor(dmap / 2 ** (__sh(3, 64))) & 3) >>> 0);
      const astep = (() => {
      if ((amode == 0)) {
        return 1;
      } else {
        return (() => {
        if ((amode == 2)) {
          return __ovf((-1), -9223372036854775808, 9223372036854775807);
        } else {
          return 0;
        }
        })();
      }
      })();
      let count = 0;
      while ((count < size)) {
        const bAddr = ((8448 | ((__ovf((bbad + dmaPatternOffset(pattern, count)), -9223372036854775808, 9223372036854775807) & 255) >>> 0)) >>> 0);
        const aFull = ((Math.trunc(abank * 2 ** (__sh(16, 64))) | ((aaddr & 65535) >>> 0)) >>> 0);
        if ((dir == 0)) {
          const v = memRead(m, aFull);
          memWrite(m, bAddr, v);
        } else {
          const v = memRead(m, bAddr);
          memWrite(m, aFull, v);
        }
        aaddr = ((__ovf((aaddr + astep), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
        count = __ovf((count + 1), -9223372036854775808, 9223372036854775807);
      }
      setScratch(m, __ovf((base + 2), -9223372036854775808, 9223372036854775807), ((aaddr & 255) >>> 0));
      setScratch(m, __ovf((base + 3), -9223372036854775808, 9223372036854775807), ((Math.floor(aaddr / 2 ** (__sh(8, 64))) & 255) >>> 0));
      setScratch(m, __ovf((base + 5), -9223372036854775808, 9223372036854775807), 0);
      setScratch(m, __ovf((base + 6), -9223372036854775808, 9223372036854775807), 0);
    }
    ch = __ovf((ch + 1), -9223372036854775808, 9223372036854775807);
  }
}

function hdmaUnitBytes(pattern) {
  if ((pattern == 0)) {
    return 1;
  }
  if ((((pattern == 1) || (pattern == 2)) || (pattern == 6))) {
    return 2;
  }
  return 4;
}

function hdmaByteReg(pattern, j) {
  if ((pattern == 1)) {
    return j;
  }
  if ((pattern == 4)) {
    return j;
  }
  if ((pattern == 5)) {
    return ((j & 1) >>> 0);
  }
  if (((pattern == 3) || (pattern == 7))) {
    if ((j < 2)) {
      return 0;
    }
    return 1;
  }
  return 0;
}

function hdmaApplyReg(m, line, reg, v) {
  if ((reg == 8448)) {
    let b = ((v & 15) >>> 0);
    if ((((v & 128) >>> 0) != 0)) {
      b = 0;
    }
    __idxSet(m.ppu.lineBright, line, b);
    return;
  }
  if ((reg == 8498)) {
    const inten = ((v & 31) >>> 0);
    if ((((v & 32) >>> 0) != 0)) {
      __idxSet(m.ppu.lineColdR, line, inten);
    }
    if ((((v & 64) >>> 0) != 0)) {
      __idxSet(m.ppu.lineColdG, line, inten);
    }
    if ((((v & 128) >>> 0) != 0)) {
      __idxSet(m.ppu.lineColdB, line, inten);
    }
    return;
  }
  if ((reg == 8486)) {
    __idxSet(m.ppu.lineWH0, line, ((v & 255) >>> 0));
    return;
  }
  if ((reg == 8487)) {
    __idxSet(m.ppu.lineWH1, line, ((v & 255) >>> 0));
    return;
  }
}

function hdmaWalkFrame(m) {
  const brightScalar = (() => {
  if ((((m.ppu.inidisp & 128) >>> 0) != 0)) {
    return 0;
  } else {
    return ((m.ppu.inidisp & 15) >>> 0);
  }
  })();
  __idxSet(m.ppu.lineBright, 0, brightScalar);
  __idxSet(m.ppu.lineColdR, 0, m.ppu.coldR);
  __idxSet(m.ppu.lineColdG, 0, m.ppu.coldG);
  __idxSet(m.ppu.lineColdB, 0, m.ppu.coldB);
  __idxSet(m.ppu.lineWH0, 0, m.ppu.wh0);
  __idxSet(m.ppu.lineWH1, 0, m.ppu.wh1);
  const en = scratch(m, 16908);
  if ((en == 0)) {
    m.ppu.hdmaOn = false;
    return;
  }
  m.ppu.hdmaOn = true;
  let a2a = [];
  let a2b = [];
  let lctr = [];
  let done = [];
  let indAddr = [];
  let ch = 0;
  while ((ch < 8)) {
    const base = __ovf((17152 + __ovf((ch * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
    a2a.push(((scratch(m, __ovf((base + 2), -9223372036854775808, 9223372036854775807)) | Math.trunc(scratch(m, __ovf((base + 3), -9223372036854775808, 9223372036854775807)) * 2 ** (__sh(8, 64)))) >>> 0));
    a2b.push(scratch(m, __ovf((base + 4), -9223372036854775808, 9223372036854775807)));
    lctr.push(0);
    done.push(0);
    indAddr.push(0);
    ch = __ovf((ch + 1), -9223372036854775808, 9223372036854775807);
  }
  let line = 0;
  while ((line < 224)) {
    if ((line > 0)) {
      __idxSet(m.ppu.lineBright, line, __idx(m.ppu.lineBright, __ovf((line - 1), -9223372036854775808, 9223372036854775807)));
      __idxSet(m.ppu.lineColdR, line, __idx(m.ppu.lineColdR, __ovf((line - 1), -9223372036854775808, 9223372036854775807)));
      __idxSet(m.ppu.lineColdG, line, __idx(m.ppu.lineColdG, __ovf((line - 1), -9223372036854775808, 9223372036854775807)));
      __idxSet(m.ppu.lineColdB, line, __idx(m.ppu.lineColdB, __ovf((line - 1), -9223372036854775808, 9223372036854775807)));
      __idxSet(m.ppu.lineWH0, line, __idx(m.ppu.lineWH0, __ovf((line - 1), -9223372036854775808, 9223372036854775807)));
      __idxSet(m.ppu.lineWH1, line, __idx(m.ppu.lineWH1, __ovf((line - 1), -9223372036854775808, 9223372036854775807)));
    }
    ch = 0;
    while ((ch < 8)) {
      if (((((Math.floor(en / 2 ** (__sh(ch, 64))) & 1) >>> 0) != 0) && (__idx(done, ch) == 0))) {
        const base = __ovf((17152 + __ovf((ch * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
        const dmap = scratch(m, __ovf((base + 0), -9223372036854775808, 9223372036854775807));
        const bbad = scratch(m, __ovf((base + 1), -9223372036854775808, 9223372036854775807));
        const indirect = (((dmap & 64) >>> 0) != 0);
        const pattern = ((dmap & 7) >>> 0);
        let doXfer = false;
        let terminated = false;
        if ((((__idx(lctr, ch) & 127) >>> 0) == 0)) {
          const bank = __idx(a2b, ch);
          let ptr = __idx(a2a, ch);
          const ntlr = memRead(m, ((Math.trunc(bank * 2 ** (__sh(16, 64))) | ptr) >>> 0));
          ptr = ((__ovf((ptr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
          if ((ntlr == 0)) {
            __idxSet(done, ch, 1);
            terminated = true;
            __idxSet(a2a, ch, ptr);
          } else {
            __idxSet(lctr, ch, ntlr);
            doXfer = true;
            if (indirect) {
              const lo = memRead(m, ((Math.trunc(bank * 2 ** (__sh(16, 64))) | ptr) >>> 0));
              ptr = ((__ovf((ptr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
              const hi = memRead(m, ((Math.trunc(bank * 2 ** (__sh(16, 64))) | ptr) >>> 0));
              ptr = ((__ovf((ptr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
              __idxSet(indAddr, ch, ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0));
            }
            __idxSet(a2a, ch, ptr);
          }
        } else {
          doXfer = (((__idx(lctr, ch) & 128) >>> 0) != 0);
        }
        if ((!terminated)) {
          if (doXfer) {
            const nbytes = hdmaUnitBytes(pattern);
            let j = 0;
            while ((j < nbytes)) {
              const reg = ((8448 | ((__ovf((bbad + hdmaByteReg(pattern, j)), -9223372036854775808, 9223372036854775807) & 255) >>> 0)) >>> 0);
              let v = 0;
              if (indirect) {
                const dbank = scratch(m, __ovf((base + 7), -9223372036854775808, 9223372036854775807));
                v = memRead(m, ((Math.trunc(dbank * 2 ** (__sh(16, 64))) | ((__idx(indAddr, ch) & 65535) >>> 0)) >>> 0));
                __idxSet(indAddr, ch, ((__ovf((__idx(indAddr, ch) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
              } else {
                v = memRead(m, ((Math.trunc(__idx(a2b, ch) * 2 ** (__sh(16, 64))) | __idx(a2a, ch)) >>> 0));
                __idxSet(a2a, ch, ((__ovf((__idx(a2a, ch) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
              }
              hdmaApplyReg(m, line, reg, v);
              j = __ovf((j + 1), -9223372036854775808, 9223372036854775807);
            }
          }
          __idxSet(lctr, ch, ((__ovf((__idx(lctr, ch) - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
        }
      }
      ch = __ovf((ch + 1), -9223372036854775808, 9223372036854775807);
    }
    line = __ovf((line + 1), -9223372036854775808, 9223372036854775807);
  }
}

function mmioRead(m, off) {
  if ((off == 8508)) {
    const h = __irem(Math.floor(m.hcounter / 2 ** (__sh(2, 64))), 340);
    if (ophctHi) {
      ophctHi = false;
      return ((Math.floor(h / 2 ** (__sh(8, 64))) & 1) >>> 0);
    }
    ophctHi = true;
    return ((h & 255) >>> 0);
  }
  if ((off == 8509)) {
    const v = m.scanline;
    if (opvctHi) {
      opvctHi = false;
      return ((Math.floor(v / 2 ** (__sh(8, 64))) & 1) >>> 0);
    }
    opvctHi = true;
    return ((v & 255) >>> 0);
  }
  if ((off == 8511)) {
    ophctHi = false;
    opvctHi = false;
    return ((64 | 2) >>> 0);
  }
  if (((off >= 8448) && (off <= 8511))) {
    return ppuRegReadPure(m.ppu, __ovf((off - 8448), -9223372036854775808, 9223372036854775807));
  }
  if (((off >= 8512) && (off <= 8515))) {
    return apuReadPort(m.apuMem, __ovf((off - 8512), -9223372036854775808, 9223372036854775807));
  }
  if ((off == 8576)) {
    return Math.trunc(__idx(m.wram, ((m.wmadd & 131071) >>> 0)));
  }
  if ((off == 16912)) {
    return ((m.vblankToggle | 2) >>> 0);
  }
  if ((off == 16913)) {
    return m.timeup;
  }
  if ((off == 16914)) {
    let hb = 0;
    if ((((m.hcounter & 7) >>> 0) < 2)) {
      hb = 64;
    }
    return ((m.vblankToggle | hb) >>> 0);
  }
  if ((off == 16916)) {
    return ((m.rddiv & 255) >>> 0);
  }
  if ((off == 16917)) {
    return ((Math.floor(m.rddiv / 2 ** (__sh(8, 64))) & 255) >>> 0);
  }
  if ((off == 16918)) {
    return ((m.rdmpy & 255) >>> 0);
  }
  if ((off == 16919)) {
    return ((Math.floor(m.rdmpy / 2 ** (__sh(8, 64))) & 255) >>> 0);
  }
  if ((off == 16406)) {
    let bit1 = 1;
    if ((joyCnt1 < 16)) {
      bit1 = ((Math.floor(joyLatch1 / 2 ** (__sh(__ovf((15 - joyCnt1), -9223372036854775808, 9223372036854775807), 64))) & 1) >>> 0);
      joyCnt1 = __ovf((joyCnt1 + 1), -9223372036854775808, 9223372036854775807);
    }
    return bit1;
  }
  if ((off == 16407)) {
    let bit2 = 1;
    if ((joyCnt2 < 16)) {
      bit2 = ((Math.floor(joyLatch2 / 2 ** (__sh(__ovf((15 - joyCnt2), -9223372036854775808, 9223372036854775807), 64))) & 1) >>> 0);
      joyCnt2 = __ovf((joyCnt2 + 1), -9223372036854775808, 9223372036854775807);
    }
    return bit2;
  }
  if ((off == 16920)) {
    return ((m.joy1 & 255) >>> 0);
  }
  if ((off == 16921)) {
    return ((Math.floor(m.joy1 / 2 ** (__sh(8, 64))) & 255) >>> 0);
  }
  if ((off == 16922)) {
    return ((m.joy2 & 255) >>> 0);
  }
  if ((off == 16923)) {
    return ((Math.floor(m.joy2 / 2 ** (__sh(8, 64))) & 255) >>> 0);
  }
  return Math.trunc(__idx(m.mmio, __ovf((off - 8192), -9223372036854775808, 9223372036854775807)));
}

function mmioWrite(m, off, val) {
  if (((off >= 8448) && (off <= 8511))) {
    ppuRegWrite(m.ppu, __ovf((off - 8448), -9223372036854775808, 9223372036854775807), val);
    return;
  }
  if (((off >= 8512) && (off <= 8515))) {
    apuWritePort(m.apuMem, __ovf((off - 8512), -9223372036854775808, 9223372036854775807), val);
    return;
  }
  if ((off == 16907)) {
    __idxSet(m.mmio, __ovf((off - 8192), -9223372036854775808, 9223372036854775807), (((val & 255) >>> 0) & 0xFF));
    runDMA(m, val);
    return;
  }
  if ((off == 8576)) {
    __idxSet(m.wram, ((m.wmadd & 131071) >>> 0), (((val & 255) >>> 0) & 0xFF));
    m.wmadd = ((__ovf((m.wmadd + 1), -9223372036854775808, 9223372036854775807) & 131071) >>> 0);
    return;
  }
  if ((off == 8577)) {
    m.wmadd = ((((m.wmadd & 130816) >>> 0) | val) >>> 0);
    return;
  }
  if ((off == 8578)) {
    m.wmadd = ((((m.wmadd & 65791) >>> 0) | Math.trunc(val * 2 ** (__sh(8, 64)))) >>> 0);
    return;
  }
  if ((off == 8579)) {
    m.wmadd = ((((m.wmadd & 65535) >>> 0) | Math.trunc(((val & 1) >>> 0) * 2 ** (__sh(16, 64)))) >>> 0);
    return;
  }
  if ((off == 16406)) {
    joyLatch1 = m.joy1;
    joyCnt1 = 0;
    joyLatch2 = m.joy2;
    joyCnt2 = 0;
    return;
  }
  if ((off == 16896)) {
    m.nmitimen = val;
    return;
  }
  if ((off == 16898)) {
    m.wrmpya = val;
    return;
  }
  if ((off == 16899)) {
    m.rdmpy = ((__ovf((m.wrmpya * val), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    return;
  }
  if ((off == 16900)) {
    m.wrdiv = ((((m.wrdiv & 65280) >>> 0) | val) >>> 0);
    return;
  }
  if ((off == 16901)) {
    m.wrdiv = ((((m.wrdiv & 255) >>> 0) | Math.trunc(val * 2 ** (__sh(8, 64)))) >>> 0);
    return;
  }
  if ((off == 16902)) {
    if ((val == 0)) {
      m.rddiv = 65535;
      m.rdmpy = m.wrdiv;
    } else {
      m.rddiv = ((__ovf(__idiv(m.wrdiv, val), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
      m.rdmpy = ((__irem(m.wrdiv, val) & 65535) >>> 0);
    }
    return;
  }
  if ((off == 16903)) {
    m.htime = ((((m.htime & 256) >>> 0) | val) >>> 0);
    return;
  }
  if ((off == 16904)) {
    m.htime = ((Math.trunc(((val & 1) >>> 0) * 2 ** (__sh(8, 64))) | ((m.htime & 255) >>> 0)) >>> 0);
    return;
  }
  if ((off == 16905)) {
    m.vtime = ((((m.vtime & 256) >>> 0) | val) >>> 0);
    return;
  }
  if ((off == 16906)) {
    m.vtime = ((Math.trunc(((val & 1) >>> 0) * 2 ** (__sh(8, 64))) | ((m.vtime & 255) >>> 0)) >>> 0);
    return;
  }
  __idxSet(m.mmio, __ovf((off - 8192), -9223372036854775808, 9223372036854775807), (((val & 255) >>> 0) & 0xFF));
}

function memReset(m) {
  m.addr = [];
  m.val = [];
}

function romOffset(m, bank, off) {
  if ((m.mapMode == 1)) {
    return ((((Math.trunc(((bank & 63) >>> 0) * 2 ** (__sh(16, 64))) | off) >>> 0) & m.romMask) >>> 0);
  }
  return ((((Math.trunc(((bank & 127) >>> 0) * 2 ** (__sh(15, 64))) | ((off & 32767) >>> 0)) >>> 0) & m.romMask) >>> 0);
}

function romByte(m, bank, off) {
  const o = romOffset(m, bank, off);
  if ((o < m.rom.length)) {
    return Math.trunc(__idx(m.rom, o));
  }
  return 0;
}

function sramIndex(m, bank, off) {
  const b = ((bank & 127) >>> 0);
  if ((m.mapMode == 0)) {
    if ((((b >= 112) && (b <= 125)) && (off < 32768))) {
      return ((((Math.trunc(__ovf((b - 112), -9223372036854775808, 9223372036854775807) * 2 ** (__sh(15, 64))) | off) >>> 0) & m.sramMask) >>> 0);
    }
    return __ovf((-1), -9223372036854775808, 9223372036854775807);
  }
  if (((((b >= 32) && (b <= 63)) && (off >= 24576)) && (off < 32768))) {
    return ((((Math.trunc(__ovf((b - 32), -9223372036854775808, 9223372036854775807) * 2 ** (__sh(13, 64))) | __ovf((off - 24576), -9223372036854775808, 9223372036854775807)) >>> 0) & m.sramMask) >>> 0);
  }
  return __ovf((-1), -9223372036854775808, 9223372036854775807);
}

function sramToString(m) {
  let s = "";
  for (const b of m.sram) {
    (s += String.fromCharCode(b));
  }
  return s;
}

function sramFromString(m, data) {
  let i = 0;
  while (((i < m.sram.length) && (i < data.length))) {
    __idxSet(m.sram, i, __sbyte(data, i));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
}

function memRead(m, a) {
  if (m.testMode) {
    let i = 0;
    while ((i < m.addr.length)) {
      if ((__idx(m.addr, i) == a)) {
        return __idx(m.val, i);
      }
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
    return 0;
  }
  const bank = ((Math.floor(a / 2 ** (__sh(16, 64))) & 255) >>> 0);
  const off = ((a & 65535) >>> 0);
  if ((bank == 126)) {
    return Math.trunc(__idx(m.wram, off));
  }
  if ((bank == 127)) {
    return Math.trunc(__idx(m.wram, __ovf((65536 + off), -9223372036854775808, 9223372036854775807)));
  }
  if (m.fxEnabled) {
    const b7 = ((bank & 127) >>> 0);
    if ((b7 <= 63)) {
      if (((off >= 12288) && (off <= 13567))) {
        if ((off == 12337)) {
          fxIrqAck = true;
        }
        return fxRegRead(m.fx, off);
      }
      if (((off >= 24576) && (off <= 32767))) {
        return Math.trunc(__idx(m.fx.ram, ((__ovf((off - 24576), -9223372036854775808, 9223372036854775807) & m.fx.ramMask) >>> 0)));
      }
    }
    if ((b7 == 112)) {
      return Math.trunc(__idx(m.fx.ram, ((off & m.fx.ramMask) >>> 0)));
    }
    if ((b7 == 113)) {
      return Math.trunc(__idx(m.fx.ram, ((__ovf((65536 + off), -9223372036854775808, 9223372036854775807) & m.fx.ramMask) >>> 0)));
    }
    if (((b7 >= 64) && (b7 <= 95))) {
      const o = ((((Math.trunc(((bank & 63) >>> 0) * 2 ** (__sh(16, 64))) | off) >>> 0) & m.romMask) >>> 0);
      if ((o < m.rom.length)) {
        return Math.trunc(__idx(m.rom, o));
      }
      return 0;
    }
  }
  const si = sramIndex(m, bank, off);
  if ((si >= 0)) {
    return Math.trunc(__idx(m.sram, si));
  }
  const b = ((bank & 127) >>> 0);
  if ((b <= 63)) {
    if ((off < 8192)) {
      return Math.trunc(__idx(m.wram, off));
    }
    if ((off < 24576)) {
      return mmioRead(m, off);
    }
    if ((off < 32768)) {
      return 0;
    }
    return romByte(m, bank, off);
  }
  return romByte(m, bank, off);
}

function memWrite(m, a, v) {
  if (m.testMode) {
    let i = 0;
    while ((i < m.addr.length)) {
      if ((__idx(m.addr, i) == a)) {
        __idxSet(m.val, i, ((v & 255) >>> 0));
        return;
      }
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
    m.addr.push(a);
    m.val.push(((v & 255) >>> 0));
    return;
  }
  const bank = ((Math.floor(a / 2 ** (__sh(16, 64))) & 255) >>> 0);
  const off = ((a & 65535) >>> 0);
  const bv = (((v & 255) >>> 0) & 0xFF);
  if ((bank == 126)) {
    __idxSet(m.wram, off, bv);
    return;
  }
  if ((bank == 127)) {
    __idxSet(m.wram, __ovf((65536 + off), -9223372036854775808, 9223372036854775807), bv);
    return;
  }
  if (m.fxEnabled) {
    const b7 = ((bank & 127) >>> 0);
    if ((b7 <= 63)) {
      if (((off >= 12288) && (off <= 13567))) {
        fxRegWrite(m.fx, off, v);
        return;
      }
      if (((off >= 24576) && (off <= 32767))) {
        __idxSet(m.fx.ram, ((__ovf((off - 24576), -9223372036854775808, 9223372036854775807) & m.fx.ramMask) >>> 0), bv);
        return;
      }
    }
    if ((b7 == 112)) {
      __idxSet(m.fx.ram, ((off & m.fx.ramMask) >>> 0), bv);
      return;
    }
    if ((b7 == 113)) {
      __idxSet(m.fx.ram, ((__ovf((65536 + off), -9223372036854775808, 9223372036854775807) & m.fx.ramMask) >>> 0), bv);
      return;
    }
  }
  const si = sramIndex(m, bank, off);
  if ((si >= 0)) {
    __idxSet(m.sram, si, bv);
    return;
  }
  const b = ((bank & 127) >>> 0);
  if ((b <= 63)) {
    if ((off < 8192)) {
      __idxSet(m.wram, off, bv);
      return;
    }
    if ((off < 24576)) {
      mmioWrite(m, off, v);
      return;
    }
    return;
  }
}

function newCpuReset(m) {
  const lo = memRead(m, 65532);
  const hi = memRead(m, 65533);
  return new Cpu(0, 0, 0, 511, 0, ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0), 52, 0, 0, 1);
}

function nmi(cpu, m) {
  if ((cpu.e == 0)) {
    push8(cpu, m, cpu.pbr);
    push16(cpu, m, cpu.pc);
    push8(cpu, m, cpu.p);
    setBit(cpu, FI, true);
    setBit(cpu, FD, false);
    cpu.pbr = 0;
    cpu.pc = ((memRead(m, 65514) | Math.trunc(memRead(m, 65515) * 2 ** (__sh(8, 64)))) >>> 0);
  } else {
    push16(cpu, m, cpu.pc);
    push8(cpu, m, ((cpu.p & (~16)) >>> 0));
    setBit(cpu, FI, true);
    setBit(cpu, FD, false);
    cpu.pbr = 0;
    cpu.pc = ((memRead(m, 65530) | Math.trunc(memRead(m, 65531) * 2 ** (__sh(8, 64)))) >>> 0);
  }
}

function irq(cpu, m) {
  if ((cpu.e == 0)) {
    push8(cpu, m, cpu.pbr);
    push16(cpu, m, cpu.pc);
    push8(cpu, m, cpu.p);
    setBit(cpu, FI, true);
    setBit(cpu, FD, false);
    cpu.pbr = 0;
    cpu.pc = ((memRead(m, 65518) | Math.trunc(memRead(m, 65519) * 2 ** (__sh(8, 64)))) >>> 0);
  } else {
    push16(cpu, m, cpu.pc);
    push8(cpu, m, ((cpu.p & (~16)) >>> 0));
    setBit(cpu, FI, true);
    setBit(cpu, FD, false);
    cpu.pbr = 0;
    cpu.pc = ((memRead(m, 65534) | Math.trunc(memRead(m, 65535) * 2 ** (__sh(8, 64)))) >>> 0);
  }
}

function maybeIrq(cpu, m) {
  if ((((m.nmitimen & 48) >>> 0) == 0)) {
    return;
  }
  m.timeup = 128;
  if ((((cpu.p & FI) >>> 0) == 0)) {
    irq(cpu, m);
  }
}

function runFxAndIrq(cpu, m) {
  if ((!m.fxEnabled)) {
    return;
  }
  if (fxIrqAck) {
    m.fx.irqPending = false;
    fxIrqAck = false;
  }
  if ((m.fx.running && (fxFrameBudget > 0))) {
    let burst = 32;
    if ((burst > fxFrameBudget)) {
      burst = fxFrameBudget;
    }
    const ran = fxRun(m.fx, burst);
    fxFrameBudget = __ovf((fxFrameBudget - ran), -9223372036854775808, 9223372036854775807);
  }
  if ((m.fx.irqPending && (((cpu.p & FI) >>> 0) == 0))) {
    irq(cpu, m);
  }
}

function stepFrame(cpu, m) {
  fxFrameBudget = 700000;
  const activeSteps = 20000;
  const vblankSteps = 1400;
  m.timeup = 0;
  let irqAt = __ovf((-1), -9223372036854775808, 9223372036854775807);
  if ((((m.nmitimen & 48) >>> 0) != 0)) {
    let vt = m.vtime;
    if ((vt > 224)) {
      vt = 224;
    }
    irqAt = __ovf(__idiv(__ovf((vt * activeSteps), -9223372036854775808, 9223372036854775807), 224), -9223372036854775808, 9223372036854775807);
  }
  let fired = false;
  cpuWaiting = false;
  let i = 0;
  while ((i < activeSteps)) {
    if ((((!fired) && (irqAt >= 0)) && (i >= irqAt))) {
      maybeIrq(cpu, m);
      fired = true;
    }
    m.scanline = __ovf(__idiv(__ovf((i * 224), -9223372036854775808, 9223372036854775807), activeSteps), -9223372036854775808, 9223372036854775807);
    step(cpu, m);
    if ((((i & 3) >>> 0) == 0)) {
      runApu(m, 2);
    }
    runFxAndIrq(cpu, m);
    if ((cpuWaiting && (!(m.fxEnabled && m.fx.running)))) {
      cpuWaiting = false;
      i = activeSteps;
    } else {
      cpuWaiting = false;
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
  }
  hdmaWalkFrame(m);
  m.vblankToggle = 128;
  ppuVblankOamReload(m.ppu);
  if ((((m.nmitimen & 128) >>> 0) != 0)) {
    nmi(cpu, m);
  }
  i = 0;
  while ((i < vblankSteps)) {
    m.scanline = __ovf((224 + __ovf(__idiv(__ovf((i * 38), -9223372036854775808, 9223372036854775807), vblankSteps), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
    step(cpu, m);
    if ((((i & 3) >>> 0) == 0)) {
      runApu(m, 2);
    }
    runFxAndIrq(cpu, m);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  m.vblankToggle = 0;
}

function m8(cpu) {
  return ((cpu.e == 1) || (((cpu.p & FM) >>> 0) != 0));
}

function x8(cpu) {
  return ((cpu.e == 1) || (((cpu.p & FX) >>> 0) != 0));
}

function setBit(cpu, mask, on) {
  if (on) {
    cpu.p = ((cpu.p | mask) >>> 0);
  } else {
    cpu.p = ((cpu.p & (~mask)) >>> 0);
  }
}

function setNZ8(cpu, v) {
  setBit(cpu, FZ, (((v & 255) >>> 0) == 0));
  setBit(cpu, FN, (((v & 128) >>> 0) != 0));
}

function setNZ16(cpu, v) {
  setBit(cpu, FZ, (((v & 65535) >>> 0) == 0));
  setBit(cpu, FN, (((v & 32768) >>> 0) != 0));
}

function setNZa(cpu, v) {
  if (m8(cpu)) {
    setNZ8(cpu, v);
  } else {
    setNZ16(cpu, v);
  }
}

function setNZx(cpu, v) {
  if (x8(cpu)) {
    setNZ8(cpu, v);
  } else {
    setNZ16(cpu, v);
  }
}

function fetch8(cpu, m) {
  const a = ((Math.trunc(cpu.pbr * 2 ** (__sh(16, 64))) | cpu.pc) >>> 0);
  const v = memRead(m, a);
  cpu.pc = ((__ovf((cpu.pc + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  return v;
}

function applyEmulationConstraints(cpu) {
  if ((cpu.e == 1)) {
    cpu.p = ((((cpu.p | FM) >>> 0) | FX) >>> 0);
    cpu.x = ((cpu.x & 255) >>> 0);
    cpu.y = ((cpu.y & 255) >>> 0);
    cpu.s = ((256 | ((cpu.s & 255) >>> 0)) >>> 0);
  }
}

function spDec(cpu) {
  if ((cpu.e == 1)) {
    cpu.s = ((256 | ((__ovf((cpu.s - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0)) >>> 0);
  } else {
    cpu.s = ((__ovf((cpu.s - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  }
}

function spInc(cpu) {
  if ((cpu.e == 1)) {
    cpu.s = ((256 | ((__ovf((cpu.s + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0)) >>> 0);
  } else {
    cpu.s = ((__ovf((cpu.s + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  }
}

function push8(cpu, m, v) {
  memWrite(m, cpu.s, ((v & 255) >>> 0));
  spDec(cpu);
}

function pull8(cpu, m) {
  spInc(cpu);
  return memRead(m, cpu.s);
}

function push16(cpu, m, v) {
  push8(cpu, m, ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0));
  push8(cpu, m, ((v & 255) >>> 0));
}

function pull16(cpu, m) {
  const lo = pull8(cpu, m);
  const hi = pull8(cpu, m);
  return ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
}

function fetch16(cpu, m) {
  const lo = fetch8(cpu, m);
  const hi = fetch8(cpu, m);
  return ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
}

function push8f(cpu, m, v) {
  memWrite(m, cpu.s, ((v & 255) >>> 0));
  cpu.s = ((__ovf((cpu.s - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
}

function pull8f(cpu, m) {
  cpu.s = ((__ovf((cpu.s + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  return memRead(m, cpu.s);
}

function push16f(cpu, m, v) {
  push8f(cpu, m, ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0));
  push8f(cpu, m, ((v & 255) >>> 0));
}

function pull16f(cpu, m) {
  const lo = pull8f(cpu, m);
  const hi = pull8f(cpu, m);
  return ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
}

function clampEmuStack(cpu) {
  if ((cpu.e == 1)) {
    cpu.s = ((256 | ((cpu.s & 255) >>> 0)) >>> 0);
  }
}

function fetch24(cpu, m) {
  const lo = fetch8(cpu, m);
  const mid = fetch8(cpu, m);
  const hi = fetch8(cpu, m);
  return ((((lo | Math.trunc(mid * 2 ** (__sh(8, 64)))) >>> 0) | Math.trunc(hi * 2 ** (__sh(16, 64)))) >>> 0);
}

function aDp(cpu, m) {
  return ((__ovf((cpu.d + fetch8(cpu, m)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
}

function dpIndexed(cpu, dp, idx) {
  if (((cpu.e == 1) && (((cpu.d & 255) >>> 0) == 0))) {
    return ((((cpu.d & 65280) >>> 0) | ((__ovf((dp + idx), -9223372036854775808, 9223372036854775807) & 255) >>> 0)) >>> 0);
  }
  return ((__ovf((__ovf((cpu.d + dp), -9223372036854775808, 9223372036854775807) + idx), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
}

function aDpX(cpu, m) {
  return dpIndexed(cpu, fetch8(cpu, m), cpu.x);
}

function aDpY(cpu, m) {
  return dpIndexed(cpu, fetch8(cpu, m), cpu.y);
}

function aAbs(cpu, m) {
  return ((Math.trunc(cpu.dbr * 2 ** (__sh(16, 64))) | fetch16(cpu, m)) >>> 0);
}

function aAbsX(cpu, m) {
  return ((__ovf((((Math.trunc(cpu.dbr * 2 ** (__sh(16, 64))) | fetch16(cpu, m)) >>> 0) + cpu.x), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
}

function aAbsY(cpu, m) {
  return ((__ovf((((Math.trunc(cpu.dbr * 2 ** (__sh(16, 64))) | fetch16(cpu, m)) >>> 0) + cpu.y), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
}

function aLong(cpu, m) {
  return fetch24(cpu, m);
}

function aLongX(cpu, m) {
  return ((__ovf((fetch24(cpu, m) + cpu.x), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
}

function readPtr16(m, addr) {
  const lo = memRead(m, ((addr & 65535) >>> 0));
  const hi = memRead(m, ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  return ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
}

function readPtr24(m, addr) {
  const lo = memRead(m, ((addr & 65535) >>> 0));
  const mid = memRead(m, ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  const hi = memRead(m, ((__ovf((addr + 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  return ((((lo | Math.trunc(mid * 2 ** (__sh(8, 64)))) >>> 0) | Math.trunc(hi * 2 ** (__sh(16, 64)))) >>> 0);
}

function aDpIndX(cpu, m) {
  const ptr = readPtr16(m, dpIndexed(cpu, fetch8(cpu, m), cpu.x));
  return ((Math.trunc(cpu.dbr * 2 ** (__sh(16, 64))) | ptr) >>> 0);
}

function aDpIndY(cpu, m) {
  const ptr = readPtr16(m, ((__ovf((cpu.d + fetch8(cpu, m)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  return ((__ovf((((Math.trunc(cpu.dbr * 2 ** (__sh(16, 64))) | ptr) >>> 0) + cpu.y), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
}

function aDpInd(cpu, m) {
  const ptr = readPtr16(m, ((__ovf((cpu.d + fetch8(cpu, m)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  return ((((Math.trunc(cpu.dbr * 2 ** (__sh(16, 64))) | ptr) >>> 0) & 16777215) >>> 0);
}

function aDpLong(cpu, m) {
  return readPtr24(m, ((__ovf((cpu.d + fetch8(cpu, m)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
}

function aDpLongY(cpu, m) {
  return ((__ovf((readPtr24(m, ((__ovf((cpu.d + fetch8(cpu, m)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)) + cpu.y), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
}

function aSr(cpu, m) {
  return ((__ovf((cpu.s + fetch8(cpu, m)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
}

function aSrY(cpu, m) {
  const ptr = readPtr16(m, ((__ovf((cpu.s + fetch8(cpu, m)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  return ((__ovf((((Math.trunc(cpu.dbr * 2 ** (__sh(16, 64))) | ptr) >>> 0) + cpu.y), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
}

function read16w(m, addr, bank0wrap) {
  const lo = memRead(m, addr);
  const hiAddr = (() => {
  if (bank0wrap) {
    return ((((addr & 16711680) >>> 0) | ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)) >>> 0);
  } else {
    return ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
  }
  })();
  const hi = memRead(m, hiAddr);
  return ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
}

function write16w(m, addr, v, bank0wrap) {
  memWrite(m, addr, ((v & 255) >>> 0));
  const hiAddr = (() => {
  if (bank0wrap) {
    return ((((addr & 16711680) >>> 0) | ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)) >>> 0);
  } else {
    return ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
  }
  })();
  memWrite(m, hiAddr, ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0));
}

function staTo(cpu, m, addr, bank0wrap) {
  if (m8(cpu)) {
    memWrite(m, addr, ((cpu.a & 255) >>> 0));
  } else {
    write16w(m, addr, cpu.a, bank0wrap);
  }
}

function ldaFrom(cpu, m, addr, bank0wrap) {
  if (m8(cpu)) {
    const v = memRead(m, addr);
    cpu.a = ((((cpu.a & 65280) >>> 0) | v) >>> 0);
    setNZ8(cpu, v);
  } else {
    const v = read16w(m, addr, bank0wrap);
    cpu.a = v;
    setNZ16(cpu, v);
  }
}

function readMval(cpu, m, addr, bank0wrap) {
  if (m8(cpu)) {
    return memRead(m, addr);
  }
  return read16w(m, addr, bank0wrap);
}

function readXval(cpu, m, addr, bank0wrap) {
  if (x8(cpu)) {
    return memRead(m, addr);
  }
  return read16w(m, addr, bank0wrap);
}

function immM(cpu, m) {
  if (m8(cpu)) {
    return fetch8(cpu, m);
  }
  return fetch16(cpu, m);
}

function immX(cpu, m) {
  if (x8(cpu)) {
    return fetch8(cpu, m);
  }
  return fetch16(cpu, m);
}

function setA(cpu, r) {
  if (m8(cpu)) {
    cpu.a = ((((cpu.a & 65280) >>> 0) | ((r & 255) >>> 0)) >>> 0);
    setNZ8(cpu, r);
  } else {
    cpu.a = ((r & 65535) >>> 0);
    setNZ16(cpu, r);
  }
}

function setXreg(cpu, r) {
  if (x8(cpu)) {
    cpu.x = ((r & 255) >>> 0);
    setNZ8(cpu, r);
  } else {
    cpu.x = ((r & 65535) >>> 0);
    setNZ16(cpu, r);
  }
}

function setYreg(cpu, r) {
  if (x8(cpu)) {
    cpu.y = ((r & 255) >>> 0);
    setNZ8(cpu, r);
  } else {
    cpu.y = ((r & 65535) >>> 0);
    setNZ16(cpu, r);
  }
}

function compareVals(cpu, reg, v, wide) {
  const mask = (() => {
  if (wide) {
    return 65535;
  } else {
    return 255;
  }
  })();
  const signbit = (() => {
  if (wide) {
    return 32768;
  } else {
    return 128;
  }
  })();
  const a = ((reg & mask) >>> 0);
  const b = ((v & mask) >>> 0);
  setBit(cpu, FC, (a >= b));
  const r = ((__ovf((a - b), -9223372036854775808, 9223372036854775807) & mask) >>> 0);
  setBit(cpu, FZ, (r == 0));
  setBit(cpu, FN, (((r & signbit) >>> 0) != 0));
}

function oraFrom(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  setA(cpu, ((cpu.a | v) >>> 0));
}

function andFrom(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  setA(cpu, ((cpu.a & v) >>> 0));
}

function eorFrom(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  setA(cpu, ((cpu.a ^ v) >>> 0));
}

function cmpFrom(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  compareVals(cpu, cpu.a, v, (!m8(cpu)));
}

function cpxFrom(cpu, m, addr, wrap) {
  const v = readXval(cpu, m, addr, wrap);
  compareVals(cpu, cpu.x, v, (!x8(cpu)));
}

function cpyFrom(cpu, m, addr, wrap) {
  const v = readXval(cpu, m, addr, wrap);
  compareVals(cpu, cpu.y, v, (!x8(cpu)));
}

function ldxFrom(cpu, m, addr, wrap) {
  const v = readXval(cpu, m, addr, wrap);
  setXreg(cpu, v);
}

function ldyFrom(cpu, m, addr, wrap) {
  const v = readXval(cpu, m, addr, wrap);
  setYreg(cpu, v);
}

function stxTo(cpu, m, addr, wrap) {
  if (x8(cpu)) {
    memWrite(m, addr, ((cpu.x & 255) >>> 0));
  } else {
    write16w(m, addr, cpu.x, wrap);
  }
}

function styTo(cpu, m, addr, wrap) {
  if (x8(cpu)) {
    memWrite(m, addr, ((cpu.y & 255) >>> 0));
  } else {
    write16w(m, addr, cpu.y, wrap);
  }
}

function stzTo(cpu, m, addr, wrap) {
  if (m8(cpu)) {
    memWrite(m, addr, 0);
  } else {
    write16w(m, addr, 0, wrap);
  }
}

function doADC(cpu, v) {
  const wide = (!m8(cpu));
  const mask = (() => {
  if (wide) {
    return 65535;
  } else {
    return 255;
  }
  })();
  const signbit = (() => {
  if (wide) {
    return 32768;
  } else {
    return 128;
  }
  })();
  const carrybit = (() => {
  if (wide) {
    return 65536;
  } else {
    return 256;
  }
  })();
  const a = ((cpu.a & mask) >>> 0);
  const b = ((v & mask) >>> 0);
  const c = ((cpu.p & FC) >>> 0);
  if ((((cpu.p & FD) >>> 0) != 0)) {
    const nib = (() => {
    if (wide) {
      return 4;
    } else {
      return 2;
    }
    })();
    let carry = c;
    let r = 0;
    let sTop = 0;
    let i = 0;
    while ((i < nib)) {
      const sh = __ovf((i * 4), -9223372036854775808, 9223372036854775807);
      let d = __ovf((__ovf((((Math.floor(a / 2 ** (__sh(sh, 64))) & 15) >>> 0) + ((Math.floor(b / 2 ** (__sh(sh, 64))) & 15) >>> 0)), -9223372036854775808, 9223372036854775807) + carry), -9223372036854775808, 9223372036854775807);
      if ((i == __ovf((nib - 1), -9223372036854775808, 9223372036854775807))) {
        sTop = d;
      }
      if ((d >= 10)) {
        d = ((__ovf((d + 6), -9223372036854775808, 9223372036854775807) & 15) >>> 0);
        carry = 1;
      } else {
        carry = 0;
      }
      r = ((r | Math.trunc(d * 2 ** (__sh(sh, 64)))) >>> 0);
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
    const topsh = __ovf((__ovf((nib - 1), -9223372036854775808, 9223372036854775807) * 4), -9223372036854775808, 9223372036854775807);
    const sV = ((((r & __ovf((Math.trunc(1 * 2 ** (__sh(topsh, 64))) - 1), -9223372036854775808, 9223372036854775807)) >>> 0) | Math.trunc(sTop * 2 ** (__sh(topsh, 64)))) >>> 0);
    setBit(cpu, FV, ((((((~((a ^ b) >>> 0)) & ((a ^ sV) >>> 0)) >>> 0) & signbit) >>> 0) != 0));
    setBit(cpu, FC, (carry != 0));
    const rr = ((r & mask) >>> 0);
    setBit(cpu, FN, (((rr & signbit) >>> 0) != 0));
    setBit(cpu, FZ, (rr == 0));
    if (wide) {
      cpu.a = rr;
    } else {
      cpu.a = ((((cpu.a & 65280) >>> 0) | rr) >>> 0);
    }
  } else {
    const sum = __ovf((__ovf((a + b), -9223372036854775808, 9223372036854775807) + c), -9223372036854775808, 9223372036854775807);
    const r = ((sum & mask) >>> 0);
    setBit(cpu, FC, (sum >= carrybit));
    setBit(cpu, FV, (((((((a ^ r) >>> 0) & ((b ^ r) >>> 0)) >>> 0) & signbit) >>> 0) != 0));
    setBit(cpu, FZ, (r == 0));
    setBit(cpu, FN, (((r & signbit) >>> 0) != 0));
    if (wide) {
      cpu.a = r;
    } else {
      cpu.a = ((((cpu.a & 65280) >>> 0) | r) >>> 0);
    }
  }
}

function doSBC(cpu, v) {
  const wide = (!m8(cpu));
  const mask = (() => {
  if (wide) {
    return 65535;
  } else {
    return 255;
  }
  })();
  const signbit = (() => {
  if (wide) {
    return 32768;
  } else {
    return 128;
  }
  })();
  const carrybit = (() => {
  if (wide) {
    return 65536;
  } else {
    return 256;
  }
  })();
  const a = ((cpu.a & mask) >>> 0);
  const b = ((v & mask) >>> 0);
  const c = ((cpu.p & FC) >>> 0);
  const comp = ((b ^ mask) >>> 0);
  const sum = __ovf((__ovf((a + comp), -9223372036854775808, 9223372036854775807) + c), -9223372036854775808, 9223372036854775807);
  const rbin = ((sum & mask) >>> 0);
  setBit(cpu, FC, (sum >= carrybit));
  setBit(cpu, FV, (((((((a ^ rbin) >>> 0) & ((comp ^ rbin) >>> 0)) >>> 0) & signbit) >>> 0) != 0));
  setBit(cpu, FN, (((rbin & signbit) >>> 0) != 0));
  setBit(cpu, FZ, (rbin == 0));
  let r = rbin;
  if ((((cpu.p & FD) >>> 0) != 0)) {
    const nib = (() => {
    if (wide) {
      return 4;
    } else {
      return 2;
    }
    })();
    let borrow = __ovf((1 - c), -9223372036854775808, 9223372036854775807);
    let dr = 0;
    let i = 0;
    while ((i < nib)) {
      const sh = __ovf((i * 4), -9223372036854775808, 9223372036854775807);
      let d = __ovf((__ovf((((Math.floor(a / 2 ** (__sh(sh, 64))) & 15) >>> 0) - ((Math.floor(b / 2 ** (__sh(sh, 64))) & 15) >>> 0)), -9223372036854775808, 9223372036854775807) - borrow), -9223372036854775808, 9223372036854775807);
      if ((d < 0)) {
        d = ((__ovf((d - 6), -9223372036854775808, 9223372036854775807) & 15) >>> 0);
        borrow = 1;
      } else {
        d = ((d & 15) >>> 0);
        borrow = 0;
      }
      dr = ((dr | Math.trunc(d * 2 ** (__sh(sh, 64)))) >>> 0);
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
    r = ((dr & mask) >>> 0);
    setBit(cpu, FN, (((r & signbit) >>> 0) != 0));
    setBit(cpu, FZ, (r == 0));
  }
  if (wide) {
    cpu.a = r;
  } else {
    cpu.a = ((((cpu.a & 65280) >>> 0) | r) >>> 0);
  }
}

function adcFrom(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  doADC(cpu, v);
}

function sbcFrom(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  doSBC(cpu, v);
}

function accMask(cpu) {
  if (m8(cpu)) {
    return 255;
  }
  return 65535;
}

function aslVal(cpu, v) {
  const mask = accMask(cpu);
  const signbit = (() => {
  if (m8(cpu)) {
    return 128;
  } else {
    return 32768;
  }
  })();
  setBit(cpu, FC, (((v & signbit) >>> 0) != 0));
  const r = ((Math.trunc(v * 2 ** (__sh(1, 64))) & mask) >>> 0);
  setNZa(cpu, r);
  return r;
}

function lsrVal(cpu, v) {
  const mask = accMask(cpu);
  setBit(cpu, FC, (((v & 1) >>> 0) != 0));
  const r = Math.floor(((v & mask) >>> 0) / 2 ** (__sh(1, 64)));
  setNZa(cpu, r);
  return r;
}

function rolVal(cpu, v) {
  const mask = accMask(cpu);
  const signbit = (() => {
  if (m8(cpu)) {
    return 128;
  } else {
    return 32768;
  }
  })();
  const oldC = ((cpu.p & FC) >>> 0);
  setBit(cpu, FC, (((v & signbit) >>> 0) != 0));
  const r = ((((Math.trunc(v * 2 ** (__sh(1, 64))) | oldC) >>> 0) & mask) >>> 0);
  setNZa(cpu, r);
  return r;
}

function rorVal(cpu, v) {
  const mask = accMask(cpu);
  const topbit = (() => {
  if (m8(cpu)) {
    return 128;
  } else {
    return 32768;
  }
  })();
  const oldC = ((cpu.p & FC) >>> 0);
  setBit(cpu, FC, (((v & 1) >>> 0) != 0));
  let r = Math.floor(((v & mask) >>> 0) / 2 ** (__sh(1, 64)));
  if ((oldC != 0)) {
    r = ((r | topbit) >>> 0);
  }
  setNZa(cpu, r);
  return r;
}

function incVal(cpu, v) {
  const mask = accMask(cpu);
  const r = ((__ovf((v + 1), -9223372036854775808, 9223372036854775807) & mask) >>> 0);
  setNZa(cpu, r);
  return r;
}

function decVal(cpu, v) {
  const mask = accMask(cpu);
  const r = ((__ovf((v - 1), -9223372036854775808, 9223372036854775807) & mask) >>> 0);
  setNZa(cpu, r);
  return r;
}

function writeAccW(cpu, r) {
  if (m8(cpu)) {
    cpu.a = ((((cpu.a & 65280) >>> 0) | ((r & 255) >>> 0)) >>> 0);
  } else {
    cpu.a = ((r & 65535) >>> 0);
  }
}

function accASL(cpu) {
  const v = ((cpu.a & accMask(cpu)) >>> 0);
  const r = aslVal(cpu, v);
  writeAccW(cpu, r);
}

function accLSR(cpu) {
  const v = ((cpu.a & accMask(cpu)) >>> 0);
  const r = lsrVal(cpu, v);
  writeAccW(cpu, r);
}

function accROL(cpu) {
  const v = ((cpu.a & accMask(cpu)) >>> 0);
  const r = rolVal(cpu, v);
  writeAccW(cpu, r);
}

function accROR(cpu) {
  const v = ((cpu.a & accMask(cpu)) >>> 0);
  const r = rorVal(cpu, v);
  writeAccW(cpu, r);
}

function rmwWrite(cpu, m, addr, wrap, r) {
  if (m8(cpu)) {
    memWrite(m, addr, ((r & 255) >>> 0));
  } else {
    write16w(m, addr, r, wrap);
  }
}

function rmwMem(cpu, m, addr, wrap, kind) {
  const v = readMval(cpu, m, addr, wrap);
  let r = 0;
  if ((kind == 0)) {
    r = aslVal(cpu, v);
  } else {
    if ((kind == 1)) {
      r = lsrVal(cpu, v);
    } else {
      if ((kind == 2)) {
        r = rolVal(cpu, v);
      } else {
        if ((kind == 3)) {
          r = rorVal(cpu, v);
        } else {
          if ((kind == 4)) {
            r = incVal(cpu, v);
          } else {
            r = decVal(cpu, v);
          }
        }
      }
    }
  }
  rmwWrite(cpu, m, addr, wrap, r);
}

function tsbMem(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  const a = ((cpu.a & accMask(cpu)) >>> 0);
  setBit(cpu, FZ, (((a & v) >>> 0) == 0));
  rmwWrite(cpu, m, addr, wrap, ((v | a) >>> 0));
}

function trbMem(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  const a = ((cpu.a & accMask(cpu)) >>> 0);
  setBit(cpu, FZ, (((a & v) >>> 0) == 0));
  rmwWrite(cpu, m, addr, wrap, ((v & (~a)) >>> 0));
}

function bitMem(cpu, m, addr, wrap) {
  const v = readMval(cpu, m, addr, wrap);
  const signbit = (() => {
  if (m8(cpu)) {
    return 128;
  } else {
    return 32768;
  }
  })();
  const ovbit = (() => {
  if (m8(cpu)) {
    return 64;
  } else {
    return 16384;
  }
  })();
  setBit(cpu, FZ, (((((cpu.a & accMask(cpu)) >>> 0) & v) >>> 0) == 0));
  setBit(cpu, FN, (((v & signbit) >>> 0) != 0));
  setBit(cpu, FV, (((v & ovbit) >>> 0) != 0));
}

function bitImm(cpu, v) {
  setBit(cpu, FZ, (((((cpu.a & accMask(cpu)) >>> 0) & v) >>> 0) == 0));
}

function branchIf(cpu, m, cond) {
  const off = fetch8(cpu, m);
  const soff = (() => {
  if ((off >= 128)) {
    return __ovf((off - 256), -9223372036854775808, 9223372036854775807);
  } else {
    return off;
  }
  })();
  if (cond) {
    cpu.pc = ((__ovf((cpu.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  }
}

function softInterrupt(cpu, m, nativeVec, emuVec) {
  const ret = ((__ovf((cpu.pc + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  if ((cpu.e == 0)) {
    push8(cpu, m, cpu.pbr);
    push16(cpu, m, ret);
    push8(cpu, m, cpu.p);
    setBit(cpu, FI, true);
    setBit(cpu, FD, false);
    cpu.pbr = 0;
    const lo = memRead(m, nativeVec);
    const hi = memRead(m, __ovf((nativeVec + 1), -9223372036854775808, 9223372036854775807));
    cpu.pc = ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
  } else {
    push16(cpu, m, ret);
    push8(cpu, m, ((cpu.p | 16) >>> 0));
    setBit(cpu, FI, true);
    setBit(cpu, FD, false);
    cpu.pbr = 0;
    const lo = memRead(m, emuVec);
    const hi = memRead(m, __ovf((emuVec + 1), -9223372036854775808, 9223372036854775807));
    cpu.pc = ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
  }
}

function blockMove(cpu, m, dir) {
  const destbank = fetch8(cpu, m);
  const srcbank = fetch8(cpu, m);
  cpu.dbr = destbank;
  let guard = 0;
  while (true) {
    const v = memRead(m, ((Math.trunc(srcbank * 2 ** (__sh(16, 64))) | ((cpu.x & 65535) >>> 0)) >>> 0));
    memWrite(m, ((Math.trunc(destbank * 2 ** (__sh(16, 64))) | ((cpu.y & 65535) >>> 0)) >>> 0), v);
    if (x8(cpu)) {
      cpu.x = ((__ovf((cpu.x + dir), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
      cpu.y = ((__ovf((cpu.y + dir), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    } else {
      cpu.x = ((__ovf((cpu.x + dir), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
      cpu.y = ((__ovf((cpu.y + dir), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
    const last = (cpu.a == 0);
    cpu.a = ((__ovf((cpu.a - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    if (last) {
      break;
    }
    guard = __ovf((guard + 1), -9223372036854775808, 9223372036854775807);
    if ((guard > 65536)) {
      break;
    }
  }
}

function step(cpu, m) {
  m.hcounter = __ovf((m.hcounter + 1), -9223372036854775808, 9223372036854775807);
  const op = fetch8(cpu, m);
  const _t19 = op;
  if (_t19 === 234) {
  } else if (_t19 === 24) {
    setBit(cpu, FC, false);
  } else if (_t19 === 56) {
    setBit(cpu, FC, true);
  } else if (_t19 === 88) {
    setBit(cpu, FI, false);
  } else if (_t19 === 120) {
    setBit(cpu, FI, true);
  } else if (_t19 === 184) {
    setBit(cpu, FV, false);
  } else if (_t19 === 216) {
    setBit(cpu, FD, false);
  } else if (_t19 === 248) {
    setBit(cpu, FD, true);
  } else if (_t19 === 251) {
    const oldC = ((cpu.p & FC) >>> 0);
    const oldE = cpu.e;
    cpu.e = oldC;
    setBit(cpu, FC, (oldE != 0));
    applyEmulationConstraints(cpu);
  } else if (_t19 === 194) {
    const mask = fetch8(cpu, m);
    cpu.p = ((cpu.p & (~mask)) >>> 0);
    applyEmulationConstraints(cpu);
  } else if (_t19 === 226) {
    const mask = fetch8(cpu, m);
    cpu.p = ((cpu.p | mask) >>> 0);
    if ((((cpu.p & FX) >>> 0) != 0)) {
      cpu.x = ((cpu.x & 255) >>> 0);
      cpu.y = ((cpu.y & 255) >>> 0);
    }
  } else if (_t19 === 170) {
    const v = (() => {
    if (x8(cpu)) {
      return ((cpu.a & 255) >>> 0);
    } else {
      return ((cpu.a & 65535) >>> 0);
    }
    })();
    cpu.x = v;
    setNZx(cpu, v);
  } else if (_t19 === 168) {
    const v = (() => {
    if (x8(cpu)) {
      return ((cpu.a & 255) >>> 0);
    } else {
      return ((cpu.a & 65535) >>> 0);
    }
    })();
    cpu.y = v;
    setNZx(cpu, v);
  } else if (_t19 === 138) {
    if (m8(cpu)) {
      cpu.a = ((((cpu.a & 65280) >>> 0) | ((cpu.x & 255) >>> 0)) >>> 0);
      setNZ8(cpu, cpu.x);
    } else {
      cpu.a = ((cpu.x & 65535) >>> 0);
      setNZ16(cpu, cpu.x);
    }
  } else if (_t19 === 152) {
    if (m8(cpu)) {
      cpu.a = ((((cpu.a & 65280) >>> 0) | ((cpu.y & 255) >>> 0)) >>> 0);
      setNZ8(cpu, cpu.y);
    } else {
      cpu.a = ((cpu.y & 65535) >>> 0);
      setNZ16(cpu, cpu.y);
    }
  } else if (_t19 === 186) {
    const v = (() => {
    if (x8(cpu)) {
      return ((cpu.s & 255) >>> 0);
    } else {
      return ((cpu.s & 65535) >>> 0);
    }
    })();
    cpu.x = v;
    setNZx(cpu, v);
  } else if (_t19 === 154) {
    if ((cpu.e == 1)) {
      cpu.s = ((256 | ((cpu.x & 255) >>> 0)) >>> 0);
    } else {
      cpu.s = ((cpu.x & 65535) >>> 0);
    }
  } else if (_t19 === 155) {
    const v = (() => {
    if (x8(cpu)) {
      return ((cpu.x & 255) >>> 0);
    } else {
      return ((cpu.x & 65535) >>> 0);
    }
    })();
    cpu.y = v;
    setNZx(cpu, v);
  } else if (_t19 === 187) {
    const v = (() => {
    if (x8(cpu)) {
      return ((cpu.y & 255) >>> 0);
    } else {
      return ((cpu.y & 65535) >>> 0);
    }
    })();
    cpu.x = v;
    setNZx(cpu, v);
  } else if (_t19 === 27) {
    if ((cpu.e == 1)) {
      cpu.s = ((256 | ((cpu.a & 255) >>> 0)) >>> 0);
    } else {
      cpu.s = ((cpu.a & 65535) >>> 0);
    }
  } else if (_t19 === 59) {
    cpu.a = ((cpu.s & 65535) >>> 0);
    setNZ16(cpu, cpu.a);
  } else if (_t19 === 91) {
    cpu.d = ((cpu.a & 65535) >>> 0);
    setNZ16(cpu, cpu.d);
  } else if (_t19 === 123) {
    cpu.a = ((cpu.d & 65535) >>> 0);
    setNZ16(cpu, cpu.a);
  } else if (_t19 === 235) {
    const lo = ((cpu.a & 255) >>> 0);
    const hi = ((Math.floor(cpu.a / 2 ** (__sh(8, 64))) & 255) >>> 0);
    cpu.a = ((Math.trunc(lo * 2 ** (__sh(8, 64))) | hi) >>> 0);
    setNZ8(cpu, hi);
  } else if (_t19 === 232) {
    if (x8(cpu)) {
      cpu.x = ((__ovf((cpu.x + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    } else {
      cpu.x = ((__ovf((cpu.x + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
    setNZx(cpu, cpu.x);
  } else if (_t19 === 200) {
    if (x8(cpu)) {
      cpu.y = ((__ovf((cpu.y + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    } else {
      cpu.y = ((__ovf((cpu.y + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
    setNZx(cpu, cpu.y);
  } else if (_t19 === 202) {
    if (x8(cpu)) {
      cpu.x = ((__ovf((cpu.x - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    } else {
      cpu.x = ((__ovf((cpu.x - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
    setNZx(cpu, cpu.x);
  } else if (_t19 === 136) {
    if (x8(cpu)) {
      cpu.y = ((__ovf((cpu.y - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    } else {
      cpu.y = ((__ovf((cpu.y - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
    setNZx(cpu, cpu.y);
  } else if (_t19 === 26) {
    if (m8(cpu)) {
      const lo = ((__ovf((cpu.a + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
      cpu.a = ((((cpu.a & 65280) >>> 0) | lo) >>> 0);
      setNZ8(cpu, lo);
    } else {
      cpu.a = ((__ovf((cpu.a + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
      setNZ16(cpu, cpu.a);
    }
  } else if (_t19 === 58) {
    if (m8(cpu)) {
      const lo = ((__ovf((cpu.a - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
      cpu.a = ((((cpu.a & 65280) >>> 0) | lo) >>> 0);
      setNZ8(cpu, lo);
    } else {
      cpu.a = ((__ovf((cpu.a - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
      setNZ16(cpu, cpu.a);
    }
  } else if (_t19 === 169) {
    if (m8(cpu)) {
      const v = fetch8(cpu, m);
      cpu.a = ((((cpu.a & 65280) >>> 0) | v) >>> 0);
      setNZ8(cpu, v);
    } else {
      const lo = fetch8(cpu, m);
      const hi = fetch8(cpu, m);
      cpu.a = ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
      setNZ16(cpu, cpu.a);
    }
  } else if (_t19 === 162) {
    if (x8(cpu)) {
      const v = fetch8(cpu, m);
      cpu.x = v;
      setNZ8(cpu, v);
    } else {
      const lo = fetch8(cpu, m);
      const hi = fetch8(cpu, m);
      cpu.x = ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
      setNZ16(cpu, cpu.x);
    }
  } else if (_t19 === 160) {
    if (x8(cpu)) {
      const v = fetch8(cpu, m);
      cpu.y = v;
      setNZ8(cpu, v);
    } else {
      const lo = fetch8(cpu, m);
      const hi = fetch8(cpu, m);
      cpu.y = ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
      setNZ16(cpu, cpu.y);
    }
  } else if (_t19 === 165) {
    ldaFrom(cpu, m, aDp(cpu, m), true);
  } else if (_t19 === 181) {
    ldaFrom(cpu, m, aDpX(cpu, m), true);
  } else if (_t19 === 173) {
    ldaFrom(cpu, m, aAbs(cpu, m), false);
  } else if (_t19 === 189) {
    ldaFrom(cpu, m, aAbsX(cpu, m), false);
  } else if (_t19 === 185) {
    ldaFrom(cpu, m, aAbsY(cpu, m), false);
  } else if (_t19 === 175) {
    ldaFrom(cpu, m, aLong(cpu, m), false);
  } else if (_t19 === 191) {
    ldaFrom(cpu, m, aLongX(cpu, m), false);
  } else if (_t19 === 161) {
    ldaFrom(cpu, m, aDpIndX(cpu, m), false);
  } else if (_t19 === 177) {
    ldaFrom(cpu, m, aDpIndY(cpu, m), false);
  } else if (_t19 === 178) {
    ldaFrom(cpu, m, aDpInd(cpu, m), false);
  } else if (_t19 === 167) {
    ldaFrom(cpu, m, aDpLong(cpu, m), false);
  } else if (_t19 === 183) {
    ldaFrom(cpu, m, aDpLongY(cpu, m), false);
  } else if (_t19 === 163) {
    ldaFrom(cpu, m, aSr(cpu, m), true);
  } else if (_t19 === 179) {
    ldaFrom(cpu, m, aSrY(cpu, m), false);
  } else if (_t19 === 133) {
    const a = aDp(cpu, m);
    staTo(cpu, m, a, true);
  } else if (_t19 === 149) {
    const a = aDpX(cpu, m);
    staTo(cpu, m, a, true);
  } else if (_t19 === 141) {
    const a = aAbs(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 157) {
    const a = aAbsX(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 153) {
    const a = aAbsY(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 143) {
    const a = aLong(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 159) {
    const a = aLongX(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 129) {
    const a = aDpIndX(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 145) {
    const a = aDpIndY(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 146) {
    const a = aDpInd(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 135) {
    const a = aDpLong(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 151) {
    const a = aDpLongY(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 131) {
    const a = aSr(cpu, m);
    staTo(cpu, m, a, true);
  } else if (_t19 === 147) {
    const a = aSrY(cpu, m);
    staTo(cpu, m, a, false);
  } else if (_t19 === 9) {
    const v = immM(cpu, m);
    setA(cpu, ((cpu.a | v) >>> 0));
  } else if (_t19 === 5) {
    const a = aDp(cpu, m);
    oraFrom(cpu, m, a, true);
  } else if (_t19 === 21) {
    const a = aDpX(cpu, m);
    oraFrom(cpu, m, a, true);
  } else if (_t19 === 13) {
    const a = aAbs(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 29) {
    const a = aAbsX(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 25) {
    const a = aAbsY(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 15) {
    const a = aLong(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 31) {
    const a = aLongX(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 1) {
    const a = aDpIndX(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 17) {
    const a = aDpIndY(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 18) {
    const a = aDpInd(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 7) {
    const a = aDpLong(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 23) {
    const a = aDpLongY(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 3) {
    const a = aSr(cpu, m);
    oraFrom(cpu, m, a, true);
  } else if (_t19 === 19) {
    const a = aSrY(cpu, m);
    oraFrom(cpu, m, a, false);
  } else if (_t19 === 41) {
    const v = immM(cpu, m);
    setA(cpu, ((cpu.a & v) >>> 0));
  } else if (_t19 === 37) {
    const a = aDp(cpu, m);
    andFrom(cpu, m, a, true);
  } else if (_t19 === 53) {
    const a = aDpX(cpu, m);
    andFrom(cpu, m, a, true);
  } else if (_t19 === 45) {
    const a = aAbs(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 61) {
    const a = aAbsX(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 57) {
    const a = aAbsY(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 47) {
    const a = aLong(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 63) {
    const a = aLongX(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 33) {
    const a = aDpIndX(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 49) {
    const a = aDpIndY(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 50) {
    const a = aDpInd(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 39) {
    const a = aDpLong(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 55) {
    const a = aDpLongY(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 35) {
    const a = aSr(cpu, m);
    andFrom(cpu, m, a, true);
  } else if (_t19 === 51) {
    const a = aSrY(cpu, m);
    andFrom(cpu, m, a, false);
  } else if (_t19 === 73) {
    const v = immM(cpu, m);
    setA(cpu, ((cpu.a ^ v) >>> 0));
  } else if (_t19 === 69) {
    const a = aDp(cpu, m);
    eorFrom(cpu, m, a, true);
  } else if (_t19 === 85) {
    const a = aDpX(cpu, m);
    eorFrom(cpu, m, a, true);
  } else if (_t19 === 77) {
    const a = aAbs(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 93) {
    const a = aAbsX(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 89) {
    const a = aAbsY(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 79) {
    const a = aLong(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 95) {
    const a = aLongX(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 65) {
    const a = aDpIndX(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 81) {
    const a = aDpIndY(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 82) {
    const a = aDpInd(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 71) {
    const a = aDpLong(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 87) {
    const a = aDpLongY(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 67) {
    const a = aSr(cpu, m);
    eorFrom(cpu, m, a, true);
  } else if (_t19 === 83) {
    const a = aSrY(cpu, m);
    eorFrom(cpu, m, a, false);
  } else if (_t19 === 201) {
    const v = immM(cpu, m);
    compareVals(cpu, cpu.a, v, (!m8(cpu)));
  } else if (_t19 === 197) {
    const a = aDp(cpu, m);
    cmpFrom(cpu, m, a, true);
  } else if (_t19 === 213) {
    const a = aDpX(cpu, m);
    cmpFrom(cpu, m, a, true);
  } else if (_t19 === 205) {
    const a = aAbs(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 221) {
    const a = aAbsX(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 217) {
    const a = aAbsY(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 207) {
    const a = aLong(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 223) {
    const a = aLongX(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 193) {
    const a = aDpIndX(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 209) {
    const a = aDpIndY(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 210) {
    const a = aDpInd(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 199) {
    const a = aDpLong(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 215) {
    const a = aDpLongY(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 195) {
    const a = aSr(cpu, m);
    cmpFrom(cpu, m, a, true);
  } else if (_t19 === 211) {
    const a = aSrY(cpu, m);
    cmpFrom(cpu, m, a, false);
  } else if (_t19 === 224) {
    const v = immX(cpu, m);
    compareVals(cpu, cpu.x, v, (!x8(cpu)));
  } else if (_t19 === 228) {
    const a = aDp(cpu, m);
    cpxFrom(cpu, m, a, true);
  } else if (_t19 === 236) {
    const a = aAbs(cpu, m);
    cpxFrom(cpu, m, a, false);
  } else if (_t19 === 192) {
    const v = immX(cpu, m);
    compareVals(cpu, cpu.y, v, (!x8(cpu)));
  } else if (_t19 === 196) {
    const a = aDp(cpu, m);
    cpyFrom(cpu, m, a, true);
  } else if (_t19 === 204) {
    const a = aAbs(cpu, m);
    cpyFrom(cpu, m, a, false);
  } else if (_t19 === 166) {
    const a = aDp(cpu, m);
    ldxFrom(cpu, m, a, true);
  } else if (_t19 === 182) {
    const a = aDpY(cpu, m);
    ldxFrom(cpu, m, a, true);
  } else if (_t19 === 174) {
    const a = aAbs(cpu, m);
    ldxFrom(cpu, m, a, false);
  } else if (_t19 === 190) {
    const a = aAbsY(cpu, m);
    ldxFrom(cpu, m, a, false);
  } else if (_t19 === 164) {
    const a = aDp(cpu, m);
    ldyFrom(cpu, m, a, true);
  } else if (_t19 === 180) {
    const a = aDpX(cpu, m);
    ldyFrom(cpu, m, a, true);
  } else if (_t19 === 172) {
    const a = aAbs(cpu, m);
    ldyFrom(cpu, m, a, false);
  } else if (_t19 === 188) {
    const a = aAbsX(cpu, m);
    ldyFrom(cpu, m, a, false);
  } else if (_t19 === 134) {
    const a = aDp(cpu, m);
    stxTo(cpu, m, a, true);
  } else if (_t19 === 150) {
    const a = aDpY(cpu, m);
    stxTo(cpu, m, a, true);
  } else if (_t19 === 142) {
    const a = aAbs(cpu, m);
    stxTo(cpu, m, a, false);
  } else if (_t19 === 132) {
    const a = aDp(cpu, m);
    styTo(cpu, m, a, true);
  } else if (_t19 === 148) {
    const a = aDpX(cpu, m);
    styTo(cpu, m, a, true);
  } else if (_t19 === 140) {
    const a = aAbs(cpu, m);
    styTo(cpu, m, a, false);
  } else if (_t19 === 100) {
    const a = aDp(cpu, m);
    stzTo(cpu, m, a, true);
  } else if (_t19 === 116) {
    const a = aDpX(cpu, m);
    stzTo(cpu, m, a, true);
  } else if (_t19 === 156) {
    const a = aAbs(cpu, m);
    stzTo(cpu, m, a, false);
  } else if (_t19 === 158) {
    const a = aAbsX(cpu, m);
    stzTo(cpu, m, a, false);
  } else if (_t19 === 105) {
    const v = immM(cpu, m);
    doADC(cpu, v);
  } else if (_t19 === 101) {
    const a = aDp(cpu, m);
    adcFrom(cpu, m, a, true);
  } else if (_t19 === 117) {
    const a = aDpX(cpu, m);
    adcFrom(cpu, m, a, true);
  } else if (_t19 === 109) {
    const a = aAbs(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 125) {
    const a = aAbsX(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 121) {
    const a = aAbsY(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 111) {
    const a = aLong(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 127) {
    const a = aLongX(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 97) {
    const a = aDpIndX(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 113) {
    const a = aDpIndY(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 114) {
    const a = aDpInd(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 103) {
    const a = aDpLong(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 119) {
    const a = aDpLongY(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 99) {
    const a = aSr(cpu, m);
    adcFrom(cpu, m, a, true);
  } else if (_t19 === 115) {
    const a = aSrY(cpu, m);
    adcFrom(cpu, m, a, false);
  } else if (_t19 === 233) {
    const v = immM(cpu, m);
    doSBC(cpu, v);
  } else if (_t19 === 229) {
    const a = aDp(cpu, m);
    sbcFrom(cpu, m, a, true);
  } else if (_t19 === 245) {
    const a = aDpX(cpu, m);
    sbcFrom(cpu, m, a, true);
  } else if (_t19 === 237) {
    const a = aAbs(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 253) {
    const a = aAbsX(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 249) {
    const a = aAbsY(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 239) {
    const a = aLong(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 255) {
    const a = aLongX(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 225) {
    const a = aDpIndX(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 241) {
    const a = aDpIndY(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 242) {
    const a = aDpInd(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 231) {
    const a = aDpLong(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 247) {
    const a = aDpLongY(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 227) {
    const a = aSr(cpu, m);
    sbcFrom(cpu, m, a, true);
  } else if (_t19 === 243) {
    const a = aSrY(cpu, m);
    sbcFrom(cpu, m, a, false);
  } else if (_t19 === 10) {
    accASL(cpu);
  } else if (_t19 === 6) {
    const a = aDp(cpu, m);
    rmwMem(cpu, m, a, true, 0);
  } else if (_t19 === 22) {
    const a = aDpX(cpu, m);
    rmwMem(cpu, m, a, true, 0);
  } else if (_t19 === 14) {
    const a = aAbs(cpu, m);
    rmwMem(cpu, m, a, false, 0);
  } else if (_t19 === 30) {
    const a = aAbsX(cpu, m);
    rmwMem(cpu, m, a, false, 0);
  } else if (_t19 === 74) {
    accLSR(cpu);
  } else if (_t19 === 70) {
    const a = aDp(cpu, m);
    rmwMem(cpu, m, a, true, 1);
  } else if (_t19 === 86) {
    const a = aDpX(cpu, m);
    rmwMem(cpu, m, a, true, 1);
  } else if (_t19 === 78) {
    const a = aAbs(cpu, m);
    rmwMem(cpu, m, a, false, 1);
  } else if (_t19 === 94) {
    const a = aAbsX(cpu, m);
    rmwMem(cpu, m, a, false, 1);
  } else if (_t19 === 42) {
    accROL(cpu);
  } else if (_t19 === 38) {
    const a = aDp(cpu, m);
    rmwMem(cpu, m, a, true, 2);
  } else if (_t19 === 54) {
    const a = aDpX(cpu, m);
    rmwMem(cpu, m, a, true, 2);
  } else if (_t19 === 46) {
    const a = aAbs(cpu, m);
    rmwMem(cpu, m, a, false, 2);
  } else if (_t19 === 62) {
    const a = aAbsX(cpu, m);
    rmwMem(cpu, m, a, false, 2);
  } else if (_t19 === 106) {
    accROR(cpu);
  } else if (_t19 === 102) {
    const a = aDp(cpu, m);
    rmwMem(cpu, m, a, true, 3);
  } else if (_t19 === 118) {
    const a = aDpX(cpu, m);
    rmwMem(cpu, m, a, true, 3);
  } else if (_t19 === 110) {
    const a = aAbs(cpu, m);
    rmwMem(cpu, m, a, false, 3);
  } else if (_t19 === 126) {
    const a = aAbsX(cpu, m);
    rmwMem(cpu, m, a, false, 3);
  } else if (_t19 === 230) {
    const a = aDp(cpu, m);
    rmwMem(cpu, m, a, true, 4);
  } else if (_t19 === 246) {
    const a = aDpX(cpu, m);
    rmwMem(cpu, m, a, true, 4);
  } else if (_t19 === 238) {
    const a = aAbs(cpu, m);
    rmwMem(cpu, m, a, false, 4);
  } else if (_t19 === 254) {
    const a = aAbsX(cpu, m);
    rmwMem(cpu, m, a, false, 4);
  } else if (_t19 === 198) {
    const a = aDp(cpu, m);
    rmwMem(cpu, m, a, true, 5);
  } else if (_t19 === 214) {
    const a = aDpX(cpu, m);
    rmwMem(cpu, m, a, true, 5);
  } else if (_t19 === 206) {
    const a = aAbs(cpu, m);
    rmwMem(cpu, m, a, false, 5);
  } else if (_t19 === 222) {
    const a = aAbsX(cpu, m);
    rmwMem(cpu, m, a, false, 5);
  } else if (_t19 === 4) {
    const a = aDp(cpu, m);
    tsbMem(cpu, m, a, true);
  } else if (_t19 === 12) {
    const a = aAbs(cpu, m);
    tsbMem(cpu, m, a, false);
  } else if (_t19 === 20) {
    const a = aDp(cpu, m);
    trbMem(cpu, m, a, true);
  } else if (_t19 === 28) {
    const a = aAbs(cpu, m);
    trbMem(cpu, m, a, false);
  } else if (_t19 === 137) {
    const v = immM(cpu, m);
    bitImm(cpu, v);
  } else if (_t19 === 36) {
    const a = aDp(cpu, m);
    bitMem(cpu, m, a, true);
  } else if (_t19 === 52) {
    const a = aDpX(cpu, m);
    bitMem(cpu, m, a, true);
  } else if (_t19 === 44) {
    const a = aAbs(cpu, m);
    bitMem(cpu, m, a, false);
  } else if (_t19 === 60) {
    const a = aAbsX(cpu, m);
    bitMem(cpu, m, a, false);
  } else if (_t19 === 16) {
    branchIf(cpu, m, (((cpu.p & FN) >>> 0) == 0));
  } else if (_t19 === 48) {
    branchIf(cpu, m, (((cpu.p & FN) >>> 0) != 0));
  } else if (_t19 === 80) {
    branchIf(cpu, m, (((cpu.p & FV) >>> 0) == 0));
  } else if (_t19 === 112) {
    branchIf(cpu, m, (((cpu.p & FV) >>> 0) != 0));
  } else if (_t19 === 144) {
    branchIf(cpu, m, (((cpu.p & FC) >>> 0) == 0));
  } else if (_t19 === 176) {
    branchIf(cpu, m, (((cpu.p & FC) >>> 0) != 0));
  } else if (_t19 === 208) {
    branchIf(cpu, m, (((cpu.p & FZ) >>> 0) == 0));
  } else if (_t19 === 240) {
    branchIf(cpu, m, (((cpu.p & FZ) >>> 0) != 0));
  } else if (_t19 === 128) {
    branchIf(cpu, m, true);
  } else if (_t19 === 130) {
    const off = fetch16(cpu, m);
    const soff = (() => {
    if ((off >= 32768)) {
      return __ovf((off - 65536), -9223372036854775808, 9223372036854775807);
    } else {
      return off;
    }
    })();
    cpu.pc = ((__ovf((cpu.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  } else if (_t19 === 76) {
    cpu.pc = fetch16(cpu, m);
  } else if (_t19 === 92) {
    const t = fetch24(cpu, m);
    cpu.pc = ((t & 65535) >>> 0);
    cpu.pbr = ((Math.floor(t / 2 ** (__sh(16, 64))) & 255) >>> 0);
  } else if (_t19 === 108) {
    const ptr = fetch16(cpu, m);
    cpu.pc = readPtr16(m, ptr);
  } else if (_t19 === 124) {
    const base = fetch16(cpu, m);
    const a0 = ((__ovf((base + cpu.x), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    const lo = memRead(m, ((Math.trunc(cpu.pbr * 2 ** (__sh(16, 64))) | a0) >>> 0));
    const hi = memRead(m, ((Math.trunc(cpu.pbr * 2 ** (__sh(16, 64))) | ((__ovf((a0 + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)) >>> 0));
    cpu.pc = ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
  } else if (_t19 === 252) {
    const base = fetch16(cpu, m);
    push16(cpu, m, ((__ovf((cpu.pc - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
    const a0 = ((__ovf((base + cpu.x), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    const lo = memRead(m, ((Math.trunc(cpu.pbr * 2 ** (__sh(16, 64))) | a0) >>> 0));
    const hi = memRead(m, ((Math.trunc(cpu.pbr * 2 ** (__sh(16, 64))) | ((__ovf((a0 + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)) >>> 0));
    cpu.pc = ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
  } else if (_t19 === 220) {
    const ptr = fetch16(cpu, m);
    const t = readPtr24(m, ptr);
    cpu.pc = ((t & 65535) >>> 0);
    cpu.pbr = ((Math.floor(t / 2 ** (__sh(16, 64))) & 255) >>> 0);
  } else if (_t19 === 32) {
    const target = fetch16(cpu, m);
    push16(cpu, m, ((__ovf((cpu.pc - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
    cpu.pc = target;
  } else if (_t19 === 96) {
    const addr = pull16(cpu, m);
    cpu.pc = ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  } else if (_t19 === 34) {
    const target = fetch24(cpu, m);
    push8f(cpu, m, cpu.pbr);
    push16f(cpu, m, ((__ovf((cpu.pc - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
    clampEmuStack(cpu);
    cpu.pc = ((target & 65535) >>> 0);
    cpu.pbr = ((Math.floor(target / 2 ** (__sh(16, 64))) & 255) >>> 0);
  } else if (_t19 === 107) {
    const addr = pull16f(cpu, m);
    const bank = pull8f(cpu, m);
    clampEmuStack(cpu);
    cpu.pc = ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    cpu.pbr = ((bank & 255) >>> 0);
  } else if (_t19 === 212) {
    const ad = aDp(cpu, m);
    const v = readPtr16(m, ad);
    push16f(cpu, m, v);
    clampEmuStack(cpu);
  } else if (_t19 === 98) {
    const off = fetch16(cpu, m);
    const soff = (() => {
    if ((off >= 32768)) {
      return __ovf((off - 65536), -9223372036854775808, 9223372036854775807);
    } else {
      return off;
    }
    })();
    push16f(cpu, m, ((__ovf((cpu.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
    clampEmuStack(cpu);
  } else if (_t19 === 72) {
    if (m8(cpu)) {
      push8(cpu, m, cpu.a);
    } else {
      push16(cpu, m, cpu.a);
    }
  } else if (_t19 === 104) {
    if (m8(cpu)) {
      const v = pull8(cpu, m);
      cpu.a = ((((cpu.a & 65280) >>> 0) | v) >>> 0);
      setNZ8(cpu, v);
    } else {
      cpu.a = pull16(cpu, m);
      setNZ16(cpu, cpu.a);
    }
  } else if (_t19 === 218) {
    if (x8(cpu)) {
      push8(cpu, m, cpu.x);
    } else {
      push16(cpu, m, cpu.x);
    }
  } else if (_t19 === 250) {
    if (x8(cpu)) {
      cpu.x = pull8(cpu, m);
      setNZ8(cpu, cpu.x);
    } else {
      cpu.x = pull16(cpu, m);
      setNZ16(cpu, cpu.x);
    }
  } else if (_t19 === 90) {
    if (x8(cpu)) {
      push8(cpu, m, cpu.y);
    } else {
      push16(cpu, m, cpu.y);
    }
  } else if (_t19 === 122) {
    if (x8(cpu)) {
      cpu.y = pull8(cpu, m);
      setNZ8(cpu, cpu.y);
    } else {
      cpu.y = pull16(cpu, m);
      setNZ16(cpu, cpu.y);
    }
  } else if (_t19 === 8) {
    push8(cpu, m, cpu.p);
  } else if (_t19 === 40) {
    cpu.p = pull8(cpu, m);
    applyEmulationConstraints(cpu);
    if ((((cpu.p & FX) >>> 0) != 0)) {
      cpu.x = ((cpu.x & 255) >>> 0);
      cpu.y = ((cpu.y & 255) >>> 0);
    }
  } else if (_t19 === 139) {
    push8f(cpu, m, cpu.dbr);
    clampEmuStack(cpu);
  } else if (_t19 === 171) {
    cpu.dbr = pull8f(cpu, m);
    clampEmuStack(cpu);
    setNZ8(cpu, cpu.dbr);
  } else if (_t19 === 75) {
    push8f(cpu, m, cpu.pbr);
    clampEmuStack(cpu);
  } else if (_t19 === 11) {
    push16f(cpu, m, cpu.d);
    clampEmuStack(cpu);
  } else if (_t19 === 43) {
    cpu.d = pull16f(cpu, m);
    clampEmuStack(cpu);
    setNZ16(cpu, cpu.d);
  } else if (_t19 === 244) {
    const v = fetch16(cpu, m);
    push16f(cpu, m, v);
    clampEmuStack(cpu);
  } else if (_t19 === 0) {
    softInterrupt(cpu, m, 65510, 65534);
  } else if (_t19 === 2) {
    softInterrupt(cpu, m, 65508, 65524);
  } else if (_t19 === 64) {
    cpu.p = pull8(cpu, m);
    const addr = pull16(cpu, m);
    if ((cpu.e == 0)) {
      cpu.pbr = pull8(cpu, m);
    }
    cpu.pc = addr;
    applyEmulationConstraints(cpu);
    if ((((cpu.p & FX) >>> 0) != 0)) {
      cpu.x = ((cpu.x & 255) >>> 0);
      cpu.y = ((cpu.y & 255) >>> 0);
    }
  } else if (_t19 === 84) {
    blockMove(cpu, m, 1);
  } else if (_t19 === 68) {
    blockMove(cpu, m, __ovf((-1), -9223372036854775808, 9223372036854775807));
  } else if (_t19 === 66) {
    const sig = fetch8(cpu, m);
  } else if (_t19 === 203) {
    cpuWaiting = true;
  } else if (_t19 === 219) {
  } else {
    badOp = op;
    badOpPc = ((Math.trunc(cpu.pbr * 2 ** (__sh(16, 64))) | ((__ovf((cpu.pc - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)) >>> 0);
  }
}

function spcMemNew() {
  return new SpcMem([], [], true, [], [], false, [], [], 0, spcZerosI64(3), spcZerosI64(3), spcZerosI64(3), spcZerosI64(3), 0, [], [], [], [], [], [], [], [], 0);
}

function spcZeros(n) {
  let v = [];
  let i = 0;
  while ((i < n)) {
    v.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function iplRom() {
  const b = [205, 239, 189, 232, 0, 198, 29, 208, 252, 143, 170, 244, 143, 187, 245, 120, 204, 244, 208, 251, 47, 25, 235, 244, 208, 252, 126, 244, 208, 11, 228, 245, 203, 244, 215, 0, 252, 208, 243, 171, 1, 16, 239, 126, 244, 16, 235, 186, 246, 218, 0, 186, 244, 196, 244, 221, 93, 208, 219, 31, 0, 0, 192, 255];
  let v = [];
  let i = 0;
  while ((i < 64)) {
    v.push((__idx(b, i) & 0xFF));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function spcZerosI64(n) {
  let v = [];
  let i = 0;
  while ((i < n)) {
    v.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function spcMemReal() {
  return new SpcMem([], [], false, spcZeros(65536), iplRom(), true, spcZerosI64(4), spcZerosI64(4), 0, spcZerosI64(3), spcZerosI64(3), spcZerosI64(3), spcZerosI64(3), 0, spcZeros(128), spcZerosI64(8), spcZerosI64(8), spcZerosI64(128), spcZerosI64(8), spcZerosI64(8), spcZerosI64(8), spcZerosI64(8), 0);
}

function s8(v) {
  const x = ((v & 255) >>> 0);
  if ((x >= 128)) {
    return __ovf((x - 256), -9223372036854775808, 9223372036854775807);
  }
  return x;
}

function dspClamp16(v) {
  if ((v > 32767)) {
    return 32767;
  }
  if ((v < __ovf((-32768), -9223372036854775808, 9223372036854775807))) {
    return __ovf((-32768), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function dspDecodeBlock(m, v) {
  const base = ((__idx(m.vBrrPtr, v) & 65535) >>> 0);
  const hdr = Math.trunc(__idx(m.ram, base));
  const range = ((Math.floor(hdr / 2 ** (__sh(4, 64))) & 15) >>> 0);
  const filter = ((Math.floor(hdr / 2 ** (__sh(2, 64))) & 3) >>> 0);
  let p0 = __idx(m.vPrev0, v);
  let p1 = __idx(m.vPrev1, v);
  let i = 0;
  while ((i < 16)) {
    const byte = Math.trunc(__idx(m.ram, ((__ovf((__ovf((base + 1), -9223372036854775808, 9223372036854775807) + Math.floor(i / 2 ** (__sh(1, 64)))), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
    let nib = (() => {
    if ((((i & 1) >>> 0) == 0)) {
      return ((Math.floor(byte / 2 ** (__sh(4, 64))) & 15) >>> 0);
    } else {
      return ((byte & 15) >>> 0);
    }
    })();
    if ((nib >= 8)) {
      nib = __ovf((nib - 16), -9223372036854775808, 9223372036854775807);
    }
    let s = 0;
    if ((range <= 12)) {
      s = Math.floor(Math.trunc(nib * 2 ** (__sh(range, 64))) / 2 ** (__sh(1, 64)));
    } else {
      s = Math.trunc(Math.floor(nib / 2 ** (__sh(3, 64))) * 2 ** (__sh(11, 64)));
    }
    if ((filter == 1)) {
      s = __ovf((__ovf((s + p0), -9223372036854775808, 9223372036854775807) + Math.floor(__ovf((-p0), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(4, 64)))), -9223372036854775808, 9223372036854775807);
    } else {
      if ((filter == 2)) {
        s = __ovf((__ovf((__ovf((__ovf((s + __ovf((p0 * 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + Math.floor(__ovf((__ovf((-p0), -9223372036854775808, 9223372036854775807) * 3), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(5, 64)))), -9223372036854775808, 9223372036854775807) - p1), -9223372036854775808, 9223372036854775807) + Math.floor(p1 / 2 ** (__sh(4, 64)))), -9223372036854775808, 9223372036854775807);
      } else {
        if ((filter == 3)) {
          s = __ovf((__ovf((__ovf((__ovf((s + __ovf((p0 * 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + Math.floor(__ovf((__ovf((-p0), -9223372036854775808, 9223372036854775807) * 13), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(6, 64)))), -9223372036854775808, 9223372036854775807) - p1), -9223372036854775808, 9223372036854775807) + Math.floor(__ovf((p1 * 3), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(4, 64)))), -9223372036854775808, 9223372036854775807);
        }
      }
    }
    s = dspClamp16(s);
    __idxSet(m.vBuf, __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + i), -9223372036854775808, 9223372036854775807), s);
    p1 = p0;
    p0 = s;
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  __idxSet(m.vPrev0, v, p0);
  __idxSet(m.vPrev1, v, p1);
  return hdr;
}

function dspSampleStart(m, srcn) {
  const dir = Math.trunc(Math.trunc(__idx(m.dsp, 93)) * 2 ** (__sh(8, 64)));
  const e = ((__ovf((dir + __ovf((srcn * 4), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  return ((Math.trunc(__idx(m.ram, e)) | Math.trunc(Math.trunc(__idx(m.ram, ((__ovf((e + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0))) * 2 ** (__sh(8, 64)))) >>> 0);
}

function dspSampleLoop(m, srcn) {
  const dir = Math.trunc(Math.trunc(__idx(m.dsp, 93)) * 2 ** (__sh(8, 64)));
  const e = ((__ovf((__ovf((dir + __ovf((srcn * 4), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  return ((Math.trunc(__idx(m.ram, e)) | Math.trunc(Math.trunc(__idx(m.ram, ((__ovf((e + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0))) * 2 ** (__sh(8, 64)))) >>> 0);
}

function dspKeyOn(m, v) {
  const srcn = Math.trunc(__idx(m.dsp, __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + 4), -9223372036854775808, 9223372036854775807)));
  __idxSet(m.vBrrPtr, v, dspSampleStart(m, srcn));
  __idxSet(m.vInterp, v, 0);
  __idxSet(m.vPrev0, v, 0);
  __idxSet(m.vPrev1, v, 0);
  __idxSet(m.vEnv, v, 0);
  __idxSet(m.vPhase, v, 1);
  dspDecodeBlock(m, v);
}

function dspGenerate(m, out, n) {
  const muted = (((Math.trunc(__idx(m.dsp, 108)) & 64) >>> 0) != 0);
  const konNow = Math.trunc(__idx(m.dsp, 76));
  const kofNow = Math.trunc(__idx(m.dsp, 92));
  const newKon = ((konNow & (~m.vKonPrev)) >>> 0);
  let vk = 0;
  while ((vk < 8)) {
    if ((((newKon & Math.trunc(1 * 2 ** (__sh(vk, 64)))) >>> 0) != 0)) {
      dspKeyOn(m, vk);
    }
    if (((((kofNow & Math.trunc(1 * 2 ** (__sh(vk, 64)))) >>> 0) != 0) && (__idx(m.vPhase, vk) != 0))) {
      __idxSet(m.vPhase, vk, 4);
    }
    vk = __ovf((vk + 1), -9223372036854775808, 9223372036854775807);
  }
  m.vKonPrev = konNow;
  const mvolL = s8(Math.trunc(__idx(m.dsp, 12)));
  const mvolR = s8(Math.trunc(__idx(m.dsp, 28)));
  let i = 0;
  while ((i < n)) {
    let accL = 0;
    let accR = 0;
    let v = 0;
    while ((v < 8)) {
      if ((__idx(m.vPhase, v) != 0)) {
        if ((__idx(m.vPhase, v) == 1)) {
          __idxSet(m.vEnv, v, __ovf((__idx(m.vEnv, v) + 64), -9223372036854775808, 9223372036854775807));
          if ((__idx(m.vEnv, v) >= 2047)) {
            __idxSet(m.vEnv, v, 2047);
            __idxSet(m.vPhase, v, 3);
          }
        } else {
          if ((__idx(m.vPhase, v) == 4)) {
            __idxSet(m.vEnv, v, __ovf((__idx(m.vEnv, v) - 32), -9223372036854775808, 9223372036854775807));
            if ((__idx(m.vEnv, v) <= 0)) {
              __idxSet(m.vEnv, v, 0);
              __idxSet(m.vPhase, v, 0);
            }
          }
        }
        const idx = ((Math.floor(__idx(m.vInterp, v) / 2 ** (__sh(12, 64))) & 15) >>> 0);
        const raw = __idx(m.vBuf, __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + idx), -9223372036854775808, 9223372036854775807));
        const s = Math.floor(__ovf((raw * __idx(m.vEnv, v)), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(11, 64)));
        accL = __ovf((accL + Math.floor(__ovf((s * s8(Math.trunc(__idx(m.dsp, __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + 0), -9223372036854775808, 9223372036854775807))))), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(7, 64)))), -9223372036854775808, 9223372036854775807);
        accR = __ovf((accR + Math.floor(__ovf((s * s8(Math.trunc(__idx(m.dsp, __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807))))), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(7, 64)))), -9223372036854775808, 9223372036854775807);
        const pitch = ((((Math.trunc(__idx(m.dsp, __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + 2), -9223372036854775808, 9223372036854775807))) | Math.trunc(Math.trunc(__idx(m.dsp, __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + 3), -9223372036854775808, 9223372036854775807))) * 2 ** (__sh(8, 64)))) >>> 0) & 16383) >>> 0);
        __idxSet(m.vInterp, v, __ovf((__idx(m.vInterp, v) + pitch), -9223372036854775808, 9223372036854775807));
        while ((Math.floor(__idx(m.vInterp, v) / 2 ** (__sh(12, 64))) >= 16)) {
          __idxSet(m.vInterp, v, __ovf((__idx(m.vInterp, v) - Math.trunc(16 * 2 ** (__sh(12, 64)))), -9223372036854775808, 9223372036854775807));
          const hdr = Math.trunc(__idx(m.ram, ((__idx(m.vBrrPtr, v) & 65535) >>> 0)));
          if ((((hdr & 1) >>> 0) != 0)) {
            if ((((hdr & 2) >>> 0) != 0)) {
              __idxSet(m.vBrrPtr, v, dspSampleLoop(m, Math.trunc(__idx(m.dsp, __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + 4), -9223372036854775808, 9223372036854775807)))));
            } else {
              __idxSet(m.vPhase, v, 0);
            }
          } else {
            __idxSet(m.vBrrPtr, v, ((__ovf((__idx(m.vBrrPtr, v) + 9), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
          }
          if ((__idx(m.vPhase, v) != 0)) {
            dspDecodeBlock(m, v);
          }
        }
      }
      v = __ovf((v + 1), -9223372036854775808, 9223372036854775807);
    }
    let oL = Math.floor(__ovf((accL * mvolL), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(7, 64)));
    let oR = Math.floor(__ovf((accR * mvolR), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(7, 64)));
    if (muted) {
      oL = 0;
      oR = 0;
    }
    __idxSet(out, __ovf((i * 2), -9223372036854775808, 9223372036854775807), dspClamp16(oL));
    __idxSet(out, __ovf((__ovf((i * 2), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807), dspClamp16(oR));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
}

function spcMemReset(m) {
  m.addr = [];
  m.val = [];
}

function spcRead(m, a) {
  if (m.testMode) {
    let i = 0;
    while ((i < m.addr.length)) {
      if ((__idx(m.addr, i) == ((a & 65535) >>> 0))) {
        return __idx(m.val, i);
      }
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
    return 0;
  }
  const addr = ((a & 65535) >>> 0);
  if (((addr >= 244) && (addr <= 247))) {
    return __idx(m.inPort, __ovf((addr - 244), -9223372036854775808, 9223372036854775807));
  }
  if ((addr == 242)) {
    return m.dspAddr;
  }
  if ((addr == 243)) {
    return Math.trunc(__idx(m.dsp, ((m.dspAddr & 127) >>> 0)));
  }
  if (((addr >= 253) && (addr <= 255))) {
    const t = __ovf((addr - 253), -9223372036854775808, 9223372036854775807);
    const r = ((__idx(m.tOut, t) & 15) >>> 0);
    __idxSet(m.tOut, t, 0);
    return r;
  }
  if ((m.iplEnabled && (addr >= 65472))) {
    return Math.trunc(__idx(m.ipl, __ovf((addr - 65472), -9223372036854775808, 9223372036854775807)));
  }
  return Math.trunc(__idx(m.ram, addr));
}

function spcTimersTick(m, cyc) {
  let t = 0;
  while ((t < 3)) {
    if ((((m.tEnable & Math.trunc(1 * 2 ** (__sh(t, 64)))) >>> 0) != 0)) {
      const period = (() => {
      if ((t == 2)) {
        return 16;
      } else {
        return 128;
      }
      })();
      __idxSet(m.tDiv, t, __ovf((__idx(m.tDiv, t) + cyc), -9223372036854775808, 9223372036854775807));
      while ((__idx(m.tDiv, t) >= period)) {
        __idxSet(m.tDiv, t, __ovf((__idx(m.tDiv, t) - period), -9223372036854775808, 9223372036854775807));
        __idxSet(m.tCount, t, __ovf((__idx(m.tCount, t) + 1), -9223372036854775808, 9223372036854775807));
        const tgt = (() => {
        if ((__idx(m.tTarget, t) == 0)) {
          return 256;
        } else {
          return __idx(m.tTarget, t);
        }
        })();
        if ((__idx(m.tCount, t) >= tgt)) {
          __idxSet(m.tCount, t, 0);
          __idxSet(m.tOut, t, ((__ovf((__idx(m.tOut, t) + 1), -9223372036854775808, 9223372036854775807) & 15) >>> 0));
        }
      }
    }
    t = __ovf((t + 1), -9223372036854775808, 9223372036854775807);
  }
}

function spcWrite(m, a, v) {
  if (m.testMode) {
    const addr = ((a & 65535) >>> 0);
    let i = 0;
    while ((i < m.addr.length)) {
      if ((__idx(m.addr, i) == addr)) {
        __idxSet(m.val, i, ((v & 255) >>> 0));
        return;
      }
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
    m.addr.push(addr);
    m.val.push(((v & 255) >>> 0));
    return;
  }
  const addr = ((a & 65535) >>> 0);
  const bv = ((v & 255) >>> 0);
  if ((addr == 241)) {
    m.iplEnabled = (((bv & 128) >>> 0) != 0);
    if ((((bv & 32) >>> 0) != 0)) {
      __idxSet(m.inPort, 2, 0);
      __idxSet(m.inPort, 3, 0);
    }
    if ((((bv & 16) >>> 0) != 0)) {
      __idxSet(m.inPort, 0, 0);
      __idxSet(m.inPort, 1, 0);
    }
    let t = 0;
    while ((t < 3)) {
      const was = ((Math.floor(m.tEnable / 2 ** (__sh(t, 64))) & 1) >>> 0);
      const now = ((Math.floor(bv / 2 ** (__sh(t, 64))) & 1) >>> 0);
      if (((now == 1) && (was == 0))) {
        __idxSet(m.tDiv, t, 0);
        __idxSet(m.tCount, t, 0);
        __idxSet(m.tOut, t, 0);
      }
      t = __ovf((t + 1), -9223372036854775808, 9223372036854775807);
    }
    m.tEnable = ((bv & 7) >>> 0);
    __idxSet(m.ram, addr, (bv & 0xFF));
    return;
  }
  if ((addr == 242)) {
    m.dspAddr = bv;
    __idxSet(m.ram, addr, (bv & 0xFF));
    return;
  }
  if ((addr == 243)) {
    if ((((m.dspAddr & 128) >>> 0) == 0)) {
      __idxSet(m.dsp, ((m.dspAddr & 127) >>> 0), (bv & 0xFF));
    }
    __idxSet(m.ram, addr, (bv & 0xFF));
    return;
  }
  if (((addr >= 250) && (addr <= 252))) {
    __idxSet(m.tTarget, __ovf((addr - 250), -9223372036854775808, 9223372036854775807), bv);
    __idxSet(m.ram, addr, (bv & 0xFF));
    return;
  }
  if (((addr >= 244) && (addr <= 247))) {
    __idxSet(m.outPort, __ovf((addr - 244), -9223372036854775808, 9223372036854775807), bv);
    __idxSet(m.ram, addr, (bv & 0xFF));
    return;
  }
  __idxSet(m.ram, addr, (bv & 0xFF));
}

function apuReadPort(m, i) {
  return __idx(m.outPort, ((i & 3) >>> 0));
}

function apuWritePort(m, i, v) {
  __idxSet(m.inPort, ((i & 3) >>> 0), ((v & 255) >>> 0));
}

function spcReset(spc, m) {
  spc.pc = spcRead16(m, 65534);
  spc.sp = 239;
  spc.psw = 2;
}

function spcSetBit(spc, mask, on) {
  if (on) {
    spc.psw = ((spc.psw | mask) >>> 0);
  } else {
    spc.psw = ((spc.psw & (~mask)) >>> 0);
  }
}

function spcNZ(spc, v) {
  spcSetBit(spc, PZ, (((v & 255) >>> 0) == 0));
  spcSetBit(spc, PN, (((v & 128) >>> 0) != 0));
}

function spcFetch(spc, m) {
  const v = spcRead(m, spc.pc);
  spc.pc = ((__ovf((spc.pc + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  return v;
}

function dpAddr(spc, dp) {
  if ((((spc.psw & PP) >>> 0) != 0)) {
    return ((256 | ((dp & 255) >>> 0)) >>> 0);
  }
  return ((dp & 255) >>> 0);
}

function spcFetch16(spc, m) {
  const lo = spcFetch(spc, m);
  const hi = spcFetch(spc, m);
  return ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
}

function spcOr(spc, v) {
  spc.a = ((spc.a | v) >>> 0);
  spcNZ(spc, spc.a);
}

function spcAnd(spc, v) {
  spc.a = ((spc.a & v) >>> 0);
  spcNZ(spc, spc.a);
}

function spcEor(spc, v) {
  spc.a = ((spc.a ^ v) >>> 0);
  spcNZ(spc, spc.a);
}

function spcCmp(spc, reg, v) {
  const d = ((__ovf((reg - v), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  spcSetBit(spc, PC_, (((reg & 255) >>> 0) >= ((v & 255) >>> 0)));
  spcSetBit(spc, PZ, (d == 0));
  spcSetBit(spc, PN, (((d & 128) >>> 0) != 0));
}

function aluAdcVal(spc, a, v) {
  const av = ((a & 255) >>> 0);
  const vv = ((v & 255) >>> 0);
  const c = ((spc.psw & PC_) >>> 0);
  const r = __ovf((__ovf((av + vv), -9223372036854775808, 9223372036854775807) + c), -9223372036854775808, 9223372036854775807);
  spcSetBit(spc, PC_, (r > 255));
  spcSetBit(spc, PH, (__ovf((__ovf((((av & 15) >>> 0) + ((vv & 15) >>> 0)), -9223372036854775808, 9223372036854775807) + c), -9223372036854775808, 9223372036854775807) > 15));
  spcSetBit(spc, PV, ((((((~((av ^ vv) >>> 0)) & ((av ^ r) >>> 0)) >>> 0) & 128) >>> 0) != 0));
  const rr = ((r & 255) >>> 0);
  spcNZ(spc, rr);
  return rr;
}

function aluSbcVal(spc, a, v) {
  return aluAdcVal(spc, a, ((((v ^ 255) >>> 0) & 255) >>> 0));
}

function spcAdc(spc, v) {
  spc.a = aluAdcVal(spc, spc.a, v);
}

function spcSbc(spc, v) {
  spc.a = aluSbcVal(spc, spc.a, v);
}

function readDp(spc, m) {
  return spcRead(m, dpAddr(spc, spcFetch(spc, m)));
}

function readAbs(spc, m) {
  return spcRead(m, spcFetch16(spc, m));
}

function readAbsX(spc, m) {
  return spcRead(m, ((__ovf((spcFetch16(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
}

function readAbsY(spc, m) {
  return spcRead(m, ((__ovf((spcFetch16(spc, m) + spc.y), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
}

function spcPush(spc, m, v) {
  spcWrite(m, ((256 | ((spc.sp & 255) >>> 0)) >>> 0), v);
  spc.sp = ((__ovf((spc.sp - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
}

function spcPull(spc, m) {
  spc.sp = ((__ovf((spc.sp + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  return spcRead(m, ((256 | ((spc.sp & 255) >>> 0)) >>> 0));
}

function spcPush16(spc, m, v) {
  spcPush(spc, m, ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0));
  spcPush(spc, m, ((v & 255) >>> 0));
}

function spcPull16(spc, m) {
  const lo = spcPull(spc, m);
  const hi = spcPull(spc, m);
  return ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
}

function spcRead16(m, addr) {
  return ((spcRead(m, addr) | Math.trunc(spcRead(m, ((__ovf((addr + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)) * 2 ** (__sh(8, 64)))) >>> 0);
}

function spcDaa(spc) {
  const oldA = ((spc.a & 255) >>> 0);
  let carry = (((spc.psw & PC_) >>> 0) != 0);
  let a = oldA;
  if ((carry || (oldA > 153))) {
    a = __ovf((a + 96), -9223372036854775808, 9223372036854775807);
    carry = true;
  }
  if (((((spc.psw & PH) >>> 0) != 0) || (((oldA & 15) >>> 0) > 9))) {
    a = __ovf((a + 6), -9223372036854775808, 9223372036854775807);
  }
  spc.a = ((a & 255) >>> 0);
  spcSetBit(spc, PC_, carry);
  spcNZ(spc, spc.a);
}

function spcDas(spc) {
  const oldA = ((spc.a & 255) >>> 0);
  let carry = (((spc.psw & PC_) >>> 0) != 0);
  let a = oldA;
  if (((!carry) || (oldA > 153))) {
    a = __ovf((a - 96), -9223372036854775808, 9223372036854775807);
    carry = false;
  }
  if (((((spc.psw & PH) >>> 0) == 0) || (((oldA & 15) >>> 0) > 9))) {
    a = __ovf((a - 6), -9223372036854775808, 9223372036854775807);
  }
  spc.a = ((a & 255) >>> 0);
  spcSetBit(spc, PC_, carry);
  spcNZ(spc, spc.a);
}

function spcDiv(spc) {
  const ya = ((((Math.trunc(spc.y * 2 ** (__sh(8, 64))) | spc.a) >>> 0) & 65535) >>> 0);
  const x = ((spc.x & 255) >>> 0);
  spcSetBit(spc, PH, (((x & 15) >>> 0) <= ((spc.y & 15) >>> 0)));
  spcSetBit(spc, PV, (spc.y >= x));
  if ((spc.y < Math.trunc(x * 2 ** (__sh(1, 64))))) {
    spc.a = __ovf(__idiv(ya, x), -9223372036854775808, 9223372036854775807);
    spc.y = __irem(ya, x);
  } else {
    spc.a = __ovf((255 - __ovf(__idiv(__ovf((ya - Math.trunc(x * 2 ** (__sh(9, 64)))), -9223372036854775808, 9223372036854775807), __ovf((256 - x), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
    spc.y = __ovf((x + __irem(__ovf((ya - Math.trunc(x * 2 ** (__sh(9, 64)))), -9223372036854775808, 9223372036854775807), __ovf((256 - x), -9223372036854775808, 9223372036854775807))), -9223372036854775808, 9223372036854775807);
  }
  spc.a = ((spc.a & 255) >>> 0);
  spc.y = ((spc.y & 255) >>> 0);
  spcNZ(spc, spc.a);
}

function bbTest(spc, m, bit, wantSet) {
  const v = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
  const off = spcFetch(spc, m);
  const soff = (() => {
  if ((off >= 128)) {
    return __ovf((off - 256), -9223372036854775808, 9223372036854775807);
  } else {
    return off;
  }
  })();
  const bitset = (((Math.floor(v / 2 ** (__sh(bit, 64))) & 1) >>> 0) != 0);
  if ((bitset == wantSet)) {
    spc.pc = ((__ovf((spc.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  }
}

function spcBranch(spc, m, cond) {
  const off = spcFetch(spc, m);
  const soff = (() => {
  if ((off >= 128)) {
    return __ovf((off - 256), -9223372036854775808, 9223372036854775807);
  } else {
    return off;
  }
  })();
  if (cond) {
    spc.pc = ((__ovf((spc.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  }
}

function spcAsl(spc, v) {
  spcSetBit(spc, PC_, (((v & 128) >>> 0) != 0));
  const r = ((Math.trunc(v * 2 ** (__sh(1, 64))) & 255) >>> 0);
  spcNZ(spc, r);
  return r;
}

function spcLsr(spc, v) {
  spcSetBit(spc, PC_, (((v & 1) >>> 0) != 0));
  const r = Math.floor(((v & 255) >>> 0) / 2 ** (__sh(1, 64)));
  spcNZ(spc, r);
  return r;
}

function spcRol(spc, v) {
  const oldC = ((spc.psw & PC_) >>> 0);
  spcSetBit(spc, PC_, (((v & 128) >>> 0) != 0));
  const r = ((((Math.trunc(v * 2 ** (__sh(1, 64))) | oldC) >>> 0) & 255) >>> 0);
  spcNZ(spc, r);
  return r;
}

function spcRor(spc, v) {
  const oldC = ((spc.psw & PC_) >>> 0);
  spcSetBit(spc, PC_, (((v & 1) >>> 0) != 0));
  let r = Math.floor(((v & 255) >>> 0) / 2 ** (__sh(1, 64)));
  if ((oldC != 0)) {
    r = ((r | 128) >>> 0);
  }
  spcNZ(spc, r);
  return r;
}

function spcNZ16(spc, w) {
  spcSetBit(spc, PZ, (((w & 65535) >>> 0) == 0));
  spcSetBit(spc, PN, (((w & 32768) >>> 0) != 0));
}

function readDpWord(spc, m, d) {
  const lo = spcRead(m, dpAddr(spc, d));
  const hi = spcRead(m, dpAddr(spc, ((__ovf((d + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0)));
  return ((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0);
}

function writeDpWord(spc, m, d, w) {
  spcWrite(m, dpAddr(spc, d), ((w & 255) >>> 0));
  spcWrite(m, dpAddr(spc, ((__ovf((d + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0)), ((Math.floor(w / 2 ** (__sh(8, 64))) & 255) >>> 0));
}

function readDpX(spc, m) {
  return spcRead(m, dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0)));
}

function readIndX(spc, m) {
  return spcRead(m, dpAddr(spc, spc.x));
}

function readIndDpX(spc, m) {
  const d = ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  return spcRead(m, readDpWord(spc, m, d));
}

function readIndDpY(spc, m) {
  const d = spcFetch(spc, m);
  const ptr = readDpWord(spc, m, d);
  return spcRead(m, ((__ovf((ptr + spc.y), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
}

function setBitMem(spc, m, bit, set) {
  const ad = dpAddr(spc, spcFetch(spc, m));
  let v = spcRead(m, ad);
  if (set) {
    v = ((v | Math.trunc(1 * 2 ** (__sh(bit, 64)))) >>> 0);
  } else {
    v = ((v & (~Math.trunc(1 * 2 ** (__sh(bit, 64))))) >>> 0);
  }
  spcWrite(m, ad, v);
}

function spcAddw(spc, w) {
  const ya = ((((Math.trunc(spc.y * 2 ** (__sh(8, 64))) | spc.a) >>> 0) & 65535) >>> 0);
  const r = __ovf((ya + w), -9223372036854775808, 9223372036854775807);
  spcSetBit(spc, PC_, (r > 65535));
  spcSetBit(spc, PH, (__ovf((((ya & 4095) >>> 0) + ((w & 4095) >>> 0)), -9223372036854775808, 9223372036854775807) > 4095));
  spcSetBit(spc, PV, ((((((~((ya ^ w) >>> 0)) & ((ya ^ r) >>> 0)) >>> 0) & 32768) >>> 0) != 0));
  spc.a = ((r & 255) >>> 0);
  spc.y = ((Math.floor(r / 2 ** (__sh(8, 64))) & 255) >>> 0);
  spcNZ16(spc, r);
}

function spcSubw(spc, w) {
  const ya = ((((Math.trunc(spc.y * 2 ** (__sh(8, 64))) | spc.a) >>> 0) & 65535) >>> 0);
  const comp = (((~w) & 65535) >>> 0);
  const r = __ovf((__ovf((ya + comp), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807);
  spcSetBit(spc, PC_, (r > 65535));
  spcSetBit(spc, PH, (__ovf((__ovf((((ya & 4095) >>> 0) + ((comp & 4095) >>> 0)), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807) > 4095));
  spcSetBit(spc, PV, ((((((~((ya ^ comp) >>> 0)) & ((ya ^ r) >>> 0)) >>> 0) & 32768) >>> 0) != 0));
  spc.a = ((r & 255) >>> 0);
  spc.y = ((Math.floor(r / 2 ** (__sh(8, 64))) & 255) >>> 0);
  spcNZ16(spc, r);
}

function spcCmpw(spc, w) {
  const ya = ((((Math.trunc(spc.y * 2 ** (__sh(8, 64))) | spc.a) >>> 0) & 65535) >>> 0);
  spcSetBit(spc, PC_, (ya >= ((w & 65535) >>> 0)));
  spcNZ16(spc, ((__ovf((ya - w), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
}

function spcStep(spc, m) {
  spcTimersTick(m, 16);
  const op = spcFetch(spc, m);
  const _t20 = op;
  if (_t20 === 0) {
  } else if (_t20 === 32) {
    spcSetBit(spc, PP, false);
  } else if (_t20 === 64) {
    spcSetBit(spc, PP, true);
  } else if (_t20 === 96) {
    spcSetBit(spc, PC_, false);
  } else if (_t20 === 128) {
    spcSetBit(spc, PC_, true);
  } else if (_t20 === 224) {
    spcSetBit(spc, PV, false);
    spcSetBit(spc, PH, false);
  } else if (_t20 === 237) {
    spcSetBit(spc, PC_, (((spc.psw & PC_) >>> 0) == 0));
  } else if (_t20 === 160) {
    spcSetBit(spc, PI, true);
  } else if (_t20 === 192) {
    spcSetBit(spc, PI, false);
  } else if (_t20 === 232) {
    const v = spcFetch(spc, m);
    spc.a = v;
    spcNZ(spc, v);
  } else if (_t20 === 205) {
    const v = spcFetch(spc, m);
    spc.x = v;
    spcNZ(spc, v);
  } else if (_t20 === 141) {
    const v = spcFetch(spc, m);
    spc.y = v;
    spcNZ(spc, v);
  } else if (_t20 === 125) {
    spc.a = spc.x;
    spcNZ(spc, spc.a);
  } else if (_t20 === 221) {
    spc.a = spc.y;
    spcNZ(spc, spc.a);
  } else if (_t20 === 93) {
    spc.x = spc.a;
    spcNZ(spc, spc.x);
  } else if (_t20 === 253) {
    spc.y = spc.a;
    spcNZ(spc, spc.y);
  } else if (_t20 === 157) {
    spc.x = spc.sp;
    spcNZ(spc, spc.x);
  } else if (_t20 === 189) {
    spc.sp = spc.x;
  } else if (_t20 === 188) {
    spc.a = ((__ovf((spc.a + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcNZ(spc, spc.a);
  } else if (_t20 === 61) {
    spc.x = ((__ovf((spc.x + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcNZ(spc, spc.x);
  } else if (_t20 === 252) {
    spc.y = ((__ovf((spc.y + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcNZ(spc, spc.y);
  } else if (_t20 === 156) {
    spc.a = ((__ovf((spc.a - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcNZ(spc, spc.a);
  } else if (_t20 === 29) {
    spc.x = ((__ovf((spc.x - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcNZ(spc, spc.x);
  } else if (_t20 === 220) {
    spc.y = ((__ovf((spc.y - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcNZ(spc, spc.y);
  } else if (_t20 === 8) {
    const v = spcFetch(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 4) {
    const v = readDp(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 5) {
    const v = readAbs(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 40) {
    const v = spcFetch(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 36) {
    const v = readDp(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 37) {
    const v = readAbs(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 72) {
    const v = spcFetch(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 68) {
    const v = readDp(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 69) {
    const v = readAbs(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 104) {
    const v = spcFetch(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 100) {
    const v = readDp(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 101) {
    const v = readAbs(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 136) {
    const v = spcFetch(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 132) {
    const v = readDp(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 133) {
    const v = readAbs(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 168) {
    const v = spcFetch(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 164) {
    const v = readDp(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 165) {
    const v = readAbs(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 200) {
    const v = spcFetch(spc, m);
    spcCmp(spc, spc.x, v);
  } else if (_t20 === 173) {
    const v = spcFetch(spc, m);
    spcCmp(spc, spc.y, v);
  } else if (_t20 === 228) {
    const v = readDp(spc, m);
    spc.a = v;
    spcNZ(spc, v);
  } else if (_t20 === 229) {
    const v = readAbs(spc, m);
    spc.a = v;
    spcNZ(spc, v);
  } else if (_t20 === 196) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    spcWrite(m, ad, spc.a);
  } else if (_t20 === 197) {
    const ad = spcFetch16(spc, m);
    spcWrite(m, ad, spc.a);
  } else if (_t20 === 248) {
    const v = readDp(spc, m);
    spc.x = v;
    spcNZ(spc, v);
  } else if (_t20 === 233) {
    const v = readAbs(spc, m);
    spc.x = v;
    spcNZ(spc, v);
  } else if (_t20 === 216) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    spcWrite(m, ad, spc.x);
  } else if (_t20 === 201) {
    const ad = spcFetch16(spc, m);
    spcWrite(m, ad, spc.x);
  } else if (_t20 === 235) {
    const v = readDp(spc, m);
    spc.y = v;
    spcNZ(spc, v);
  } else if (_t20 === 236) {
    const v = readAbs(spc, m);
    spc.y = v;
    spcNZ(spc, v);
  } else if (_t20 === 203) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    spcWrite(m, ad, spc.y);
  } else if (_t20 === 204) {
    const ad = spcFetch16(spc, m);
    spcWrite(m, ad, spc.y);
  } else if (_t20 === 230) {
    spc.a = spcRead(m, dpAddr(spc, spc.x));
    spcNZ(spc, spc.a);
  } else if (_t20 === 198) {
    spcWrite(m, dpAddr(spc, spc.x), spc.a);
  } else if (_t20 === 143) {
    const imm = spcFetch(spc, m);
    const ad = dpAddr(spc, spcFetch(spc, m));
    spcWrite(m, ad, imm);
  } else if (_t20 === 45) {
    spcPush(spc, m, spc.a);
  } else if (_t20 === 77) {
    spcPush(spc, m, spc.x);
  } else if (_t20 === 109) {
    spcPush(spc, m, spc.y);
  } else if (_t20 === 13) {
    spcPush(spc, m, spc.psw);
  } else if (_t20 === 174) {
    spc.a = spcPull(spc, m);
  } else if (_t20 === 206) {
    spc.x = spcPull(spc, m);
  } else if (_t20 === 238) {
    spc.y = spcPull(spc, m);
  } else if (_t20 === 142) {
    spc.psw = spcPull(spc, m);
  } else if (_t20 === 171) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = ((__ovf((spcRead(m, ad) + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 172) {
    const ad = spcFetch16(spc, m);
    const r = ((__ovf((spcRead(m, ad) + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 139) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = ((__ovf((spcRead(m, ad) - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 140) {
    const ad = spcFetch16(spc, m);
    const r = ((__ovf((spcRead(m, ad) - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 47) {
    spcBranch(spc, m, true);
  } else if (_t20 === 240) {
    spcBranch(spc, m, (((spc.psw & PZ) >>> 0) != 0));
  } else if (_t20 === 208) {
    spcBranch(spc, m, (((spc.psw & PZ) >>> 0) == 0));
  } else if (_t20 === 176) {
    spcBranch(spc, m, (((spc.psw & PC_) >>> 0) != 0));
  } else if (_t20 === 144) {
    spcBranch(spc, m, (((spc.psw & PC_) >>> 0) == 0));
  } else if (_t20 === 48) {
    spcBranch(spc, m, (((spc.psw & PN) >>> 0) != 0));
  } else if (_t20 === 16) {
    spcBranch(spc, m, (((spc.psw & PN) >>> 0) == 0));
  } else if (_t20 === 112) {
    spcBranch(spc, m, (((spc.psw & PV) >>> 0) != 0));
  } else if (_t20 === 80) {
    spcBranch(spc, m, (((spc.psw & PV) >>> 0) == 0));
  } else if (_t20 === 21) {
    const v = readAbsX(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 22) {
    const v = readAbsY(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 53) {
    const v = readAbsX(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 54) {
    const v = readAbsY(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 85) {
    const v = readAbsX(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 86) {
    const v = readAbsY(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 117) {
    const v = readAbsX(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 118) {
    const v = readAbsY(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 149) {
    const v = readAbsX(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 150) {
    const v = readAbsY(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 181) {
    const v = readAbsX(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 182) {
    const v = readAbsY(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 27) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    const r = spcAsl(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 91) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    const r = spcLsr(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 59) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    const r = spcRol(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 123) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    const r = spcRor(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 187) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    const r = ((__ovf((spcRead(m, ad) + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 155) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    const r = ((__ovf((spcRead(m, ad) - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 222) {
    const v = spcRead(m, dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0)));
    const off = spcFetch(spc, m);
    const soff = (() => {
    if ((off >= 128)) {
      return __ovf((off - 256), -9223372036854775808, 9223372036854775807);
    } else {
      return off;
    }
    })();
    if ((((spc.a & 255) >>> 0) != v)) {
      spc.pc = ((__ovf((spc.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
  } else if (_t20 === 245) {
    const v = readAbsX(spc, m);
    spc.a = v;
    spcNZ(spc, v);
  } else if (_t20 === 246) {
    const v = readAbsY(spc, m);
    spc.a = v;
    spcNZ(spc, v);
  } else if (_t20 === 231) {
    const v = readIndDpX(spc, m);
    spc.a = v;
    spcNZ(spc, v);
  } else if (_t20 === 247) {
    const v = readIndDpY(spc, m);
    spc.a = v;
    spcNZ(spc, v);
  } else if (_t20 === 213) {
    const ad = ((__ovf((spcFetch16(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    spcWrite(m, ad, spc.a);
  } else if (_t20 === 214) {
    const ad = ((__ovf((spcFetch16(spc, m) + spc.y), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    spcWrite(m, ad, spc.a);
  } else if (_t20 === 199) {
    const ptr = readDpWord(spc, m, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    spcWrite(m, ptr, spc.a);
  } else if (_t20 === 215) {
    const ptr = readDpWord(spc, m, spcFetch(spc, m));
    spcWrite(m, ((__ovf((ptr + spc.y), -9223372036854775808, 9223372036854775807) & 65535) >>> 0), spc.a);
  } else if (_t20 === 249) {
    const v = spcRead(m, dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.y), -9223372036854775808, 9223372036854775807) & 255) >>> 0)));
    spc.x = v;
    spcNZ(spc, v);
  } else if (_t20 === 251) {
    const v = spcRead(m, dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0)));
    spc.y = v;
    spcNZ(spc, v);
  } else if (_t20 === 219) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    spcWrite(m, ad, spc.y);
  } else if (_t20 === 217) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.y), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    spcWrite(m, ad, spc.x);
  } else if (_t20 === 10) {
    const mb = spcFetch16(spc, m);
    const b = ((Math.floor(spcRead(m, ((mb & 8191) >>> 0)) / 2 ** (__sh(((Math.floor(mb / 2 ** (__sh(13, 64))) & 7) >>> 0), 64))) & 1) >>> 0);
    spcSetBit(spc, PC_, ((((spc.psw & PC_) >>> 0) != 0) || (b != 0)));
  } else if (_t20 === 42) {
    const mb = spcFetch16(spc, m);
    const b = ((Math.floor(spcRead(m, ((mb & 8191) >>> 0)) / 2 ** (__sh(((Math.floor(mb / 2 ** (__sh(13, 64))) & 7) >>> 0), 64))) & 1) >>> 0);
    spcSetBit(spc, PC_, ((((spc.psw & PC_) >>> 0) != 0) || (b == 0)));
  } else if (_t20 === 74) {
    const mb = spcFetch16(spc, m);
    const b = ((Math.floor(spcRead(m, ((mb & 8191) >>> 0)) / 2 ** (__sh(((Math.floor(mb / 2 ** (__sh(13, 64))) & 7) >>> 0), 64))) & 1) >>> 0);
    spcSetBit(spc, PC_, ((((spc.psw & PC_) >>> 0) != 0) && (b != 0)));
  } else if (_t20 === 106) {
    const mb = spcFetch16(spc, m);
    const b = ((Math.floor(spcRead(m, ((mb & 8191) >>> 0)) / 2 ** (__sh(((Math.floor(mb / 2 ** (__sh(13, 64))) & 7) >>> 0), 64))) & 1) >>> 0);
    spcSetBit(spc, PC_, ((((spc.psw & PC_) >>> 0) != 0) && (b == 0)));
  } else if (_t20 === 138) {
    const mb = spcFetch16(spc, m);
    const b = ((Math.floor(spcRead(m, ((mb & 8191) >>> 0)) / 2 ** (__sh(((Math.floor(mb / 2 ** (__sh(13, 64))) & 7) >>> 0), 64))) & 1) >>> 0);
    spcSetBit(spc, PC_, ((((spc.psw & PC_) >>> 0) != 0) != (b != 0)));
  } else if (_t20 === 170) {
    const mb = spcFetch16(spc, m);
    const b = ((Math.floor(spcRead(m, ((mb & 8191) >>> 0)) / 2 ** (__sh(((Math.floor(mb / 2 ** (__sh(13, 64))) & 7) >>> 0), 64))) & 1) >>> 0);
    spcSetBit(spc, PC_, (b != 0));
  } else if (_t20 === 202) {
    const mb = spcFetch16(spc, m);
    const ad = ((mb & 8191) >>> 0);
    const bit = ((Math.floor(mb / 2 ** (__sh(13, 64))) & 7) >>> 0);
    let v = spcRead(m, ad);
    if ((((spc.psw & PC_) >>> 0) != 0)) {
      v = ((v | Math.trunc(1 * 2 ** (__sh(bit, 64)))) >>> 0);
    } else {
      v = ((v & (~Math.trunc(1 * 2 ** (__sh(bit, 64))))) >>> 0);
    }
    spcWrite(m, ad, v);
  } else if (_t20 === 234) {
    const mb = spcFetch16(spc, m);
    const ad = ((mb & 8191) >>> 0);
    const bit = ((Math.floor(mb / 2 ** (__sh(13, 64))) & 7) >>> 0);
    const cur = spcRead(m, ad);
    spcWrite(m, ad, ((cur ^ Math.trunc(1 * 2 ** (__sh(bit, 64)))) >>> 0));
  } else if (_t20 === 14) {
    const ad = spcFetch16(spc, m);
    const v = spcRead(m, ad);
    spcNZ(spc, ((__ovf((spc.a - v), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    spcWrite(m, ad, ((v | spc.a) >>> 0));
  } else if (_t20 === 78) {
    const ad = spcFetch16(spc, m);
    const v = spcRead(m, ad);
    spcNZ(spc, ((__ovf((spc.a - v), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    spcWrite(m, ad, ((v & (~spc.a)) >>> 0));
  } else if (_t20 === 24) {
    const imm = spcFetch(spc, m);
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = ((((spcRead(m, ad) | imm) >>> 0) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 56) {
    const imm = spcFetch(spc, m);
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = ((((spcRead(m, ad) & imm) >>> 0) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 88) {
    const imm = spcFetch(spc, m);
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = ((((spcRead(m, ad) ^ imm) >>> 0) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 120) {
    const imm = spcFetch(spc, m);
    const ad = dpAddr(spc, spcFetch(spc, m));
    spcCmp(spc, spcRead(m, ad), imm);
  } else if (_t20 === 152) {
    const imm = spcFetch(spc, m);
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = aluAdcVal(spc, spcRead(m, ad), imm);
    spcWrite(m, ad, r);
  } else if (_t20 === 184) {
    const imm = spcFetch(spc, m);
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = aluSbcVal(spc, spcRead(m, ad), imm);
    spcWrite(m, ad, r);
  } else if (_t20 === 9) {
    const sv = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = ((((spcRead(m, ad) | sv) >>> 0) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 41) {
    const sv = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = ((((spcRead(m, ad) & sv) >>> 0) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 73) {
    const sv = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = ((((spcRead(m, ad) ^ sv) >>> 0) & 255) >>> 0);
    spcWrite(m, ad, r);
    spcNZ(spc, r);
  } else if (_t20 === 105) {
    const sv = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
    const ad = dpAddr(spc, spcFetch(spc, m));
    spcCmp(spc, spcRead(m, ad), sv);
  } else if (_t20 === 137) {
    const sv = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = aluAdcVal(spc, spcRead(m, ad), sv);
    spcWrite(m, ad, r);
  } else if (_t20 === 169) {
    const sv = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = aluSbcVal(spc, spcRead(m, ad), sv);
    spcWrite(m, ad, r);
  } else if (_t20 === 250) {
    const sv = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
    const ad = dpAddr(spc, spcFetch(spc, m));
    spcWrite(m, ad, sv);
  } else if (_t20 === 2) {
    setBitMem(spc, m, 0, true);
  } else if (_t20 === 34) {
    setBitMem(spc, m, 1, true);
  } else if (_t20 === 66) {
    setBitMem(spc, m, 2, true);
  } else if (_t20 === 98) {
    setBitMem(spc, m, 3, true);
  } else if (_t20 === 130) {
    setBitMem(spc, m, 4, true);
  } else if (_t20 === 162) {
    setBitMem(spc, m, 5, true);
  } else if (_t20 === 194) {
    setBitMem(spc, m, 6, true);
  } else if (_t20 === 226) {
    setBitMem(spc, m, 7, true);
  } else if (_t20 === 18) {
    setBitMem(spc, m, 0, false);
  } else if (_t20 === 50) {
    setBitMem(spc, m, 1, false);
  } else if (_t20 === 82) {
    setBitMem(spc, m, 2, false);
  } else if (_t20 === 114) {
    setBitMem(spc, m, 3, false);
  } else if (_t20 === 146) {
    setBitMem(spc, m, 4, false);
  } else if (_t20 === 178) {
    setBitMem(spc, m, 5, false);
  } else if (_t20 === 210) {
    setBitMem(spc, m, 6, false);
  } else if (_t20 === 242) {
    setBitMem(spc, m, 7, false);
  } else if (_t20 === 191) {
    spc.a = spcRead(m, dpAddr(spc, spc.x));
    spcNZ(spc, spc.a);
    spc.x = ((__ovf((spc.x + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  } else if (_t20 === 175) {
    spcWrite(m, dpAddr(spc, spc.x), spc.a);
    spc.x = ((__ovf((spc.x + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  } else if (_t20 === 6) {
    const v = readIndX(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 38) {
    const v = readIndX(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 70) {
    const v = readIndX(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 102) {
    const v = readIndX(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 134) {
    const v = readIndX(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 166) {
    const v = readIndX(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 7) {
    const v = readIndDpX(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 39) {
    const v = readIndDpX(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 71) {
    const v = readIndDpX(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 103) {
    const v = readIndDpX(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 135) {
    const v = readIndDpX(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 167) {
    const v = readIndDpX(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 23) {
    const v = readIndDpY(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 55) {
    const v = readIndDpY(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 87) {
    const v = readIndDpY(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 119) {
    const v = readIndDpY(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 151) {
    const v = readIndDpY(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 183) {
    const v = readIndDpY(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 207) {
    const r = ((__ovf((spc.y * spc.a), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    spc.a = ((r & 255) >>> 0);
    spc.y = ((Math.floor(r / 2 ** (__sh(8, 64))) & 255) >>> 0);
    spcNZ(spc, spc.y);
  } else if (_t20 === 122) {
    const d = spcFetch(spc, m);
    spcAddw(spc, readDpWord(spc, m, d));
  } else if (_t20 === 154) {
    const d = spcFetch(spc, m);
    spcSubw(spc, readDpWord(spc, m, d));
  } else if (_t20 === 90) {
    const d = spcFetch(spc, m);
    spcCmpw(spc, readDpWord(spc, m, d));
  } else if (_t20 === 20) {
    const v = readDpX(spc, m);
    spcOr(spc, v);
  } else if (_t20 === 52) {
    const v = readDpX(spc, m);
    spcAnd(spc, v);
  } else if (_t20 === 84) {
    const v = readDpX(spc, m);
    spcEor(spc, v);
  } else if (_t20 === 116) {
    const v = readDpX(spc, m);
    spcCmp(spc, spc.a, v);
  } else if (_t20 === 148) {
    const v = readDpX(spc, m);
    spcAdc(spc, v);
  } else if (_t20 === 180) {
    const v = readDpX(spc, m);
    spcSbc(spc, v);
  } else if (_t20 === 244) {
    const v = readDpX(spc, m);
    spc.a = v;
    spcNZ(spc, v);
  } else if (_t20 === 212) {
    const ad = dpAddr(spc, ((__ovf((spcFetch(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 255) >>> 0));
    spcWrite(m, ad, spc.a);
  } else if (_t20 === 28) {
    spc.a = spcAsl(spc, spc.a);
  } else if (_t20 === 11) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = spcAsl(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 12) {
    const ad = spcFetch16(spc, m);
    const r = spcAsl(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 92) {
    spc.a = spcLsr(spc, spc.a);
  } else if (_t20 === 75) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = spcLsr(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 76) {
    const ad = spcFetch16(spc, m);
    const r = spcLsr(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 60) {
    spc.a = spcRol(spc, spc.a);
  } else if (_t20 === 43) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = spcRol(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 44) {
    const ad = spcFetch16(spc, m);
    const r = spcRol(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 124) {
    spc.a = spcRor(spc, spc.a);
  } else if (_t20 === 107) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    const r = spcRor(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 108) {
    const ad = spcFetch16(spc, m);
    const r = spcRor(spc, spcRead(m, ad));
    spcWrite(m, ad, r);
  } else if (_t20 === 159) {
    spc.a = ((((Math.floor(spc.a / 2 ** (__sh(4, 64))) | Math.trunc(spc.a * 2 ** (__sh(4, 64)))) >>> 0) & 255) >>> 0);
    spcNZ(spc, spc.a);
  } else if (_t20 === 186) {
    const d = spcFetch(spc, m);
    const w = readDpWord(spc, m, d);
    spc.a = ((w & 255) >>> 0);
    spc.y = ((Math.floor(w / 2 ** (__sh(8, 64))) & 255) >>> 0);
    spcNZ16(spc, w);
  } else if (_t20 === 218) {
    const d = spcFetch(spc, m);
    writeDpWord(spc, m, d, ((Math.trunc(spc.y * 2 ** (__sh(8, 64))) | spc.a) >>> 0));
  } else if (_t20 === 58) {
    const d = spcFetch(spc, m);
    const w = ((__ovf((readDpWord(spc, m, d) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    writeDpWord(spc, m, d, w);
    spcNZ16(spc, w);
  } else if (_t20 === 26) {
    const d = spcFetch(spc, m);
    const w = ((__ovf((readDpWord(spc, m, d) - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    writeDpWord(spc, m, d, w);
    spcNZ16(spc, w);
  } else if (_t20 === 254) {
    const off = spcFetch(spc, m);
    spc.y = ((__ovf((spc.y - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    const soff = (() => {
    if ((off >= 128)) {
      return __ovf((off - 256), -9223372036854775808, 9223372036854775807);
    } else {
      return off;
    }
    })();
    if ((spc.y != 0)) {
      spc.pc = ((__ovf((spc.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
  } else if (_t20 === 110) {
    const ad = dpAddr(spc, spcFetch(spc, m));
    const off = spcFetch(spc, m);
    const v = ((__ovf((spcRead(m, ad) - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    spcWrite(m, ad, v);
    const soff = (() => {
    if ((off >= 128)) {
      return __ovf((off - 256), -9223372036854775808, 9223372036854775807);
    } else {
      return off;
    }
    })();
    if ((v != 0)) {
      spc.pc = ((__ovf((spc.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
  } else if (_t20 === 46) {
    const v = spcRead(m, dpAddr(spc, spcFetch(spc, m)));
    const off = spcFetch(spc, m);
    const soff = (() => {
    if ((off >= 128)) {
      return __ovf((off - 256), -9223372036854775808, 9223372036854775807);
    } else {
      return off;
    }
    })();
    if ((((spc.a & 255) >>> 0) != v)) {
      spc.pc = ((__ovf((spc.pc + soff), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
  } else if (_t20 === 95) {
    spc.pc = spcFetch16(spc, m);
  } else if (_t20 === 63) {
    const target = spcFetch16(spc, m);
    spcPush16(spc, m, spc.pc);
    spc.pc = target;
  } else if (_t20 === 111) {
    spc.pc = spcPull16(spc, m);
  } else if (_t20 === 1) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65502);
  } else if (_t20 === 17) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65500);
  } else if (_t20 === 33) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65498);
  } else if (_t20 === 49) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65496);
  } else if (_t20 === 65) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65494);
  } else if (_t20 === 81) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65492);
  } else if (_t20 === 97) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65490);
  } else if (_t20 === 113) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65488);
  } else if (_t20 === 129) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65486);
  } else if (_t20 === 145) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65484);
  } else if (_t20 === 161) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65482);
  } else if (_t20 === 177) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65480);
  } else if (_t20 === 193) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65478);
  } else if (_t20 === 209) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65476);
  } else if (_t20 === 225) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65474);
  } else if (_t20 === 241) {
    spcPush16(spc, m, spc.pc);
    spc.pc = spcRead16(m, 65472);
  } else if (_t20 === 79) {
    const u = spcFetch(spc, m);
    spcPush16(spc, m, spc.pc);
    spc.pc = ((65280 | u) >>> 0);
  } else if (_t20 === 31) {
    const addr = ((__ovf((spcFetch16(spc, m) + spc.x), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    spc.pc = spcRead16(m, addr);
  } else if (_t20 === 15) {
    spcPush16(spc, m, spc.pc);
    spcPush(spc, m, spc.psw);
    spcSetBit(spc, PB, true);
    spcSetBit(spc, PI, false);
    spc.pc = spcRead16(m, 65502);
  } else if (_t20 === 127) {
    spc.psw = spcPull(spc, m);
    spc.pc = spcPull16(spc, m);
  } else if (_t20 === 223) {
    spcDaa(spc);
  } else if (_t20 === 190) {
    spcDas(spc);
  } else if (_t20 === 158) {
    spcDiv(spc);
  } else if (_t20 === 62) {
    const v = readDp(spc, m);
    spcCmp(spc, spc.x, v);
  } else if (_t20 === 30) {
    const v = readAbs(spc, m);
    spcCmp(spc, spc.x, v);
  } else if (_t20 === 126) {
    const v = readDp(spc, m);
    spcCmp(spc, spc.y, v);
  } else if (_t20 === 94) {
    const v = readAbs(spc, m);
    spcCmp(spc, spc.y, v);
  } else if (_t20 === 3) {
    bbTest(spc, m, 0, true);
  } else if (_t20 === 35) {
    bbTest(spc, m, 1, true);
  } else if (_t20 === 67) {
    bbTest(spc, m, 2, true);
  } else if (_t20 === 99) {
    bbTest(spc, m, 3, true);
  } else if (_t20 === 131) {
    bbTest(spc, m, 4, true);
  } else if (_t20 === 163) {
    bbTest(spc, m, 5, true);
  } else if (_t20 === 195) {
    bbTest(spc, m, 6, true);
  } else if (_t20 === 227) {
    bbTest(spc, m, 7, true);
  } else if (_t20 === 19) {
    bbTest(spc, m, 0, false);
  } else if (_t20 === 51) {
    bbTest(spc, m, 1, false);
  } else if (_t20 === 83) {
    bbTest(spc, m, 2, false);
  } else if (_t20 === 115) {
    bbTest(spc, m, 3, false);
  } else if (_t20 === 147) {
    bbTest(spc, m, 4, false);
  } else if (_t20 === 179) {
    bbTest(spc, m, 5, false);
  } else if (_t20 === 211) {
    bbTest(spc, m, 6, false);
  } else if (_t20 === 243) {
    bbTest(spc, m, 7, false);
  } else if (_t20 === 25) {
    const a1 = dpAddr(spc, spc.x);
    const r = ((((spcRead(m, a1) | spcRead(m, dpAddr(spc, spc.y))) >>> 0) & 255) >>> 0);
    spcWrite(m, a1, r);
    spcNZ(spc, r);
  } else if (_t20 === 57) {
    const a1 = dpAddr(spc, spc.x);
    const r = ((((spcRead(m, a1) & spcRead(m, dpAddr(spc, spc.y))) >>> 0) & 255) >>> 0);
    spcWrite(m, a1, r);
    spcNZ(spc, r);
  } else if (_t20 === 89) {
    const a1 = dpAddr(spc, spc.x);
    const r = ((((spcRead(m, a1) ^ spcRead(m, dpAddr(spc, spc.y))) >>> 0) & 255) >>> 0);
    spcWrite(m, a1, r);
    spcNZ(spc, r);
  } else if (_t20 === 121) {
    const v1 = spcRead(m, dpAddr(spc, spc.x));
    const v2 = spcRead(m, dpAddr(spc, spc.y));
    spcCmp(spc, v1, v2);
  } else if (_t20 === 153) {
    const a1 = dpAddr(spc, spc.x);
    const r = aluAdcVal(spc, spcRead(m, a1), spcRead(m, dpAddr(spc, spc.y)));
    spcWrite(m, a1, r);
  } else if (_t20 === 185) {
    const a1 = dpAddr(spc, spc.x);
    const r = aluSbcVal(spc, spcRead(m, a1), spcRead(m, dpAddr(spc, spc.y)));
    spcWrite(m, a1, r);
  } else if (_t20 === 239) {
  } else if (_t20 === 255) {
  } else {
  }
}

function ppuZeros(n) {
  let v = [];
  let i = 0;
  while ((i < n)) {
    v.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function ppuZerosI64(n) {
  let v = [];
  let i = 0;
  while ((i < n)) {
    v.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function newPpu() {
  return new Ppu(ppuZeros(65536), ppuZeros(512), ppuZeros(1024), 0, 0, 0, 0, false, 0, 0, 0, 0, 0, 0, 0, ppuZerosI64(4), ppuZerosI64(4), 0, 0, 0, 0, 0, 0, 0, false, 31, 0, 256, 0, 0, 256, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, ppuZerosI64(224), ppuZerosI64(224), ppuZerosI64(224), ppuZerosI64(224), 0, 0, 0, 0, 0, 0, 0, 0, 0, ppuZerosI64(224), ppuZerosI64(224));
}

function vramStep(p) {
  const s = ((p.vmain & 3) >>> 0);
  if ((s == 0)) {
    return 1;
  }
  if ((s == 1)) {
    return 32;
  }
  return 128;
}

function ppuVblankOamReload(p) {
  if ((((p.inidisp & 128) >>> 0) == 0)) {
    p.oamaddr = oamReload;
    p.oamHi = false;
  }
}

function ppuRegWrite(p, reg, val) {
  const v = ((val & 255) >>> 0);
  if ((reg == 0)) {
    p.inidisp = v;
    return;
  }
  if ((reg == 1)) {
    p.obsel = v;
    return;
  }
  if ((reg == 2)) {
    p.oamaddr = ((((p.oamaddr & 256) >>> 0) | v) >>> 0);
    oamReload = p.oamaddr;
    p.oamHi = false;
    return;
  }
  if ((reg == 3)) {
    p.oamaddr = ((Math.trunc(((v & 1) >>> 0) * 2 ** (__sh(8, 64))) | ((p.oamaddr & 255) >>> 0)) >>> 0);
    oamReload = p.oamaddr;
    p.oamHi = false;
    return;
  }
  if ((reg == 4)) {
    const a = ((__ovf((p.oamaddr * 2), -9223372036854775808, 9223372036854775807) & 1023) >>> 0);
    if ((!p.oamHi)) {
      p.oamLatch = v;
      __idxSet(p.oam, a, (v & 0xFF));
      p.oamHi = true;
    } else {
      __idxSet(p.oam, ((__ovf((a + 1), -9223372036854775808, 9223372036854775807) & 1023) >>> 0), (v & 0xFF));
      p.oamaddr = ((__ovf((p.oamaddr + 1), -9223372036854775808, 9223372036854775807) & 511) >>> 0);
      p.oamHi = false;
    }
    return;
  }
  if ((reg == 5)) {
    p.bgmode = v;
    return;
  }
  if ((reg == 7)) {
    p.bgsc0 = v;
    return;
  }
  if ((reg == 8)) {
    p.bgsc1 = v;
    return;
  }
  if ((reg == 9)) {
    p.bgsc2 = v;
    return;
  }
  if ((reg == 10)) {
    p.bgsc3 = v;
    return;
  }
  if ((reg == 11)) {
    p.bg12nba = v;
    return;
  }
  if ((reg == 12)) {
    p.bg34nba = v;
    return;
  }
  if (((reg >= 13) && (reg <= 20))) {
    const idx = __ovf(__idiv(__ovf((reg - 13), -9223372036854775808, 9223372036854775807), 2), -9223372036854775808, 9223372036854775807);
    const isV = (((__ovf((reg - 13), -9223372036854775808, 9223372036854775807) & 1) >>> 0) == 1);
    if (isV) {
      __idxSet(p.bgvofs, idx, ((((Math.trunc(v * 2 ** (__sh(8, 64))) | p.scrollLatch) >>> 0) & 1023) >>> 0));
    } else {
      __idxSet(p.bghofs, idx, ((((((Math.trunc(v * 2 ** (__sh(8, 64))) | ((p.scrollLatch & 248) >>> 0)) >>> 0) | ((p.scrollHi & 7) >>> 0)) >>> 0) & 1023) >>> 0));
      p.scrollHi = v;
    }
    if ((reg == 13)) {
      p.m7hofs = m7Ext13(((((Math.trunc(v * 2 ** (__sh(8, 64))) | p.m7Latch) >>> 0) & 8191) >>> 0));
      p.m7Latch = v;
    }
    if ((reg == 14)) {
      p.m7vofs = m7Ext13(((((Math.trunc(v * 2 ** (__sh(8, 64))) | p.m7Latch) >>> 0) & 8191) >>> 0));
      p.m7Latch = v;
    }
    p.scrollLatch = v;
    return;
  }
  if ((reg == 21)) {
    p.vmain = v;
    return;
  }
  if ((reg == 22)) {
    p.vmaddr = ((((p.vmaddr & 32512) >>> 0) | v) >>> 0);
    return;
  }
  if ((reg == 23)) {
    p.vmaddr = ((Math.trunc(((v & 127) >>> 0) * 2 ** (__sh(8, 64))) | ((p.vmaddr & 255) >>> 0)) >>> 0);
    return;
  }
  if ((reg == 24)) {
    const a = ((__ovf((p.vmaddr * 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    __idxSet(p.vram, a, (v & 0xFF));
    if ((((p.vmain & 128) >>> 0) == 0)) {
      p.vmaddr = ((__ovf((p.vmaddr + vramStep(p)), -9223372036854775808, 9223372036854775807) & 32767) >>> 0);
    }
    return;
  }
  if ((reg == 25)) {
    const a = ((__ovf((__ovf((p.vmaddr * 2), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    __idxSet(p.vram, a, (v & 0xFF));
    if ((((p.vmain & 128) >>> 0) != 0)) {
      p.vmaddr = ((__ovf((p.vmaddr + vramStep(p)), -9223372036854775808, 9223372036854775807) & 32767) >>> 0);
    }
    return;
  }
  if ((reg == 33)) {
    p.cgaddr = v;
    p.cgHi = false;
    return;
  }
  if ((reg == 34)) {
    if ((!p.cgHi)) {
      p.cgLatch = v;
      p.cgHi = true;
    } else {
      const a = ((__ovf((p.cgaddr * 2), -9223372036854775808, 9223372036854775807) & 511) >>> 0);
      __idxSet(p.cgram, a, (p.cgLatch & 0xFF));
      __idxSet(p.cgram, ((__ovf((a + 1), -9223372036854775808, 9223372036854775807) & 511) >>> 0), (v & 0xFF));
      p.cgaddr = ((__ovf((p.cgaddr + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
      p.cgHi = false;
    }
    return;
  }
  if ((reg == 26)) {
    p.m7sel = v;
    return;
  }
  if ((reg == 27)) {
    p.m7a = m7Ext16(((Math.trunc(v * 2 ** (__sh(8, 64))) | p.m7Latch) >>> 0));
    p.m7Latch = v;
    return;
  }
  if ((reg == 28)) {
    p.m7b = m7Ext16(((Math.trunc(v * 2 ** (__sh(8, 64))) | p.m7Latch) >>> 0));
    p.m7Latch = v;
    return;
  }
  if ((reg == 29)) {
    p.m7c = m7Ext16(((Math.trunc(v * 2 ** (__sh(8, 64))) | p.m7Latch) >>> 0));
    p.m7Latch = v;
    return;
  }
  if ((reg == 30)) {
    p.m7d = m7Ext16(((Math.trunc(v * 2 ** (__sh(8, 64))) | p.m7Latch) >>> 0));
    p.m7Latch = v;
    return;
  }
  if ((reg == 31)) {
    p.m7x = m7Ext13(((((Math.trunc(v * 2 ** (__sh(8, 64))) | p.m7Latch) >>> 0) & 8191) >>> 0));
    p.m7Latch = v;
    return;
  }
  if ((reg == 32)) {
    p.m7y = m7Ext13(((((Math.trunc(v * 2 ** (__sh(8, 64))) | p.m7Latch) >>> 0) & 8191) >>> 0));
    p.m7Latch = v;
    return;
  }
  if ((reg == 35)) {
    p.w12sel = v;
    return;
  }
  if ((reg == 36)) {
    p.w34sel = v;
    return;
  }
  if ((reg == 38)) {
    p.wh0 = v;
    return;
  }
  if ((reg == 39)) {
    p.wh1 = v;
    return;
  }
  if ((reg == 40)) {
    p.wh2 = v;
    return;
  }
  if ((reg == 41)) {
    p.wh3 = v;
    return;
  }
  if ((reg == 42)) {
    p.wbglog = v;
    return;
  }
  if ((reg == 44)) {
    p.tm = v;
    return;
  }
  if ((reg == 45)) {
    p.ts = v;
    return;
  }
  if ((reg == 46)) {
    p.tmw = v;
    return;
  }
  if ((reg == 47)) {
    p.tsw = v;
    return;
  }
  if ((reg == 49)) {
    p.cgadsub = v;
    return;
  }
  if ((reg == 50)) {
    const inten = ((v & 31) >>> 0);
    if ((((v & 32) >>> 0) != 0)) {
      p.coldR = inten;
    }
    if ((((v & 64) >>> 0) != 0)) {
      p.coldG = inten;
    }
    if ((((v & 128) >>> 0) != 0)) {
      p.coldB = inten;
    }
    return;
  }
}

function ppuRegRead(p, reg) {
  if ((reg == 56)) {
    const a = ((__ovf((p.oamaddr * 2), -9223372036854775808, 9223372036854775807) & 1023) >>> 0);
    const r = Math.trunc(__idx(p.oam, a));
    p.oamaddr = ((__ovf((p.oamaddr + 1), -9223372036854775808, 9223372036854775807) & 511) >>> 0);
    return r;
  }
  if ((reg == 57)) {
    const a = ((__ovf((p.vmaddr * 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    return Math.trunc(__idx(p.vram, a));
  }
  if ((reg == 58)) {
    const a = ((__ovf((__ovf((p.vmaddr * 2), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    return Math.trunc(__idx(p.vram, a));
  }
  if ((reg == 59)) {
    const a = ((__ovf((p.cgaddr * 2), -9223372036854775808, 9223372036854775807) & 511) >>> 0);
    const r = Math.trunc(__idx(p.cgram, a));
    p.cgaddr = ((__ovf((p.cgaddr + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
    return r;
  }
  return 0;
}

function ppuRegReadPure(p, reg) {
  if ((reg == 56)) {
    return Math.trunc(__idx(p.oam, ((__ovf((p.oamaddr * 2), -9223372036854775808, 9223372036854775807) & 1023) >>> 0)));
  }
  if ((reg == 57)) {
    return Math.trunc(__idx(p.vram, ((__ovf((p.vmaddr * 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
  }
  if ((reg == 58)) {
    return Math.trunc(__idx(p.vram, ((__ovf((__ovf((p.vmaddr * 2), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
  }
  if ((reg == 59)) {
    return Math.trunc(__idx(p.cgram, ((__ovf((p.cgaddr * 2), -9223372036854775808, 9223372036854775807) & 511) >>> 0)));
  }
  return 0;
}

function m7Ext16(v) {
  const x = ((v & 65535) >>> 0);
  return (() => {
  if ((x >= 32768)) {
    return __ovf((x - 65536), -9223372036854775808, 9223372036854775807);
  } else {
    return x;
  }
  })();
}

function m7Ext13(v) {
  const x = ((v & 8191) >>> 0);
  return (() => {
  if ((x >= 4096)) {
    return __ovf((x - 8192), -9223372036854775808, 9223372036854775807);
  } else {
    return x;
  }
  })();
}

function vramWord(p, waddr) {
  const b = ((__ovf((waddr * 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  return ((Math.trunc(__idx(p.vram, b)) | Math.trunc(Math.trunc(__idx(p.vram, ((__ovf((b + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0))) * 2 ** (__sh(8, 64)))) >>> 0);
}

function tile4bpp(p, charBase, tileNum, px, py) {
  const tb = ((__ovf((__ovf((charBase + __ovf((tileNum * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) * 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  const r0 = ((__ovf((tb + __ovf((py * 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  const p0 = Math.trunc(__idx(p.vram, r0));
  const p1 = Math.trunc(__idx(p.vram, ((__ovf((r0 + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
  const p2 = Math.trunc(__idx(p.vram, ((__ovf((r0 + 16), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
  const p3 = Math.trunc(__idx(p.vram, ((__ovf((r0 + 17), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
  const bit = __ovf((7 - px), -9223372036854775808, 9223372036854775807);
  return ((((((((Math.floor(p0 / 2 ** (__sh(bit, 64))) & 1) >>> 0) | Math.trunc(((Math.floor(p1 / 2 ** (__sh(bit, 64))) & 1) >>> 0) * 2 ** (__sh(1, 64)))) >>> 0) | Math.trunc(((Math.floor(p2 / 2 ** (__sh(bit, 64))) & 1) >>> 0) * 2 ** (__sh(2, 64)))) >>> 0) | Math.trunc(((Math.floor(p3 / 2 ** (__sh(bit, 64))) & 1) >>> 0) * 2 ** (__sh(3, 64)))) >>> 0);
}

function tile8bpp(p, charBase, tileNum, px, py) {
  const tb = ((__ovf((__ovf((charBase + __ovf((tileNum * 32), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) * 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  const r0 = ((__ovf((tb + __ovf((py * 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  const bit = __ovf((7 - px), -9223372036854775808, 9223372036854775807);
  let ci = 0;
  let plane = 0;
  while ((plane < 4)) {
    const a = ((__ovf((r0 + __ovf((plane * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    const lo = Math.trunc(__idx(p.vram, a));
    const hi = Math.trunc(__idx(p.vram, ((__ovf((a + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
    ci = ((((ci | Math.trunc(((Math.floor(lo / 2 ** (__sh(bit, 64))) & 1) >>> 0) * 2 ** (__sh(__ovf((plane * 2), -9223372036854775808, 9223372036854775807), 64)))) >>> 0) | Math.trunc(((Math.floor(hi / 2 ** (__sh(bit, 64))) & 1) >>> 0) * 2 ** (__sh(__ovf((__ovf((plane * 2), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807), 64)))) >>> 0);
    plane = __ovf((plane + 1), -9223372036854775808, 9223372036854775807);
  }
  return ci;
}

function lineBrightAt(p, y, deflt) {
  if (p.hdmaOn) {
    return __idx(p.lineBright, y);
  }
  return deflt;
}

function windowMasked(p, layerIdx, screenDisable, x, y) {
  if ((((screenDisable & Math.trunc(1 * 2 ** (__sh(layerIdx, 64)))) >>> 0) == 0)) {
    return false;
  }
  const sel = (() => {
  if ((layerIdx < 2)) {
    return p.w12sel;
  } else {
    return p.w34sel;
  }
  })();
  const shift = __ovf((((layerIdx & 1) >>> 0) * 4), -9223372036854775808, 9223372036854775807);
  const w1en = (((Math.floor(sel / 2 ** (__sh(shift, 64))) & 1) >>> 0) != 0);
  const w1inv = (((Math.floor(sel / 2 ** (__sh(__ovf((shift + 1), -9223372036854775808, 9223372036854775807), 64))) & 1) >>> 0) != 0);
  const w2en = (((Math.floor(sel / 2 ** (__sh(__ovf((shift + 2), -9223372036854775808, 9223372036854775807), 64))) & 1) >>> 0) != 0);
  const w2inv = (((Math.floor(sel / 2 ** (__sh(__ovf((shift + 3), -9223372036854775808, 9223372036854775807), 64))) & 1) >>> 0) != 0);
  if (((!w1en) && (!w2en))) {
    return false;
  }
  const lo1 = (() => {
  if (p.hdmaOn) {
    return __idx(p.lineWH0, y);
  } else {
    return p.wh0;
  }
  })();
  const hi1 = (() => {
  if (p.hdmaOn) {
    return __idx(p.lineWH1, y);
  } else {
    return p.wh1;
  }
  })();
  let in1 = ((x >= lo1) && (x <= hi1));
  if (w1inv) {
    in1 = (!in1);
  }
  let in2 = ((x >= p.wh2) && (x <= p.wh3));
  if (w2inv) {
    in2 = (!in2);
  }
  if ((w1en && w2en)) {
    const logic = ((Math.floor(p.wbglog / 2 ** (__sh(__ovf((layerIdx * 2), -9223372036854775808, 9223372036854775807), 64))) & 3) >>> 0);
    if ((logic == 1)) {
      return (in1 && in2);
    }
    if ((logic == 2)) {
      return (in1 != in2);
    }
    if ((logic == 3)) {
      return (in1 == in2);
    }
    return (in1 || in2);
  }
  if (w1en) {
    return in1;
  }
  return in2;
}

function cgToRgb(p, idx, bright) {
  const a = ((__ovf((idx * 2), -9223372036854775808, 9223372036854775807) & 511) >>> 0);
  const w = ((Math.trunc(__idx(p.cgram, a)) | Math.trunc(Math.trunc(__idx(p.cgram, ((__ovf((a + 1), -9223372036854775808, 9223372036854775807) & 511) >>> 0))) * 2 ** (__sh(8, 64)))) >>> 0);
  let r = Math.trunc(((w & 31) >>> 0) * 2 ** (__sh(3, 64)));
  let g = Math.trunc(((Math.floor(w / 2 ** (__sh(5, 64))) & 31) >>> 0) * 2 ** (__sh(3, 64)));
  let b = Math.trunc(((Math.floor(w / 2 ** (__sh(10, 64))) & 31) >>> 0) * 2 ** (__sh(3, 64)));
  r = __ovf(__idiv(__ovf((r * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807);
  g = __ovf(__idiv(__ovf((g * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807);
  b = __ovf(__idiv(__ovf((b * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807);
  return ((((Math.trunc(r * 2 ** (__sh(16, 64))) | Math.trunc(g * 2 ** (__sh(8, 64)))) >>> 0) | b) >>> 0);
}

function renderSprites(p, fb, bright, wantPrio) {
  const objBase = Math.trunc(((p.obsel & 7) >>> 0) * 2 ** (__sh(13, 64)));
  let s = 127;
  while ((s >= 0)) {
    const oa = __ovf((s * 4), -9223372036854775808, 9223372036854775807);
    const xl = Math.trunc(__idx(p.oam, oa));
    const y = Math.trunc(__idx(p.oam, __ovf((oa + 1), -9223372036854775808, 9223372036854775807)));
    const tileL = Math.trunc(__idx(p.oam, __ovf((oa + 2), -9223372036854775808, 9223372036854775807)));
    const attr = Math.trunc(__idx(p.oam, __ovf((oa + 3), -9223372036854775808, 9223372036854775807)));
    if (((wantPrio >= 0) && (((Math.floor(attr / 2 ** (__sh(4, 64))) & 3) >>> 0) != wantPrio))) {
      s = __ovf((s - 1), -9223372036854775808, 9223372036854775807);
      continue;
    }
    const ht = Math.trunc(__idx(p.oam, __ovf((512 + Math.floor(s / 2 ** (__sh(2, 64)))), -9223372036854775808, 9223372036854775807)));
    const shift = __ovf((((s & 3) >>> 0) * 2), -9223372036854775808, 9223372036854775807);
    const xhi = ((Math.floor(ht / 2 ** (__sh(shift, 64))) & 1) >>> 0);
    const large = ((Math.floor(ht / 2 ** (__sh(__ovf((shift + 1), -9223372036854775808, 9223372036854775807), 64))) & 1) >>> 0);
    let sx = ((xl | Math.trunc(xhi * 2 ** (__sh(8, 64)))) >>> 0);
    if ((sx >= 256)) {
      sx = __ovf((sx - 512), -9223372036854775808, 9223372036854775807);
    }
    const dim = (() => {
    if ((large != 0)) {
      return 16;
    } else {
      return 8;
    }
    })();
    const pal = ((Math.floor(attr / 2 ** (__sh(1, 64))) & 7) >>> 0);
    const hflip = ((Math.floor(attr / 2 ** (__sh(6, 64))) & 1) >>> 0);
    const vflip = ((Math.floor(attr / 2 ** (__sh(7, 64))) & 1) >>> 0);
    const tileNum = ((tileL | Math.trunc(((attr & 1) >>> 0) * 2 ** (__sh(8, 64)))) >>> 0);
    let oy = 0;
    while ((oy < dim)) {
      const scrY = __ovf((y + oy), -9223372036854775808, 9223372036854775807);
      if (((scrY >= 0) && (scrY < 224))) {
        let ox = 0;
        while ((ox < dim)) {
          const scrX = __ovf((sx + ox), -9223372036854775808, 9223372036854775807);
          if (((scrX >= 0) && (scrX < 256))) {
            let tx = ox;
            let ty = oy;
            if ((hflip != 0)) {
              tx = __ovf((__ovf((dim - 1), -9223372036854775808, 9223372036854775807) - ox), -9223372036854775808, 9223372036854775807);
            }
            if ((vflip != 0)) {
              ty = __ovf((__ovf((dim - 1), -9223372036854775808, 9223372036854775807) - oy), -9223372036854775808, 9223372036854775807);
            }
            const t = __ovf((__ovf((tileNum + __ovf((Math.floor(ty / 2 ** (__sh(3, 64))) * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + Math.floor(tx / 2 ** (__sh(3, 64)))), -9223372036854775808, 9223372036854775807);
            const ci = tile4bpp(p, objBase, ((t & 511) >>> 0), ((tx & 7) >>> 0), ((ty & 7) >>> 0));
            if ((ci != 0)) {
              __idxSet(fb, __ovf((__ovf((scrY * 256), -9223372036854775808, 9223372036854775807) + scrX), -9223372036854775808, 9223372036854775807), cgToRgb(p, __ovf((__ovf((128 + __ovf((pal * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807), lineBrightAt(p, scrY, bright)));
            }
          }
          ox = __ovf((ox + 1), -9223372036854775808, 9223372036854775807);
        }
      }
      oy = __ovf((oy + 1), -9223372036854775808, 9223372036854775807);
    }
    s = __ovf((s - 1), -9223372036854775808, 9223372036854775807);
  }
}

function tile2bpp(p, charBase, tileNum, px, py) {
  const tb = ((__ovf((__ovf((charBase + __ovf((tileNum * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) * 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  const r0 = ((__ovf((tb + __ovf((py * 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  const p0 = Math.trunc(__idx(p.vram, r0));
  const p1 = Math.trunc(__idx(p.vram, ((__ovf((r0 + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
  const bit = __ovf((7 - px), -9223372036854775808, 9223372036854775807);
  return ((((Math.floor(p0 / 2 ** (__sh(bit, 64))) & 1) >>> 0) | Math.trunc(((Math.floor(p1 / 2 ** (__sh(bit, 64))) & 1) >>> 0) * 2 ** (__sh(1, 64)))) >>> 0);
}

function bgEntryAddr(tmBase, sc, tileX, tileY) {
  const nh = (() => {
  if ((((sc & 1) >>> 0) != 0)) {
    return 2;
  } else {
    return 1;
  }
  })();
  const sx = (() => {
  if ((tileX >= 32)) {
    return 1;
  } else {
    return 0;
  }
  })();
  const sy = (() => {
  if ((tileY >= 32)) {
    return 1;
  } else {
    return 0;
  }
  })();
  const quad = __ovf((sx + __ovf((sy * nh), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
  return __ovf((__ovf((__ovf((tmBase + __ovf((quad * 1024), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + __ovf((((tileY & 31) >>> 0) * 32), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ((tileX & 31) >>> 0)), -9223372036854775808, 9223372036854775807);
}

function renderBGLayer(p, fb, bright, sc, chBase, hofs, vofs, bpp, palBase, layerIdx, screenDisable, wantPrio, cgMain) {
  const cgMode = (() => {
  if ((cgMain && (((p.cgadsub & Math.trunc(1 * 2 ** (__sh(layerIdx, 64)))) >>> 0) != 0))) {
    return (() => {
    if ((((p.cgadsub & 128) >>> 0) != 0)) {
      return (() => {
      if ((((p.cgadsub & 64) >>> 0) != 0)) {
        return 4;
      } else {
        return 3;
      }
      })();
    } else {
      return (() => {
      if ((((p.cgadsub & 64) >>> 0) != 0)) {
        return 2;
      } else {
        return 1;
      }
      })();
    }
    })();
  } else {
    return 0;
  }
  })();
  const palW = (() => {
  if ((bpp == 4)) {
    return 16;
  } else {
    return 4;
  }
  })();
  const tmBase = Math.trunc(((sc & 252) >>> 0) * 2 ** (__sh(8, 64)));
  const big16 = (((Math.floor(p.bgmode / 2 ** (__sh(__ovf((4 + layerIdx), -9223372036854775808, 9223372036854775807), 64))) & 1) >>> 0) != 0);
  const tileShift = (() => {
  if (big16) {
    return 4;
  } else {
    return 3;
  }
  })();
  const maskX = (() => {
  if ((((sc & 1) >>> 0) != 0)) {
    return (() => {
    if (big16) {
      return 1023;
    } else {
      return 511;
    }
    })();
  } else {
    return (() => {
    if (big16) {
      return 511;
    } else {
      return 255;
    }
    })();
  }
  })();
  const maskY = (() => {
  if ((((sc & 2) >>> 0) != 0)) {
    return (() => {
    if (big16) {
      return 1023;
    } else {
      return 511;
    }
    })();
  } else {
    return (() => {
    if (big16) {
      return 511;
    } else {
      return 255;
    }
    })();
  }
  })();
  let y = 0;
  while ((y < 224)) {
    let x = 0;
    while ((x < 256)) {
      if (windowMasked(p, layerIdx, screenDisable, x, y)) {
        x = __ovf((x + 1), -9223372036854775808, 9223372036854775807);
        continue;
      }
      const ex = ((__ovf((x + hofs), -9223372036854775808, 9223372036854775807) & maskX) >>> 0);
      const ey = ((__ovf((y + vofs), -9223372036854775808, 9223372036854775807) & maskY) >>> 0);
      const entry = vramWord(p, bgEntryAddr(tmBase, sc, Math.floor(ex / 2 ** (__sh(tileShift, 64))), Math.floor(ey / 2 ** (__sh(tileShift, 64)))));
      if (((wantPrio >= 0) && (((Math.floor(entry / 2 ** (__sh(13, 64))) & 1) >>> 0) != wantPrio))) {
        x = __ovf((x + 1), -9223372036854775808, 9223372036854775807);
        continue;
      }
      const hflip = ((Math.floor(entry / 2 ** (__sh(14, 64))) & 1) >>> 0);
      const vflip = ((Math.floor(entry / 2 ** (__sh(15, 64))) & 1) >>> 0);
      let tileNum = ((entry & 1023) >>> 0);
      if (big16) {
        let sx8 = ((Math.floor(ex / 2 ** (__sh(3, 64))) & 1) >>> 0);
        let sy8 = ((Math.floor(ey / 2 ** (__sh(3, 64))) & 1) >>> 0);
        if ((hflip != 0)) {
          sx8 = __ovf((1 - sx8), -9223372036854775808, 9223372036854775807);
        }
        if ((vflip != 0)) {
          sy8 = __ovf((1 - sy8), -9223372036854775808, 9223372036854775807);
        }
        tileNum = ((__ovf((__ovf((tileNum + sx8), -9223372036854775808, 9223372036854775807) + __ovf((sy8 * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) & 1023) >>> 0);
      }
      const pal = ((Math.floor(entry / 2 ** (__sh(10, 64))) & 7) >>> 0);
      let px = ((ex & 7) >>> 0);
      let py = ((ey & 7) >>> 0);
      if ((hflip != 0)) {
        px = __ovf((7 - px), -9223372036854775808, 9223372036854775807);
      }
      if ((vflip != 0)) {
        py = __ovf((7 - py), -9223372036854775808, 9223372036854775807);
      }
      const ci = (() => {
      if ((bpp == 8)) {
        return tile8bpp(p, chBase, tileNum, px, py);
      } else {
        return (() => {
        if ((bpp == 4)) {
          return tile4bpp(p, chBase, tileNum, px, py);
        } else {
          return tile2bpp(p, chBase, tileNum, px, py);
        }
        })();
      }
      })();
      if ((ci != 0)) {
        const colorIdx = (() => {
        if ((bpp == 8)) {
          return ci;
        } else {
          return __ovf((__ovf((palBase + __ovf((pal * palW), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807);
        }
        })();
        const col = cgToRgb(p, colorIdx, lineBrightAt(p, y, bright));
        const fi = __ovf((__ovf((y * 256), -9223372036854775808, 9223372036854775807) + x), -9223372036854775808, 9223372036854775807);
        __idxSet(fb, fi, (() => {
        if ((cgMode == 0)) {
          return col;
        } else {
          return blendRgb(__idx(fb, fi), col, cgMode);
        }
        })());
      }
      x = __ovf((x + 1), -9223372036854775808, 9223372036854775807);
    }
    y = __ovf((y + 1), -9223372036854775808, 9223372036854775807);
  }
}

function renderMode7(p, fb, bright) {
  const ox = __ovf((p.m7hofs - p.m7x), -9223372036854775808, 9223372036854775807);
  const oy = __ovf((p.m7vofs - p.m7y), -9223372036854775808, 9223372036854775807);
  let sy = 0;
  while ((sy < 224)) {
    let sx = 0;
    while ((sx < 256)) {
      const dx = __ovf((ox + sx), -9223372036854775808, 9223372036854775807);
      const dy = __ovf((oy + sy), -9223372036854775808, 9223372036854775807);
      const vx = __ovf((Math.floor(__ovf((__ovf((p.m7a * dx), -9223372036854775808, 9223372036854775807) + __ovf((p.m7b * dy), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(8, 64))) + p.m7x), -9223372036854775808, 9223372036854775807);
      const vy = __ovf((Math.floor(__ovf((__ovf((p.m7c * dx), -9223372036854775808, 9223372036854775807) + __ovf((p.m7d * dy), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(8, 64))) + p.m7y), -9223372036854775808, 9223372036854775807);
      const px = ((vx & 1023) >>> 0);
      const py = ((vy & 1023) >>> 0);
      const tileX = Math.floor(px / 2 ** (__sh(3, 64)));
      const tileY = Math.floor(py / 2 ** (__sh(3, 64)));
      const mapN = __ovf((__ovf((tileY * 128), -9223372036854775808, 9223372036854775807) + tileX), -9223372036854775808, 9223372036854775807);
      const tile = Math.trunc(__idx(p.vram, ((__ovf((mapN * 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
      const gAddr = ((__ovf((__ovf((__ovf((__ovf((__ovf((tile * 64), -9223372036854775808, 9223372036854775807) + __ovf((((py & 7) >>> 0) * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ((px & 7) >>> 0)), -9223372036854775808, 9223372036854775807) * 2), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
      const ci = Math.trunc(__idx(p.vram, gAddr));
      if ((ci != 0)) {
        __idxSet(fb, __ovf((__ovf((sy * 256), -9223372036854775808, 9223372036854775807) + sx), -9223372036854775808, 9223372036854775807), cgToRgb(p, ci, lineBrightAt(p, sy, bright)));
      }
      sx = __ovf((sx + 1), -9223372036854775808, 9223372036854775807);
    }
    sy = __ovf((sy + 1), -9223372036854775808, 9223372036854775807);
  }
}

function renderScreenBGs(p, fb, bright, enable, screenDisable, cgMain) {
  const ch1 = Math.trunc(((p.bg12nba & 15) >>> 0) * 2 ** (__sh(12, 64)));
  const ch2 = Math.trunc(((Math.floor(p.bg12nba / 2 ** (__sh(4, 64))) & 15) >>> 0) * 2 ** (__sh(12, 64)));
  const ch3 = Math.trunc(((p.bg34nba & 15) >>> 0) * 2 ** (__sh(12, 64)));
  const ch4 = Math.trunc(((Math.floor(p.bg34nba / 2 ** (__sh(4, 64))) & 15) >>> 0) * 2 ** (__sh(12, 64)));
  const mode = ((p.bgmode & 7) >>> 0);
  const en1 = (((enable & 1) >>> 0) != 0);
  const en2 = (((enable & 2) >>> 0) != 0);
  const en3 = (((enable & 4) >>> 0) != 0);
  const en4 = (((enable & 8) >>> 0) != 0);
  if ((mode == 0)) {
    if (en4) {
      renderBGLayer(p, fb, bright, p.bgsc3, ch4, __idx(p.bghofs, 3), __idx(p.bgvofs, 3), 2, 96, 3, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
    }
    if (en3) {
      renderBGLayer(p, fb, bright, p.bgsc2, ch3, __idx(p.bghofs, 2), __idx(p.bgvofs, 2), 2, 64, 2, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
    }
    if (en2) {
      renderBGLayer(p, fb, bright, p.bgsc1, ch2, __idx(p.bghofs, 1), __idx(p.bgvofs, 1), 2, 32, 1, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
    }
    if (en1) {
      renderBGLayer(p, fb, bright, p.bgsc0, ch1, __idx(p.bghofs, 0), __idx(p.bgvofs, 0), 2, 0, 0, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
    }
  } else {
    if ((mode == 7)) {
      if (en1) {
        renderMode7(p, fb, bright);
      }
    } else {
      if ((mode == 3)) {
        if (en2) {
          renderBGLayer(p, fb, bright, p.bgsc1, ch2, __idx(p.bghofs, 1), __idx(p.bgvofs, 1), 4, 0, 1, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
        }
        if (en1) {
          renderBGLayer(p, fb, bright, p.bgsc0, ch1, __idx(p.bghofs, 0), __idx(p.bgvofs, 0), 8, 0, 0, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
        }
      } else {
        if (en3) {
          renderBGLayer(p, fb, bright, p.bgsc2, ch3, __idx(p.bghofs, 2), __idx(p.bgvofs, 2), 2, 0, 2, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
        }
        if (en2) {
          renderBGLayer(p, fb, bright, p.bgsc1, ch2, __idx(p.bghofs, 1), __idx(p.bgvofs, 1), 4, 0, 1, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
        }
        if (en1) {
          renderBGLayer(p, fb, bright, p.bgsc0, ch1, __idx(p.bghofs, 0), __idx(p.bgvofs, 0), 4, 0, 0, screenDisable, __ovf((-1), -9223372036854775808, 9223372036854775807), cgMain);
        }
      }
    }
  }
}

function clamp5(v) {
  if ((v < 0)) {
    return 0;
  }
  if ((v > 31)) {
    return 31;
  }
  return v;
}

function clamp8(v) {
  if ((v < 0)) {
    return 0;
  }
  if ((v > 255)) {
    return 255;
  }
  return v;
}

function blendRgb(sub, main, cgMode) {
  const sr = ((Math.floor(sub / 2 ** (__sh(16, 64))) & 255) >>> 0);
  const sg = ((Math.floor(sub / 2 ** (__sh(8, 64))) & 255) >>> 0);
  const sb = ((sub & 255) >>> 0);
  const mr = ((Math.floor(main / 2 ** (__sh(16, 64))) & 255) >>> 0);
  const mg = ((Math.floor(main / 2 ** (__sh(8, 64))) & 255) >>> 0);
  const mb = ((main & 255) >>> 0);
  let r = __ovf((mr + sr), -9223372036854775808, 9223372036854775807);
  let g = __ovf((mg + sg), -9223372036854775808, 9223372036854775807);
  let b = __ovf((mb + sb), -9223372036854775808, 9223372036854775807);
  if (((cgMode == 3) || (cgMode == 4))) {
    r = __ovf((mr - sr), -9223372036854775808, 9223372036854775807);
    g = __ovf((mg - sg), -9223372036854775808, 9223372036854775807);
    b = __ovf((mb - sb), -9223372036854775808, 9223372036854775807);
  }
  if (((cgMode == 2) || (cgMode == 4))) {
    r = __ovf(__idiv(r, 2), -9223372036854775808, 9223372036854775807);
    g = __ovf(__idiv(g, 2), -9223372036854775808, 9223372036854775807);
    b = __ovf(__idiv(b, 2), -9223372036854775808, 9223372036854775807);
  }
  return ((((Math.trunc(clamp8(r) * 2 ** (__sh(16, 64))) | Math.trunc(clamp8(g) * 2 ** (__sh(8, 64)))) >>> 0) | clamp8(b)) >>> 0);
}

function backdropColor(p, bright) {
  const w = ((Math.trunc(__idx(p.cgram, 0)) | Math.trunc(Math.trunc(__idx(p.cgram, 1)) * 2 ** (__sh(8, 64)))) >>> 0);
  let r = ((w & 31) >>> 0);
  let g = ((Math.floor(w / 2 ** (__sh(5, 64))) & 31) >>> 0);
  let b = ((Math.floor(w / 2 ** (__sh(10, 64))) & 31) >>> 0);
  if (((((p.cgadsub & 32) >>> 0) != 0) && (((p.cgadsub & 128) >>> 0) == 0))) {
    r = clamp5(__ovf((r + p.coldR), -9223372036854775808, 9223372036854775807));
    g = clamp5(__ovf((g + p.coldG), -9223372036854775808, 9223372036854775807));
    b = clamp5(__ovf((b + p.coldB), -9223372036854775808, 9223372036854775807));
  }
  const rr = ((__ovf(__idiv(__ovf((Math.trunc(r * 2 ** (__sh(3, 64))) * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  const gg = ((__ovf(__idiv(__ovf((Math.trunc(g * 2 ** (__sh(3, 64))) * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  const bb = ((__ovf(__idiv(__ovf((Math.trunc(b * 2 ** (__sh(3, 64))) * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  return ((((Math.trunc(rr * 2 ** (__sh(16, 64))) | Math.trunc(gg * 2 ** (__sh(8, 64)))) >>> 0) | bb) >>> 0);
}

function backdropColorLine(p, y, deflt) {
  const bright = lineBrightAt(p, y, deflt);
  const w = ((Math.trunc(__idx(p.cgram, 0)) | Math.trunc(Math.trunc(__idx(p.cgram, 1)) * 2 ** (__sh(8, 64)))) >>> 0);
  let r = ((w & 31) >>> 0);
  let g = ((Math.floor(w / 2 ** (__sh(5, 64))) & 31) >>> 0);
  let b = ((Math.floor(w / 2 ** (__sh(10, 64))) & 31) >>> 0);
  if (((((p.cgadsub & 32) >>> 0) != 0) && (((p.cgadsub & 128) >>> 0) == 0))) {
    r = clamp5(__ovf((r + __idx(p.lineColdR, y)), -9223372036854775808, 9223372036854775807));
    g = clamp5(__ovf((g + __idx(p.lineColdG, y)), -9223372036854775808, 9223372036854775807));
    b = clamp5(__ovf((b + __idx(p.lineColdB, y)), -9223372036854775808, 9223372036854775807));
  }
  const rr = ((__ovf(__idiv(__ovf((Math.trunc(r * 2 ** (__sh(3, 64))) * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  const gg = ((__ovf(__idiv(__ovf((Math.trunc(g * 2 ** (__sh(3, 64))) * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  const bb = ((__ovf(__idiv(__ovf((Math.trunc(b * 2 ** (__sh(3, 64))) * bright), -9223372036854775808, 9223372036854775807), 15), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  return ((((Math.trunc(rr * 2 ** (__sh(16, 64))) | Math.trunc(gg * 2 ** (__sh(8, 64)))) >>> 0) | bb) >>> 0);
}

function renderMode1Main(p, fb, bright) {
  const ch1 = Math.trunc(((p.bg12nba & 15) >>> 0) * 2 ** (__sh(12, 64)));
  const ch2 = Math.trunc(((Math.floor(p.bg12nba / 2 ** (__sh(4, 64))) & 15) >>> 0) * 2 ** (__sh(12, 64)));
  const ch3 = Math.trunc(((p.bg34nba & 15) >>> 0) * 2 ** (__sh(12, 64)));
  const en1 = (((p.tm & 1) >>> 0) != 0);
  const en2 = (((p.tm & 2) >>> 0) != 0);
  const en3 = (((p.tm & 4) >>> 0) != 0);
  const enObj = (((p.tm & 16) >>> 0) != 0);
  const d = p.tmw;
  const bg3High = (((p.bgmode & 8) >>> 0) != 0);
  if ((en3 && (!bg3High))) {
    renderBGLayer(p, fb, bright, p.bgsc2, ch3, __idx(p.bghofs, 2), __idx(p.bgvofs, 2), 2, 0, 2, d, 0, false);
  }
  if (enObj) {
    renderSprites(p, fb, bright, 0);
  }
  if (en3) {
    if ((!bg3High)) {
      renderBGLayer(p, fb, bright, p.bgsc2, ch3, __idx(p.bghofs, 2), __idx(p.bgvofs, 2), 2, 0, 2, d, 1, false);
    } else {
      renderBGLayer(p, fb, bright, p.bgsc2, ch3, __idx(p.bghofs, 2), __idx(p.bgvofs, 2), 2, 0, 2, d, 0, false);
    }
  }
  if (enObj) {
    renderSprites(p, fb, bright, 1);
  }
  if (en2) {
    renderBGLayer(p, fb, bright, p.bgsc1, ch2, __idx(p.bghofs, 1), __idx(p.bgvofs, 1), 4, 0, 1, d, 0, false);
  }
  if (en1) {
    renderBGLayer(p, fb, bright, p.bgsc0, ch1, __idx(p.bghofs, 0), __idx(p.bgvofs, 0), 4, 0, 0, d, 0, false);
  }
  if (enObj) {
    renderSprites(p, fb, bright, 2);
  }
  if (en2) {
    renderBGLayer(p, fb, bright, p.bgsc1, ch2, __idx(p.bghofs, 1), __idx(p.bgvofs, 1), 4, 0, 1, d, 1, false);
  }
  if (en1) {
    renderBGLayer(p, fb, bright, p.bgsc0, ch1, __idx(p.bghofs, 0), __idx(p.bgvofs, 0), 4, 0, 0, d, 1, false);
  }
  if (enObj) {
    renderSprites(p, fb, bright, 3);
  }
  if ((en3 && bg3High)) {
    renderBGLayer(p, fb, bright, p.bgsc2, ch3, __idx(p.bghofs, 2), __idx(p.bgvofs, 2), 2, 0, 2, d, 1, false);
  }
}

function renderFrame(p, fb) {
  const bright = ((p.inidisp & 15) >>> 0);
  const forceBlank = ((((p.inidisp & 128) >>> 0) != 0) && (!p.hdmaOn));
  const constBackdrop = (() => {
  if (forceBlank) {
    return 0;
  } else {
    return backdropColor(p, bright);
  }
  })();
  let y = 0;
  while ((y < 224)) {
    const bd = (() => {
    if (((!forceBlank) && p.hdmaOn)) {
      return backdropColorLine(p, y, bright);
    } else {
      return constBackdrop;
    }
    })();
    let x = 0;
    while ((x < 256)) {
      __idxSet(fb, __ovf((__ovf((y * 256), -9223372036854775808, 9223372036854775807) + x), -9223372036854775808, 9223372036854775807), bd);
      x = __ovf((x + 1), -9223372036854775808, 9223372036854775807);
    }
    y = __ovf((y + 1), -9223372036854775808, 9223372036854775807);
  }
  if (forceBlank) {
    return;
  }
  if ((p.ts != 0)) {
    renderScreenBGs(p, fb, bright, p.ts, p.tsw, false);
  }
  if ((((p.bgmode & 7) >>> 0) == 1)) {
    renderMode1Main(p, fb, bright);
  } else {
    renderScreenBGs(p, fb, bright, p.tm, p.tmw, true);
    if ((((((p.tm | p.ts) >>> 0) & 16) >>> 0) != 0)) {
      renderSprites(p, fb, bright, __ovf((-1), -9223372036854775808, 9223372036854775807));
    }
  }
}

function ppuVram(p, a) {
  return Math.trunc(__idx(p.vram, ((a & 65535) >>> 0)));
}

function ppuCgram(p, a) {
  return Math.trunc(__idx(p.cgram, ((a & 511) >>> 0)));
}

function fxDbgStat(which) {
  if ((which == 0)) {
    return fxDbgStarts;
  }
  if ((which == 1)) {
    return fxDbgSteps;
  }
  if ((which == 2)) {
    return fxDbgStops;
  }
  return fxDbgPlots;
}

function fxRamNonzero(fx) {
  let count = 0;
  let i = 0;
  while ((i < fx.ram.length)) {
    if ((Math.trunc(__idx(fx.ram, i)) != 0)) {
      count = __ovf((count + 1), -9223372036854775808, 9223372036854775807);
    }
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return count;
}

function cloneBytes(src) {
  let v = [];
  let i = 0;
  while ((i < src.length)) {
    v.push(__idx(src, i));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function vecZerosFx(n) {
  let v = [];
  let i = 0;
  while ((i < n)) {
    v.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function fxNew(romClone) {
  const len = romClone.length;
  let mask = 1;
  while ((mask < len)) {
    mask = Math.trunc(mask * 2 ** (__sh(1, 64)));
  }
  mask = __ovf((mask - 1), -9223372036854775808, 9223372036854775807);
  let nrb = Math.floor(len / 2 ** (__sh(15, 64)));
  if ((nrb > 32)) {
    nrb = 32;
  }
  if ((nrb < 1)) {
    nrb = 1;
  }
  let reg = [];
  let i = 0;
  while ((i < 16)) {
    reg.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return new Fx(reg, 0, 0, 0, 0, false, false, false, false, false, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, false, 0, romClone, mask, nrb, vecZerosFx(131072), 131071, 2, vecZerosFx(512), 0, 128, 128);
}

function sex8(v) {
  const b = ((v & 255) >>> 0);
  if ((((b & 128) >>> 0) != 0)) {
    return __ovf((b - 256), -9223372036854775808, 9223372036854775807);
  }
  return b;
}

function sex16(v) {
  const b = ((v & 65535) >>> 0);
  if ((((b & 32768) >>> 0) != 0)) {
    return __ovf((b - 65536), -9223372036854775808, 9223372036854775807);
  }
  return b;
}

function ashr1(s) {
  return __ovf(__idiv(((s & (~1)) >>> 0), 2), -9223372036854775808, 9223372036854775807);
}

function gsuRomOffset(fx, bank, addr) {
  const b = ((bank & 127) >>> 0);
  let off = 0;
  if ((b >= 64)) {
    let bb = b;
    if ((fx.nRomBanks > 1)) {
      bb = __irem(b, fx.nRomBanks);
    } else {
      bb = ((b & 1) >>> 0);
    }
    off = __ovf((Math.trunc(bb * 2 ** (__sh(16, 64))) + ((addr & 65535) >>> 0)), -9223372036854775808, 9223372036854775807);
  } else {
    off = __ovf((Math.trunc(b * 2 ** (__sh(15, 64))) + ((addr & 32767) >>> 0)), -9223372036854775808, 9223372036854775807);
  }
  return ((off & fx.romMask) >>> 0);
}

function gsuRomByte(fx, bank, addr) {
  const o = gsuRomOffset(fx, bank, addr);
  if ((o < fx.rom.length)) {
    return Math.trunc(__idx(fx.rom, o));
  }
  return 0;
}

function prgByte(fx, addr) {
  const b = ((fx.pbr & 127) >>> 0);
  if (((b >= 112) && (b <= 115))) {
    const idx = __ovf((Math.trunc(__irem(((b & 3) >>> 0), fx.nRamBanks) * 2 ** (__sh(16, 64))) + ((addr & 65535) >>> 0)), -9223372036854775808, 9223372036854775807);
    return Math.trunc(__idx(fx.ram, ((idx & fx.ramMask) >>> 0)));
  }
  return gsuRomByte(fx, fx.pbr, addr);
}

function gsuRamIdx(fx, adr) {
  return ((__ovf((Math.trunc(__irem(fx.rambr, fx.nRamBanks) * 2 ** (__sh(16, 64))) + ((adr & 65535) >>> 0)), -9223372036854775808, 9223372036854775807) & fx.ramMask) >>> 0);
}

function ramRead(fx, adr) {
  return Math.trunc(__idx(fx.ram, gsuRamIdx(fx, adr)));
}

function ramWrite(fx, adr, v) {
  __idxSet(fx.ram, gsuRamIdx(fx, adr), (((v & 255) >>> 0) & 0xFF));
}

function fetchPipe(fx) {
  fx.pipe = prgByte(fx, ((__idx(fx.reg, 15) & 65535) >>> 0));
}

function r15inc(fx) {
  __idxSet(fx.reg, 15, ((__ovf((__idx(fx.reg, 15) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
}

function clrflags(fx) {
  fx.alt1 = false;
  fx.alt2 = false;
  fx.bflag = false;
  fx.sreg = 0;
  fx.dreg = 0;
}

function readR14(fx) {
  fx.romBuffer = gsuRomByte(fx, fx.rombr, ((__idx(fx.reg, 14) & 65535) >>> 0));
}

function setDreg(fx, v) {
  __idxSet(fx.reg, fx.dreg, ((v & 4294967295) >>> 0));
  if ((fx.dreg == 14)) {
    readR14(fx);
  }
}

function sregVal(fx) {
  return __idx(fx.reg, fx.sreg);
}

function fxUpdateScreen(fx) {
  let n = 0;
  if ((((fx.scmr & 4) >>> 0) != 0)) {
    n = ((n | 1) >>> 0);
  }
  if ((((fx.scmr & 32) >>> 0) != 0)) {
    n = ((n | 2) >>> 0);
  }
  if ((n == 0)) {
    fx.realHeight = 128;
  } else {
    if ((n == 1)) {
      fx.realHeight = 160;
    } else {
      if ((n == 2)) {
        fx.realHeight = 192;
      } else {
        fx.realHeight = 256;
      }
    }
  }
  fx.mode = ((fx.scmr & 3) >>> 0);
  if ((((fx.por & 16) >>> 0) != 0)) {
    fx.screenHeight = 256;
  } else {
    fx.screenHeight = fx.realHeight;
  }
}

function bytesPerTile(mode) {
  if ((mode == 0)) {
    return 16;
  }
  if ((mode == 3)) {
    return 64;
  }
  return 32;
}

function planeCount(mode) {
  if ((mode == 0)) {
    return 2;
  }
  if ((mode == 3)) {
    return 8;
  }
  return 4;
}

function plotAddr(fx, x, y) {
  const bpt = bytesPerTile(fx.mode);
  const tr = Math.floor(y / 2 ** (__sh(3, 64)));
  const tc = Math.floor(x / 2 ** (__sh(3, 64)));
  let colOff = 0;
  let rowOff = 0;
  if ((fx.screenHeight == 256)) {
    let shift = 0;
    if ((fx.mode == 1)) {
      shift = 1;
    } else {
      if ((fx.mode >= 2)) {
        shift = 2;
      }
    }
    rowOff = Math.trunc(__ovf((Math.trunc(((tr & 16) >>> 0) * 2 ** (__sh(9, 64))) + Math.trunc(((tr & 15) >>> 0) * 2 ** (__sh(8, 64)))), -9223372036854775808, 9223372036854775807) * 2 ** (__sh(shift, 64)));
    colOff = Math.trunc(__ovf((Math.trunc(((tc & 16) >>> 0) * 2 ** (__sh(8, 64))) + Math.trunc(((tc & 15) >>> 0) * 2 ** (__sh(4, 64)))), -9223372036854775808, 9223372036854775807) * 2 ** (__sh(shift, 64)));
  } else {
    const tilesPerCol = __ovf(__idiv(fx.screenHeight, 8), -9223372036854775808, 9223372036854775807);
    colOff = __ovf((__ovf((tc * tilesPerCol), -9223372036854775808, 9223372036854775807) * bpt), -9223372036854775808, 9223372036854775807);
    rowOff = __ovf((tr * bpt), -9223372036854775808, 9223372036854775807);
  }
  return __ovf((__ovf((__ovf((Math.trunc(fx.scbr * 2 ** (__sh(10, 64))) + colOff), -9223372036854775808, 9223372036854775807) + rowOff), -9223372036854775808, 9223372036854775807) + Math.trunc(((y & 7) >>> 0) * 2 ** (__sh(1, 64)))), -9223372036854775808, 9223372036854775807);
}

function fxPlot(fx) {
  const x = ((__idx(fx.reg, 1) & 255) >>> 0);
  const y = ((__idx(fx.reg, 2) & 255) >>> 0);
  r15inc(fx);
  clrflags(fx);
  __idxSet(fx.reg, 1, ((__ovf((__idx(fx.reg, 1) + 1), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  if ((y >= fx.screenHeight)) {
    return;
  }
  const planes = planeCount(fx.mode);
  const colr = ((fx.color & 255) >>> 0);
  if ((planes == 8)) {
    if ((((fx.por & 16) >>> 0) == 0)) {
      if (((((fx.por & 1) >>> 0) == 0) && ((colr == 0) || ((((fx.por & 8) >>> 0) != 0) && (((colr & 15) >>> 0) == 0))))) {
        return;
      }
    } else {
      if (((((fx.por & 1) >>> 0) == 0) && (colr == 0))) {
        return;
      }
    }
  } else {
    if (((((fx.por & 1) >>> 0) == 0) && (((colr & 15) >>> 0) == 0))) {
      return;
    }
  }
  let c = colr;
  if (((planes != 8) && (((fx.por & 2) >>> 0) != 0))) {
    if ((((((x ^ y) >>> 0) & 1) >>> 0) != 0)) {
      c = ((Math.floor(fx.color / 2 ** (__sh(4, 64))) & 255) >>> 0);
    } else {
      c = ((fx.color & 255) >>> 0);
    }
  }
  fxDbgPlots = __ovf((fxDbgPlots + 1), -9223372036854775808, 9223372036854775807);
  const base = plotAddr(fx, x, y);
  const bit = Math.floor(128 / 2 ** (__sh(((x & 7) >>> 0), 64)));
  let p = 0;
  while ((p < planes)) {
    const idx = ((__ovf((__ovf((base + __ovf((16 * Math.floor(p / 2 ** (__sh(1, 64)))), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ((p & 1) >>> 0)), -9223372036854775808, 9223372036854775807) & fx.ramMask) >>> 0);
    if ((((c & Math.trunc(1 * 2 ** (__sh(p, 64)))) >>> 0) != 0)) {
      __idxSet(fx.ram, idx, (((Math.trunc(__idx(fx.ram, idx)) | bit) >>> 0) & 0xFF));
    } else {
      __idxSet(fx.ram, idx, (((Math.trunc(__idx(fx.ram, idx)) & (~bit)) >>> 0) & 0xFF));
    }
    p = __ovf((p + 1), -9223372036854775808, 9223372036854775807);
  }
}

function fxRpix(fx) {
  const x = ((__idx(fx.reg, 1) & 255) >>> 0);
  const y = ((__idx(fx.reg, 2) & 255) >>> 0);
  r15inc(fx);
  if ((y >= fx.screenHeight)) {
    setDreg(fx, 0);
    clrflags(fx);
    return;
  }
  const planes = planeCount(fx.mode);
  const base = plotAddr(fx, x, y);
  const bit = Math.floor(128 / 2 ** (__sh(((x & 7) >>> 0), 64)));
  let v = 0;
  let p = 0;
  while ((p < planes)) {
    const idx = ((__ovf((__ovf((base + __ovf((16 * Math.floor(p / 2 ** (__sh(1, 64)))), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ((p & 1) >>> 0)), -9223372036854775808, 9223372036854775807) & fx.ramMask) >>> 0);
    if ((((Math.trunc(__idx(fx.ram, idx)) & bit) >>> 0) != 0)) {
      v = ((v | Math.trunc(1 * 2 ** (__sh(p, 64)))) >>> 0);
    }
    p = __ovf((p + 1), -9223372036854775808, 9223372036854775807);
  }
  setDreg(fx, v);
  fx.vZero = v;
  clrflags(fx);
}

function fxStop(fx) {
  fx.running = false;
  fxDbgStops = __ovf((fxDbgStops + 1), -9223372036854775808, 9223372036854775807);
  if ((((fx.cfgr & 128) >>> 0) == 0)) {
    fx.irqPending = true;
  }
  fx.por = 0;
  fx.pipe = 1;
  clrflags(fx);
  r15inc(fx);
}

function fxCache(fx) {
  const c = ((__idx(fx.reg, 15) & 65520) >>> 0);
  if (((fx.cbr != c) || (!fx.cacheActive))) {
    fx.cacheActive = true;
    fx.cbr = c;
  }
  clrflags(fx);
  r15inc(fx);
}

function fxBranch(fx, take) {
  const v = fx.pipe;
  r15inc(fx);
  fetchPipe(fx);
  if (take) {
    __idxSet(fx.reg, 15, ((__ovf((__idx(fx.reg, 15) + sex8(v)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  } else {
    r15inc(fx);
  }
}

function testS(fx) {
  return (((fx.vSign & 32768) >>> 0) != 0);
}

function testZ(fx) {
  return (((fx.vZero & 65535) >>> 0) == 0);
}

function testOV(fx) {
  return ((fx.vOverflow >= 32768) || (fx.vOverflow < __ovf((-32768), -9223372036854775808, 9223372036854775807)));
}

function testCY(fx) {
  return (((fx.vCarry & 1) >>> 0) != 0);
}

function fxStepOne(fx) {
  const op = fx.pipe;
  fetchPipe(fx);
  let alt = 0;
  if (fx.alt1) {
    alt = ((alt | 1) >>> 0);
  }
  if (fx.alt2) {
    alt = ((alt | 2) >>> 0);
  }
  if ((op < 16)) {
    if ((op == 0)) {
      fxStop(fx);
    } else {
      if ((op == 1)) {
        clrflags(fx);
        r15inc(fx);
      } else {
        if ((op == 2)) {
          fxCache(fx);
        } else {
          if ((op == 3)) {
            const s = sregVal(fx);
            fx.vCarry = ((s & 1) >>> 0);
            const v = Math.floor(((s & 65535) >>> 0) / 2 ** (__sh(1, 64)));
            r15inc(fx);
            setDreg(fx, v);
            fx.vSign = v;
            fx.vZero = v;
            clrflags(fx);
          } else {
            if ((op == 4)) {
              const s = sregVal(fx);
              const v = ((__ovf((Math.trunc(s * 2 ** (__sh(1, 64))) + fx.vCarry), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
              fx.vCarry = ((Math.floor(s / 2 ** (__sh(15, 64))) & 1) >>> 0);
              r15inc(fx);
              setDreg(fx, v);
              fx.vSign = v;
              fx.vZero = v;
              clrflags(fx);
            } else {
              if ((op == 5)) {
                fxBranch(fx, true);
              } else {
                if ((op == 6)) {
                  fxBranch(fx, (testS(fx) == testOV(fx)));
                } else {
                  if ((op == 7)) {
                    fxBranch(fx, (testS(fx) != testOV(fx)));
                  } else {
                    if ((op == 8)) {
                      fxBranch(fx, (!testZ(fx)));
                    } else {
                      if ((op == 9)) {
                        fxBranch(fx, testZ(fx));
                      } else {
                        if ((op == 10)) {
                          fxBranch(fx, (!testS(fx)));
                        } else {
                          if ((op == 11)) {
                            fxBranch(fx, testS(fx));
                          } else {
                            if ((op == 12)) {
                              fxBranch(fx, (!testCY(fx)));
                            } else {
                              if ((op == 13)) {
                                fxBranch(fx, testCY(fx));
                              } else {
                                if ((op == 14)) {
                                  fxBranch(fx, (!testOV(fx)));
                                } else {
                                  fxBranch(fx, testOV(fx));
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return;
  }
  if ((op < 32)) {
    const n = ((op & 15) >>> 0);
    if (fx.bflag) {
      __idxSet(fx.reg, n, ((sregVal(fx) & 4294967295) >>> 0));
      clrflags(fx);
      if ((n == 14)) {
        readR14(fx);
      }
      if ((n != 15)) {
        r15inc(fx);
      }
    } else {
      fx.dreg = n;
      r15inc(fx);
    }
    return;
  }
  if ((op < 48)) {
    const n = ((op & 15) >>> 0);
    fx.bflag = true;
    fx.sreg = n;
    fx.dreg = n;
    r15inc(fx);
    return;
  }
  if ((op < 64)) {
    if ((op <= 59)) {
      const n = ((op & 15) >>> 0);
      const adr = __idx(fx.reg, n);
      fx.lastRamAdr = adr;
      ramWrite(fx, adr, sregVal(fx));
      if (((alt != 1) && (alt != 3))) {
        ramWrite(fx, ((adr ^ 1) >>> 0), Math.floor(sregVal(fx) / 2 ** (__sh(8, 64))));
      }
      clrflags(fx);
      r15inc(fx);
    } else {
      if ((op == 60)) {
        __idxSet(fx.reg, 12, ((__ovf((__idx(fx.reg, 12) - 1), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
        fx.vSign = __idx(fx.reg, 12);
        fx.vZero = __idx(fx.reg, 12);
        if ((((__idx(fx.reg, 12) & 65535) >>> 0) != 0)) {
          __idxSet(fx.reg, 15, ((__idx(fx.reg, 13) & 65535) >>> 0));
        } else {
          r15inc(fx);
        }
        clrflags(fx);
      } else {
        if ((op == 61)) {
          fx.alt1 = true;
          fx.bflag = false;
          r15inc(fx);
        } else {
          if ((op == 62)) {
            fx.alt2 = true;
            fx.bflag = false;
            r15inc(fx);
          } else {
            fx.alt1 = true;
            fx.alt2 = true;
            fx.bflag = false;
            r15inc(fx);
          }
        }
      }
    }
    return;
  }
  if ((op < 80)) {
    if ((op <= 75)) {
      const n = ((op & 15) >>> 0);
      const adr = __idx(fx.reg, n);
      fx.lastRamAdr = adr;
      let v = ramRead(fx, adr);
      if (((alt != 1) && (alt != 3))) {
        v = ((v | Math.trunc(ramRead(fx, ((adr ^ 1) >>> 0)) * 2 ** (__sh(8, 64)))) >>> 0);
      }
      r15inc(fx);
      setDreg(fx, v);
      clrflags(fx);
    } else {
      if ((op == 76)) {
        if (((alt == 1) || (alt == 3))) {
          fxRpix(fx);
        } else {
          fxPlot(fx);
        }
      } else {
        if ((op == 77)) {
          const s = sregVal(fx);
          const v = ((Math.trunc(((s & 255) >>> 0) * 2 ** (__sh(8, 64))) | ((Math.floor(s / 2 ** (__sh(8, 64))) & 255) >>> 0)) >>> 0);
          r15inc(fx);
          setDreg(fx, v);
          fx.vSign = v;
          fx.vZero = v;
          clrflags(fx);
        } else {
          if ((op == 78)) {
            if (((alt == 1) || (alt == 3))) {
              fx.por = ((sregVal(fx) & 255) >>> 0);
              fxUpdateScreen(fx);
            } else {
              let c = ((sregVal(fx) & 255) >>> 0);
              if ((((fx.por & 4) >>> 0) != 0)) {
                c = ((((c & 240) >>> 0) | ((Math.floor(c / 2 ** (__sh(4, 64))) & 15) >>> 0)) >>> 0);
              }
              if ((((fx.por & 8) >>> 0) != 0)) {
                fx.color = ((((fx.color & 240) >>> 0) | ((c & 15) >>> 0)) >>> 0);
              } else {
                fx.color = ((c & 255) >>> 0);
              }
            }
            clrflags(fx);
            r15inc(fx);
          } else {
            const v = (((~sregVal(fx)) & 4294967295) >>> 0);
            r15inc(fx);
            setDreg(fx, v);
            fx.vSign = v;
            fx.vZero = v;
            clrflags(fx);
          }
        }
      }
    }
    return;
  }
  if ((op < 96)) {
    const n = ((op & 15) >>> 0);
    const a = ((sregVal(fx) & 65535) >>> 0);
    const bRaw = (() => {
    if ((alt <= 1)) {
      return __idx(fx.reg, n);
    } else {
      return n;
    }
    })();
    const b = ((bRaw & 65535) >>> 0);
    let t = 0;
    if ((alt == 0)) {
      t = __ovf((a + b), -9223372036854775808, 9223372036854775807);
    } else {
      if ((alt == 1)) {
        t = __ovf((__ovf((a + b), -9223372036854775808, 9223372036854775807) + fx.vCarry), -9223372036854775808, 9223372036854775807);
      } else {
        if ((alt == 2)) {
          t = __ovf((a + b), -9223372036854775808, 9223372036854775807);
        } else {
          t = __ovf((__ovf((a + b), -9223372036854775808, 9223372036854775807) + fx.vCarry), -9223372036854775808, 9223372036854775807);
        }
      }
    }
    fx.vCarry = (() => {
    if ((t >= 65536)) {
      return 1;
    } else {
      return 0;
    }
    })();
    fx.vOverflow = (((((~((sregVal(fx) ^ bRaw) >>> 0)) & ((bRaw ^ t) >>> 0)) >>> 0) & 32768) >>> 0);
    fx.vSign = t;
    fx.vZero = t;
    r15inc(fx);
    setDreg(fx, t);
    clrflags(fx);
    return;
  }
  if ((op < 112)) {
    const n = ((op & 15) >>> 0);
    const a = ((sregVal(fx) & 65535) >>> 0);
    const bRaw = (() => {
    if ((alt == 2)) {
      return n;
    } else {
      return __idx(fx.reg, n);
    }
    })();
    const b = ((bRaw & 65535) >>> 0);
    let t = 0;
    if ((alt == 0)) {
      t = __ovf((a - b), -9223372036854775808, 9223372036854775807);
    } else {
      if ((alt == 1)) {
        t = __ovf((__ovf((a - b), -9223372036854775808, 9223372036854775807) - ((fx.vCarry ^ 1) >>> 0)), -9223372036854775808, 9223372036854775807);
      } else {
        if ((alt == 2)) {
          t = __ovf((a - b), -9223372036854775808, 9223372036854775807);
        } else {
          t = __ovf((a - b), -9223372036854775808, 9223372036854775807);
        }
      }
    }
    fx.vCarry = (() => {
    if ((t >= 0)) {
      return 1;
    } else {
      return 0;
    }
    })();
    fx.vOverflow = ((((((sregVal(fx) ^ bRaw) >>> 0) & ((sregVal(fx) ^ t) >>> 0)) >>> 0) & 32768) >>> 0);
    fx.vSign = t;
    fx.vZero = t;
    r15inc(fx);
    if ((alt != 3)) {
      setDreg(fx, t);
    }
    clrflags(fx);
    return;
  }
  if ((op < 128)) {
    if ((op == 112)) {
      const v = ((((__idx(fx.reg, 7) & 65280) >>> 0) | Math.floor(((__idx(fx.reg, 8) & 65280) >>> 0) / 2 ** (__sh(8, 64)))) >>> 0);
      r15inc(fx);
      setDreg(fx, v);
      fx.vOverflow = Math.trunc(((v & 49344) >>> 0) * 2 ** (__sh(16, 64)));
      fx.vZero = (() => {
      if ((((v & 61680) >>> 0) != 0)) {
        return 0;
      } else {
        return 1;
      }
      })();
      fx.vSign = ((((v | Math.trunc(v * 2 ** (__sh(8, 64)))) >>> 0) & 32768) >>> 0);
      fx.vCarry = (() => {
      if ((((v & 57568) >>> 0) != 0)) {
        return 1;
      } else {
        return 0;
      }
      })();
      clrflags(fx);
    } else {
      const n = ((op & 15) >>> 0);
      const s = sregVal(fx);
      let v = 0;
      if ((alt == 0)) {
        v = ((s & __idx(fx.reg, n)) >>> 0);
      } else {
        if ((alt == 1)) {
          v = ((s & (~__idx(fx.reg, n))) >>> 0);
        } else {
          if ((alt == 2)) {
            v = ((s & n) >>> 0);
          } else {
            v = ((s & (~n)) >>> 0);
          }
        }
      }
      v = ((v & 4294967295) >>> 0);
      r15inc(fx);
      setDreg(fx, v);
      fx.vSign = v;
      fx.vZero = v;
      clrflags(fx);
    }
    return;
  }
  if ((op < 144)) {
    const n = ((op & 15) >>> 0);
    const s = sregVal(fx);
    let v = 0;
    if ((alt == 0)) {
      v = __ovf((sex8(s) * sex8(__idx(fx.reg, n))), -9223372036854775808, 9223372036854775807);
    } else {
      if ((alt == 1)) {
        v = __ovf((((s & 255) >>> 0) * ((__idx(fx.reg, n) & 255) >>> 0)), -9223372036854775808, 9223372036854775807);
      } else {
        if ((alt == 2)) {
          v = __ovf((sex8(s) * n), -9223372036854775808, 9223372036854775807);
        } else {
          v = __ovf((((s & 255) >>> 0) * n), -9223372036854775808, 9223372036854775807);
        }
      }
    }
    v = ((v & 4294967295) >>> 0);
    r15inc(fx);
    setDreg(fx, v);
    fx.vSign = v;
    fx.vZero = v;
    clrflags(fx);
    return;
  }
  if ((op < 160)) {
    if ((op == 144)) {
      ramWrite(fx, fx.lastRamAdr, sregVal(fx));
      ramWrite(fx, ((fx.lastRamAdr ^ 1) >>> 0), Math.floor(sregVal(fx) / 2 ** (__sh(8, 64))));
      clrflags(fx);
      r15inc(fx);
    } else {
      if (((op >= 145) && (op <= 148))) {
        __idxSet(fx.reg, 11, ((__ovf((__idx(fx.reg, 15) + ((op & 15) >>> 0)), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
        clrflags(fx);
        r15inc(fx);
      } else {
        if ((op == 149)) {
          const v = ((sex8(sregVal(fx)) & 4294967295) >>> 0);
          r15inc(fx);
          setDreg(fx, v);
          fx.vSign = v;
          fx.vZero = v;
          clrflags(fx);
        } else {
          if ((op == 150)) {
            const s = sregVal(fx);
            fx.vCarry = ((s & 1) >>> 0);
            let v = 0;
            if (((alt == 1) || (alt == 3))) {
              const sv = sex16(s);
              if ((sv == __ovf((-1), -9223372036854775808, 9223372036854775807))) {
                v = 0;
              } else {
                v = ((ashr1(sv) & 4294967295) >>> 0);
              }
            } else {
              v = ((ashr1(sex16(s)) & 4294967295) >>> 0);
            }
            r15inc(fx);
            setDreg(fx, v);
            fx.vSign = v;
            fx.vZero = v;
            clrflags(fx);
          } else {
            if ((op == 151)) {
              const s = sregVal(fx);
              const v = ((Math.floor(((s & 65535) >>> 0) / 2 ** (__sh(1, 64))) | Math.trunc(fx.vCarry * 2 ** (__sh(15, 64)))) >>> 0);
              fx.vCarry = ((s & 1) >>> 0);
              r15inc(fx);
              setDreg(fx, v);
              fx.vSign = v;
              fx.vZero = v;
              clrflags(fx);
            } else {
              if (((op >= 152) && (op <= 157))) {
                const n = ((op & 15) >>> 0);
                if (((alt == 1) || (alt == 3))) {
                  fx.pbr = ((__idx(fx.reg, n) & 127) >>> 0);
                  __idxSet(fx.reg, 15, ((sregVal(fx) & 65535) >>> 0));
                  fx.cacheActive = true;
                  fx.cbr = ((__idx(fx.reg, 15) & 65520) >>> 0);
                  clrflags(fx);
                } else {
                  __idxSet(fx.reg, 15, ((__idx(fx.reg, n) & 65535) >>> 0));
                  clrflags(fx);
                }
              } else {
                if ((op == 158)) {
                  const v = ((sregVal(fx) & 255) >>> 0);
                  r15inc(fx);
                  setDreg(fx, v);
                  fx.vSign = Math.trunc(v * 2 ** (__sh(8, 64)));
                  fx.vZero = Math.trunc(v * 2 ** (__sh(8, 64)));
                  clrflags(fx);
                } else {
                  const c = ((__ovf((sex16(sregVal(fx)) * sex16(__idx(fx.reg, 6))), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
                  const v = ((Math.floor(c / 2 ** (__sh(16, 64))) & 65535) >>> 0);
                  if (((alt == 1) || (alt == 3))) {
                    __idxSet(fx.reg, 4, c);
                  }
                  r15inc(fx);
                  setDreg(fx, v);
                  fx.vSign = v;
                  fx.vZero = v;
                  fx.vCarry = ((Math.floor(c / 2 ** (__sh(15, 64))) & 1) >>> 0);
                  clrflags(fx);
                }
              }
            }
          }
        }
      }
    }
    return;
  }
  if ((op < 176)) {
    const n = ((op & 15) >>> 0);
    if ((alt == 0)) {
      const v = fx.pipe;
      r15inc(fx);
      fetchPipe(fx);
      r15inc(fx);
      __idxSet(fx.reg, n, ((sex8(v) & 4294967295) >>> 0));
      if ((n == 14)) {
        readR14(fx);
      }
      clrflags(fx);
    } else {
      if ((alt == 2)) {
        const v = __idx(fx.reg, n);
        const adr = Math.trunc(fx.pipe * 2 ** (__sh(1, 64)));
        fx.lastRamAdr = adr;
        r15inc(fx);
        fetchPipe(fx);
        ramWrite(fx, adr, v);
        ramWrite(fx, __ovf((adr + 1), -9223372036854775808, 9223372036854775807), Math.floor(v / 2 ** (__sh(8, 64))));
        clrflags(fx);
        r15inc(fx);
      } else {
        const adr = Math.trunc(fx.pipe * 2 ** (__sh(1, 64)));
        fx.lastRamAdr = adr;
        r15inc(fx);
        fetchPipe(fx);
        r15inc(fx);
        let v = ramRead(fx, adr);
        v = ((v | Math.trunc(ramRead(fx, __ovf((adr + 1), -9223372036854775808, 9223372036854775807)) * 2 ** (__sh(8, 64)))) >>> 0);
        __idxSet(fx.reg, n, ((v & 4294967295) >>> 0));
        if ((n == 14)) {
          readR14(fx);
        }
        clrflags(fx);
      }
    }
    return;
  }
  if ((op < 192)) {
    const n = ((op & 15) >>> 0);
    if (fx.bflag) {
      const v = __idx(fx.reg, n);
      r15inc(fx);
      setDreg(fx, v);
      fx.vOverflow = Math.trunc(((v & 128) >>> 0) * 2 ** (__sh(16, 64)));
      fx.vSign = v;
      fx.vZero = v;
      clrflags(fx);
    } else {
      fx.sreg = n;
      r15inc(fx);
    }
    return;
  }
  if ((op < 208)) {
    if ((op == 192)) {
      const v = ((Math.floor(sregVal(fx) / 2 ** (__sh(8, 64))) & 255) >>> 0);
      r15inc(fx);
      setDreg(fx, v);
      fx.vSign = Math.trunc(v * 2 ** (__sh(8, 64)));
      fx.vZero = Math.trunc(v * 2 ** (__sh(8, 64)));
      clrflags(fx);
    } else {
      const n = ((op & 15) >>> 0);
      const s = sregVal(fx);
      let v = 0;
      if ((alt == 0)) {
        v = ((s | __idx(fx.reg, n)) >>> 0);
      } else {
        if ((alt == 1)) {
          v = ((s ^ __idx(fx.reg, n)) >>> 0);
        } else {
          if ((alt == 2)) {
            v = ((s | n) >>> 0);
          } else {
            v = ((s ^ n) >>> 0);
          }
        }
      }
      v = ((v & 4294967295) >>> 0);
      r15inc(fx);
      setDreg(fx, v);
      fx.vSign = v;
      fx.vZero = v;
      clrflags(fx);
    }
    return;
  }
  if ((op < 224)) {
    if ((op <= 222)) {
      const n = ((op & 15) >>> 0);
      __idxSet(fx.reg, n, ((__ovf((__idx(fx.reg, n) + 1), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
      fx.vSign = __idx(fx.reg, n);
      fx.vZero = __idx(fx.reg, n);
      if ((n == 14)) {
        readR14(fx);
      }
      clrflags(fx);
      r15inc(fx);
    } else {
      if ((alt == 2)) {
        fx.rambr = __irem(sregVal(fx), fx.nRamBanks);
        clrflags(fx);
        r15inc(fx);
      } else {
        if ((alt == 3)) {
          fx.rombr = ((sregVal(fx) & 127) >>> 0);
          clrflags(fx);
          r15inc(fx);
        } else {
          let c = ((fx.romBuffer & 255) >>> 0);
          if ((((fx.por & 4) >>> 0) != 0)) {
            c = ((((c & 240) >>> 0) | ((Math.floor(c / 2 ** (__sh(4, 64))) & 15) >>> 0)) >>> 0);
          }
          if ((((fx.por & 8) >>> 0) != 0)) {
            fx.color = ((((fx.color & 240) >>> 0) | ((c & 15) >>> 0)) >>> 0);
          } else {
            fx.color = ((c & 255) >>> 0);
          }
          clrflags(fx);
          r15inc(fx);
        }
      }
    }
    return;
  }
  if ((op < 240)) {
    if ((op <= 238)) {
      const n = ((op & 15) >>> 0);
      __idxSet(fx.reg, n, ((__ovf((__idx(fx.reg, n) - 1), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
      fx.vSign = __idx(fx.reg, n);
      fx.vZero = __idx(fx.reg, n);
      if ((n == 14)) {
        readR14(fx);
      }
      clrflags(fx);
      r15inc(fx);
    } else {
      const rb = ((fx.romBuffer & 255) >>> 0);
      let v = 0;
      if ((alt == 1)) {
        v = ((((sregVal(fx) & 255) >>> 0) | Math.trunc(rb * 2 ** (__sh(8, 64)))) >>> 0);
      } else {
        if ((alt == 2)) {
          v = ((((sregVal(fx) & 65280) >>> 0) | rb) >>> 0);
        } else {
          if ((alt == 3)) {
            v = ((sex8(rb) & 4294967295) >>> 0);
          } else {
            v = rb;
          }
        }
      }
      r15inc(fx);
      setDreg(fx, v);
      clrflags(fx);
    }
    return;
  }
  const n = ((op & 15) >>> 0);
  if ((alt == 0)) {
    const lo = fx.pipe;
    r15inc(fx);
    fetchPipe(fx);
    r15inc(fx);
    const hi = fx.pipe;
    fetchPipe(fx);
    r15inc(fx);
    __idxSet(fx.reg, n, ((((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0) & 4294967295) >>> 0));
    if ((n == 14)) {
      readR14(fx);
    }
    clrflags(fx);
  } else {
    if ((alt == 2)) {
      const v = __idx(fx.reg, n);
      let adr = fx.pipe;
      r15inc(fx);
      fetchPipe(fx);
      r15inc(fx);
      adr = ((adr | Math.trunc(fx.pipe * 2 ** (__sh(8, 64)))) >>> 0);
      fetchPipe(fx);
      fx.lastRamAdr = adr;
      ramWrite(fx, adr, v);
      ramWrite(fx, ((adr ^ 1) >>> 0), Math.floor(v / 2 ** (__sh(8, 64))));
      clrflags(fx);
      r15inc(fx);
    } else {
      let adr = fx.pipe;
      r15inc(fx);
      fetchPipe(fx);
      r15inc(fx);
      adr = ((adr | Math.trunc(fx.pipe * 2 ** (__sh(8, 64)))) >>> 0);
      fetchPipe(fx);
      r15inc(fx);
      fx.lastRamAdr = adr;
      let v = ramRead(fx, adr);
      v = ((v | Math.trunc(ramRead(fx, ((adr ^ 1) >>> 0)) * 2 ** (__sh(8, 64)))) >>> 0);
      __idxSet(fx.reg, n, ((v & 4294967295) >>> 0));
      if ((n == 14)) {
        readR14(fx);
      }
      clrflags(fx);
    }
  }
}

function fxRun(fx, maxSteps) {
  if ((!fx.running)) {
    return 0;
  }
  fxUpdateScreen(fx);
  let i = 0;
  while (((i < maxSteps) && fx.running)) {
    fxStepOne(fx);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  fxDbgSteps = __ovf((fxDbgSteps + i), -9223372036854775808, 9223372036854775807);
  return i;
}

function composeSfr(fx) {
  let s = 0;
  if ((((fx.vZero & 65535) >>> 0) == 0)) {
    s = ((s | 2) >>> 0);
  }
  if ((((fx.vCarry & 1) >>> 0) != 0)) {
    s = ((s | 4) >>> 0);
  }
  if ((((fx.vSign & 32768) >>> 0) != 0)) {
    s = ((s | 8) >>> 0);
  }
  if (((fx.vOverflow >= 32768) || (fx.vOverflow < __ovf((-32768), -9223372036854775808, 9223372036854775807)))) {
    s = ((s | 16) >>> 0);
  }
  if (fx.running) {
    s = ((s | 32) >>> 0);
  }
  if (fx.alt1) {
    s = ((s | 256) >>> 0);
  }
  if (fx.alt2) {
    s = ((s | 512) >>> 0);
  }
  if (fx.bflag) {
    s = ((s | 4096) >>> 0);
  }
  if (fx.irqPending) {
    s = ((s | 32768) >>> 0);
  }
  return s;
}

function fxStart(fx) {
  if ((!fx.running)) {
    fx.running = true;
    fxDbgStarts = __ovf((fxDbgStarts + 1), -9223372036854775808, 9223372036854775807);
  }
}

function fxRegRead(fx, addr) {
  if (((addr >= 12288) && (addr <= 12319))) {
    const i = Math.floor(__ovf((addr - 12288), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(1, 64)));
    const byte = ((addr & 1) >>> 0);
    return ((Math.floor(__idx(fx.reg, i) / 2 ** (__sh(__ovf((8 * byte), -9223372036854775808, 9223372036854775807), 64))) & 255) >>> 0);
  }
  if ((addr == 12336)) {
    return ((composeSfr(fx) & 255) >>> 0);
  }
  if ((addr == 12337)) {
    return ((Math.floor(composeSfr(fx) / 2 ** (__sh(8, 64))) & 255) >>> 0);
  }
  if ((addr == 12339)) {
    return fx.bramr;
  }
  if ((addr == 12340)) {
    return fx.pbr;
  }
  if ((addr == 12342)) {
    return fx.rombr;
  }
  if ((addr == 12343)) {
    return fx.cfgr;
  }
  if ((addr == 12344)) {
    return fx.scbr;
  }
  if ((addr == 12345)) {
    return fx.clsr;
  }
  if ((addr == 12346)) {
    return fx.scmr;
  }
  if ((addr == 12347)) {
    return 0;
  }
  if ((addr == 12348)) {
    return fx.rambr;
  }
  if ((addr == 12350)) {
    return ((fx.cbr & 255) >>> 0);
  }
  if ((addr == 12351)) {
    return ((Math.floor(fx.cbr / 2 ** (__sh(8, 64))) & 255) >>> 0);
  }
  if (((addr >= 12544) && (addr <= 13055))) {
    return Math.trunc(__idx(fx.cache, __ovf((addr - 12544), -9223372036854775808, 9223372036854775807)));
  }
  return 0;
}

function fxRegWrite(fx, addr, v) {
  const val = ((v & 255) >>> 0);
  if (((addr >= 12288) && (addr <= 12319))) {
    const i = Math.floor(__ovf((addr - 12288), -9223372036854775808, 9223372036854775807) / 2 ** (__sh(1, 64)));
    const byte = ((addr & 1) >>> 0);
    if ((byte == 0)) {
      __idxSet(fx.reg, i, ((((__idx(fx.reg, i) & 4294967040) >>> 0) | val) >>> 0));
    } else {
      __idxSet(fx.reg, i, ((((__idx(fx.reg, i) & 4294902015) >>> 0) | Math.trunc(val * 2 ** (__sh(8, 64)))) >>> 0));
    }
    if ((addr == 12319)) {
      fxStart(fx);
    }
    return;
  }
  if ((addr == 12336)) {
    fx.vZero = (() => {
    if ((((val & 2) >>> 0) != 0)) {
      return 0;
    } else {
      return 1;
    }
    })();
    fx.vCarry = ((Math.floor(val / 2 ** (__sh(2, 64))) & 1) >>> 0);
    fx.vSign = (() => {
    if ((((val & 8) >>> 0) != 0)) {
      return 32768;
    } else {
      return 0;
    }
    })();
    fx.vOverflow = (() => {
    if ((((val & 16) >>> 0) != 0)) {
      return 32768;
    } else {
      return 0;
    }
    })();
    if ((((val & 32) >>> 0) != 0)) {
      fxStart(fx);
    } else {
      fx.running = false;
      fx.cacheActive = false;
    }
    return;
  }
  if ((addr == 12337)) {
    return;
  }
  if ((addr == 12339)) {
    fx.bramr = val;
    return;
  }
  if ((addr == 12340)) {
    fx.pbr = ((val & 127) >>> 0);
    return;
  }
  if ((addr == 12342)) {
    fx.rombr = ((val & 127) >>> 0);
    return;
  }
  if ((addr == 12343)) {
    fx.cfgr = val;
    return;
  }
  if ((addr == 12344)) {
    fx.scbr = val;
    fxUpdateScreen(fx);
    return;
  }
  if ((addr == 12345)) {
    fx.clsr = val;
    return;
  }
  if ((addr == 12346)) {
    fx.scmr = val;
    fxUpdateScreen(fx);
    return;
  }
  if ((addr == 12348)) {
    fx.rambr = __irem(val, fx.nRamBanks);
    return;
  }
  if ((addr == 12350)) {
    fx.cbr = ((((fx.cbr & 65280) >>> 0) | val) >>> 0);
    return;
  }
  if ((addr == 12351)) {
    fx.cbr = ((((fx.cbr & 255) >>> 0) | Math.trunc(val * 2 ** (__sh(8, 64)))) >>> 0);
    return;
  }
  if (((addr >= 12544) && (addr <= 13055))) {
    __idxSet(fx.cache, __ovf((addr - 12544), -9223372036854775808, 9223372036854775807), (val & 0xFF));
    return;
  }
}

function fxTestRun(program, seed, carry, steps) {
  let rom = [];
  let i = 0;
  while ((i < 32768)) {
    if ((i < program.length)) {
      rom.push(__idx(program, i));
    } else {
      rom.push(0);
    }
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  let fx = fxNew(rom);
  i = 0;
  while ((i < 16)) {
    __idxSet(fx.reg, i, ((__idx(seed, i) & 4294967295) >>> 0));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  fx.vCarry = ((carry & 1) >>> 0);
  fx.vZero = 1;
  fx.vSign = 0;
  fx.vOverflow = 0;
  __idxSet(fx.reg, 15, 0);
  fx.pbr = 0;
  fx.pipe = 1;
  fx.running = true;
  let n = 0;
  while (((n < steps) && fx.running)) {
    fxStepOne(fx);
    n = __ovf((n + 1), -9223372036854775808, 9223372036854775807);
  }
  let out = [];
  i = 0;
  while ((i < 16)) {
    out.push(((__idx(fx.reg, i) & 65535) >>> 0));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  out.push(((composeSfr(fx) & 65535) >>> 0));
  return out;
}

function isSuperFx(rom) {
  if ((rom.length < 32768)) {
    return false;
  }
  const t = Math.trunc(__idx(rom, 32726));
  return ((((t == 19) || (t == 20)) || (t == 21)) || (t == 26));
}

function u16At(data, i) {
  return ((Math.trunc(__idx(data, i)) | Math.trunc(Math.trunc(__idx(data, __ovf((i + 1), -9223372036854775808, 9223372036854775807))) * 2 ** (__sh(8, 64)))) >>> 0);
}

function scoreHeader(data, base, wantHi) {
  if ((__ovf((base + 32), -9223372036854775808, 9223372036854775807) > data.length)) {
    return __ovf((-1), -9223372036854775808, 9223372036854775807);
  }
  let score = 0;
  const comp = u16At(data, __ovf((base + 28), -9223372036854775808, 9223372036854775807));
  const chk = u16At(data, __ovf((base + 30), -9223372036854775808, 9223372036854775807));
  if (((((__ovf((comp + chk), -9223372036854775808, 9223372036854775807) & 65535) >>> 0) == 65535) && (chk != 0))) {
    score = __ovf((score + 8), -9223372036854775808, 9223372036854775807);
  }
  const mode = Math.trunc(__idx(data, __ovf((base + 21), -9223372036854775808, 9223372036854775807)));
  const modeHi = (((mode & 1) >>> 0) == 1);
  if ((modeHi == wantHi)) {
    score = __ovf((score + 4), -9223372036854775808, 9223372036854775807);
  }
  const reset = u16At(data, __ovf((base + 60), -9223372036854775808, 9223372036854775807));
  if ((reset >= 32768)) {
    score = __ovf((score + 1), -9223372036854775808, 9223372036854775807);
  }
  return score;
}

function parseCart(raw) {
  let start = 0;
  if ((__irem(raw.length, 32768) == 512)) {
    start = 512;
  }
  let data = [];
  let i = start;
  while ((i < raw.length)) {
    data.push(__idx(raw, i));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  if ((data.length < 32768)) {
    return Result_Cart_string.Err("ROM too small");
  }
  const loScore = scoreHeader(data, 32704, false);
  const hiScore = scoreHeader(data, 65472, true);
  let mapMode = 0;
  if ((hiScore > loScore)) {
    mapMode = 1;
  }
  return Result_Cart_string.Ok(new Cart(data, mapMode));
}

function Unit$Eq$eq(self, _other) {
  return true;
}

function Cpu$Eq$eq(self, other) {
  return ((((((((((self.a == other.a) && (self.x == other.x)) && (self.y == other.y)) && (self.s == other.s)) && (self.d == other.d)) && (self.pc == other.pc)) && (self.p == other.p)) && (self.dbr == other.dbr)) && (self.pbr == other.pbr)) && (self.e == other.e));
}

function Spc$Eq$eq(self, other) {
  return ((((((self.a == other.a) && (self.x == other.x)) && (self.y == other.y)) && (self.sp == other.sp)) && (self.pc == other.pc)) && (self.psw == other.psw));
}

try { main(); __flush(); } catch (__e) { __flush(); if (__e && __e.__milo_trap) { __eprint(__e.message + "\n"); if (typeof process !== 'undefined') process.exit(134); } throw __e; }
