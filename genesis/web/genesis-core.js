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

class GenHandle {
  constructor(cpu, m, synth, rgba, samples) {
    this.cpu = cpu;
    this.m = m;
    this.synth = synth;
    this.rgba = rgba;
    this.samples = samples;
  }
}

class Cart {
  constructor(rom, name, romEnd) {
    this.rom = rom;
    this.name = name;
    this.romEnd = romEnd;
  }
}

class Mem {
  constructor(ram, touched, genesis, vram, cram, vsram, vdpRegs, vdpAddr, vdpCode, vdpFirst, vdpPending, vdpLine, dmaFillPending, fillAddr, fillInc, fillLen, lastDataByte, z80Busreq, z80Reset, z80, ctrl1, tmssUnlocked, pad1, padTh, pad2, padTh2, ioRegs) {
    this.ram = ram;
    this.touched = touched;
    this.genesis = genesis;
    this.vram = vram;
    this.cram = cram;
    this.vsram = vsram;
    this.vdpRegs = vdpRegs;
    this.vdpAddr = vdpAddr;
    this.vdpCode = vdpCode;
    this.vdpFirst = vdpFirst;
    this.vdpPending = vdpPending;
    this.vdpLine = vdpLine;
    this.dmaFillPending = dmaFillPending;
    this.fillAddr = fillAddr;
    this.fillInc = fillInc;
    this.fillLen = fillLen;
    this.lastDataByte = lastDataByte;
    this.z80Busreq = z80Busreq;
    this.z80Reset = z80Reset;
    this.z80 = z80;
    this.ctrl1 = ctrl1;
    this.tmssUnlocked = tmssUnlocked;
    this.pad1 = pad1;
    this.padTh = padTh;
    this.pad2 = pad2;
    this.padTh2 = padTh2;
    this.ioRegs = ioRegs;
  }
}

class M68k {
  constructor(d, a, otherSp, pc, sr, halted, fault, faultAddr, faultRW, faultIN, faultCommit) {
    this.d = d;
    this.a = a;
    this.otherSp = otherSp;
    this.pc = pc;
    this.sr = sr;
    this.halted = halted;
    this.fault = fault;
    this.faultAddr = faultAddr;
    this.faultRW = faultRW;
    this.faultIN = faultIN;
    this.faultCommit = faultCommit;
  }
}

class Z80 {
  constructor(a, b, c, d, e, h, l, f, i, r, pc, sp, ix, iy, af_, bc_, de_, hl_, iff1, iff2, im, wz, halted, mem, gen, bank, ymAddr0, ymAddr1, ym, psgLatch, psg, fmKey, rom, dac, dacW, dacR, ymStatus, timerACnt, timerARun, timerBCnt, timerBRun) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.h = h;
    this.l = l;
    this.f = f;
    this.i = i;
    this.r = r;
    this.pc = pc;
    this.sp = sp;
    this.ix = ix;
    this.iy = iy;
    this.af_ = af_;
    this.bc_ = bc_;
    this.de_ = de_;
    this.hl_ = hl_;
    this.iff1 = iff1;
    this.iff2 = iff2;
    this.im = im;
    this.wz = wz;
    this.halted = halted;
    this.mem = mem;
    this.gen = gen;
    this.bank = bank;
    this.ymAddr0 = ymAddr0;
    this.ymAddr1 = ymAddr1;
    this.ym = ym;
    this.psgLatch = psgLatch;
    this.psg = psg;
    this.fmKey = fmKey;
    this.rom = rom;
    this.dac = dac;
    this.dacW = dacW;
    this.dacR = dacR;
    this.ymStatus = ymStatus;
    this.timerACnt = timerACnt;
    this.timerARun = timerARun;
    this.timerBCnt = timerBCnt;
    this.timerBRun = timerBRun;
  }
}

class Synth {
  constructor(phase, modPhase, envLevel, opPhase, fbMem, noiseLfsr) {
    this.phase = phase;
    this.modPhase = modPhase;
    this.envLevel = envLevel;
    this.opPhase = opPhase;
    this.fbMem = fbMem;
    this.noiseLfsr = noiseLfsr;
  }
}

class StereoSample {
  constructor(l, r) {
    this.l = l;
    this.r = r;
  }
}

const Ea = {
  DReg(_0) { return { tag: 0, data: [_0] }; },
  AReg(_0) { return { tag: 1, data: [_0] }; },
  MemAddr(_0) { return { tag: 2, data: [_0] }; },
  Imm(_0) { return { tag: 3, data: [_0] }; },
};

const Result_Cart_string = {
  Ok(_0) { return { tag: 0, data: [_0] }; },
  Err(_0) { return { tag: 1, data: [_0] }; },
};

const __enumMeta = {
  "Ea": [["DReg", 1], ["AReg", 1], ["MemAddr", 1], ["Imm", 1]],
  "Result_Cart_string": [["Ok", 1], ["Err", 1]],
  "Option": [["Some", 1], ["None", 0]],
  "Result": [["Ok", 1], ["Err", 1]]
};

const MAXW = 320;
const SR_C = 1;
const SR_V = 2;
const SR_Z = 4;
const SR_N = 8;
const SR_X = 16;
const SR_S = 8192;
const SR_T = 32768;
const ADDR_MASK = 16777215;
const VRAM_MASK = 65535;
const FC = 1;
const FN = 2;
const FPV = 4;
const FX = 8;
const FH = 16;
const FY = 32;
const FZ = 64;
const FS = 128;
const SAMPLE_RATE = 44100;
const FM_SCALE_1E6 = 50808;
const PRI = 256;

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

function loadRom(m, cart) {
  let i = 0;
  while (((i < cart.rom.length) && (i < 4194304))) {
    __idxSet(m.ram, i, __idx(cart.rom, i));
    m.z80.rom.push(__idx(cart.rom, i));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
}

function createGenesis(rom) {
  let cart = new Cart([], "", 0);
  const _t18 = parseCart(rom);
  if (_t18.tag === 0) {
    const c = _t18.data[0];
    cart = c;
  } else if (_t18.tag === 1) {
    const e = _t18.data[0];
    __print(("Genesis ROM parse failed: " + e) + "\n");
  }
  let m = newMem();
  m.genesis = true;
  m.z80.gen = true;
  loadRom(m, cart);
  const sp = ((((((Math.trunc(Math.trunc(__idx(m.ram, 0)) * 2 ** (__sh(24, 64))) | Math.trunc(Math.trunc(__idx(m.ram, 1)) * 2 ** (__sh(16, 64)))) >>> 0) | Math.trunc(Math.trunc(__idx(m.ram, 2)) * 2 ** (__sh(8, 64)))) >>> 0) | Math.trunc(__idx(m.ram, 3))) >>> 0);
  const pc = ((((((Math.trunc(Math.trunc(__idx(m.ram, 4)) * 2 ** (__sh(24, 64))) | Math.trunc(Math.trunc(__idx(m.ram, 5)) * 2 ** (__sh(16, 64)))) >>> 0) | Math.trunc(Math.trunc(__idx(m.ram, 6)) * 2 ** (__sh(8, 64)))) >>> 0) | Math.trunc(__idx(m.ram, 7))) >>> 0);
  let cpu = newCpu();
  __idxSet(cpu.a, 7, ((sp & 4294967295) >>> 0));
  cpu.pc = ((pc & 4294967295) >>> 0);
  cpu.sr = 9984;
  const h = frameHeight(m);
  let rgba = [];
  let t = 0;
  while ((t < __ovf((__ovf((MAXW * h), -9223372036854775808, 9223372036854775807) * 4), -9223372036854775808, 9223372036854775807))) {
    rgba.push(0);
    t = __ovf((t + 1), -9223372036854775808, 9223372036854775807);
  }
  let samples = [];
  return new GenHandle(cpu, m, newSynth(), rgba, samples);
}

function setButtons(h, p) {
  h.m.pad1 = p;
}

function runFrame(cpu, m) {
  let line = 0;
  let hIntCounter = __idx(m.vdpRegs, 10);
  while ((line < 262)) {
    m.vdpLine = line;
    if ((line < 224)) {
      if ((hIntCounter == 0)) {
        hIntCounter = __idx(m.vdpRegs, 10);
        if ((((__idx(m.vdpRegs, 0) & 16) >>> 0) != 0)) {
          deliverInterrupt(cpu, m, 4);
        }
      } else {
        hIntCounter = __ovf((hIntCounter - 1), -9223372036854775808, 9223372036854775807);
      }
    } else {
      hIntCounter = __idx(m.vdpRegs, 10);
    }
    let k = 0;
    while ((k < 130)) {
      if ((!cpu.halted)) {
        step(cpu, m);
      }
      if ((z80Running(m) && (((k & 1) >>> 0) == 0))) {
        stepZ80(m.z80);
      }
      k = __ovf((k + 1), -9223372036854775808, 9223372036854775807);
    }
    if ((line == 224)) {
      if ((((__idx(m.vdpRegs, 1) & 32) >>> 0) != 0)) {
        deliverInterrupt(cpu, m, 6);
      }
      if (z80Running(m)) {
        z80Interrupt(m.z80);
      }
    }
    line = __ovf((line + 1), -9223372036854775808, 9223372036854775807);
  }
}

function stepFrame(h) {
  runFrame(h.cpu, h.m);
  let sa = 0;
  while ((sa < 735)) {
    const smp = synthSample(h.synth, h.m.z80);
    h.samples.push(((smp.l << 16) >> 16));
    h.samples.push(((smp.r << 16) >> 16));
    sa = __ovf((sa + 1), -9223372036854775808, 9223372036854775807);
  }
  const fb = renderIndexed(h.m);
  const srcW = frameWidth(h.m);
  let i = 0;
  while ((i < fb.length)) {
    const row = __ovf(__idiv(i, srcW), -9223372036854775808, 9223372036854775807);
    const col = __irem(i, srcW);
    const dst = __ovf((__ovf((__ovf((row * MAXW), -9223372036854775808, 9223372036854775807) + col), -9223372036854775808, 9223372036854775807) * 4), -9223372036854775808, 9223372036854775807);
    __idxSet(h.rgba, dst, (pixelR(h.m, __idx(fb, i)) & 0xFF));
    __idxSet(h.rgba, __ovf((dst + 1), -9223372036854775808, 9223372036854775807), (pixelG(h.m, __idx(fb, i)) & 0xFF));
    __idxSet(h.rgba, __ovf((dst + 2), -9223372036854775808, 9223372036854775807), (pixelB(h.m, __idx(fb, i)) & 0xFF));
    __idxSet(h.rgba, __ovf((dst + 3), -9223372036854775808, 9223372036854775807), 255);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
}

function frameH(h) {
  return frameHeight(h.m);
}

function main() {
  return 0;
}

function parseCart(raw) {
  if ((raw.length < 512)) {
    return Result_Cart_string.Err("file too small to be a Genesis ROM");
  }
  let rom = [];
  for (const b of raw) {
    rom.push(b);
  }
  let end = __ovf((288 + 48), -9223372036854775808, 9223372036854775807);
  while (((end > 288) && (Math.trunc(__idx(rom, __ovf((end - 1), -9223372036854775808, 9223372036854775807))) == 32))) {
    end = __ovf((end - 1), -9223372036854775808, 9223372036854775807);
  }
  while ((((end >= 290) && (Math.trunc(__idx(rom, __ovf((end - 2), -9223372036854775808, 9223372036854775807))) == 129)) && (Math.trunc(__idx(rom, __ovf((end - 1), -9223372036854775808, 9223372036854775807))) == 64))) {
    end = __ovf((end - 2), -9223372036854775808, 9223372036854775807);
  }
  let name = "";
  let j = 288;
  while ((j < end)) {
    const b = Math.trunc(__idx(rom, j));
    if ((((b == 129) && (__ovf((j + 1), -9223372036854775808, 9223372036854775807) < end)) && (Math.trunc(__idx(rom, __ovf((j + 1), -9223372036854775808, 9223372036854775807))) == 64))) {
      name = (name + " ");
      j = __ovf((j + 2), -9223372036854775808, 9223372036854775807);
    } else {
      if (((b == 130) && (__ovf((j + 1), -9223372036854775808, 9223372036854775807) < end))) {
        const c = Math.trunc(__idx(rom, __ovf((j + 1), -9223372036854775808, 9223372036854775807)));
        let out = __ovf((-1), -9223372036854775808, 9223372036854775807);
        if (((c >= 79) && (c <= 88))) {
          out = __ovf((48 + __ovf((c - 79), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
        } else {
          if (((c >= 96) && (c <= 121))) {
            out = __ovf((65 + __ovf((c - 96), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
          } else {
            if (((c >= 129) && (c <= 154))) {
              out = __ovf((97 + __ovf((c - 129), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
            }
          }
        }
        if ((out >= 0)) {
          name = (name + charFromByte((out & 0xFF)));
        }
        j = __ovf((j + 2), -9223372036854775808, 9223372036854775807);
      } else {
        if (((b >= 32) && (b <= 126))) {
          name = (name + charFromByte(__idx(rom, j)));
          j = __ovf((j + 1), -9223372036854775808, 9223372036854775807);
        } else {
          j = __ovf((j + 1), -9223372036854775808, 9223372036854775807);
        }
      }
    }
  }
  const romEnd = ((((((Math.trunc(Math.trunc(__idx(rom, 420)) * 2 ** (__sh(24, 64))) | Math.trunc(Math.trunc(__idx(rom, 421)) * 2 ** (__sh(16, 64)))) >>> 0) | Math.trunc(Math.trunc(__idx(rom, 422)) * 2 ** (__sh(8, 64)))) >>> 0) | Math.trunc(__idx(rom, 423))) >>> 0);
  return Result_Cart_string.Ok(new Cart(rom, name, romEnd));
}

function charFromByte(b) {
  let s = "";
  (s += String.fromCharCode(b));
  return s;
}

function newMem() {
  let ram = [];
  let i = 0;
  while ((i < 16777216)) {
    ram.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return new Mem(ram, [], false, [], Array.from({length: 64}, () => __clone(0)), Array.from({length: 40}, () => __clone(0)), Array.from({length: 24}, () => __clone(0)), 0, 0, 0, false, 0, false, 0, 0, 0, 0, false, true, newZ80(), 0, false, 0, false, 0, false, Array.from({length: 16}, () => __clone(0)));
}

function z80Running(m) {
  return ((!m.z80Reset) && (!m.z80Busreq));
}

function padReadPort(p, th) {
  let v = 0;
  if (th) {
    v = 64;
    if ((((p & 1) >>> 0) == 0)) {
      v = ((v | 1) >>> 0);
    }
    if ((((p & 2) >>> 0) == 0)) {
      v = ((v | 2) >>> 0);
    }
    if ((((p & 4) >>> 0) == 0)) {
      v = ((v | 4) >>> 0);
    }
    if ((((p & 8) >>> 0) == 0)) {
      v = ((v | 8) >>> 0);
    }
    if ((((p & 32) >>> 0) == 0)) {
      v = ((v | 16) >>> 0);
    }
    if ((((p & 64) >>> 0) == 0)) {
      v = ((v | 32) >>> 0);
    }
  } else {
    if ((((p & 1) >>> 0) == 0)) {
      v = ((v | 1) >>> 0);
    }
    if ((((p & 2) >>> 0) == 0)) {
      v = ((v | 2) >>> 0);
    }
    if ((((p & 16) >>> 0) == 0)) {
      v = ((v | 16) >>> 0);
    }
    if ((((p & 128) >>> 0) == 0)) {
      v = ((v | 32) >>> 0);
    }
  }
  return v;
}

function memRead8(m, addr) {
  const a = ((addr & ADDR_MASK) >>> 0);
  if ((m.genesis && isDevice(a))) {
    return devRead8(m, a);
  }
  return Math.trunc(__idx(m.ram, a));
}

function memWrite8(m, addr, val) {
  const a = ((addr & ADDR_MASK) >>> 0);
  if (m.genesis) {
    if ((a < 4194304)) {
      return;
    }
    if (isDevice(a)) {
      if (((a >= 10485760) && (a <= 10551295))) {
        const za = ((a & 65535) >>> 0);
        if ((za < 8192)) {
          __idxSet(m.z80.mem, za, (((val & 255) >>> 0) & 0xFF));
        } else {
          z80DevWrite(m.z80, za, ((val & 255) >>> 0));
        }
      } else {
        if (((a >= 10567680) && (a <= 10567683))) {
          m.tmssUnlocked = true;
        } else {
          if ((a == 10551299)) {
            m.padTh = (((val & 64) >>> 0) != 0);
          } else {
            if ((a == 10551301)) {
              m.padTh2 = (((val & 64) >>> 0) != 0);
            } else {
              if (((a >= 10551304) && (a <= 10551311))) {
                __idxSet(m.ioRegs, ((((a | 1) >>> 0) & 15) >>> 0), ((val & 255) >>> 0));
              } else {
                if ((a == 10555648)) {
                  m.z80Busreq = (((val & 1) >>> 0) != 0);
                } else {
                  if ((a == 10555904)) {
                    m.z80Reset = (((val & 1) >>> 0) == 0);
                  }
                }
              }
            }
          }
        }
      }
      return;
    }
  }
  __idxSet(m.ram, a, (((val & 255) >>> 0) & 0xFF));
  m.touched.push(a);
}

function memRead16(m, addr) {
  const a = ((addr & ADDR_MASK) >>> 0);
  if ((m.genesis && isDevice(a))) {
    return devRead16(m, a);
  }
  return ((Math.trunc(Math.trunc(__idx(m.ram, a)) * 2 ** (__sh(8, 64))) | Math.trunc(__idx(m.ram, ((__ovf((a + 1), -9223372036854775808, 9223372036854775807) & ADDR_MASK) >>> 0)))) >>> 0);
}

function memWrite16(m, addr, val) {
  const a = ((addr & ADDR_MASK) >>> 0);
  if (m.genesis) {
    if ((a < 4194304)) {
      return;
    }
    if (isDevice(a)) {
      devWrite16(m, a, ((val & 65535) >>> 0));
      return;
    }
  }
  memWrite8(m, addr, ((Math.floor(val / 2 ** (__sh(8, 64))) & 255) >>> 0));
  memWrite8(m, __ovf((addr + 1), -9223372036854775808, 9223372036854775807), ((val & 255) >>> 0));
}

function isDevice(a) {
  return ((a >= 10485760) && (a < 12582928));
}

function vdpStatus(m) {
  let s = ((13312 | 512) >>> 0);
  if ((m.vdpLine >= 224)) {
    s = ((s | 8) >>> 0);
  }
  return s;
}

function devRead16(m, a) {
  if (((a == 12582916) || (a == 12582918))) {
    return vdpStatus(m);
  }
  if (((a == 12582920) || (a == 12582922))) {
    return Math.trunc(((m.vdpLine & 255) >>> 0) * 2 ** (__sh(8, 64)));
  }
  if (((a == 12582912) || (a == 12582914))) {
    return 0;
  }
  if ((a == 10555648)) {
    return 0;
  }
  if ((a == 10551296)) {
    return 160;
  }
  if (((a >= 10551298) && (a <= 10551303))) {
    return 65535;
  }
  if (((a >= 10551304) && (a <= 10551311))) {
    const b = __idx(m.ioRegs, ((((a | 1) >>> 0) & 15) >>> 0));
    return ((Math.trunc(b * 2 ** (__sh(8, 64))) | b) >>> 0);
  }
  return 0;
}

function devRead8(m, a) {
  if (((a >= 10485760) && (a <= 10551295))) {
    const za = ((a & 65535) >>> 0);
    if ((za < 8192)) {
      return Math.trunc(__idx(m.z80.mem, za));
    }
    return 0;
  }
  if ((a == 10551297)) {
    return 160;
  }
  if ((a == 10551299)) {
    return padReadPort(m.pad1, m.padTh);
  }
  if ((a == 10551301)) {
    return padReadPort(m.pad2, m.padTh2);
  }
  const w = devRead16(m, ((a & (~1)) >>> 0));
  if ((((a & 1) >>> 0) == 0)) {
    return ((Math.floor(w / 2 ** (__sh(8, 64))) & 255) >>> 0);
  }
  return ((w & 255) >>> 0);
}

function devWrite16(m, a, val) {
  if (((a >= 10485760) && (a <= 10551295))) {
    const za = ((a & 65535) >>> 0);
    if ((za < 8192)) {
      __idxSet(m.z80.mem, za, (((Math.floor(val / 2 ** (__sh(8, 64))) & 255) >>> 0) & 0xFF));
      __idxSet(m.z80.mem, ((__ovf((za + 1), -9223372036854775808, 9223372036854775807) & 8191) >>> 0), (((val & 255) >>> 0) & 0xFF));
    } else {
      z80DevWrite(m.z80, za, ((Math.floor(val / 2 ** (__sh(8, 64))) & 255) >>> 0));
      z80DevWrite(m.z80, __ovf((za + 1), -9223372036854775808, 9223372036854775807), ((val & 255) >>> 0));
    }
    return;
  }
  if (((a == 12582912) || (a == 12582914))) {
    vdpDataWrite(m, val);
    return;
  }
  if (((a == 12582916) || (a == 12582918))) {
    vdpControlWrite(m, val);
    return;
  }
  if ((a == 10555648)) {
    m.z80Busreq = (((val & 256) >>> 0) != 0);
    return;
  }
  if ((a == 10555904)) {
    m.z80Reset = (((val & 256) >>> 0) == 0);
    return;
  }
  if ((a == 10567680)) {
    m.tmssUnlocked = true;
    return;
  }
  if ((a == 10551298)) {
    m.ctrl1 = ((val & 65535) >>> 0);
    m.padTh = (((val & 64) >>> 0) != 0);
    return;
  }
  if ((a == 10551300)) {
    m.padTh2 = (((val & 64) >>> 0) != 0);
    return;
  }
  if (((a >= 10551304) && (a <= 10551310))) {
    __idxSet(m.ioRegs, ((((a | 1) >>> 0) & 15) >>> 0), ((val & 255) >>> 0));
  }
}

function vdpControlWrite(m, val) {
  if (m.vdpPending) {
    m.vdpPending = false;
    const first = m.vdpFirst;
    m.vdpAddr = ((((first & 16383) >>> 0) | Math.trunc(((val & 3) >>> 0) * 2 ** (__sh(14, 64)))) >>> 0);
    m.vdpCode = ((((Math.floor(first / 2 ** (__sh(14, 64))) & 3) >>> 0) | ((Math.floor(val / 2 ** (__sh(2, 64))) & 60) >>> 0)) >>> 0);
    if ((((m.vdpCode & 32) >>> 0) != 0)) {
      vdpDma(m);
    }
    return;
  }
  if ((((val & 49152) >>> 0) == 32768)) {
    const reg = ((Math.floor(val / 2 ** (__sh(8, 64))) & 31) >>> 0);
    if ((reg < 24)) {
      __idxSet(m.vdpRegs, reg, ((val & 255) >>> 0));
    }
    return;
  }
  m.vdpFirst = val;
  m.vdpPending = true;
}

function vdpDma(m) {
  const mode = ((Math.floor(__idx(m.vdpRegs, 23) / 2 ** (__sh(6, 64))) & 3) >>> 0);
  if ((mode == 2)) {
    let flen = ((Math.trunc(__idx(m.vdpRegs, 20) * 2 ** (__sh(8, 64))) | __idx(m.vdpRegs, 19)) >>> 0);
    if ((flen == 0)) {
      flen = 65536;
    }
    m.fillAddr = m.vdpAddr;
    m.fillInc = __idx(m.vdpRegs, 15);
    m.fillLen = flen;
    doFill(m, m.lastDataByte);
    return;
  }
  if ((mode == 3)) {
    vdpDmaCopy(m);
    return;
  }
  let src = ((((Math.trunc(((__idx(m.vdpRegs, 23) & 127) >>> 0) * 2 ** (__sh(17, 64))) | Math.trunc(__idx(m.vdpRegs, 22) * 2 ** (__sh(9, 64)))) >>> 0) | Math.trunc(__idx(m.vdpRegs, 21) * 2 ** (__sh(1, 64)))) >>> 0);
  let len = ((Math.trunc(__idx(m.vdpRegs, 20) * 2 ** (__sh(8, 64))) | __idx(m.vdpRegs, 19)) >>> 0);
  if ((len == 0)) {
    len = 65536;
  }
  let i = 0;
  while ((i < len)) {
    const a = ((src & 16777215) >>> 0);
    const w = ((Math.trunc(Math.trunc(__idx(m.ram, a)) * 2 ** (__sh(8, 64))) | Math.trunc(__idx(m.ram, ((__ovf((a + 1), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0)))) >>> 0);
    vdpDataWrite(m, w);
    src = ((__ovf((src + 2), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  const srcWord = ((Math.floor(src / 2 ** (__sh(1, 64))) & 65535) >>> 0);
  __idxSet(m.vdpRegs, 21, ((srcWord & 255) >>> 0));
  __idxSet(m.vdpRegs, 22, ((Math.floor(srcWord / 2 ** (__sh(8, 64))) & 255) >>> 0));
  __idxSet(m.vdpRegs, 19, 0);
  __idxSet(m.vdpRegs, 20, 0);
}

function vramPut(m, idx, byte) {
  const i = ((idx & VRAM_MASK) >>> 0);
  while ((m.vram.length <= i)) {
    m.vram.push(0);
  }
  __idxSet(m.vram, i, byte);
}

function vdpDmaCopy(m) {
  let src = ((Math.trunc(__idx(m.vdpRegs, 22) * 2 ** (__sh(8, 64))) | __idx(m.vdpRegs, 21)) >>> 0);
  let len = ((Math.trunc(__idx(m.vdpRegs, 20) * 2 ** (__sh(8, 64))) | __idx(m.vdpRegs, 19)) >>> 0);
  if ((len == 0)) {
    len = 65536;
  }
  let dst = m.vdpAddr;
  let i = 0;
  while ((i < len)) {
    const sb = (() => {
    if ((((src & VRAM_MASK) >>> 0) < m.vram.length)) {
      return __idx(m.vram, ((src & VRAM_MASK) >>> 0));
    } else {
      return 0;
    }
    })();
    vramPut(m, dst, sb);
    src = ((__ovf((src + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    dst = ((__ovf((dst + __idx(m.vdpRegs, 15)), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  m.vdpAddr = ((dst & 131071) >>> 0);
}

function doFill(m, fillByteIn) {
  m.dmaFillPending = false;
  const fillByte = (((fillByteIn & 255) >>> 0) & 0xFF);
  const len = m.fillLen;
  const inc = m.fillInc;
  let da = m.fillAddr;
  let i = 0;
  while ((i < len)) {
    vramPut(m, da, fillByte);
    da = ((__ovf((da + inc), -9223372036854775808, 9223372036854775807) & 131071) >>> 0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  m.vdpAddr = ((da & 131071) >>> 0);
}

function vdpDataWrite(m, val) {
  m.lastDataByte = ((Math.floor(val / 2 ** (__sh(8, 64))) & 255) >>> 0);
  const target = ((m.vdpCode & 15) >>> 0);
  const a = m.vdpAddr;
  if ((target == 1)) {
    const base = ((((a & VRAM_MASK) >>> 0) & 65534) >>> 0);
    const hi = (((Math.floor(val / 2 ** (__sh(8, 64))) & 255) >>> 0) & 0xFF);
    const lo = (((val & 255) >>> 0) & 0xFF);
    if ((((a & 1) >>> 0) == 0)) {
      vramPut(m, base, hi);
      vramPut(m, __ovf((base + 1), -9223372036854775808, 9223372036854775807), lo);
    } else {
      vramPut(m, base, lo);
      vramPut(m, __ovf((base + 1), -9223372036854775808, 9223372036854775807), hi);
    }
  } else {
    if ((target == 3)) {
      const idx = ((Math.floor(a / 2 ** (__sh(1, 64))) & 63) >>> 0);
      __idxSet(m.cram, idx, ((val & 3822) >>> 0));
    } else {
      if ((target == 5)) {
        const idx = __irem(Math.floor(a / 2 ** (__sh(1, 64))), 40);
        __idxSet(m.vsram, idx, ((val & 2047) >>> 0));
      }
    }
  }
  m.vdpAddr = ((__ovf((a + __idx(m.vdpRegs, 15)), -9223372036854775808, 9223372036854775807) & 131071) >>> 0);
}

function memRead32(m, addr) {
  return ((Math.trunc(memRead16(m, addr) * 2 ** (__sh(16, 64))) | memRead16(m, __ovf((addr + 2), -9223372036854775808, 9223372036854775807))) >>> 0);
}

function memWrite32(m, addr, val) {
  memWrite16(m, addr, ((Math.floor(val / 2 ** (__sh(16, 64))) & 65535) >>> 0));
  memWrite16(m, __ovf((addr + 2), -9223372036854775808, 9223372036854775807), ((val & 65535) >>> 0));
}

function newCpu() {
  return new M68k([0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], 0, 0, 9984, false, false, 0, true, false, false);
}

function checkAlign(cpu, addr, size, isRead, isFetch) {
  if ((((size != 0) && (((addr & 1) >>> 0) != 0)) && (!cpu.fault))) {
    cpu.fault = true;
    cpu.faultAddr = ((addr & 4294967295) >>> 0);
    cpu.faultRW = isRead;
    cpu.faultIN = isFetch;
    cpu.faultCommit = false;
    return true;
  }
  return cpu.fault;
}

function isSuper(cpu) {
  return (((cpu.sr & SR_S) >>> 0) != 0);
}

function sizeMask(size) {
  if ((size == 0)) {
    return 255;
  }
  if ((size == 1)) {
    return 65535;
  }
  return 4294967295;
}

function sizeMsb(size) {
  if ((size == 0)) {
    return 128;
  }
  if ((size == 1)) {
    return 32768;
  }
  return 2147483648;
}

function sizeBytes(size) {
  if ((size == 0)) {
    return 1;
  }
  if ((size == 1)) {
    return 2;
  }
  return 4;
}

function signExtend(val, size) {
  const m = sizeMask(size);
  const v = ((val & m) >>> 0);
  const msb = sizeMsb(size);
  if ((((v & msb) >>> 0) != 0)) {
    return __ovf((v - __ovf((m + 1), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function getD(cpu, n, size) {
  return ((__idx(cpu.d, n) & sizeMask(size)) >>> 0);
}

function setD(cpu, n, size, val) {
  const m = sizeMask(size);
  __idxSet(cpu.d, n, ((((__idx(cpu.d, n) & (~m)) >>> 0) | ((val & m) >>> 0)) >>> 0));
}

function setA(cpu, n, size, val) {
  if ((size == 1)) {
    __idxSet(cpu.a, n, ((signExtend(val, 1) & 4294967295) >>> 0));
  } else {
    __idxSet(cpu.a, n, ((val & 4294967295) >>> 0));
  }
}

function fetch16(cpu, m) {
  const w = memRead16(m, cpu.pc);
  cpu.pc = ((__ovf((cpu.pc + 2), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
  return w;
}

function fetch32(cpu, m) {
  const hi = fetch16(cpu, m);
  const lo = fetch16(cpu, m);
  return ((Math.trunc(hi * 2 ** (__sh(16, 64))) | lo) >>> 0);
}

function incrStep(reg, size) {
  const b = sizeBytes(size);
  if (((reg == 7) && (b == 1))) {
    return 2;
  }
  return b;
}

function briefIndex(cpu, ext) {
  const ri = ((Math.floor(ext / 2 ** (__sh(12, 64))) & 7) >>> 0);
  const isAddr = (((ext & 32768) >>> 0) != 0);
  let idx = (() => {
  if (isAddr) {
    return __idx(cpu.a, ri);
  } else {
    return __idx(cpu.d, ri);
  }
  })();
  if ((((ext & 2048) >>> 0) == 0)) {
    return signExtend(idx, 1);
  }
  return signExtend(idx, 2);
}

function resolveEa(cpu, m, mode, reg, size) {
  if ((mode == 0)) {
    return Ea.DReg(reg);
  }
  if ((mode == 1)) {
    return Ea.AReg(reg);
  }
  if ((mode == 2)) {
    return Ea.MemAddr(((__idx(cpu.a, reg) & 4294967295) >>> 0));
  }
  if ((mode == 3)) {
    const addr = ((__idx(cpu.a, reg) & 4294967295) >>> 0);
    __idxSet(cpu.a, reg, ((__ovf((__idx(cpu.a, reg) + incrStep(reg, size)), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
    return Ea.MemAddr(addr);
  }
  if ((mode == 4)) {
    __idxSet(cpu.a, reg, ((__ovf((__idx(cpu.a, reg) - incrStep(reg, size)), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
    return Ea.MemAddr(((__idx(cpu.a, reg) & 4294967295) >>> 0));
  }
  if ((mode == 5)) {
    const d16 = signExtend(fetch16(cpu, m), 1);
    return Ea.MemAddr(((__ovf((__idx(cpu.a, reg) + d16), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  }
  if ((mode == 6)) {
    const base = __idx(cpu.a, reg);
    const ext = fetch16(cpu, m);
    const disp = signExtend(((ext & 255) >>> 0), 0);
    return Ea.MemAddr(((__ovf((__ovf((base + disp), -9223372036854775808, 9223372036854775807) + briefIndex(cpu, ext)), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  }
  if ((reg == 0)) {
    return Ea.MemAddr(((signExtend(fetch16(cpu, m), 1) & 4294967295) >>> 0));
  }
  if ((reg == 1)) {
    return Ea.MemAddr(((fetch32(cpu, m) & 4294967295) >>> 0));
  }
  if ((reg == 2)) {
    const base = cpu.pc;
    const d16 = signExtend(fetch16(cpu, m), 1);
    return Ea.MemAddr(((__ovf((base + d16), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  }
  if ((reg == 3)) {
    const base = cpu.pc;
    const ext = fetch16(cpu, m);
    const disp = signExtend(((ext & 255) >>> 0), 0);
    return Ea.MemAddr(((__ovf((__ovf((base + disp), -9223372036854775808, 9223372036854775807) + briefIndex(cpu, ext)), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  }
  if ((size == 2)) {
    return Ea.Imm(fetch32(cpu, m));
  }
  return Ea.Imm(((fetch16(cpu, m) & sizeMask(size)) >>> 0));
}

function eaLoad(cpu, m, ea, size) {
  const _t19 = ea;
  if (_t19.tag === 0) {
    const n = _t19.data[0];
    return getD(cpu, n, size);
  } else if (_t19.tag === 1) {
    const n = _t19.data[0];
    return ((signExtend(__idx(cpu.a, n), size) & sizeMask(size)) >>> 0);
  } else if (_t19.tag === 2) {
    const addr = _t19.data[0];
    if (checkAlign(cpu, addr, size, true, false)) {
      return 0;
    }
    if ((size == 0)) {
      return memRead8(m, addr);
    }
    if ((size == 1)) {
      return memRead16(m, addr);
    }
    return memRead32(m, addr);
  } else if (_t19.tag === 3) {
    const v = _t19.data[0];
    return ((v & sizeMask(size)) >>> 0);
  }
}

function eaStore(cpu, m, ea, size, val) {
  const _t20 = ea;
  if (_t20.tag === 0) {
    const n = _t20.data[0];
    setD(cpu, n, size, val);
  } else if (_t20.tag === 1) {
    const n = _t20.data[0];
    setA(cpu, n, size, val);
  } else if (_t20.tag === 2) {
    const addr = _t20.data[0];
    if (checkAlign(cpu, addr, size, false, false)) {
      return;
    }
    if ((size == 0)) {
      memWrite8(m, addr, val);
    } else {
      if ((size == 1)) {
        memWrite16(m, addr, val);
      } else {
        memWrite32(m, addr, val);
      }
    }
  } else if (_t20.tag === 3) {
    const v = _t20.data[0];
  }
}

function setBit(cpu, bit, on) {
  if (on) {
    cpu.sr = ((cpu.sr | bit) >>> 0);
  } else {
    cpu.sr = ((cpu.sr & (~bit)) >>> 0);
  }
}

function getBit(cpu, bit) {
  return (((cpu.sr & bit) >>> 0) != 0);
}

function setNZ(cpu, size, res) {
  const r = ((res & sizeMask(size)) >>> 0);
  setBit(cpu, SR_N, (((r & sizeMsb(size)) >>> 0) != 0));
  setBit(cpu, SR_Z, (r == 0));
}

function setLogicalFlags(cpu, size, res) {
  setNZ(cpu, size, res);
  setBit(cpu, SR_V, false);
  setBit(cpu, SR_C, false);
}

function addFlags(cpu, size, a, b, res, withX) {
  const mask = sizeMask(size);
  const msb = sizeMsb(size);
  const ua = ((a & mask) >>> 0);
  const ub = ((b & mask) >>> 0);
  const r = ((res & mask) >>> 0);
  const carry = (__ovf((ua + ub), -9223372036854775808, 9223372036854775807) > mask);
  const overflow = ((((((~((a ^ b) >>> 0)) & ((a ^ res) >>> 0)) >>> 0) & msb) >>> 0) != 0);
  setNZ(cpu, size, r);
  setBit(cpu, SR_V, overflow);
  setBit(cpu, SR_C, carry);
  if (withX) {
    setBit(cpu, SR_X, carry);
  }
}

function subFlags(cpu, size, a, b, res, withX) {
  const mask = sizeMask(size);
  const msb = sizeMsb(size);
  const ua = ((a & mask) >>> 0);
  const ub = ((b & mask) >>> 0);
  const r = ((res & mask) >>> 0);
  const borrow = (ub > ua);
  const overflow = (((((((a ^ b) >>> 0) & ((a ^ res) >>> 0)) >>> 0) & msb) >>> 0) != 0);
  setNZ(cpu, size, r);
  setBit(cpu, SR_V, overflow);
  setBit(cpu, SR_C, borrow);
  if (withX) {
    setBit(cpu, SR_X, borrow);
  }
}

function testCond(cpu, cond) {
  const c = getBit(cpu, SR_C);
  const v = getBit(cpu, SR_V);
  const z = getBit(cpu, SR_Z);
  const n = getBit(cpu, SR_N);
  if ((cond == 0)) {
    return true;
  }
  if ((cond == 1)) {
    return false;
  }
  if ((cond == 2)) {
    return ((!c) && (!z));
  }
  if ((cond == 3)) {
    return (c || z);
  }
  if ((cond == 4)) {
    return (!c);
  }
  if ((cond == 5)) {
    return c;
  }
  if ((cond == 6)) {
    return (!z);
  }
  if ((cond == 7)) {
    return z;
  }
  if ((cond == 8)) {
    return (!v);
  }
  if ((cond == 9)) {
    return v;
  }
  if ((cond == 10)) {
    return (!n);
  }
  if ((cond == 11)) {
    return n;
  }
  if ((cond == 12)) {
    return (n == v);
  }
  if ((cond == 13)) {
    return (n != v);
  }
  if ((cond == 14)) {
    return ((!z) && (n == v));
  }
  return (z || (n != v));
}

function pushLong(cpu, m, val) {
  __idxSet(cpu.a, 7, ((__ovf((__idx(cpu.a, 7) - 4), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  memWrite32(m, __idx(cpu.a, 7), val);
}

function pushWord(cpu, m, val) {
  __idxSet(cpu.a, 7, ((__ovf((__idx(cpu.a, 7) - 2), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  memWrite16(m, __idx(cpu.a, 7), ((val & 65535) >>> 0));
}

function raiseAddressError(cpu, m, ir) {
  const oldSr = cpu.sr;
  const wasSuper = (((oldSr & SR_S) >>> 0) != 0);
  cpu.sr = ((((cpu.sr | SR_S) >>> 0) & (~SR_T)) >>> 0);
  if ((!wasSuper)) {
    const tmp = __idx(cpu.a, 7);
    __idxSet(cpu.a, 7, cpu.otherSp);
    cpu.otherSp = tmp;
  }
  let fc = 1;
  if (cpu.faultIN) {
    if (wasSuper) {
      fc = 6;
    } else {
      fc = 2;
    }
  } else {
    if (wasSuper) {
      fc = 5;
    } else {
      fc = 1;
    }
  }
  let ssw = fc;
  if (cpu.faultRW) {
    ssw = ((ssw | 16) >>> 0);
  }
  if ((!cpu.faultIN)) {
    ssw = ((ssw | 8) >>> 0);
  }
  const faultPc = cpu.pc;
  cpu.fault = false;
  pushLong(cpu, m, faultPc);
  pushWord(cpu, m, oldSr);
  pushWord(cpu, m, ir);
  pushLong(cpu, m, cpu.faultAddr);
  pushWord(cpu, m, ssw);
  cpu.pc = ((memRead32(m, __ovf((3 * 4), -9223372036854775808, 9223372036854775807)) & 4294967295) >>> 0);
}

function popLong(cpu, m) {
  const v = memRead32(m, __idx(cpu.a, 7));
  __idxSet(cpu.a, 7, ((__ovf((__idx(cpu.a, 7) + 4), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  return v;
}

function popWord(cpu, m) {
  const v = memRead16(m, __idx(cpu.a, 7));
  __idxSet(cpu.a, 7, ((__ovf((__idx(cpu.a, 7) + 2), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
  return v;
}

function privViolation(cpu, m) {
  if ((((cpu.sr & SR_S) >>> 0) == 0)) {
    cpu.pc = ((__ovf((cpu.pc - 2), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
    raiseException(cpu, m, 8);
    return true;
  }
  return false;
}

function setSr(cpu, newSr) {
  const oldS = (((cpu.sr & SR_S) >>> 0) != 0);
  cpu.sr = ((newSr & 65535) >>> 0);
  if ((oldS != (((cpu.sr & SR_S) >>> 0) != 0))) {
    const tmp = __idx(cpu.a, 7);
    __idxSet(cpu.a, 7, cpu.otherSp);
    cpu.otherSp = tmp;
  }
}

function deliverInterrupt(cpu, m, level) {
  const curMask = ((Math.floor(cpu.sr / 2 ** (__sh(8, 64))) & 7) >>> 0);
  if (((level != 7) && (level <= curMask))) {
    return false;
  }
  const oldSr = cpu.sr;
  const wasSuper = (((oldSr & SR_S) >>> 0) != 0);
  cpu.sr = ((((cpu.sr & (~1792)) >>> 0) | Math.trunc(((level & 7) >>> 0) * 2 ** (__sh(8, 64)))) >>> 0);
  cpu.sr = ((((cpu.sr | SR_S) >>> 0) & (~SR_T)) >>> 0);
  if ((!wasSuper)) {
    const tmp = __idx(cpu.a, 7);
    __idxSet(cpu.a, 7, cpu.otherSp);
    cpu.otherSp = tmp;
  }
  cpu.halted = false;
  pushLong(cpu, m, cpu.pc);
  pushWord(cpu, m, oldSr);
  cpu.pc = ((memRead32(m, __ovf((__ovf((24 + level), -9223372036854775808, 9223372036854775807) * 4), -9223372036854775808, 9223372036854775807)) & 4294967295) >>> 0);
  return true;
}

function raiseException(cpu, m, vec) {
  const oldSr = cpu.sr;
  const wasSuper = (((oldSr & SR_S) >>> 0) != 0);
  cpu.sr = ((((cpu.sr | SR_S) >>> 0) & (~SR_T)) >>> 0);
  if ((!wasSuper)) {
    const tmp = __idx(cpu.a, 7);
    __idxSet(cpu.a, 7, cpu.otherSp);
    cpu.otherSp = tmp;
  }
  pushLong(cpu, m, cpu.pc);
  pushWord(cpu, m, oldSr);
  cpu.pc = ((memRead32(m, __ovf((vec * 4), -9223372036854775808, 9223372036854775807)) & 4294967295) >>> 0);
}

function setPc(cpu, target) {
  const t = ((target & 4294967295) >>> 0);
  cpu.pc = t;
  if (((((t & 1) >>> 0) != 0) && (!cpu.fault))) {
    cpu.fault = true;
    cpu.faultAddr = t;
    cpu.faultRW = true;
    cpu.faultIN = true;
    cpu.faultCommit = true;
  }
}

function step(cpu, m) {
  if (cpu.halted) {
    return false;
  }
  if ((((cpu.pc & 1) >>> 0) != 0)) {
    cpu.fault = true;
    cpu.faultAddr = ((cpu.pc & 4294967295) >>> 0);
    cpu.faultRW = true;
    cpu.faultIN = true;
    raiseAddressError(cpu, m, memRead16(m, ((cpu.pc & (~1)) >>> 0)));
    return true;
  }
  let savedD = [0, 0, 0, 0, 0, 0, 0, 0];
  let si = 0;
  while ((si < 8)) {
    __idxSet(savedD, si, __idx(cpu.d, si));
    si = __ovf((si + 1), -9223372036854775808, 9223372036854775807);
  }
  const savedSr = cpu.sr;
  const op = fetch16(cpu, m);
  const ran = decode(cpu, m, op);
  if (cpu.fault) {
    if ((!cpu.faultCommit)) {
      si = 0;
      while ((si < 8)) {
        __idxSet(cpu.d, si, __idx(savedD, si));
        si = __ovf((si + 1), -9223372036854775808, 9223372036854775807);
      }
      cpu.sr = savedSr;
    }
    raiseAddressError(cpu, m, op);
    return true;
  }
  return ran;
}

function decode(cpu, m, op) {
  const top = ((Math.floor(op / 2 ** (__sh(12, 64))) & 15) >>> 0);
  if ((top == 1)) {
    return execMove(cpu, m, op, 0);
  }
  if ((top == 3)) {
    return execMove(cpu, m, op, 1);
  }
  if ((top == 2)) {
    return execMove(cpu, m, op, 2);
  }
  if ((top == 7)) {
    if ((((op & 256) >>> 0) == 0)) {
      const reg = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
      const val = signExtend(((op & 255) >>> 0), 0);
      setD(cpu, reg, 2, ((val & 4294967295) >>> 0));
      setLogicalFlags(cpu, 2, val);
      return true;
    }
    return false;
  }
  if ((top == 6)) {
    return execBranch(cpu, m, op);
  }
  if ((top == 5)) {
    return execAddqSubq(cpu, m, op);
  }
  if ((top == 13)) {
    return execAddSub(cpu, m, op, true);
  }
  if ((top == 9)) {
    return execAddSub(cpu, m, op, false);
  }
  if ((top == 11)) {
    return execCmpEor(cpu, m, op);
  }
  if ((top == 12)) {
    return execAnd(cpu, m, op);
  }
  if ((top == 8)) {
    return execOr(cpu, m, op);
  }
  if ((top == 4)) {
    return execMisc(cpu, m, op);
  }
  if ((top == 14)) {
    return execShift(cpu, m, op);
  }
  if ((top == 0)) {
    return execImmediate(cpu, m, op);
  }
  return false;
}

function doShift(cpu, val, size, cnt, sty, left) {
  const mask = sizeMask(size);
  const msb = sizeMsb(size);
  let v = ((val & mask) >>> 0);
  let carry = false;
  let overflow = false;
  let xf = getBit(cpu, SR_X);
  let i = 0;
  while ((i < cnt)) {
    if (left) {
      const msbBit = (((v & msb) >>> 0) != 0);
      let newLsb = false;
      if ((sty == 2)) {
        newLsb = xf;
        carry = msbBit;
        xf = msbBit;
      } else {
        if ((sty == 3)) {
          carry = msbBit;
          newLsb = msbBit;
        } else {
          carry = msbBit;
          xf = msbBit;
        }
      }
      v = ((((Math.trunc(v * 2 ** (__sh(1, 64))) | (() => {
      if (newLsb) {
        return 1;
      } else {
        return 0;
      }
      })()) >>> 0) & mask) >>> 0);
      if (((sty == 0) && ((((v & msb) >>> 0) != 0) != msbBit))) {
        overflow = true;
      }
    } else {
      const lsbBit = (((v & 1) >>> 0) != 0);
      let newMsb = false;
      if ((sty == 0)) {
        newMsb = (((v & msb) >>> 0) != 0);
        carry = lsbBit;
        xf = lsbBit;
      } else {
        if ((sty == 1)) {
          carry = lsbBit;
          xf = lsbBit;
        } else {
          if ((sty == 3)) {
            carry = lsbBit;
            newMsb = lsbBit;
          } else {
            newMsb = xf;
            carry = lsbBit;
            xf = lsbBit;
          }
        }
      }
      v = ((((Math.floor(v / 2 ** (__sh(1, 64))) | (() => {
      if (newMsb) {
        return msb;
      } else {
        return 0;
      }
      })()) >>> 0) & mask) >>> 0);
    }
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  setNZ(cpu, size, v);
  setBit(cpu, SR_V, (((sty == 0) && left) && overflow));
  if ((cnt == 0)) {
    if ((sty == 2)) {
      setBit(cpu, SR_C, getBit(cpu, SR_X));
    } else {
      setBit(cpu, SR_C, false);
    }
  } else {
    setBit(cpu, SR_C, carry);
    if ((sty != 3)) {
      setBit(cpu, SR_X, xf);
    }
  }
  return v;
}

function execShift(cpu, m, op) {
  const left = (((op & 256) >>> 0) != 0);
  if ((((op & 192) >>> 0) == 192)) {
    const sty = ((Math.floor(op / 2 ** (__sh(9, 64))) & 3) >>> 0);
    const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
    const reg = ((op & 7) >>> 0);
    const ea = resolveEa(cpu, m, mode, reg, 1);
    const v = eaLoad(cpu, m, ea, 1);
    const r = doShift(cpu, v, 1, 1, sty, left);
    eaStore(cpu, m, ea, 1, r);
    return true;
  }
  const size = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  const sty = ((Math.floor(op / 2 ** (__sh(3, 64))) & 3) >>> 0);
  const ir = ((Math.floor(op / 2 ** (__sh(5, 64))) & 1) >>> 0);
  const reg = ((op & 7) >>> 0);
  let cnt = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  if ((ir == 0)) {
    if ((cnt == 0)) {
      cnt = 8;
    }
  } else {
    cnt = ((getD(cpu, ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0), 2) & 63) >>> 0);
  }
  const v = getD(cpu, reg, size);
  const r = doShift(cpu, v, size, cnt, sty, left);
  setD(cpu, reg, size, r);
  return true;
}

function execImmediate(cpu, m, op) {
  if ((((op & 61752) >>> 0) == 264)) {
    return execMovep(cpu, m, op);
  }
  const dynamicBit = (((op & 256) >>> 0) != 0);
  const staticBit = (((op & 65280) >>> 0) == 2048);
  if ((dynamicBit || staticBit)) {
    return execBitOp(cpu, m, op, staticBit);
  }
  const which = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const size = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  if ((size == 3)) {
    return false;
  }
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  if ((((mode == 7) && (reg == 4)) && (((which == 0) || (which == 1)) || (which == 5)))) {
    const imm = fetch16(cpu, m);
    if ((size == 0)) {
      const ccr = ((cpu.sr & 31) >>> 0);
      const r = ((applyLogic(which, ccr, ((imm & 31) >>> 0)) & 31) >>> 0);
      cpu.sr = ((((cpu.sr & (~31)) >>> 0) | r) >>> 0);
      return true;
    }
    const oldS = (((cpu.sr & SR_S) >>> 0) != 0);
    const r = ((applyLogic(which, cpu.sr, imm) & 42783) >>> 0);
    cpu.sr = r;
    if ((oldS != (((r & SR_S) >>> 0) != 0))) {
      const tmp = __idx(cpu.a, 7);
      __idxSet(cpu.a, 7, cpu.otherSp);
      cpu.otherSp = tmp;
    }
    return true;
  }
  const imm = (() => {
  if ((size == 2)) {
    return fetch32(cpu, m);
  } else {
    return ((fetch16(cpu, m) & sizeMask(size)) >>> 0);
  }
  })();
  const ea = resolveEa(cpu, m, mode, reg, size);
  const cur = eaLoad(cpu, m, ea, size);
  if ((which == 2)) {
    const res = ((__ovf((cur - imm), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
    subFlags(cpu, size, cur, imm, res, true);
    eaStore(cpu, m, ea, size, res);
  } else {
    if ((which == 3)) {
      const res = ((__ovf((cur + imm), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
      addFlags(cpu, size, cur, imm, res, true);
      eaStore(cpu, m, ea, size, res);
    } else {
      if ((which == 6)) {
        const res = ((__ovf((cur - imm), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
        subFlags(cpu, size, cur, imm, res, false);
      } else {
        const res = ((applyLogic(which, cur, imm) & sizeMask(size)) >>> 0);
        eaStore(cpu, m, ea, size, res);
        setLogicalFlags(cpu, size, res);
      }
    }
  }
  return true;
}

function execMovep(cpu, m, op) {
  const dreg = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const areg = ((op & 7) >>> 0);
  const opmode = ((Math.floor(op / 2 ** (__sh(6, 64))) & 7) >>> 0);
  const disp = signExtend(fetch16(cpu, m), 1);
  const addr = ((__ovf((__idx(cpu.a, areg) + disp), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
  const isLong = (((opmode & 1) >>> 0) != 0);
  const toMem = (((opmode & 2) >>> 0) != 0);
  if (toMem) {
    const d = ((__idx(cpu.d, dreg) & 4294967295) >>> 0);
    if (isLong) {
      memWrite8(m, addr, ((Math.floor(d / 2 ** (__sh(24, 64))) & 255) >>> 0));
      memWrite8(m, ((__ovf((addr + 2), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0), ((Math.floor(d / 2 ** (__sh(16, 64))) & 255) >>> 0));
      memWrite8(m, ((__ovf((addr + 4), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0), ((Math.floor(d / 2 ** (__sh(8, 64))) & 255) >>> 0));
      memWrite8(m, ((__ovf((addr + 6), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0), ((d & 255) >>> 0));
    } else {
      memWrite8(m, addr, ((Math.floor(d / 2 ** (__sh(8, 64))) & 255) >>> 0));
      memWrite8(m, ((__ovf((addr + 2), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0), ((d & 255) >>> 0));
    }
  } else {
    if (isLong) {
      const v = ((((((((Math.trunc(memRead8(m, addr) * 2 ** (__sh(24, 64))) | Math.trunc(memRead8(m, ((__ovf((addr + 2), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0)) * 2 ** (__sh(16, 64)))) >>> 0) | Math.trunc(memRead8(m, ((__ovf((addr + 4), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0)) * 2 ** (__sh(8, 64)))) >>> 0) | memRead8(m, ((__ovf((addr + 6), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0))) >>> 0) & 4294967295) >>> 0);
      __idxSet(cpu.d, dreg, v);
    } else {
      const v = ((((Math.trunc(memRead8(m, addr) * 2 ** (__sh(8, 64))) | memRead8(m, ((__ovf((addr + 2), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0))) >>> 0) & 65535) >>> 0);
      setD(cpu, dreg, 1, v);
    }
  }
  return true;
}

function applyLogic(which, a, b) {
  if ((which == 0)) {
    return ((a | b) >>> 0);
  }
  if ((which == 1)) {
    return ((a & b) >>> 0);
  }
  return ((a ^ b) >>> 0);
}

function execBitOp(cpu, m, op, isStatic) {
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  let bitNum = 0;
  if (isStatic) {
    bitNum = ((fetch16(cpu, m) & 255) >>> 0);
  } else {
    bitNum = ((getD(cpu, ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0), 2) & 255) >>> 0);
  }
  const opType = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  if ((mode == 0)) {
    const b = ((bitNum & 31) >>> 0);
    const v = ((__idx(cpu.d, reg) & 4294967295) >>> 0);
    const bit = ((Math.floor(v / 2 ** (__sh(b, 64))) & 1) >>> 0);
    setBit(cpu, SR_Z, (bit == 0));
    if ((opType == 1)) {
      __idxSet(cpu.d, reg, ((v ^ Math.trunc(1 * 2 ** (__sh(b, 64)))) >>> 0));
    } else {
      if ((opType == 2)) {
        __idxSet(cpu.d, reg, ((v & (~Math.trunc(1 * 2 ** (__sh(b, 64))))) >>> 0));
      } else {
        if ((opType == 3)) {
          __idxSet(cpu.d, reg, ((v | Math.trunc(1 * 2 ** (__sh(b, 64)))) >>> 0));
        }
      }
    }
    return true;
  }
  const b = ((bitNum & 7) >>> 0);
  const ea = resolveEa(cpu, m, mode, reg, 0);
  const v = eaLoad(cpu, m, ea, 0);
  const bit = ((Math.floor(v / 2 ** (__sh(b, 64))) & 1) >>> 0);
  setBit(cpu, SR_Z, (bit == 0));
  if ((opType == 1)) {
    eaStore(cpu, m, ea, 0, ((v ^ Math.trunc(1 * 2 ** (__sh(b, 64)))) >>> 0));
  } else {
    if ((opType == 2)) {
      eaStore(cpu, m, ea, 0, ((v & (~Math.trunc(1 * 2 ** (__sh(b, 64))))) >>> 0));
    } else {
      if ((opType == 3)) {
        eaStore(cpu, m, ea, 0, ((v | Math.trunc(1 * 2 ** (__sh(b, 64)))) >>> 0));
      }
    }
  }
  return true;
}

function execMove(cpu, m, op, size) {
  const srcMode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const srcReg = ((op & 7) >>> 0);
  const dstMode = ((Math.floor(op / 2 ** (__sh(6, 64))) & 7) >>> 0);
  const dstReg = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const srcEa = resolveEa(cpu, m, srcMode, srcReg, size);
  const val = eaLoad(cpu, m, srcEa, size);
  if ((dstMode == 1)) {
    setA(cpu, dstReg, size, signExtend(val, size));
    return true;
  }
  const dstEa = resolveEa(cpu, m, dstMode, dstReg, size);
  eaStore(cpu, m, dstEa, size, val);
  setLogicalFlags(cpu, size, val);
  return true;
}

function execBranch(cpu, m, op) {
  const cond = ((Math.floor(op / 2 ** (__sh(8, 64))) & 15) >>> 0);
  const disp8 = ((op & 255) >>> 0);
  const base = cpu.pc;
  let disp = signExtend(disp8, 0);
  if ((disp8 == 0)) {
    disp = signExtend(fetch16(cpu, m), 1);
  }
  const target = ((__ovf((base + disp), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
  if ((cond == 1)) {
    pushLong(cpu, m, cpu.pc);
    setPc(cpu, target);
    return true;
  }
  if ((cond == 0)) {
    setPc(cpu, target);
    return true;
  }
  if (testCond(cpu, cond)) {
    setPc(cpu, target);
  }
  return true;
}

function execAddqSubq(cpu, m, op) {
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  const size = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  if ((size == 3)) {
    const cond = ((Math.floor(op / 2 ** (__sh(8, 64))) & 15) >>> 0);
    if ((mode == 1)) {
      const base = cpu.pc;
      const disp = signExtend(fetch16(cpu, m), 1);
      if (testCond(cpu, cond)) {
        return true;
      }
      const cnt = ((__ovf((getD(cpu, reg, 1) - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
      setD(cpu, reg, 1, cnt);
      if ((cnt != 65535)) {
        setPc(cpu, __ovf((base + disp), -9223372036854775808, 9223372036854775807));
      }
      return true;
    }
    const ea = resolveEa(cpu, m, mode, reg, 0);
    const v = (() => {
    if (testCond(cpu, cond)) {
      return 255;
    } else {
      return 0;
    }
    })();
    eaStore(cpu, m, ea, 0, v);
    return true;
  }
  let data = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  if ((data == 0)) {
    data = 8;
  }
  const isSub = (((op & 256) >>> 0) != 0);
  const ea = resolveEa(cpu, m, mode, reg, size);
  if ((mode == 1)) {
    const cur = __idx(cpu.a, reg);
    const res = (() => {
    if (isSub) {
      return __ovf((cur - data), -9223372036854775808, 9223372036854775807);
    } else {
      return __ovf((cur + data), -9223372036854775808, 9223372036854775807);
    }
    })();
    __idxSet(cpu.a, reg, ((res & 4294967295) >>> 0));
    return true;
  }
  const cur = eaLoad(cpu, m, ea, size);
  if (isSub) {
    const res = ((__ovf((cur - data), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
    subFlags(cpu, size, cur, data, res, true);
    eaStore(cpu, m, ea, size, res);
  } else {
    const res = ((__ovf((cur + data), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
    addFlags(cpu, size, cur, data, res, true);
    eaStore(cpu, m, ea, size, res);
  }
  return true;
}

function execAddSubX(cpu, m, op, isAdd, size) {
  const rx = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const ry = ((op & 7) >>> 0);
  const mem = (((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0) == 1);
  const mask = sizeMask(size);
  const msb = sizeMsb(size);
  const bytes = sizeBytes(size);
  const x = (() => {
  if (getBit(cpu, SR_X)) {
    return 1;
  } else {
    return 0;
  }
  })();
  let a = 0;
  let b = 0;
  let addr = 0;
  if (mem) {
    const decY = (() => {
    if (((size == 0) && (ry == 7))) {
      return 2;
    } else {
      return bytes;
    }
    })();
    __idxSet(cpu.a, ry, ((__ovf((__idx(cpu.a, ry) - decY), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
    b = readSized(m, __idx(cpu.a, ry), size);
    const decX = (() => {
    if (((size == 0) && (rx == 7))) {
      return 2;
    } else {
      return bytes;
    }
    })();
    __idxSet(cpu.a, rx, ((__ovf((__idx(cpu.a, rx) - decX), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
    addr = __idx(cpu.a, rx);
    a = readSized(m, addr, size);
  } else {
    a = getD(cpu, rx, size);
    b = getD(cpu, ry, size);
  }
  const ua = ((a & mask) >>> 0);
  const ub = ((b & mask) >>> 0);
  let res = 0;
  let carry = false;
  let overflow = false;
  if (isAdd) {
    const full = __ovf((__ovf((ua + ub), -9223372036854775808, 9223372036854775807) + x), -9223372036854775808, 9223372036854775807);
    res = ((full & mask) >>> 0);
    carry = (full > mask);
    overflow = ((((((~((a ^ b) >>> 0)) & ((a ^ res) >>> 0)) >>> 0) & msb) >>> 0) != 0);
  } else {
    res = ((__ovf((__ovf((ua - ub), -9223372036854775808, 9223372036854775807) - x), -9223372036854775808, 9223372036854775807) & mask) >>> 0);
    carry = (__ovf((ub + x), -9223372036854775808, 9223372036854775807) > ua);
    overflow = (((((((a ^ b) >>> 0) & ((a ^ res) >>> 0)) >>> 0) & msb) >>> 0) != 0);
  }
  setBit(cpu, SR_N, (((res & msb) >>> 0) != 0));
  setBit(cpu, SR_V, overflow);
  setBit(cpu, SR_C, carry);
  setBit(cpu, SR_X, carry);
  if ((res != 0)) {
    setBit(cpu, SR_Z, false);
  }
  if (mem) {
    writeSized(m, addr, size, res);
  } else {
    setD(cpu, rx, size, res);
  }
}

function execExg(cpu, op, opmode, mode) {
  const rx = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const ry = ((op & 7) >>> 0);
  if (((opmode == 5) && (mode == 0))) {
    const t = __idx(cpu.d, rx);
    __idxSet(cpu.d, rx, __idx(cpu.d, ry));
    __idxSet(cpu.d, ry, t);
  } else {
    if (((opmode == 5) && (mode == 1))) {
      const t = __idx(cpu.a, rx);
      __idxSet(cpu.a, rx, __idx(cpu.a, ry));
      __idxSet(cpu.a, ry, t);
    } else {
      if (((opmode == 6) && (mode == 1))) {
        const t = __idx(cpu.d, rx);
        __idxSet(cpu.d, rx, __idx(cpu.a, ry));
        __idxSet(cpu.a, ry, t);
      }
    }
  }
}

function bcdAdd(cpu, srcB, dstB) {
  const x = (() => {
  if (getBit(cpu, SR_X)) {
    return 1;
  } else {
    return 0;
  }
  })();
  let res = __ovf((__ovf((((srcB & 15) >>> 0) + ((dstB & 15) >>> 0)), -9223372036854775808, 9223372036854775807) + x), -9223372036854775808, 9223372036854775807);
  let v = (((~res) & 4294967295) >>> 0);
  if ((res > 9)) {
    res = __ovf((res + 6), -9223372036854775808, 9223372036854775807);
  }
  res = __ovf((__ovf((res + ((srcB & 240) >>> 0)), -9223372036854775808, 9223372036854775807) + ((dstB & 240) >>> 0)), -9223372036854775808, 9223372036854775807);
  const c = (res > 153);
  if (c) {
    res = __ovf((res - 160), -9223372036854775808, 9223372036854775807);
  }
  res = ((res & 4294967295) >>> 0);
  v = ((v & res) >>> 0);
  const res8 = ((res & 255) >>> 0);
  setBit(cpu, SR_N, (((res & 128) >>> 0) != 0));
  setBit(cpu, SR_V, (((v & 128) >>> 0) != 0));
  setBit(cpu, SR_C, c);
  setBit(cpu, SR_X, c);
  if ((res8 != 0)) {
    setBit(cpu, SR_Z, false);
  }
  return res8;
}

function bcdSub(cpu, srcB, dstB) {
  const x = (() => {
  if (getBit(cpu, SR_X)) {
    return 1;
  } else {
    return 0;
  }
  })();
  let res = ((__ovf((__ovf((((dstB & 15) >>> 0) - ((srcB & 15) >>> 0)), -9223372036854775808, 9223372036854775807) - x), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
  let v = (((~res) & 4294967295) >>> 0);
  if ((res > 9)) {
    res = ((__ovf((res - 6), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
  }
  res = ((__ovf((__ovf((res + ((dstB & 240) >>> 0)), -9223372036854775808, 9223372036854775807) - ((srcB & 240) >>> 0)), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
  const c = (res > 153);
  if (c) {
    res = ((__ovf((res + 160), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
  }
  v = ((v & res) >>> 0);
  const res8 = ((res & 255) >>> 0);
  setBit(cpu, SR_N, (((res & 128) >>> 0) != 0));
  setBit(cpu, SR_V, (((v & 128) >>> 0) != 0));
  setBit(cpu, SR_C, c);
  setBit(cpu, SR_X, c);
  if ((res8 != 0)) {
    setBit(cpu, SR_Z, false);
  }
  return res8;
}

function execBcdRM(cpu, m, op, isSub) {
  const rx = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const ry = ((op & 7) >>> 0);
  const mem = (((op & 8) >>> 0) != 0);
  let srcB = 0;
  let dstB = 0;
  let addr = 0;
  if (mem) {
    const decY = (() => {
    if ((ry == 7)) {
      return 2;
    } else {
      return 1;
    }
    })();
    __idxSet(cpu.a, ry, ((__ovf((__idx(cpu.a, ry) - decY), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
    srcB = memRead8(m, __idx(cpu.a, ry));
    const decX = (() => {
    if ((rx == 7)) {
      return 2;
    } else {
      return 1;
    }
    })();
    __idxSet(cpu.a, rx, ((__ovf((__idx(cpu.a, rx) - decX), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
    addr = __idx(cpu.a, rx);
    dstB = memRead8(m, addr);
  } else {
    srcB = ((__idx(cpu.d, ry) & 255) >>> 0);
    dstB = ((__idx(cpu.d, rx) & 255) >>> 0);
  }
  const res = (() => {
  if (isSub) {
    return bcdSub(cpu, srcB, dstB);
  } else {
    return bcdAdd(cpu, srcB, dstB);
  }
  })();
  if (mem) {
    memWrite8(m, addr, res);
  } else {
    setD(cpu, rx, 0, res);
  }
}

function readSized(m, addr, size) {
  if ((size == 0)) {
    return memRead8(m, addr);
  }
  if ((size == 1)) {
    return memRead16(m, addr);
  }
  return memRead32(m, addr);
}

function writeSized(m, addr, size, val) {
  if ((size == 0)) {
    memWrite8(m, addr, val);
  } else {
    if ((size == 1)) {
      memWrite16(m, addr, val);
    } else {
      memWrite32(m, addr, val);
    }
  }
}

function execAddSub(cpu, m, op, isAdd) {
  const dn = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const opmode = ((Math.floor(op / 2 ** (__sh(6, 64))) & 7) >>> 0);
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  if (((opmode == 3) || (opmode == 7))) {
    const size = (() => {
    if ((opmode == 3)) {
      return 1;
    } else {
      return 2;
    }
    })();
    const ea = resolveEa(cpu, m, mode, reg, size);
    const src = signExtend(eaLoad(cpu, m, ea, size), size);
    const cur = __idx(cpu.a, dn);
    const res = (() => {
    if (isAdd) {
      return __ovf((cur + src), -9223372036854775808, 9223372036854775807);
    } else {
      return __ovf((cur - src), -9223372036854775808, 9223372036854775807);
    }
    })();
    __idxSet(cpu.a, dn, ((res & 4294967295) >>> 0));
    return true;
  }
  const size = ((opmode & 3) >>> 0);
  const toEa = (((opmode & 4) >>> 0) != 0);
  if ((toEa && ((mode == 0) || (mode == 1)))) {
    execAddSubX(cpu, m, op, isAdd, size);
    return true;
  }
  const ea = resolveEa(cpu, m, mode, reg, size);
  if (toEa) {
    const a = eaLoad(cpu, m, ea, size);
    const b = getD(cpu, dn, size);
    if (isAdd) {
      const res = ((__ovf((a + b), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
      addFlags(cpu, size, a, b, res, true);
      eaStore(cpu, m, ea, size, res);
    } else {
      const res = ((__ovf((a - b), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
      subFlags(cpu, size, a, b, res, true);
      eaStore(cpu, m, ea, size, res);
    }
  } else {
    const a = getD(cpu, dn, size);
    const b = eaLoad(cpu, m, ea, size);
    if (isAdd) {
      const res = ((__ovf((a + b), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
      addFlags(cpu, size, a, b, res, true);
      setD(cpu, dn, size, res);
    } else {
      const res = ((__ovf((a - b), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
      subFlags(cpu, size, a, b, res, true);
      setD(cpu, dn, size, res);
    }
  }
  return true;
}

function execCmpEor(cpu, m, op) {
  const dn = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const opmode = ((Math.floor(op / 2 ** (__sh(6, 64))) & 7) >>> 0);
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  if (((opmode == 3) || (opmode == 7))) {
    const size = (() => {
    if ((opmode == 3)) {
      return 1;
    } else {
      return 2;
    }
    })();
    const ea = resolveEa(cpu, m, mode, reg, size);
    const src = signExtend(eaLoad(cpu, m, ea, size), size);
    const a = __idx(cpu.a, dn);
    const res = ((__ovf((a - src), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
    subFlags(cpu, 2, a, src, res, false);
    return true;
  }
  const size = ((opmode & 3) >>> 0);
  if ((((opmode & 4) >>> 0) == 0)) {
    const ea = resolveEa(cpu, m, mode, reg, size);
    const b = eaLoad(cpu, m, ea, size);
    const a = getD(cpu, dn, size);
    const res = ((__ovf((a - b), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
    subFlags(cpu, size, a, b, res, false);
    return true;
  }
  if ((mode == 1)) {
    const ea1 = resolveEa(cpu, m, 3, reg, size);
    const ea2 = resolveEa(cpu, m, 3, dn, size);
    const s = eaLoad(cpu, m, ea1, size);
    const d = eaLoad(cpu, m, ea2, size);
    const res = ((__ovf((d - s), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
    subFlags(cpu, size, d, s, res, false);
    return true;
  }
  const ea = resolveEa(cpu, m, mode, reg, size);
  const a = eaLoad(cpu, m, ea, size);
  const res = ((((a ^ getD(cpu, dn, size)) >>> 0) & sizeMask(size)) >>> 0);
  eaStore(cpu, m, ea, size, res);
  setLogicalFlags(cpu, size, res);
  return true;
}

function execAnd(cpu, m, op) {
  const dn = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const opmode = ((Math.floor(op / 2 ** (__sh(6, 64))) & 7) >>> 0);
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  const size = ((opmode & 3) >>> 0);
  if ((((mode == 0) || (mode == 1)) && (((opmode == 4) || (opmode == 5)) || (opmode == 6)))) {
    if ((opmode == 4)) {
      execBcdRM(cpu, m, op, false);
    } else {
      execExg(cpu, op, opmode, mode);
    }
    return true;
  }
  if ((size == 3)) {
    const ea = resolveEa(cpu, m, mode, reg, 1);
    const src = ((eaLoad(cpu, m, ea, 1) & 65535) >>> 0);
    let res = 0;
    if ((((opmode & 4) >>> 0) == 0)) {
      res = __ovf((((getD(cpu, dn, 1) & 65535) >>> 0) * src), -9223372036854775808, 9223372036854775807);
    } else {
      res = ((__ovf((signExtend(getD(cpu, dn, 1), 1) * signExtend(src, 1)), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
    }
    setD(cpu, dn, 2, ((res & 4294967295) >>> 0));
    setLogicalFlags(cpu, 2, res);
    return true;
  }
  const ea = resolveEa(cpu, m, mode, reg, size);
  if ((((opmode & 4) >>> 0) == 0)) {
    const res = ((((getD(cpu, dn, size) & eaLoad(cpu, m, ea, size)) >>> 0) & sizeMask(size)) >>> 0);
    setD(cpu, dn, size, res);
    setLogicalFlags(cpu, size, res);
  } else {
    const res = ((((eaLoad(cpu, m, ea, size) & getD(cpu, dn, size)) >>> 0) & sizeMask(size)) >>> 0);
    eaStore(cpu, m, ea, size, res);
    setLogicalFlags(cpu, size, res);
  }
  return true;
}

function execOr(cpu, m, op) {
  const dn = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
  const opmode = ((Math.floor(op / 2 ** (__sh(6, 64))) & 7) >>> 0);
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  const size = ((opmode & 3) >>> 0);
  if ((((mode == 0) || (mode == 1)) && (opmode == 4))) {
    execBcdRM(cpu, m, op, true);
    return true;
  }
  if ((size == 3)) {
    const signed = (((opmode & 4) >>> 0) != 0);
    const ea = resolveEa(cpu, m, mode, reg, 1);
    const divisorRaw = ((eaLoad(cpu, m, ea, 1) & 65535) >>> 0);
    if (cpu.fault) {
      return true;
    }
    if ((divisorRaw == 0)) {
      raiseException(cpu, m, 5);
      return true;
    }
    const dividend = ((__idx(cpu.d, dn) & 4294967295) >>> 0);
    if (signed) {
      const dv = signExtend(dividend, 2);
      const ds = signExtend(divisorRaw, 1);
      const q = quotTrunc(dv, ds);
      const r = __ovf((dv - __ovf((q * ds), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
      if (((q > 32767) || (q < __ovf((-32768), -9223372036854775808, 9223372036854775807)))) {
        setBit(cpu, SR_V, true);
        setBit(cpu, SR_C, false);
        return true;
      }
      const packed = ((Math.trunc(((r & 65535) >>> 0) * 2 ** (__sh(16, 64))) | ((q & 65535) >>> 0)) >>> 0);
      __idxSet(cpu.d, dn, ((packed & 4294967295) >>> 0));
      setBit(cpu, SR_N, (((q & 32768) >>> 0) != 0));
      setBit(cpu, SR_Z, (((q & 65535) >>> 0) == 0));
      setBit(cpu, SR_V, false);
      setBit(cpu, SR_C, false);
    } else {
      const q = __ovf(__idiv(dividend, divisorRaw), -9223372036854775808, 9223372036854775807);
      const r = __irem(dividend, divisorRaw);
      if ((q > 65535)) {
        setBit(cpu, SR_V, true);
        setBit(cpu, SR_C, false);
        return true;
      }
      const packed = ((Math.trunc(((r & 65535) >>> 0) * 2 ** (__sh(16, 64))) | ((q & 65535) >>> 0)) >>> 0);
      __idxSet(cpu.d, dn, ((packed & 4294967295) >>> 0));
      setBit(cpu, SR_N, (((q & 32768) >>> 0) != 0));
      setBit(cpu, SR_Z, (((q & 65535) >>> 0) == 0));
      setBit(cpu, SR_V, false);
      setBit(cpu, SR_C, false);
    }
    return true;
  }
  const ea = resolveEa(cpu, m, mode, reg, size);
  if ((((opmode & 4) >>> 0) == 0)) {
    const res = ((((getD(cpu, dn, size) | eaLoad(cpu, m, ea, size)) >>> 0) & sizeMask(size)) >>> 0);
    setD(cpu, dn, size, res);
    setLogicalFlags(cpu, size, res);
  } else {
    const res = ((((eaLoad(cpu, m, ea, size) | getD(cpu, dn, size)) >>> 0) & sizeMask(size)) >>> 0);
    eaStore(cpu, m, ea, size, res);
    setLogicalFlags(cpu, size, res);
  }
  return true;
}

function quotTrunc(a, b) {
  return __ovf(__idiv(a, b), -9223372036854775808, 9223372036854775807);
}

function execMovem(cpu, m, op) {
  const toReg = (((op & 1024) >>> 0) != 0);
  const long = (((op & 64) >>> 0) != 0);
  const sz = (() => {
  if (long) {
    return 2;
  } else {
    return 1;
  }
  })();
  const bytes = (() => {
  if (long) {
    return 4;
  } else {
    return 2;
  }
  })();
  const mask = fetch16(cpu, m);
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  if (((!toReg) && (mode == 4))) {
    if ((((__idx(cpu.a, reg) & 1) >>> 0) != 0)) {
      checkAlign(cpu, ((__ovf((__idx(cpu.a, reg) - bytes), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0), sz, false, false);
      return true;
    }
    let addr = ((__idx(cpu.a, reg) & 4294967295) >>> 0);
    let i = 0;
    while ((i < 16)) {
      if ((((Math.floor(mask / 2 ** (__sh(i, 64))) & 1) >>> 0) != 0)) {
        addr = ((__ovf((addr - bytes), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
        let val = 0;
        if ((i < 8)) {
          val = __idx(cpu.a, __ovf((7 - i), -9223372036854775808, 9223372036854775807));
        } else {
          val = __idx(cpu.d, __ovf((15 - i), -9223372036854775808, 9223372036854775807));
        }
        if (long) {
          memWrite32(m, addr, val);
        } else {
          memWrite16(m, addr, ((val & 65535) >>> 0));
        }
      }
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
    __idxSet(cpu.a, reg, addr);
    return true;
  }
  let addr = 0;
  if ((toReg && (mode == 3))) {
    addr = ((__idx(cpu.a, reg) & 4294967295) >>> 0);
  } else {
    const ea = resolveEa(cpu, m, mode, reg, sz);
    const _t21 = ea;
    if (_t21.tag === 2) {
      const a = _t21.data[0];
      addr = a;
    } else { // wildcard
      return false;
    }
  }
  if ((((addr & 1) >>> 0) != 0)) {
    checkAlign(cpu, addr, sz, toReg, false);
    return true;
  }
  let i = 0;
  while ((i < 16)) {
    if ((((Math.floor(mask / 2 ** (__sh(i, 64))) & 1) >>> 0) != 0)) {
      if (toReg) {
        let v = 0;
        if (long) {
          v = memRead32(m, addr);
        } else {
          v = ((signExtend(memRead16(m, addr), 1) & 4294967295) >>> 0);
        }
        if ((i < 8)) {
          __idxSet(cpu.d, i, ((v & 4294967295) >>> 0));
        } else {
          __idxSet(cpu.a, __ovf((i - 8), -9223372036854775808, 9223372036854775807), ((v & 4294967295) >>> 0));
        }
      } else {
        let val = 0;
        if ((i < 8)) {
          val = __idx(cpu.d, i);
        } else {
          val = __idx(cpu.a, __ovf((i - 8), -9223372036854775808, 9223372036854775807));
        }
        if (long) {
          memWrite32(m, addr, val);
        } else {
          memWrite16(m, addr, ((val & 65535) >>> 0));
        }
      }
      addr = ((__ovf((addr + bytes), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0);
    }
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  if ((toReg && (mode == 3))) {
    __idxSet(cpu.a, reg, ((addr & 4294967295) >>> 0));
  }
  return true;
}

function execMisc(cpu, m, op) {
  if ((op == 20081)) {
    return true;
  }
  if ((op == 20080)) {
    return true;
  }
  if ((op == 20083)) {
    if (privViolation(cpu, m)) {
      return true;
    }
    const newSr = ((popWord(cpu, m) & 42783) >>> 0);
    const pc = popLong(cpu, m);
    setSr(cpu, newSr);
    setPc(cpu, pc);
    return true;
  }
  if ((op == 20085)) {
    setPc(cpu, popLong(cpu, m));
    return true;
  }
  if ((op == 20087)) {
    const ccr = popWord(cpu, m);
    cpu.sr = ((((cpu.sr & 65280) >>> 0) | ((ccr & 31) >>> 0)) >>> 0);
    setPc(cpu, popLong(cpu, m));
    return true;
  }
  if ((op == 20086)) {
    if (getBit(cpu, SR_V)) {
      raiseException(cpu, m, 7);
    }
    return true;
  }
  if ((op == 20082)) {
    const imm = ((fetch16(cpu, m) & 42783) >>> 0);
    setSr(cpu, imm);
    cpu.halted = true;
    return true;
  }
  if ((((op & 65520) >>> 0) == 20032)) {
    raiseException(cpu, m, __ovf((32 + ((op & 15) >>> 0)), -9223372036854775808, 9223372036854775807));
    return true;
  }
  const mode = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const reg = ((op & 7) >>> 0);
  if ((((op & 65528) >>> 0) == 20048)) {
    const disp = signExtend(fetch16(cpu, m), 1);
    pushLong(cpu, m, __idx(cpu.a, reg));
    __idxSet(cpu.a, reg, __idx(cpu.a, 7));
    __idxSet(cpu.a, 7, ((__ovf((__idx(cpu.a, 7) + disp), -9223372036854775808, 9223372036854775807) & 4294967295) >>> 0));
    return true;
  }
  if ((((op & 65528) >>> 0) == 20056)) {
    __idxSet(cpu.a, 7, __idx(cpu.a, reg));
    __idxSet(cpu.a, reg, popLong(cpu, m));
    return true;
  }
  if ((((op & 65520) >>> 0) == 20064)) {
    if ((((op & 8) >>> 0) == 0)) {
      cpu.otherSp = ((__idx(cpu.a, reg) & 4294967295) >>> 0);
    } else {
      __idxSet(cpu.a, reg, ((cpu.otherSp & 4294967295) >>> 0));
    }
    return true;
  }
  if ((((op & 65472) >>> 0) == 16576)) {
    const ea = resolveEa(cpu, m, mode, reg, 1);
    eaStore(cpu, m, ea, 1, ((cpu.sr & 65535) >>> 0));
    return true;
  }
  if ((((op & 65472) >>> 0) == 17600)) {
    const ea = resolveEa(cpu, m, mode, reg, 1);
    const v = eaLoad(cpu, m, ea, 1);
    cpu.sr = ((((cpu.sr & 65280) >>> 0) | ((v & 31) >>> 0)) >>> 0);
    return true;
  }
  if ((((op & 65472) >>> 0) == 18112)) {
    if (privViolation(cpu, m)) {
      return true;
    }
    const ea = resolveEa(cpu, m, mode, reg, 1);
    const v = eaLoad(cpu, m, ea, 1);
    setSr(cpu, ((v & 42783) >>> 0));
    return true;
  }
  if ((((op & 65472) >>> 0) == 19136)) {
    const ea = resolveEa(cpu, m, mode, reg, 0);
    const v = eaLoad(cpu, m, ea, 0);
    setNZ(cpu, 0, v);
    setBit(cpu, SR_V, false);
    setBit(cpu, SR_C, false);
    eaStore(cpu, m, ea, 0, ((v | 128) >>> 0));
    return true;
  }
  if ((((op & 61888) >>> 0) == 16832)) {
    const an = ((Math.floor(op / 2 ** (__sh(9, 64))) & 7) >>> 0);
    const ea = resolveEa(cpu, m, mode, reg, 2);
    const _t22 = ea;
    if (_t22.tag === 2) {
      const addr = _t22.data[0];
      __idxSet(cpu.a, an, ((addr & 4294967295) >>> 0));
      return true;
    } else { // wildcard
      return false;
    }
  }
  if ((((op & 65472) >>> 0) == 18432)) {
    const ea = resolveEa(cpu, m, mode, reg, 0);
    const dst = ((eaLoad(cpu, m, ea, 0) & 255) >>> 0);
    const res = bcdSub(cpu, dst, 0);
    eaStore(cpu, m, ea, 0, res);
    return true;
  }
  if ((((op & 65528) >>> 0) == 18496)) {
    const v = ((__idx(cpu.d, reg) & 4294967295) >>> 0);
    const sw = ((((Math.floor(v / 2 ** (__sh(16, 64))) & 65535) >>> 0) | ((Math.trunc(v * 2 ** (__sh(16, 64))) & 4294901760) >>> 0)) >>> 0);
    __idxSet(cpu.d, reg, sw);
    setLogicalFlags(cpu, 2, sw);
    return true;
  }
  if ((((op & 65472) >>> 0) == 18496)) {
    const ea = resolveEa(cpu, m, mode, reg, 2);
    const _t23 = ea;
    if (_t23.tag === 2) {
      const addr = _t23.data[0];
      pushLong(cpu, m, ((addr & 4294967295) >>> 0));
      return true;
    } else { // wildcard
      return false;
    }
  }
  if ((((op & 65464) >>> 0) == 18560)) {
    const longMode = (((op & 64) >>> 0) != 0);
    if (longMode) {
      const v = ((signExtend(__idx(cpu.d, reg), 1) & 4294967295) >>> 0);
      __idxSet(cpu.d, reg, v);
      setLogicalFlags(cpu, 2, v);
    } else {
      const v = ((signExtend(__idx(cpu.d, reg), 0) & 65535) >>> 0);
      setD(cpu, reg, 1, v);
      setLogicalFlags(cpu, 1, v);
    }
    return true;
  }
  if ((((op & 64384) >>> 0) == 18560)) {
    return execMovem(cpu, m, op);
  }
  const sub = ((Math.floor(op / 2 ** (__sh(8, 64))) & 15) >>> 0);
  const size = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  if (((sub == 2) && (size != 3))) {
    const ea = resolveEa(cpu, m, mode, reg, size);
    eaStore(cpu, m, ea, size, 0);
    setLogicalFlags(cpu, size, 0);
    return true;
  }
  if (((sub == 6) && (size != 3))) {
    const ea = resolveEa(cpu, m, mode, reg, size);
    const res = (((~eaLoad(cpu, m, ea, size)) & sizeMask(size)) >>> 0);
    eaStore(cpu, m, ea, size, res);
    setLogicalFlags(cpu, size, res);
    return true;
  }
  if (((sub == 4) && (size != 3))) {
    const ea = resolveEa(cpu, m, mode, reg, size);
    const v = eaLoad(cpu, m, ea, size);
    const res = ((__ovf((-v), -9223372036854775808, 9223372036854775807) & sizeMask(size)) >>> 0);
    subFlags(cpu, size, 0, v, res, true);
    eaStore(cpu, m, ea, size, res);
    return true;
  }
  if (((sub == 10) && (size != 3))) {
    const ea = resolveEa(cpu, m, mode, reg, size);
    const v = eaLoad(cpu, m, ea, size);
    setLogicalFlags(cpu, size, v);
    return true;
  }
  if (((((op & 65472) >>> 0) == 20160) || (((op & 65472) >>> 0) == 20096))) {
    const isJsr = (((op & 64) >>> 0) == 0);
    const ea = resolveEa(cpu, m, mode, reg, 2);
    const _t24 = ea;
    if (_t24.tag === 2) {
      const addr = _t24.data[0];
      if (isJsr) {
        pushLong(cpu, m, cpu.pc);
      }
      setPc(cpu, addr);
      return true;
    } else { // wildcard
      return false;
    }
  }
  return false;
}

function newZ80() {
  let mem = [];
  let i = 0;
  while ((i < 65536)) {
    mem.push(0);
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return new Z80(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, false, 0, 0, false, mem, false, 0, 0, 0, Array.from({length: 512}, () => __clone(0)), 0, Array.from({length: 8}, () => __clone(0)), [false, false, false, false, false, false], [], Array.from({length: 4096}, () => __clone(0)), 0, 0, 0, 0, false, 0, false);
}

function ymTimerTick(cpu, us) {
  if (cpu.timerARun) {
    cpu.timerACnt = __ovf((cpu.timerACnt + us), -9223372036854775808, 9223372036854775807);
    const na = ((Math.trunc(((__idx(cpu.ym, 36) & 255) >>> 0) * 2 ** (__sh(2, 64))) | ((__idx(cpu.ym, 37) & 3) >>> 0)) >>> 0);
    const periodA = __ovf((18 * __ovf((1024 - na), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
    if (((periodA > 0) && (cpu.timerACnt >= periodA))) {
      cpu.timerACnt = __ovf((cpu.timerACnt - periodA), -9223372036854775808, 9223372036854775807);
      if ((((__idx(cpu.ym, 39) & 4) >>> 0) != 0)) {
        cpu.ymStatus = ((cpu.ymStatus | 1) >>> 0);
      }
    }
  }
  if (cpu.timerBRun) {
    cpu.timerBCnt = __ovf((cpu.timerBCnt + us), -9223372036854775808, 9223372036854775807);
    const nb = ((__idx(cpu.ym, 38) & 255) >>> 0);
    const periodB = __ovf((288 * __ovf((256 - nb), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
    if (((periodB > 0) && (cpu.timerBCnt >= periodB))) {
      cpu.timerBCnt = __ovf((cpu.timerBCnt - periodB), -9223372036854775808, 9223372036854775807);
      if ((((__idx(cpu.ym, 39) & 8) >>> 0) != 0)) {
        cpu.ymStatus = ((cpu.ymStatus | 2) >>> 0);
      }
    }
  }
}

function rd(cpu, addr) {
  const a = ((addr & 65535) >>> 0);
  if (cpu.gen) {
    if ((a < 16384)) {
      return Math.trunc(__idx(cpu.mem, ((a & 8191) >>> 0)));
    }
    if ((a >= 32768)) {
      const src = ((((Math.trunc(cpu.bank * 2 ** (__sh(15, 64))) | ((a & 32767) >>> 0)) >>> 0) & 16777215) >>> 0);
      if ((src < cpu.rom.length)) {
        return Math.trunc(__idx(cpu.rom, src));
      }
      return 0;
    }
    if (((a >= 16384) && (a <= 16387))) {
      return cpu.ymStatus;
    }
    return 0;
  }
  return Math.trunc(__idx(cpu.mem, a));
}

function wr(cpu, addr, val) {
  const a = ((addr & 65535) >>> 0);
  if (cpu.gen) {
    z80DevWrite(cpu, a, ((val & 255) >>> 0));
    return;
  }
  __idxSet(cpu.mem, a, (((val & 255) >>> 0) & 0xFF));
}

function z80DevWrite(cpu, a, val) {
  if ((a < 16384)) {
    __idxSet(cpu.mem, ((a & 8191) >>> 0), (val & 0xFF));
    return;
  }
  if ((a == 16384)) {
    cpu.ymAddr0 = val;
    return;
  }
  if ((a == 16385)) {
    const reg = ((cpu.ymAddr0 & 255) >>> 0);
    __idxSet(cpu.ym, reg, val);
    if ((reg == 42)) {
      __idxSet(cpu.dac, ((cpu.dacW & 4095) >>> 0), val);
      cpu.dacW = __ovf((cpu.dacW + 1), -9223372036854775808, 9223372036854775807);
    }
    if ((reg == 39)) {
      cpu.timerARun = (((val & 1) >>> 0) != 0);
      cpu.timerBRun = (((val & 2) >>> 0) != 0);
      if ((((val & 16) >>> 0) != 0)) {
        cpu.ymStatus = ((cpu.ymStatus & (~1)) >>> 0);
      }
      if ((((val & 32) >>> 0) != 0)) {
        cpu.ymStatus = ((cpu.ymStatus & (~2)) >>> 0);
      }
    }
    if ((reg == 40)) {
      const sel = ((val & 7) >>> 0);
      let ch = sel;
      if ((sel >= 4)) {
        ch = __ovf((sel - 1), -9223372036854775808, 9223372036854775807);
      }
      if ((ch < 6)) {
        __idxSet(cpu.fmKey, ch, (((val & 240) >>> 0) != 0));
      }
    }
    return;
  }
  if ((a == 16386)) {
    cpu.ymAddr1 = val;
    return;
  }
  if ((a == 16387)) {
    __idxSet(cpu.ym, __ovf((256 + ((cpu.ymAddr1 & 255) >>> 0)), -9223372036854775808, 9223372036854775807), val);
    return;
  }
  if ((a == 24576)) {
    cpu.bank = ((((Math.floor(cpu.bank / 2 ** (__sh(1, 64))) | Math.trunc(((val & 1) >>> 0) * 2 ** (__sh(8, 64)))) >>> 0) & 511) >>> 0);
    return;
  }
  if ((a == 32529)) {
    psgWrite(cpu, val);
    return;
  }
}

function psgWrite(cpu, val) {
  if ((((val & 128) >>> 0) != 0)) {
    const reg = ((Math.floor(val / 2 ** (__sh(4, 64))) & 7) >>> 0);
    cpu.psgLatch = reg;
    __idxSet(cpu.psg, reg, ((((__idx(cpu.psg, reg) & 1008) >>> 0) | ((val & 15) >>> 0)) >>> 0));
  } else {
    const reg = cpu.psgLatch;
    if ((((reg & 1) >>> 0) == 0)) {
      __idxSet(cpu.psg, reg, ((((__idx(cpu.psg, reg) & 15) >>> 0) | Math.trunc(((val & 63) >>> 0) * 2 ** (__sh(4, 64)))) >>> 0));
    } else {
      __idxSet(cpu.psg, reg, ((val & 15) >>> 0));
    }
  }
}

function fetchOp(cpu) {
  const op = rd(cpu, cpu.pc);
  cpu.pc = ((__ovf((cpu.pc + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  cpu.r = ((((cpu.r & 128) >>> 0) | ((__ovf((cpu.r + 1), -9223372036854775808, 9223372036854775807) & 127) >>> 0)) >>> 0);
  return op;
}

function zfetch8(cpu) {
  const v = rd(cpu, cpu.pc);
  cpu.pc = ((__ovf((cpu.pc + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  return v;
}

function zfetch16(cpu) {
  const lo = zfetch8(cpu);
  const hi = zfetch8(cpu);
  return ((Math.trunc(hi * 2 ** (__sh(8, 64))) | lo) >>> 0);
}

function getHL(cpu) {
  return ((Math.trunc(cpu.h * 2 ** (__sh(8, 64))) | cpu.l) >>> 0);
}

function setHL(cpu, v) {
  cpu.h = ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0);
  cpu.l = ((v & 255) >>> 0);
}

function getBC(cpu) {
  return ((Math.trunc(cpu.b * 2 ** (__sh(8, 64))) | cpu.c) >>> 0);
}

function getDE(cpu) {
  return ((Math.trunc(cpu.d * 2 ** (__sh(8, 64))) | cpu.e) >>> 0);
}

function setFlag(cpu, bit, on) {
  if (on) {
    cpu.f = ((cpu.f | bit) >>> 0);
  } else {
    cpu.f = ((cpu.f & (~bit)) >>> 0);
  }
}

function parityEven(v) {
  let x = ((v & 255) >>> 0);
  let count = 0;
  let i = 0;
  while ((i < 8)) {
    if ((((x & 1) >>> 0) != 0)) {
      count = __ovf((count + 1), -9223372036854775808, 9223372036854775807);
    }
    x = Math.floor(x / 2 ** (__sh(1, 64)));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return (((count & 1) >>> 0) == 0);
}

function setSZYX(cpu, r) {
  const v = ((r & 255) >>> 0);
  setFlag(cpu, FS, (((v & 128) >>> 0) != 0));
  setFlag(cpu, FZ, (v == 0));
  setFlag(cpu, FY, (((v & 32) >>> 0) != 0));
  setFlag(cpu, FX, (((v & 8) >>> 0) != 0));
}

function getReg(cpu, idx) {
  if ((idx == 0)) {
    return cpu.b;
  }
  if ((idx == 1)) {
    return cpu.c;
  }
  if ((idx == 2)) {
    return cpu.d;
  }
  if ((idx == 3)) {
    return cpu.e;
  }
  if ((idx == 4)) {
    return cpu.h;
  }
  if ((idx == 5)) {
    return cpu.l;
  }
  if ((idx == 6)) {
    return rd(cpu, getHL(cpu));
  }
  return cpu.a;
}

function setReg(cpu, idx, val) {
  const v = ((val & 255) >>> 0);
  if ((idx == 0)) {
    cpu.b = v;
  } else {
    if ((idx == 1)) {
      cpu.c = v;
    } else {
      if ((idx == 2)) {
        cpu.d = v;
      } else {
        if ((idx == 3)) {
          cpu.e = v;
        } else {
          if ((idx == 4)) {
            cpu.h = v;
          } else {
            if ((idx == 5)) {
              cpu.l = v;
            } else {
              if ((idx == 6)) {
                wr(cpu, getHL(cpu), v);
              } else {
                cpu.a = v;
              }
            }
          }
        }
      }
    }
  }
}

function aluAdd(cpu, val, carry) {
  const a = cpu.a;
  const r = __ovf((__ovf((a + val), -9223372036854775808, 9223372036854775807) + carry), -9223372036854775808, 9223372036854775807);
  const res = ((r & 255) >>> 0);
  setSZYX(cpu, res);
  setFlag(cpu, FH, (__ovf((__ovf((((a & 15) >>> 0) + ((val & 15) >>> 0)), -9223372036854775808, 9223372036854775807) + carry), -9223372036854775808, 9223372036854775807) > 15));
  setFlag(cpu, FPV, (((((((a ^ (~val)) >>> 0) & ((a ^ res) >>> 0)) >>> 0) & 128) >>> 0) != 0));
  setFlag(cpu, FN, false);
  setFlag(cpu, FC, (r > 255));
  cpu.a = res;
}

function aluSub(cpu, val, carry, store) {
  const a = cpu.a;
  const r = __ovf((__ovf((a - val), -9223372036854775808, 9223372036854775807) - carry), -9223372036854775808, 9223372036854775807);
  const res = ((r & 255) >>> 0);
  setFlag(cpu, FS, (((res & 128) >>> 0) != 0));
  setFlag(cpu, FZ, (res == 0));
  setFlag(cpu, FH, (__ovf((__ovf((((a & 15) >>> 0) - ((val & 15) >>> 0)), -9223372036854775808, 9223372036854775807) - carry), -9223372036854775808, 9223372036854775807) < 0));
  setFlag(cpu, FPV, (((((((a ^ val) >>> 0) & ((a ^ res) >>> 0)) >>> 0) & 128) >>> 0) != 0));
  setFlag(cpu, FN, true);
  setFlag(cpu, FC, (r < 0));
  if (store) {
    setFlag(cpu, FY, (((res & 32) >>> 0) != 0));
    setFlag(cpu, FX, (((res & 8) >>> 0) != 0));
    cpu.a = res;
  } else {
    setFlag(cpu, FY, (((val & 32) >>> 0) != 0));
    setFlag(cpu, FX, (((val & 8) >>> 0) != 0));
  }
}

function aluAnd(cpu, val) {
  const res = ((((cpu.a & val) >>> 0) & 255) >>> 0);
  setSZYX(cpu, res);
  setFlag(cpu, FH, true);
  setFlag(cpu, FPV, parityEven(res));
  setFlag(cpu, FN, false);
  setFlag(cpu, FC, false);
  cpu.a = res;
}

function aluXor(cpu, val) {
  const res = ((((cpu.a ^ val) >>> 0) & 255) >>> 0);
  setSZYX(cpu, res);
  setFlag(cpu, FH, false);
  setFlag(cpu, FPV, parityEven(res));
  setFlag(cpu, FN, false);
  setFlag(cpu, FC, false);
  cpu.a = res;
}

function aluOr(cpu, val) {
  const res = ((((cpu.a | val) >>> 0) & 255) >>> 0);
  setSZYX(cpu, res);
  setFlag(cpu, FH, false);
  setFlag(cpu, FPV, parityEven(res));
  setFlag(cpu, FN, false);
  setFlag(cpu, FC, false);
  cpu.a = res;
}

function doAlu(cpu, op, val) {
  const cf = ((cpu.f & FC) >>> 0);
  if ((op == 0)) {
    aluAdd(cpu, val, 0);
  } else {
    if ((op == 1)) {
      aluAdd(cpu, val, cf);
    } else {
      if ((op == 2)) {
        aluSub(cpu, val, 0, true);
      } else {
        if ((op == 3)) {
          aluSub(cpu, val, cf, true);
        } else {
          if ((op == 4)) {
            aluAnd(cpu, val);
          } else {
            if ((op == 5)) {
              aluXor(cpu, val);
            } else {
              if ((op == 6)) {
                aluOr(cpu, val);
              } else {
                aluSub(cpu, val, 0, false);
              }
            }
          }
        }
      }
    }
  }
}

function incReg(cpu, idx) {
  const v = getReg(cpu, idx);
  const res = ((__ovf((v + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  setSZYX(cpu, res);
  setFlag(cpu, FH, (((v & 15) >>> 0) == 15));
  setFlag(cpu, FPV, (v == 127));
  setFlag(cpu, FN, false);
  setReg(cpu, idx, res);
}

function decReg(cpu, idx) {
  const v = getReg(cpu, idx);
  const res = ((__ovf((v - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  setSZYX(cpu, res);
  setFlag(cpu, FH, (((v & 15) >>> 0) == 0));
  setFlag(cpu, FPV, (v == 128));
  setFlag(cpu, FN, true);
  setReg(cpu, idx, res);
}

function getAF(cpu) {
  return ((Math.trunc(cpu.a * 2 ** (__sh(8, 64))) | cpu.f) >>> 0);
}

function setAF(cpu, v) {
  cpu.a = ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0);
  cpu.f = ((v & 255) >>> 0);
}

function setBC(cpu, v) {
  cpu.b = ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0);
  cpu.c = ((v & 255) >>> 0);
}

function setDE(cpu, v) {
  cpu.d = ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0);
  cpu.e = ((v & 255) >>> 0);
}

function getRP(cpu, p) {
  if ((p == 0)) {
    return getBC(cpu);
  }
  if ((p == 1)) {
    return getDE(cpu);
  }
  if ((p == 2)) {
    return getHL(cpu);
  }
  return cpu.sp;
}

function setRP(cpu, p, v) {
  if ((p == 0)) {
    setBC(cpu, v);
  } else {
    if ((p == 1)) {
      setDE(cpu, v);
    } else {
      if ((p == 2)) {
        setHL(cpu, v);
      } else {
        cpu.sp = ((v & 65535) >>> 0);
      }
    }
  }
}

function getRP2(cpu, p) {
  if ((p == 3)) {
    return getAF(cpu);
  }
  return getRP(cpu, p);
}

function setRP2(cpu, p, v) {
  if ((p == 3)) {
    setAF(cpu, v);
  } else {
    setRP(cpu, p, v);
  }
}

function z80Interrupt(cpu) {
  if ((!cpu.iff1)) {
    return false;
  }
  cpu.iff1 = false;
  cpu.iff2 = false;
  cpu.halted = false;
  push16(cpu, cpu.pc);
  if ((cpu.im == 2)) {
    const vec = ((((Math.trunc(cpu.i * 2 ** (__sh(8, 64))) | 255) >>> 0) & 65535) >>> 0);
    cpu.pc = ((rd(cpu, vec) | Math.trunc(rd(cpu, ((__ovf((vec + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)) * 2 ** (__sh(8, 64)))) >>> 0);
  } else {
    cpu.pc = 56;
  }
  return true;
}

function push16(cpu, v) {
  cpu.sp = ((__ovf((cpu.sp - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  wr(cpu, cpu.sp, ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0));
  cpu.sp = ((__ovf((cpu.sp - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  wr(cpu, cpu.sp, ((v & 255) >>> 0));
}

function pop16(cpu) {
  const lo = rd(cpu, cpu.sp);
  cpu.sp = ((__ovf((cpu.sp + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  const hi = rd(cpu, cpu.sp);
  cpu.sp = ((__ovf((cpu.sp + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
  return ((Math.trunc(hi * 2 ** (__sh(8, 64))) | lo) >>> 0);
}

function testCC(cpu, y) {
  if ((y == 0)) {
    return (((cpu.f & FZ) >>> 0) == 0);
  }
  if ((y == 1)) {
    return (((cpu.f & FZ) >>> 0) != 0);
  }
  if ((y == 2)) {
    return (((cpu.f & FC) >>> 0) == 0);
  }
  if ((y == 3)) {
    return (((cpu.f & FC) >>> 0) != 0);
  }
  if ((y == 4)) {
    return (((cpu.f & FPV) >>> 0) == 0);
  }
  if ((y == 5)) {
    return (((cpu.f & FPV) >>> 0) != 0);
  }
  if ((y == 6)) {
    return (((cpu.f & FS) >>> 0) == 0);
  }
  return (((cpu.f & FS) >>> 0) != 0);
}

function add16(cpu, a, b) {
  const r = __ovf((a + b), -9223372036854775808, 9223372036854775807);
  const res = ((r & 65535) >>> 0);
  setFlag(cpu, FH, (__ovf((((a & 4095) >>> 0) + ((b & 4095) >>> 0)), -9223372036854775808, 9223372036854775807) > 4095));
  setFlag(cpu, FC, (r > 65535));
  setFlag(cpu, FN, false);
  setFlag(cpu, FY, (((res & 8192) >>> 0) != 0));
  setFlag(cpu, FX, (((res & 2048) >>> 0) != 0));
  return res;
}

function rotAcc(cpu, kind) {
  const a = cpu.a;
  let res = 0;
  let carry = false;
  if ((kind == 0)) {
    carry = (((a & 128) >>> 0) != 0);
    res = ((((Math.trunc(a * 2 ** (__sh(1, 64))) | (() => {
    if (carry) {
      return 1;
    } else {
      return 0;
    }
    })()) >>> 0) & 255) >>> 0);
  } else {
    if ((kind == 1)) {
      carry = (((a & 1) >>> 0) != 0);
      res = ((((Math.floor(a / 2 ** (__sh(1, 64))) | (() => {
      if (carry) {
        return 128;
      } else {
        return 0;
      }
      })()) >>> 0) & 255) >>> 0);
    } else {
      if ((kind == 2)) {
        const cin = (((cpu.f & FC) >>> 0) != 0);
        carry = (((a & 128) >>> 0) != 0);
        res = ((((Math.trunc(a * 2 ** (__sh(1, 64))) | (() => {
        if (cin) {
          return 1;
        } else {
          return 0;
        }
        })()) >>> 0) & 255) >>> 0);
      } else {
        const cin = (((cpu.f & FC) >>> 0) != 0);
        carry = (((a & 1) >>> 0) != 0);
        res = ((((Math.floor(a / 2 ** (__sh(1, 64))) | (() => {
        if (cin) {
          return 128;
        } else {
          return 0;
        }
        })()) >>> 0) & 255) >>> 0);
      }
    }
  }
  cpu.a = res;
  setFlag(cpu, FC, carry);
  setFlag(cpu, FH, false);
  setFlag(cpu, FN, false);
  setFlag(cpu, FY, (((res & 32) >>> 0) != 0));
  setFlag(cpu, FX, (((res & 8) >>> 0) != 0));
}

function doDaa(cpu) {
  let a = cpu.a;
  let adjust = 0;
  const n = (((cpu.f & FN) >>> 0) != 0);
  let carry = (((cpu.f & FC) >>> 0) != 0);
  if (((((cpu.f & FH) >>> 0) != 0) || (((a & 15) >>> 0) > 9))) {
    adjust = ((adjust | 6) >>> 0);
  }
  if ((carry || (a > 153))) {
    adjust = ((adjust | 96) >>> 0);
    carry = true;
  }
  if (n) {
    a = ((__ovf((a - adjust), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  } else {
    a = ((__ovf((a + adjust), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  }
  setFlag(cpu, FH, (((((cpu.a ^ a) >>> 0) & 16) >>> 0) != 0));
  cpu.a = a;
  setSZYX(cpu, a);
  setFlag(cpu, FPV, parityEven(a));
  setFlag(cpu, FC, carry);
}

function stepZ80(cpu) {
  ymTimerTick(cpu, 1);
  if (cpu.halted) {
    return true;
  }
  const op = fetchOp(cpu);
  const x = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  const y = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const z = ((op & 7) >>> 0);
  const p = Math.floor(y / 2 ** (__sh(1, 64)));
  const q = ((y & 1) >>> 0);
  if ((op == 118)) {
    cpu.halted = true;
    return true;
  }
  if ((op == 203)) {
    return execCB(cpu);
  }
  if ((op == 237)) {
    return execED(cpu);
  }
  if ((op == 221)) {
    return execIndex(cpu, false);
  }
  if ((op == 253)) {
    return execIndex(cpu, true);
  }
  if ((x == 1)) {
    setReg(cpu, y, getReg(cpu, z));
    return true;
  }
  if ((x == 2)) {
    doAlu(cpu, y, getReg(cpu, z));
    return true;
  }
  if ((x == 0)) {
    return execX0(cpu, op, y, z, p, q);
  }
  return execX3(cpu, op, y, z, p, q);
}

function execX0(cpu, _op, y, z, p, q) {
  if ((z == 0)) {
    if ((y == 0)) {
      return true;
    }
    if ((y == 1)) {
      const t = getAF(cpu);
      setAF(cpu, cpu.af_);
      cpu.af_ = t;
      return true;
    }
    const d = signExt8(zfetch8(cpu));
    if ((y == 2)) {
      cpu.b = ((__ovf((cpu.b - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
      if ((cpu.b != 0)) {
        cpu.pc = ((__ovf((cpu.pc + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
      }
      return true;
    }
    if ((y == 3)) {
      cpu.pc = ((__ovf((cpu.pc + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
      return true;
    }
    if (testCC(cpu, __ovf((y - 4), -9223372036854775808, 9223372036854775807))) {
      cpu.pc = ((__ovf((cpu.pc + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    }
    return true;
  }
  if ((z == 1)) {
    if ((q == 0)) {
      setRP(cpu, p, zfetch16(cpu));
    } else {
      setHL(cpu, add16(cpu, getHL(cpu), getRP(cpu, p)));
    }
    return true;
  }
  if ((z == 2)) {
    return execIndirect(cpu, p, q);
  }
  if ((z == 3)) {
    if ((q == 0)) {
      setRP(cpu, p, ((__ovf((getRP(cpu, p) + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
    } else {
      setRP(cpu, p, ((__ovf((getRP(cpu, p) - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
    }
    return true;
  }
  if ((z == 4)) {
    incReg(cpu, y);
    return true;
  }
  if ((z == 5)) {
    decReg(cpu, y);
    return true;
  }
  if ((z == 6)) {
    setReg(cpu, y, zfetch8(cpu));
    return true;
  }
  if ((y < 4)) {
    rotAcc(cpu, y);
  } else {
    if ((y == 4)) {
      doDaa(cpu);
    } else {
      if ((y == 5)) {
        cpu.a = (((~cpu.a) & 255) >>> 0);
        setFlag(cpu, FH, true);
        setFlag(cpu, FN, true);
        setFlag(cpu, FY, (((cpu.a & 32) >>> 0) != 0));
        setFlag(cpu, FX, (((cpu.a & 8) >>> 0) != 0));
      } else {
        if ((y == 6)) {
          setFlag(cpu, FC, true);
          setFlag(cpu, FH, false);
          setFlag(cpu, FN, false);
          setFlag(cpu, FY, (((cpu.a & 32) >>> 0) != 0));
          setFlag(cpu, FX, (((cpu.a & 8) >>> 0) != 0));
        } else {
          const oldC = (((cpu.f & FC) >>> 0) != 0);
          setFlag(cpu, FH, oldC);
          setFlag(cpu, FC, (!oldC));
          setFlag(cpu, FN, false);
          setFlag(cpu, FY, (((cpu.a & 32) >>> 0) != 0));
          setFlag(cpu, FX, (((cpu.a & 8) >>> 0) != 0));
        }
      }
    }
  }
  return true;
}

function execIndirect(cpu, p, q) {
  if ((q == 0)) {
    if ((p == 0)) {
      wr(cpu, getBC(cpu), cpu.a);
    } else {
      if ((p == 1)) {
        wr(cpu, getDE(cpu), cpu.a);
      } else {
        if ((p == 2)) {
          const nn = zfetch16(cpu);
          wr(cpu, nn, cpu.l);
          wr(cpu, __ovf((nn + 1), -9223372036854775808, 9223372036854775807), cpu.h);
        } else {
          wr(cpu, zfetch16(cpu), cpu.a);
        }
      }
    }
  } else {
    if ((p == 0)) {
      cpu.a = rd(cpu, getBC(cpu));
    } else {
      if ((p == 1)) {
        cpu.a = rd(cpu, getDE(cpu));
      } else {
        if ((p == 2)) {
          const nn = zfetch16(cpu);
          cpu.l = rd(cpu, nn);
          cpu.h = rd(cpu, __ovf((nn + 1), -9223372036854775808, 9223372036854775807));
        } else {
          cpu.a = rd(cpu, zfetch16(cpu));
        }
      }
    }
  }
  return true;
}

function execX3(cpu, _op, y, z, p, q) {
  if ((z == 0)) {
    if (testCC(cpu, y)) {
      cpu.pc = pop16(cpu);
    }
    return true;
  }
  if ((z == 1)) {
    if ((q == 0)) {
      setRP2(cpu, p, pop16(cpu));
      return true;
    }
    if ((p == 0)) {
      cpu.pc = pop16(cpu);
    } else {
      if ((p == 1)) {
        const b = getBC(cpu);
        const d = getDE(cpu);
        const h = getHL(cpu);
        setBC(cpu, cpu.bc_);
        setDE(cpu, cpu.de_);
        setHL(cpu, cpu.hl_);
        cpu.bc_ = b;
        cpu.de_ = d;
        cpu.hl_ = h;
      } else {
        if ((p == 2)) {
          cpu.pc = getHL(cpu);
        } else {
          cpu.sp = getHL(cpu);
        }
      }
    }
    return true;
  }
  if ((z == 2)) {
    const nn = zfetch16(cpu);
    if (testCC(cpu, y)) {
      cpu.pc = nn;
    }
    return true;
  }
  if ((z == 3)) {
    if ((y == 0)) {
      cpu.pc = zfetch16(cpu);
      return true;
    }
    if ((y == 4)) {
      const lo = rd(cpu, cpu.sp);
      const hi = rd(cpu, __ovf((cpu.sp + 1), -9223372036854775808, 9223372036854775807));
      wr(cpu, cpu.sp, cpu.l);
      wr(cpu, __ovf((cpu.sp + 1), -9223372036854775808, 9223372036854775807), cpu.h);
      cpu.l = lo;
      cpu.h = hi;
      return true;
    }
    if ((y == 5)) {
      const d = getDE(cpu);
      setDE(cpu, getHL(cpu));
      setHL(cpu, d);
      return true;
    }
    if ((y == 6)) {
      cpu.iff1 = false;
      cpu.iff2 = false;
      return true;
    }
    if ((y == 7)) {
      cpu.iff1 = true;
      cpu.iff2 = true;
      return true;
    }
    return false;
  }
  if ((z == 4)) {
    const nn = zfetch16(cpu);
    if (testCC(cpu, y)) {
      push16(cpu, cpu.pc);
      cpu.pc = nn;
    }
    return true;
  }
  if ((z == 5)) {
    if ((q == 0)) {
      push16(cpu, getRP2(cpu, p));
      return true;
    }
    if ((p == 0)) {
      const nn = zfetch16(cpu);
      push16(cpu, cpu.pc);
      cpu.pc = nn;
      return true;
    }
    return false;
  }
  if ((z == 6)) {
    doAlu(cpu, y, zfetch8(cpu));
    return true;
  }
  push16(cpu, cpu.pc);
  cpu.pc = __ovf((y * 8), -9223372036854775808, 9223372036854775807);
  return true;
}

function signExt8(v) {
  if ((((v & 128) >>> 0) != 0)) {
    return __ovf((v - 256), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function incVal(cpu, v) {
  const res = ((__ovf((v + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  setSZYX(cpu, res);
  setFlag(cpu, FH, (((v & 15) >>> 0) == 15));
  setFlag(cpu, FPV, (v == 127));
  setFlag(cpu, FN, false);
  return res;
}

function decVal(cpu, v) {
  const res = ((__ovf((v - 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  setSZYX(cpu, res);
  setFlag(cpu, FH, (((v & 15) >>> 0) == 0));
  setFlag(cpu, FPV, (v == 128));
  setFlag(cpu, FN, true);
  return res;
}

function execIndex(cpu, isIY) {
  let base = (() => {
  if (isIY) {
    return cpu.iy;
  } else {
    return cpu.ix;
  }
  })();
  const op = fetchOp(cpu);
  if ((op == 203)) {
    const d = signExt8(zfetch8(cpu));
    const addr = ((__ovf((base + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    return execDDCB(cpu, addr);
  }
  if (((((op == 9) || (op == 25)) || (op == 41)) || (op == 57))) {
    const p = ((Math.floor(op / 2 ** (__sh(4, 64))) & 3) >>> 0);
    let rp = getRP(cpu, p);
    if ((p == 2)) {
      rp = base;
    }
    base = add16(cpu, base, rp);
    return storeIndex(cpu, isIY, base);
  }
  if ((op == 33)) {
    base = zfetch16(cpu);
    return storeIndex(cpu, isIY, base);
  }
  if ((op == 34)) {
    const nn = zfetch16(cpu);
    wr(cpu, nn, ((base & 255) >>> 0));
    wr(cpu, __ovf((nn + 1), -9223372036854775808, 9223372036854775807), ((Math.floor(base / 2 ** (__sh(8, 64))) & 255) >>> 0));
    return true;
  }
  if ((op == 42)) {
    const nn = zfetch16(cpu);
    base = ((rd(cpu, nn) | Math.trunc(rd(cpu, __ovf((nn + 1), -9223372036854775808, 9223372036854775807)) * 2 ** (__sh(8, 64)))) >>> 0);
    return storeIndex(cpu, isIY, base);
  }
  if ((op == 35)) {
    base = ((__ovf((base + 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    return storeIndex(cpu, isIY, base);
  }
  if ((op == 43)) {
    base = ((__ovf((base - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    return storeIndex(cpu, isIY, base);
  }
  if ((op == 229)) {
    push16(cpu, base);
    return true;
  }
  if ((op == 225)) {
    base = pop16(cpu);
    return storeIndex(cpu, isIY, base);
  }
  if ((op == 227)) {
    const lo = rd(cpu, cpu.sp);
    const hi = rd(cpu, __ovf((cpu.sp + 1), -9223372036854775808, 9223372036854775807));
    wr(cpu, cpu.sp, ((base & 255) >>> 0));
    wr(cpu, __ovf((cpu.sp + 1), -9223372036854775808, 9223372036854775807), ((Math.floor(base / 2 ** (__sh(8, 64))) & 255) >>> 0));
    base = ((Math.trunc(hi * 2 ** (__sh(8, 64))) | lo) >>> 0);
    return storeIndex(cpu, isIY, base);
  }
  if ((op == 233)) {
    cpu.pc = base;
    return true;
  }
  if ((op == 249)) {
    cpu.sp = base;
    return true;
  }
  if ((op == 52)) {
    const d = signExt8(zfetch8(cpu));
    const a = ((__ovf((base + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    wr(cpu, a, incVal(cpu, rd(cpu, a)));
    return true;
  }
  if ((op == 53)) {
    const d = signExt8(zfetch8(cpu));
    const a = ((__ovf((base + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    wr(cpu, a, decVal(cpu, rd(cpu, a)));
    return true;
  }
  if ((op == 54)) {
    const d = signExt8(zfetch8(cpu));
    const n = zfetch8(cpu);
    wr(cpu, ((__ovf((base + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0), n);
    return true;
  }
  const x = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  const y = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const z = ((op & 7) >>> 0);
  if ((((x == 1) && (op != 118)) && ((y == 6) || (z == 6)))) {
    const d = signExt8(zfetch8(cpu));
    const a = ((__ovf((base + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
    if ((z == 6)) {
      setReg(cpu, y, rd(cpu, a));
    } else {
      wr(cpu, a, getReg(cpu, z));
    }
    return true;
  }
  if (((x == 2) && (z == 6))) {
    const d = signExt8(zfetch8(cpu));
    doAlu(cpu, y, rd(cpu, ((__ovf((base + d), -9223372036854775808, 9223372036854775807) & 65535) >>> 0)));
    return true;
  }
  return false;
}

function storeIndex(cpu, isIY, v) {
  if (isIY) {
    cpu.iy = ((v & 65535) >>> 0);
  } else {
    cpu.ix = ((v & 65535) >>> 0);
  }
  return true;
}

function execDDCB(cpu, addr) {
  const op = zfetch8(cpu);
  const x = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  const y = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const z = ((op & 7) >>> 0);
  const v = rd(cpu, addr);
  if ((x == 1)) {
    const bitset = (((Math.floor(v / 2 ** (__sh(y, 64))) & 1) >>> 0) != 0);
    setFlag(cpu, FZ, (!bitset));
    setFlag(cpu, FPV, (!bitset));
    setFlag(cpu, FH, true);
    setFlag(cpu, FN, false);
    setFlag(cpu, FS, ((y == 7) && bitset));
    setFlag(cpu, FY, (((Math.floor(addr / 2 ** (__sh(8, 64))) & 32) >>> 0) != 0));
    setFlag(cpu, FX, (((Math.floor(addr / 2 ** (__sh(8, 64))) & 8) >>> 0) != 0));
    return true;
  }
  let res = 0;
  if ((x == 0)) {
    res = shiftOp(cpu, y, v);
  } else {
    if ((x == 2)) {
      res = ((v & (~Math.trunc(1 * 2 ** (__sh(y, 64))))) >>> 0);
    } else {
      res = ((v | Math.trunc(1 * 2 ** (__sh(y, 64)))) >>> 0);
    }
  }
  wr(cpu, addr, res);
  if ((z != 6)) {
    setReg(cpu, z, res);
  }
  return true;
}

function execCB(cpu) {
  const op = fetchOp(cpu);
  const x = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  const y = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const z = ((op & 7) >>> 0);
  if ((x == 0)) {
    const v = getReg(cpu, z);
    const res = shiftOp(cpu, y, v);
    setReg(cpu, z, res);
    return true;
  }
  if ((x == 1)) {
    const v = getReg(cpu, z);
    const bitset = (((Math.floor(v / 2 ** (__sh(y, 64))) & 1) >>> 0) != 0);
    setFlag(cpu, FZ, (!bitset));
    setFlag(cpu, FPV, (!bitset));
    setFlag(cpu, FH, true);
    setFlag(cpu, FN, false);
    setFlag(cpu, FS, ((y == 7) && bitset));
    if ((z == 6)) {
      setFlag(cpu, FY, (((Math.floor(cpu.wz / 2 ** (__sh(8, 64))) & 32) >>> 0) != 0));
      setFlag(cpu, FX, (((Math.floor(cpu.wz / 2 ** (__sh(8, 64))) & 8) >>> 0) != 0));
    } else {
      setFlag(cpu, FY, (((v & 32) >>> 0) != 0));
      setFlag(cpu, FX, (((v & 8) >>> 0) != 0));
    }
    return true;
  }
  if ((x == 2)) {
    setReg(cpu, z, ((getReg(cpu, z) & (~Math.trunc(1 * 2 ** (__sh(y, 64))))) >>> 0));
    return true;
  }
  setReg(cpu, z, ((getReg(cpu, z) | Math.trunc(1 * 2 ** (__sh(y, 64)))) >>> 0));
  return true;
}

function adcHL(cpu, rp) {
  const hl = getHL(cpu);
  const c = ((cpu.f & FC) >>> 0);
  const r = __ovf((__ovf((hl + rp), -9223372036854775808, 9223372036854775807) + c), -9223372036854775808, 9223372036854775807);
  const res = ((r & 65535) >>> 0);
  setFlag(cpu, FS, (((res & 32768) >>> 0) != 0));
  setFlag(cpu, FZ, (res == 0));
  setFlag(cpu, FH, (__ovf((__ovf((((hl & 4095) >>> 0) + ((rp & 4095) >>> 0)), -9223372036854775808, 9223372036854775807) + c), -9223372036854775808, 9223372036854775807) > 4095));
  setFlag(cpu, FPV, ((((((~((hl ^ rp) >>> 0)) & ((hl ^ res) >>> 0)) >>> 0) & 32768) >>> 0) != 0));
  setFlag(cpu, FN, false);
  setFlag(cpu, FC, (r > 65535));
  setFlag(cpu, FY, (((res & 8192) >>> 0) != 0));
  setFlag(cpu, FX, (((res & 2048) >>> 0) != 0));
  setHL(cpu, res);
}

function sbcHL(cpu, rp) {
  const hl = getHL(cpu);
  const c = ((cpu.f & FC) >>> 0);
  const r = __ovf((__ovf((hl - rp), -9223372036854775808, 9223372036854775807) - c), -9223372036854775808, 9223372036854775807);
  const res = ((r & 65535) >>> 0);
  setFlag(cpu, FS, (((res & 32768) >>> 0) != 0));
  setFlag(cpu, FZ, (res == 0));
  setFlag(cpu, FH, (__ovf((__ovf((((hl & 4095) >>> 0) - ((rp & 4095) >>> 0)), -9223372036854775808, 9223372036854775807) - c), -9223372036854775808, 9223372036854775807) < 0));
  setFlag(cpu, FPV, (((((((hl ^ rp) >>> 0) & ((hl ^ res) >>> 0)) >>> 0) & 32768) >>> 0) != 0));
  setFlag(cpu, FN, true);
  setFlag(cpu, FC, (r < 0));
  setFlag(cpu, FY, (((res & 8192) >>> 0) != 0));
  setFlag(cpu, FX, (((res & 2048) >>> 0) != 0));
  setHL(cpu, res);
}

function blockLd(cpu, dir) {
  const v = rd(cpu, getHL(cpu));
  wr(cpu, getDE(cpu), v);
  setDE(cpu, ((__ovf((getDE(cpu) + dir), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  setHL(cpu, ((__ovf((getHL(cpu) + dir), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  setBC(cpu, ((__ovf((getBC(cpu) - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  const n = ((__ovf((v + cpu.a), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  setFlag(cpu, FH, false);
  setFlag(cpu, FN, false);
  setFlag(cpu, FPV, (getBC(cpu) != 0));
  setFlag(cpu, FY, (((n & 2) >>> 0) != 0));
  setFlag(cpu, FX, (((n & 8) >>> 0) != 0));
}

function blockCp(cpu, dir) {
  const v = rd(cpu, getHL(cpu));
  const r = ((__ovf((cpu.a - v), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  const hcarry = (__ovf((((cpu.a & 15) >>> 0) - ((v & 15) >>> 0)), -9223372036854775808, 9223372036854775807) < 0);
  setHL(cpu, ((__ovf((getHL(cpu) + dir), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  setBC(cpu, ((__ovf((getBC(cpu) - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0));
  setFlag(cpu, FS, (((r & 128) >>> 0) != 0));
  setFlag(cpu, FZ, (r == 0));
  setFlag(cpu, FH, hcarry);
  setFlag(cpu, FN, true);
  setFlag(cpu, FPV, (getBC(cpu) != 0));
  let hb = 0;
  if (hcarry) {
    hb = 1;
  }
  const n = ((__ovf((r - hb), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  setFlag(cpu, FY, (((n & 2) >>> 0) != 0));
  setFlag(cpu, FX, (((n & 8) >>> 0) != 0));
}

function execED(cpu) {
  const op = fetchOp(cpu);
  const x = ((Math.floor(op / 2 ** (__sh(6, 64))) & 3) >>> 0);
  const y = ((Math.floor(op / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const z = ((op & 7) >>> 0);
  const p = Math.floor(y / 2 ** (__sh(1, 64)));
  const q = ((y & 1) >>> 0);
  if ((x == 1)) {
    if ((z == 2)) {
      if ((q == 0)) {
        sbcHL(cpu, getRP(cpu, p));
      } else {
        adcHL(cpu, getRP(cpu, p));
      }
      return true;
    }
    if ((z == 3)) {
      const nn = zfetch16(cpu);
      if ((q == 0)) {
        const v = getRP(cpu, p);
        wr(cpu, nn, ((v & 255) >>> 0));
        wr(cpu, __ovf((nn + 1), -9223372036854775808, 9223372036854775807), ((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0));
      } else {
        const lo = rd(cpu, nn);
        const hi = rd(cpu, __ovf((nn + 1), -9223372036854775808, 9223372036854775807));
        setRP(cpu, p, ((Math.trunc(hi * 2 ** (__sh(8, 64))) | lo) >>> 0));
      }
      return true;
    }
    if ((z == 4)) {
      const a = cpu.a;
      cpu.a = ((__ovf((-a), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
      setSZYX(cpu, cpu.a);
      setFlag(cpu, FH, (((a & 15) >>> 0) != 0));
      setFlag(cpu, FPV, (a == 128));
      setFlag(cpu, FN, true);
      setFlag(cpu, FC, (a != 0));
      return true;
    }
    if ((z == 5)) {
      cpu.pc = pop16(cpu);
      cpu.iff1 = cpu.iff2;
      return true;
    }
    if ((z == 6)) {
      if (((y == 2) || (y == 6))) {
        cpu.im = 1;
      } else {
        if (((y == 3) || (y == 7))) {
          cpu.im = 2;
        } else {
          cpu.im = 0;
        }
      }
      return true;
    }
    if ((z == 7)) {
      if ((y == 0)) {
        cpu.i = cpu.a;
      } else {
        if ((y == 1)) {
          cpu.r = cpu.a;
        } else {
          if (((y == 2) || (y == 3))) {
            cpu.a = (() => {
            if ((y == 2)) {
              return cpu.i;
            } else {
              return cpu.r;
            }
            })();
            setFlag(cpu, FS, (((cpu.a & 128) >>> 0) != 0));
            setFlag(cpu, FZ, (cpu.a == 0));
            setFlag(cpu, FY, (((cpu.a & 32) >>> 0) != 0));
            setFlag(cpu, FX, (((cpu.a & 8) >>> 0) != 0));
            setFlag(cpu, FH, false);
            setFlag(cpu, FN, false);
            setFlag(cpu, FPV, cpu.iff2);
          } else {
            if ((y == 4)) {
              const m = rd(cpu, getHL(cpu));
              const newM = ((((Math.floor(m / 2 ** (__sh(4, 64))) | Math.trunc(((cpu.a & 15) >>> 0) * 2 ** (__sh(4, 64)))) >>> 0) & 255) >>> 0);
              cpu.a = ((((cpu.a & 240) >>> 0) | ((m & 15) >>> 0)) >>> 0);
              wr(cpu, getHL(cpu), newM);
              setSZYX(cpu, cpu.a);
              setFlag(cpu, FPV, parityEven(cpu.a));
              setFlag(cpu, FH, false);
              setFlag(cpu, FN, false);
            } else {
              if ((y == 5)) {
                const m = rd(cpu, getHL(cpu));
                const newM = ((((Math.trunc(m * 2 ** (__sh(4, 64))) | ((cpu.a & 15) >>> 0)) >>> 0) & 255) >>> 0);
                cpu.a = ((((cpu.a & 240) >>> 0) | ((Math.floor(m / 2 ** (__sh(4, 64))) & 15) >>> 0)) >>> 0);
                wr(cpu, getHL(cpu), newM);
                setSZYX(cpu, cpu.a);
                setFlag(cpu, FPV, parityEven(cpu.a));
                setFlag(cpu, FH, false);
                setFlag(cpu, FN, false);
              }
            }
          }
        }
      }
      return true;
    }
    return false;
  }
  if ((x == 2)) {
    if (((y >= 4) && (z < 4))) {
      let dir = __ovf((-1), -9223372036854775808, 9223372036854775807);
      if (((y == 4) || (y == 6))) {
        dir = 1;
      }
      if ((z == 0)) {
        blockLd(cpu, dir);
        if ((((y == 6) || (y == 7)) && (getBC(cpu) != 0))) {
          cpu.pc = ((__ovf((cpu.pc - 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
        }
        return true;
      }
      if ((z == 1)) {
        blockCp(cpu, dir);
        if (((((y == 6) || (y == 7)) && (getBC(cpu) != 0)) && (((cpu.f & FZ) >>> 0) == 0))) {
          cpu.pc = ((__ovf((cpu.pc - 2), -9223372036854775808, 9223372036854775807) & 65535) >>> 0);
        }
        return true;
      }
      return false;
    }
    return true;
  }
  return true;
}

function shiftOp(cpu, kind, v) {
  const oldC = (((cpu.f & FC) >>> 0) != 0);
  let res = 0;
  let carry = false;
  if ((kind == 0)) {
    carry = (((v & 128) >>> 0) != 0);
    res = ((((Math.trunc(v * 2 ** (__sh(1, 64))) | (() => {
    if (carry) {
      return 1;
    } else {
      return 0;
    }
    })()) >>> 0) & 255) >>> 0);
  } else {
    if ((kind == 1)) {
      carry = (((v & 1) >>> 0) != 0);
      res = ((((Math.floor(v / 2 ** (__sh(1, 64))) | (() => {
      if (carry) {
        return 128;
      } else {
        return 0;
      }
      })()) >>> 0) & 255) >>> 0);
    } else {
      if ((kind == 2)) {
        carry = (((v & 128) >>> 0) != 0);
        res = ((((Math.trunc(v * 2 ** (__sh(1, 64))) | (() => {
        if (oldC) {
          return 1;
        } else {
          return 0;
        }
        })()) >>> 0) & 255) >>> 0);
      } else {
        if ((kind == 3)) {
          carry = (((v & 1) >>> 0) != 0);
          res = ((((Math.floor(v / 2 ** (__sh(1, 64))) | (() => {
          if (oldC) {
            return 128;
          } else {
            return 0;
          }
          })()) >>> 0) & 255) >>> 0);
        } else {
          if ((kind == 4)) {
            carry = (((v & 128) >>> 0) != 0);
            res = ((Math.trunc(v * 2 ** (__sh(1, 64))) & 255) >>> 0);
          } else {
            if ((kind == 5)) {
              carry = (((v & 1) >>> 0) != 0);
              res = ((((Math.floor(v / 2 ** (__sh(1, 64))) | ((v & 128) >>> 0)) >>> 0) & 255) >>> 0);
            } else {
              if ((kind == 6)) {
                carry = (((v & 128) >>> 0) != 0);
                res = ((((Math.trunc(v * 2 ** (__sh(1, 64))) | 1) >>> 0) & 255) >>> 0);
              } else {
                carry = (((v & 1) >>> 0) != 0);
                res = ((Math.floor(v / 2 ** (__sh(1, 64))) & 255) >>> 0);
              }
            }
          }
        }
      }
    }
  }
  setSZYX(cpu, res);
  setFlag(cpu, FPV, parityEven(res));
  setFlag(cpu, FH, false);
  setFlag(cpu, FN, false);
  setFlag(cpu, FC, carry);
  return res;
}

function newSynth() {
  return new Synth([0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], Array.from({length: 24}, () => __clone(0)), [0, 0, 0, 0, 0, 0], 32768);
}

function opOff(opNum) {
  if ((opNum == 1)) {
    return 0;
  }
  if ((opNum == 2)) {
    return 8;
  }
  if ((opNum == 3)) {
    return 4;
  }
  return 12;
}

function operatorOut(s, z, c, part, ci, opNum, baseInc, modIn) {
  const off = opOff(opNum);
  const idx = __ovf((__ovf((c * 4), -9223372036854775808, 9223372036854775807) + __ovf((opNum - 1), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
  const inc = __ovf(__idiv(__ovf((baseInc * opMulX2(z, part, off, ci)), -9223372036854775808, 9223372036854775807), 2), -9223372036854775808, 9223372036854775807);
  __idxSet(s.opPhase, idx, ((__ovf((__idx(s.opPhase, idx) + inc), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0));
  const tl = ((__idx(z.ym, __ovf((__ovf((__ovf((part + 64), -9223372036854775808, 9223372036854775807) + off), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807)) & 127) >>> 0);
  const atten = __ovf((127 - tl), -9223372036854775808, 9223372036854775807);
  if ((atten <= 0)) {
    return 0;
  }
  const ph = ((__ovf((Math.floor(__idx(s.opPhase, idx) / 2 ** (__sh(8, 64))) + modIn), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  return __ovf(__idiv(__ovf((sineLut(ph) * atten), -9223372036854775808, 9223372036854775807), 127), -9223372036854775808, 9223372036854775807);
}

function fmChannel4op(s, z, c, part, ci, baseInc) {
  const alg = ((__idx(z.ym, __ovf((__ovf((part + 176), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807)) & 7) >>> 0);
  const fb = ((Math.floor(__idx(z.ym, __ovf((__ovf((part + 176), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807)) / 2 ** (__sh(3, 64))) & 7) >>> 0);
  let fbIn = 0;
  if ((fb > 0)) {
    fbIn = Math.floor(__idx(s.fbMem, c) / 2 ** (__sh(__ovf((9 - fb), -9223372036854775808, 9223372036854775807), 64)));
  }
  const o1 = operatorOut(s, z, c, part, ci, 1, baseInc, fbIn);
  __idxSet(s.fbMem, c, o1);
  let out = 0;
  if ((alg == 0)) {
    const o2 = operatorOut(s, z, c, part, ci, 2, baseInc, o1);
    const o3 = operatorOut(s, z, c, part, ci, 3, baseInc, o2);
    out = operatorOut(s, z, c, part, ci, 4, baseInc, o3);
  } else {
    if ((alg == 1)) {
      const o2 = operatorOut(s, z, c, part, ci, 2, baseInc, 0);
      const o3 = operatorOut(s, z, c, part, ci, 3, baseInc, __ovf((o1 + o2), -9223372036854775808, 9223372036854775807));
      out = operatorOut(s, z, c, part, ci, 4, baseInc, o3);
    } else {
      if ((alg == 2)) {
        const o2 = operatorOut(s, z, c, part, ci, 2, baseInc, 0);
        const o3 = operatorOut(s, z, c, part, ci, 3, baseInc, o2);
        out = operatorOut(s, z, c, part, ci, 4, baseInc, __ovf((o1 + o3), -9223372036854775808, 9223372036854775807));
      } else {
        if ((alg == 3)) {
          const o2 = operatorOut(s, z, c, part, ci, 2, baseInc, o1);
          const o3 = operatorOut(s, z, c, part, ci, 3, baseInc, 0);
          out = operatorOut(s, z, c, part, ci, 4, baseInc, __ovf((o2 + o3), -9223372036854775808, 9223372036854775807));
        } else {
          if ((alg == 4)) {
            const o2 = operatorOut(s, z, c, part, ci, 2, baseInc, o1);
            const o3 = operatorOut(s, z, c, part, ci, 3, baseInc, 0);
            const o4 = operatorOut(s, z, c, part, ci, 4, baseInc, o3);
            out = __ovf((o2 + o4), -9223372036854775808, 9223372036854775807);
          } else {
            if ((alg == 5)) {
              const o2 = operatorOut(s, z, c, part, ci, 2, baseInc, o1);
              const o3 = operatorOut(s, z, c, part, ci, 3, baseInc, o1);
              const o4 = operatorOut(s, z, c, part, ci, 4, baseInc, o1);
              out = __ovf((__ovf((o2 + o3), -9223372036854775808, 9223372036854775807) + o4), -9223372036854775808, 9223372036854775807);
            } else {
              if ((alg == 6)) {
                const o2 = operatorOut(s, z, c, part, ci, 2, baseInc, o1);
                const o3 = operatorOut(s, z, c, part, ci, 3, baseInc, 0);
                const o4 = operatorOut(s, z, c, part, ci, 4, baseInc, 0);
                out = __ovf((__ovf((o2 + o3), -9223372036854775808, 9223372036854775807) + o4), -9223372036854775808, 9223372036854775807);
              } else {
                const o2 = operatorOut(s, z, c, part, ci, 2, baseInc, 0);
                const o3 = operatorOut(s, z, c, part, ci, 3, baseInc, 0);
                const o4 = operatorOut(s, z, c, part, ci, 4, baseInc, 0);
                out = __ovf((__ovf((__ovf((o1 + o2), -9223372036854775808, 9223372036854775807) + o3), -9223372036854775808, 9223372036854775807) + o4), -9223372036854775808, 9223372036854775807);
              }
            }
          }
        }
      }
    }
  }
  return out;
}

function opMulX2(z, part, slotOff, ci) {
  const mul = ((__idx(z.ym, __ovf((__ovf((__ovf((part + 48), -9223372036854775808, 9223372036854775807) + slotOff), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807)) & 15) >>> 0);
  if ((mul == 0)) {
    return 1;
  }
  return __ovf((mul * 2), -9223372036854775808, 9223372036854775807);
}

function fmFreqMilli(z, c) {
  const part = (() => {
  if ((c < 3)) {
    return 0;
  } else {
    return 256;
  }
  })();
  const ci = __irem(c, 3);
  const lo = __idx(z.ym, __ovf((__ovf((part + 160), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807));
  const hi = __idx(z.ym, __ovf((__ovf((part + 164), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807));
  const fnum = ((Math.trunc(((hi & 7) >>> 0) * 2 ** (__sh(8, 64))) | lo) >>> 0);
  const block = ((Math.floor(hi / 2 ** (__sh(3, 64))) & 7) >>> 0);
  const shifted = Math.trunc(fnum * 2 ** (__sh(block, 64)));
  return __ovf(__idiv(__ovf((shifted * FM_SCALE_1E6), -9223372036854775808, 9223372036854775807), 1000), -9223372036854775808, 9223372036854775807);
}

function fmAmp(z, c) {
  const part = (() => {
  if ((c < 3)) {
    return 0;
  } else {
    return 256;
  }
  })();
  const ci = __irem(c, 3);
  const tl = ((__idx(z.ym, __ovf((__ovf((part + 76), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807)) & 127) >>> 0);
  const a = __ovf((255 - __ovf((tl * 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
  if ((a < 0)) {
    return 0;
  }
  return a;
}

function keyOnMask(z) {
  return __idx(z.ym, 40);
}

function panLR(z, part, ci) {
  const p = ((Math.floor(__idx(z.ym, __ovf((__ovf((part + 180), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807)) / 2 ** (__sh(6, 64))) & 3) >>> 0);
  if ((p == 0)) {
    return 3;
  }
  return p;
}

function synthSample(s, z) {
  let accL = 0;
  let accR = 0;
  const dacOn = (((__idx(z.ym, 43) & 128) >>> 0) != 0);
  if (dacOn) {
    if ((z.dacR < z.dacW)) {
      const smp = __idx(z.dac, ((z.dacR & 4095) >>> 0));
      z.dacR = __ovf((z.dacR + 1), -9223372036854775808, 9223372036854775807);
      const v = __ovf((__ovf((smp - 128), -9223372036854775808, 9223372036854775807) * 3), -9223372036854775808, 9223372036854775807);
      const pan = panLR(z, 256, 2);
      if ((((pan & 2) >>> 0) != 0)) {
        accL = __ovf((accL + v), -9223372036854775808, 9223372036854775807);
      }
      if ((((pan & 1) >>> 0) != 0)) {
        accR = __ovf((accR + v), -9223372036854775808, 9223372036854775807);
      }
    }
  }
  let c = 0;
  while ((c < 6)) {
    if ((!((c == 5) && dacOn))) {
      const part = (() => {
      if ((c < 3)) {
        return 0;
      } else {
        return 256;
      }
      })();
      const ci = __irem(c, 3);
      const target = (() => {
      if (__idx(z.fmKey, c)) {
        return fmAmp(z, c);
      } else {
        return 0;
      }
      })();
      if ((__idx(s.envLevel, c) < target)) {
        __idxSet(s.envLevel, c, __ovf((__idx(s.envLevel, c) + 8), -9223372036854775808, 9223372036854775807));
        if ((__idx(s.envLevel, c) > target)) {
          __idxSet(s.envLevel, c, target);
        }
      } else {
        if ((__idx(s.envLevel, c) > target)) {
          const rr = ((__idx(z.ym, __ovf((__ovf((part + 140), -9223372036854775808, 9223372036854775807) + ci), -9223372036854775808, 9223372036854775807)) & 15) >>> 0);
          const step = __ovf((1 + rr), -9223372036854775808, 9223372036854775807);
          __idxSet(s.envLevel, c, __ovf((__idx(s.envLevel, c) - step), -9223372036854775808, 9223372036854775807));
          if ((__idx(s.envLevel, c) < target)) {
            __idxSet(s.envLevel, c, target);
          }
        }
      }
      const fMilli = fmFreqMilli(z, c);
      if (((fMilli > 0) && (__idx(s.envLevel, c) > 0))) {
        const baseInc = __ovf(__idiv(__ovf((fMilli * 65536), -9223372036854775808, 9223372036854775807), __ovf((SAMPLE_RATE * 1000), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
        const chOut = __ovf(__idiv(__ovf((fmChannel4op(s, z, c, part, ci, baseInc) * __idx(s.envLevel, c)), -9223372036854775808, 9223372036854775807), 255), -9223372036854775808, 9223372036854775807);
        const pan = panLR(z, part, ci);
        if ((((pan & 2) >>> 0) != 0)) {
          accL = __ovf((accL + chOut), -9223372036854775808, 9223372036854775807);
        }
        if ((((pan & 1) >>> 0) != 0)) {
          accR = __ovf((accR + chOut), -9223372036854775808, 9223372036854775807);
        }
      }
    }
    c = __ovf((c + 1), -9223372036854775808, 9223372036854775807);
  }
  let ch = 0;
  while ((ch < 3)) {
    const period = __idx(z.psg, __ovf((ch * 2), -9223372036854775808, 9223372036854775807));
    const vol = __ovf((15 - ((__idx(z.psg, __ovf((__ovf((ch * 2), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807)) & 15) >>> 0)), -9223372036854775808, 9223372036854775807);
    if (((period > 0) && (vol > 0))) {
      const psgClk = 3579545;
      const freqMilli = __ovf(__idiv(__ovf((psgClk * 1000), -9223372036854775808, 9223372036854775807), __ovf((32 * period), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
      const inc = __ovf(__idiv(__ovf((freqMilli * 65536), -9223372036854775808, 9223372036854775807), __ovf((SAMPLE_RATE * 1000), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
      __idxSet(s.phase, __ovf((6 + ch), -9223372036854775808, 9223372036854775807), ((__ovf((__idx(s.phase, __ovf((6 + ch), -9223372036854775808, 9223372036854775807)) + inc), -9223372036854775808, 9223372036854775807) & 16777215) >>> 0));
      const sq = (() => {
      if ((((Math.floor(__idx(s.phase, __ovf((6 + ch), -9223372036854775808, 9223372036854775807)) / 2 ** (__sh(15, 64))) & 1) >>> 0) != 0)) {
        return 1;
      } else {
        return __ovf((-1), -9223372036854775808, 9223372036854775807);
      }
      })();
      const pv = __ovf((__ovf((sq * vol), -9223372036854775808, 9223372036854775807) * 40), -9223372036854775808, 9223372036854775807);
      accL = __ovf((accL + pv), -9223372036854775808, 9223372036854775807);
      accR = __ovf((accR + pv), -9223372036854775808, 9223372036854775807);
    }
    ch = __ovf((ch + 1), -9223372036854775808, 9223372036854775807);
  }
  return new StereoSample(clampS16(__ovf((accL * 40), -9223372036854775808, 9223372036854775807)), clampS16(__ovf((accR * 40), -9223372036854775808, 9223372036854775807)));
}

function clampS16(v) {
  if ((v > 32767)) {
    return 32767;
  }
  if ((v < __ovf((-32768), -9223372036854775808, 9223372036854775807))) {
    return __ovf((-32768), -9223372036854775808, 9223372036854775807);
  }
  return v;
}

function sineLut(idx) {
  const i = ((idx & 255) >>> 0);
  const x = i;
  let t = 0;
  if ((x < 64)) {
    t = x;
  } else {
    if ((x < 128)) {
      t = __ovf((128 - x), -9223372036854775808, 9223372036854775807);
    } else {
      if ((x < 192)) {
        t = __ovf((-__ovf((x - 128), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
      } else {
        t = __ovf((-__ovf((256 - x), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
      }
    }
  }
  return t;
}

function frameWidth(m) {
  if ((((__idx(m.vdpRegs, 12) & 1) >>> 0) != 0)) {
    return 320;
  }
  return 256;
}

function frameHeight(_m) {
  return 224;
}

function planeCells(code) {
  if ((code == 0)) {
    return 32;
  }
  if ((code == 1)) {
    return 64;
  }
  return 128;
}

function cramR(e) {
  return __ovf((((Math.floor(e / 2 ** (__sh(1, 64))) & 7) >>> 0) * 36), -9223372036854775808, 9223372036854775807);
}

function cramG(e) {
  return __ovf((((Math.floor(e / 2 ** (__sh(5, 64))) & 7) >>> 0) * 36), -9223372036854775808, 9223372036854775807);
}

function cramB(e) {
  return __ovf((((Math.floor(e / 2 ** (__sh(9, 64))) & 7) >>> 0) * 36), -9223372036854775808, 9223372036854775807);
}

function shComp(c, mode) {
  if ((mode == 1)) {
    return __ovf(__idiv(c, 2), -9223372036854775808, 9223372036854775807);
  }
  if ((mode == 2)) {
    const v = __ovf((__ovf(__idiv(c, 2), -9223372036854775808, 9223372036854775807) + 128), -9223372036854775808, 9223372036854775807);
    if ((v > 255)) {
      return 255;
    }
    return v;
  }
  return c;
}

function pixelR(m, packed) {
  return shComp(cramR(__idx(m.cram, ((packed & 63) >>> 0))), ((Math.floor(packed / 2 ** (__sh(6, 64))) & 3) >>> 0));
}

function pixelG(m, packed) {
  return shComp(cramG(__idx(m.cram, ((packed & 63) >>> 0))), ((Math.floor(packed / 2 ** (__sh(6, 64))) & 3) >>> 0));
}

function pixelB(m, packed) {
  return shComp(cramB(__idx(m.cram, ((packed & 63) >>> 0))), ((Math.floor(packed / 2 ** (__sh(6, 64))) & 3) >>> 0));
}

function vram8(m, addr) {
  const a = ((addr & 65535) >>> 0);
  if ((a < m.vram.length)) {
    return Math.trunc(__idx(m.vram, a));
  }
  return 0;
}

function wrapCoord(v, span) {
  const r = __irem(v, span);
  if ((r < 0)) {
    return __ovf((r + span), -9223372036854775808, 9223372036854775807);
  }
  return r;
}

function hscrollFor(m, y, planeB) {
  const hbase = Math.trunc(((__idx(m.vdpRegs, 13) & 63) >>> 0) * 2 ** (__sh(10, 64)));
  const mode = ((__idx(m.vdpRegs, 11) & 3) >>> 0);
  let row = 0;
  if ((mode == 3)) {
    row = y;
  } else {
    if ((mode == 2)) {
      row = ((y & (~7)) >>> 0);
    }
  }
  const planeOff = (() => {
  if (planeB) {
    return 2;
  } else {
    return 0;
  }
  })();
  const off = __ovf((__ovf((hbase + __ovf((row * 4), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + planeOff), -9223372036854775808, 9223372036854775807);
  return ((Math.trunc(vram8(m, off) * 2 ** (__sh(8, 64))) | vram8(m, __ovf((off + 1), -9223372036854775808, 9223372036854775807))) >>> 0);
}

function vscrollFor(m, planeB, colPair) {
  let idx = 0;
  if ((((__idx(m.vdpRegs, 11) & 4) >>> 0) != 0)) {
    idx = __irem(__ovf((colPair * 2), -9223372036854775808, 9223372036854775807), 40);
  }
  if (planeB) {
    return __idx(m.vsram, __irem(__ovf((idx + 1), -9223372036854775808, 9223372036854775807), 40));
  }
  return __idx(m.vsram, idx);
}

function sampleNametable(m, base, stride, cellX, cellY, fxIn, fyIn) {
  const entryAddr = __ovf((base + __ovf((__ovf((__ovf((cellY * stride), -9223372036854775808, 9223372036854775807) + cellX), -9223372036854775808, 9223372036854775807) * 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
  const entry = ((Math.trunc(vram8(m, entryAddr) * 2 ** (__sh(8, 64))) | vram8(m, __ovf((entryAddr + 1), -9223372036854775808, 9223372036854775807))) >>> 0);
  const tileIdx = ((entry & 2047) >>> 0);
  const palLine = ((Math.floor(entry / 2 ** (__sh(13, 64))) & 3) >>> 0);
  const hflip = (((entry & 2048) >>> 0) != 0);
  const vflip = (((entry & 4096) >>> 0) != 0);
  let fx = fxIn;
  let fy = fyIn;
  if (hflip) {
    fx = __ovf((7 - fx), -9223372036854775808, 9223372036854775807);
  }
  if (vflip) {
    fy = __ovf((7 - fy), -9223372036854775808, 9223372036854775807);
  }
  const byte = vram8(m, __ovf((__ovf((__ovf((tileIdx * 32), -9223372036854775808, 9223372036854775807) + __ovf((fy * 4), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + __ovf(__idiv(fx, 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807));
  let color = 0;
  if ((((fx & 1) >>> 0) == 0)) {
    color = ((Math.floor(byte / 2 ** (__sh(4, 64))) & 15) >>> 0);
  } else {
    color = ((byte & 15) >>> 0);
  }
  if ((color == 0)) {
    return __ovf((-1), -9223372036854775808, 9223372036854775807);
  }
  let packed = __ovf((__ovf((palLine * 16), -9223372036854775808, 9223372036854775807) + color), -9223372036854775808, 9223372036854775807);
  if ((((entry & 32768) >>> 0) != 0)) {
    packed = ((packed | PRI) >>> 0);
  }
  return packed;
}

function samplePlane(m, base, pw, ph, px, py) {
  return sampleNametable(m, base, pw, __irem(__ovf(__idiv(px, 8), -9223372036854775808, 9223372036854775807), pw), __irem(__ovf(__idiv(py, 8), -9223372036854775808, 9223372036854775807), ph), __irem(px, 8), __irem(py, 8));
}

function inWindow(m, x, y) {
  const rv = __idx(m.vdpRegs, 18);
  const vval = __ovf((((rv & 31) >>> 0) * 8), -9223372036854775808, 9223372036854775807);
  let yin = false;
  if ((((rv & 128) >>> 0) != 0)) {
    yin = (y >= vval);
  } else {
    yin = (y < vval);
  }
  const rh = __idx(m.vdpRegs, 17);
  const hval = __ovf((((rh & 31) >>> 0) * 16), -9223372036854775808, 9223372036854775807);
  let xin = false;
  if ((((rh & 128) >>> 0) != 0)) {
    xin = (x >= hval);
  } else {
    xin = (x < hval);
  }
  return (yin || xin);
}

function sampleWindow(m, x, y, width) {
  const stride = (() => {
  if ((width == 320)) {
    return 64;
  } else {
    return 32;
  }
  })();
  const base = (() => {
  if ((width == 320)) {
    return Math.trunc(((__idx(m.vdpRegs, 3) & 62) >>> 0) * 2 ** (__sh(10, 64)));
  } else {
    return Math.trunc(((__idx(m.vdpRegs, 3) & 63) >>> 0) * 2 ** (__sh(10, 64)));
  }
  })();
  return sampleNametable(m, base, stride, __ovf(__idiv(x, 8), -9223372036854775808, 9223372036854775807), __ovf(__idiv(y, 8), -9223372036854775808, 9223372036854775807), __irem(x, 8), __irem(y, 8));
}

function renderIndexed(m) {
  const width = frameWidth(m);
  const height = frameHeight(m);
  const planeW = planeCells(((__idx(m.vdpRegs, 16) & 3) >>> 0));
  const planeH = planeCells(((Math.floor(__idx(m.vdpRegs, 16) / 2 ** (__sh(4, 64))) & 3) >>> 0));
  const baseA = Math.trunc(((__idx(m.vdpRegs, 2) & 56) >>> 0) * 2 ** (__sh(10, 64)));
  const baseB = Math.trunc(((__idx(m.vdpRegs, 4) & 7) >>> 0) * 2 ** (__sh(13, 64)));
  const backdrop = ((__idx(m.vdpRegs, 7) & 63) >>> 0);
  const sh = (((__idx(m.vdpRegs, 12) & 8) >>> 0) != 0);
  if ((((__idx(m.vdpRegs, 1) & 64) >>> 0) == 0)) {
    let blank = [];
    let bi = 0;
    while ((bi < __ovf((width * height), -9223372036854775808, 9223372036854775807))) {
      blank.push(((backdrop & 63) >>> 0));
      bi = __ovf((bi + 1), -9223372036854775808, 9223372036854775807);
    }
    return blank;
  }
  const spanAx = __ovf((planeW * 8), -9223372036854775808, 9223372036854775807);
  const spanAy = __ovf((planeH * 8), -9223372036854775808, 9223372036854775807);
  let spr = [];
  let s = 0;
  while ((s < __ovf((width * height), -9223372036854775808, 9223372036854775807))) {
    spr.push(__ovf((-1), -9223372036854775808, 9223372036854775807));
    s = __ovf((s + 1), -9223372036854775808, 9223372036854775807);
  }
  drawSprites(m, spr, width, height);
  let fb = [];
  let y = 0;
  while ((y < height)) {
    const hA = hscrollFor(m, y, false);
    const hB = hscrollFor(m, y, true);
    let x = 0;
    while ((x < width)) {
      const colPair = __ovf(__idiv(x, 16), -9223372036854775808, 9223372036854775807);
      const pyA = wrapCoord(__ovf((y + vscrollFor(m, false, colPair)), -9223372036854775808, 9223372036854775807), spanAy);
      const pyB = wrapCoord(__ovf((y + vscrollFor(m, true, colPair)), -9223372036854775808, 9223372036854775807), spanAy);
      let aVal = __ovf((-1), -9223372036854775808, 9223372036854775807);
      if (inWindow(m, x, y)) {
        aVal = sampleWindow(m, x, y, width);
      } else {
        aVal = samplePlane(m, baseA, planeW, planeH, wrapCoord(__ovf((x - hA), -9223372036854775808, 9223372036854775807), spanAx), pyA);
      }
      const bVal = samplePlane(m, baseB, planeW, planeH, wrapCoord(__ovf((x - hB), -9223372036854775808, 9223372036854775807), spanAx), pyB);
      let sVal = __idx(spr, __ovf((__ovf((y * width), -9223372036854775808, 9223372036854775807) + x), -9223372036854775808, 9223372036854775807));
      let shadowed = false;
      let highlighted = false;
      if (sh) {
        const hiPlane = (((aVal >= 0) && (((aVal & PRI) >>> 0) != 0)) || ((bVal >= 0) && (((bVal & PRI) >>> 0) != 0)));
        shadowed = (!hiPlane);
        if ((sVal >= 0)) {
          const sc = ((sVal & 63) >>> 0);
          if ((sc == 63)) {
            shadowed = true;
            sVal = __ovf((-1), -9223372036854775808, 9223372036854775807);
          } else {
            if ((sc == 62)) {
              if (shadowed) {
                shadowed = false;
              } else {
                highlighted = true;
              }
              sVal = __ovf((-1), -9223372036854775808, 9223372036854775807);
            }
          }
        }
      }
      let pick = backdrop;
      let winSprite = false;
      if (((sVal >= 0) && (((sVal & PRI) >>> 0) != 0))) {
        pick = ((sVal & 63) >>> 0);
        winSprite = true;
      } else {
        if (((aVal >= 0) && (((aVal & PRI) >>> 0) != 0))) {
          pick = ((aVal & 63) >>> 0);
        } else {
          if (((bVal >= 0) && (((bVal & PRI) >>> 0) != 0))) {
            pick = ((bVal & 63) >>> 0);
          } else {
            if ((sVal >= 0)) {
              pick = ((sVal & 63) >>> 0);
              winSprite = true;
            } else {
              if ((aVal >= 0)) {
                pick = ((aVal & 63) >>> 0);
              } else {
                if ((bVal >= 0)) {
                  pick = ((bVal & 63) >>> 0);
                }
              }
            }
          }
        }
      }
      let mode = 0;
      if ((sh && (!winSprite))) {
        if (highlighted) {
          mode = 2;
        } else {
          if (shadowed) {
            mode = 1;
          }
        }
      }
      fb.push(((((pick & 63) >>> 0) | Math.trunc(mode * 2 ** (__sh(6, 64)))) >>> 0));
      x = __ovf((x + 1), -9223372036854775808, 9223372036854775807);
    }
    y = __ovf((y + 1), -9223372036854775808, 9223372036854775807);
  }
  return fb;
}

function drawSprites(m, fb, width, height) {
  const satBase = Math.trunc(((__idx(m.vdpRegs, 5) & 127) >>> 0) * 2 ** (__sh(9, 64)));
  let sprIdx = 0;
  let guard = 0;
  while ((guard < 80)) {
    const o = __ovf((satBase + __ovf((sprIdx * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
    const yraw = ((((Math.trunc(vram8(m, o) * 2 ** (__sh(8, 64))) | vram8(m, __ovf((o + 1), -9223372036854775808, 9223372036854775807))) >>> 0) & 1023) >>> 0);
    const sizeByte = vram8(m, __ovf((o + 2), -9223372036854775808, 9223372036854775807));
    const hs = __ovf((((Math.floor(sizeByte / 2 ** (__sh(2, 64))) & 3) >>> 0) + 1), -9223372036854775808, 9223372036854775807);
    const vs = __ovf((((sizeByte & 3) >>> 0) + 1), -9223372036854775808, 9223372036854775807);
    const link = ((vram8(m, __ovf((o + 3), -9223372036854775808, 9223372036854775807)) & 127) >>> 0);
    const attr = ((Math.trunc(vram8(m, __ovf((o + 4), -9223372036854775808, 9223372036854775807)) * 2 ** (__sh(8, 64))) | vram8(m, __ovf((o + 5), -9223372036854775808, 9223372036854775807))) >>> 0);
    const xraw = ((((Math.trunc(vram8(m, __ovf((o + 6), -9223372036854775808, 9223372036854775807)) * 2 ** (__sh(8, 64))) | vram8(m, __ovf((o + 7), -9223372036854775808, 9223372036854775807))) >>> 0) & 511) >>> 0);
    const tileBase = ((attr & 2047) >>> 0);
    const pal = ((Math.floor(attr / 2 ** (__sh(13, 64))) & 3) >>> 0);
    const hflip = (((attr & 2048) >>> 0) != 0);
    const vflip = (((attr & 4096) >>> 0) != 0);
    const pri = (((attr & 32768) >>> 0) != 0);
    const sx = __ovf((xraw - 128), -9223372036854775808, 9223372036854775807);
    const sy = __ovf((yraw - 128), -9223372036854775808, 9223372036854775807);
    let col = 0;
    while ((col < hs)) {
      let row = 0;
      while ((row < vs)) {
        const tile = __ovf((__ovf((tileBase + __ovf((col * vs), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + row), -9223372036854775808, 9223372036854775807);
        const destCol = (() => {
        if (hflip) {
          return __ovf((__ovf((hs - 1), -9223372036854775808, 9223372036854775807) - col), -9223372036854775808, 9223372036854775807);
        } else {
          return col;
        }
        })();
        const destRow = (() => {
        if (vflip) {
          return __ovf((__ovf((vs - 1), -9223372036854775808, 9223372036854775807) - row), -9223372036854775808, 9223372036854775807);
        } else {
          return row;
        }
        })();
        drawSprTile(m, fb, width, height, tile, __ovf((sx + __ovf((destCol * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807), __ovf((sy + __ovf((destRow * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807), pal, hflip, vflip, pri);
        row = __ovf((row + 1), -9223372036854775808, 9223372036854775807);
      }
      col = __ovf((col + 1), -9223372036854775808, 9223372036854775807);
    }
    if ((link == 0)) {
      return;
    }
    sprIdx = link;
    guard = __ovf((guard + 1), -9223372036854775808, 9223372036854775807);
  }
}

function drawSprTile(m, fb, width, height, tile, ox, oy, pal, hflip, vflip, pri) {
  let py = 0;
  while ((py < 8)) {
    let px = 0;
    while ((px < 8)) {
      const dx = __ovf((ox + px), -9223372036854775808, 9223372036854775807);
      const dy = __ovf((oy + py), -9223372036854775808, 9223372036854775807);
      if (((((dx >= 0) && (dx < width)) && (dy >= 0)) && (dy < height))) {
        const slot = __ovf((__ovf((dy * width), -9223372036854775808, 9223372036854775807) + dx), -9223372036854775808, 9223372036854775807);
        if ((__idx(fb, slot) < 0)) {
          let fx = px;
          let fy = py;
          if (hflip) {
            fx = __ovf((7 - px), -9223372036854775808, 9223372036854775807);
          }
          if (vflip) {
            fy = __ovf((7 - py), -9223372036854775808, 9223372036854775807);
          }
          const byte = vram8(m, __ovf((__ovf((__ovf((tile * 32), -9223372036854775808, 9223372036854775807) + __ovf((fy * 4), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + __ovf(__idiv(fx, 2), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807));
          let color = 0;
          if ((((fx & 1) >>> 0) == 0)) {
            color = ((Math.floor(byte / 2 ** (__sh(4, 64))) & 15) >>> 0);
          } else {
            color = ((byte & 15) >>> 0);
          }
          if ((color != 0)) {
            let packed = __ovf((__ovf((pal * 16), -9223372036854775808, 9223372036854775807) + color), -9223372036854775808, 9223372036854775807);
            if (pri) {
              packed = ((packed | PRI) >>> 0);
            }
            __idxSet(fb, slot, packed);
          }
        }
      }
      px = __ovf((px + 1), -9223372036854775808, 9223372036854775807);
    }
    py = __ovf((py + 1), -9223372036854775808, 9223372036854775807);
  }
}

function Unit$Eq$eq(self, _other) {
  return true;
}

function StereoSample$Eq$eq(self, other) {
  return ((self.l == other.l) && (self.r == other.r));
}

try { main(); __flush(); } catch (__e) { __flush(); if (__e && __e.__milo_trap) { __eprint(__e.message + "\n"); if (typeof process !== 'undefined') process.exit(134); } throw __e; }
