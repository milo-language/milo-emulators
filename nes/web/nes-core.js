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

class NesHandle {
  constructor(cpu, bus) {
    this.cpu = cpu;
    this.bus = bus;
  }
}

class Bus {
  constructor(ram, wram, prg, prgMask, ppu, apu, ctrl1, strobe, buttons, ctrl2, buttons2, mapper, prgBanks, prgBank, mmc2Prg, m227Lo, m227Hi, mmcSelect, mmcR0, mmcR1, mmcR2, mmcR3, mmcR4, mmcR5, mmcR6, mmcR7, irqLatch, irqCounter, irqReload, irqEnabled, irqPending, nmiArmed) {
    this.ram = ram;
    this.wram = wram;
    this.prg = prg;
    this.prgMask = prgMask;
    this.ppu = ppu;
    this.apu = apu;
    this.ctrl1 = ctrl1;
    this.strobe = strobe;
    this.buttons = buttons;
    this.ctrl2 = ctrl2;
    this.buttons2 = buttons2;
    this.mapper = mapper;
    this.prgBanks = prgBanks;
    this.prgBank = prgBank;
    this.mmc2Prg = mmc2Prg;
    this.m227Lo = m227Lo;
    this.m227Hi = m227Hi;
    this.mmcSelect = mmcSelect;
    this.mmcR0 = mmcR0;
    this.mmcR1 = mmcR1;
    this.mmcR2 = mmcR2;
    this.mmcR3 = mmcR3;
    this.mmcR4 = mmcR4;
    this.mmcR5 = mmcR5;
    this.mmcR6 = mmcR6;
    this.mmcR7 = mmcR7;
    this.irqLatch = irqLatch;
    this.irqCounter = irqCounter;
    this.irqReload = irqReload;
    this.irqEnabled = irqEnabled;
    this.irqPending = irqPending;
    this.nmiArmed = nmiArmed;
  }
}

class Cpu {
  constructor(a, x, y, sp, p, pc, cyc, extraCycles, unknownSeen) {
    this.a = a;
    this.x = x;
    this.y = y;
    this.sp = sp;
    this.p = p;
    this.pc = pc;
    this.cyc = cyc;
    this.extraCycles = extraCycles;
    this.unknownSeen = unknownSeen;
  }
}

class Cartridge {
  constructor(prg, chr, mapper, mirrorVertical, hasBattery, prg16kBanks, chr8kBanks) {
    this.prg = prg;
    this.chr = chr;
    this.mapper = mapper;
    this.mirrorVertical = mirrorVertical;
    this.hasBattery = hasBattery;
    this.prg16kBanks = prg16kBanks;
    this.chr8kBanks = chr8kBanks;
  }
}

class Ppu {
  constructor(chr, chrBankOffset, vram, palette, oam, mirrorVertical, ctrl, mask, status, oamAddr, v, t, fineX, w, readBuffer, scanline, dot, frame, nmiPending, scrollX, scrollY, mmc2, mmc2Latch0, mmc2Latch1, mmc2ChrFD0, mmc2ChrFE0, mmc2ChrFD1, mmc2ChrFE1, fb) {
    this.chr = chr;
    this.chrBankOffset = chrBankOffset;
    this.vram = vram;
    this.palette = palette;
    this.oam = oam;
    this.mirrorVertical = mirrorVertical;
    this.ctrl = ctrl;
    this.mask = mask;
    this.status = status;
    this.oamAddr = oamAddr;
    this.v = v;
    this.t = t;
    this.fineX = fineX;
    this.w = w;
    this.readBuffer = readBuffer;
    this.scanline = scanline;
    this.dot = dot;
    this.frame = frame;
    this.nmiPending = nmiPending;
    this.scrollX = scrollX;
    this.scrollY = scrollY;
    this.mmc2 = mmc2;
    this.mmc2Latch0 = mmc2Latch0;
    this.mmc2Latch1 = mmc2Latch1;
    this.mmc2ChrFD0 = mmc2ChrFD0;
    this.mmc2ChrFE0 = mmc2ChrFE0;
    this.mmc2ChrFD1 = mmc2ChrFD1;
    this.mmc2ChrFE1 = mmc2ChrFE1;
    this.fb = fb;
  }
}

class Pulse {
  constructor(enabled, duty, dutyPos, lengthHalt, constant, volume, timerPeriod, timerVal, length, envStart, envDivider, envDecay, sweepEnabled, sweepPeriod, sweepNegate, sweepShift, sweepReload, sweepDivider, isPulse2) {
    this.enabled = enabled;
    this.duty = duty;
    this.dutyPos = dutyPos;
    this.lengthHalt = lengthHalt;
    this.constant = constant;
    this.volume = volume;
    this.timerPeriod = timerPeriod;
    this.timerVal = timerVal;
    this.length = length;
    this.envStart = envStart;
    this.envDivider = envDivider;
    this.envDecay = envDecay;
    this.sweepEnabled = sweepEnabled;
    this.sweepPeriod = sweepPeriod;
    this.sweepNegate = sweepNegate;
    this.sweepShift = sweepShift;
    this.sweepReload = sweepReload;
    this.sweepDivider = sweepDivider;
    this.isPulse2 = isPulse2;
  }
}

class Triangle {
  constructor(enabled, control, length, linearReload, linearCounter, linearReloadFlag, timerPeriod, timerVal, seqPos) {
    this.enabled = enabled;
    this.control = control;
    this.length = length;
    this.linearReload = linearReload;
    this.linearCounter = linearCounter;
    this.linearReloadFlag = linearReloadFlag;
    this.timerPeriod = timerPeriod;
    this.timerVal = timerVal;
    this.seqPos = seqPos;
  }
}

class Noise {
  constructor(enabled, lengthHalt, constant, volume, length, envStart, envDivider, envDecay, mode, timerPeriod, timerVal, shift) {
    this.enabled = enabled;
    this.lengthHalt = lengthHalt;
    this.constant = constant;
    this.volume = volume;
    this.length = length;
    this.envStart = envStart;
    this.envDivider = envDivider;
    this.envDecay = envDecay;
    this.mode = mode;
    this.timerPeriod = timerPeriod;
    this.timerVal = timerVal;
    this.shift = shift;
  }
}

class Dmc {
  constructor(enabled, irqEnabled, loopFlag, rate, timer, output, sampleAddr, sampleLen, curAddr, bytesRemaining, shiftReg, bitsRemaining, bufferByte, bufferEmpty, silence, needsFetch, irqFlag) {
    this.enabled = enabled;
    this.irqEnabled = irqEnabled;
    this.loopFlag = loopFlag;
    this.rate = rate;
    this.timer = timer;
    this.output = output;
    this.sampleAddr = sampleAddr;
    this.sampleLen = sampleLen;
    this.curAddr = curAddr;
    this.bytesRemaining = bytesRemaining;
    this.shiftReg = shiftReg;
    this.bitsRemaining = bitsRemaining;
    this.bufferByte = bufferByte;
    this.bufferEmpty = bufferEmpty;
    this.silence = silence;
    this.needsFetch = needsFetch;
    this.irqFlag = irqFlag;
  }
}

class Apu {
  constructor(pulse1, pulse2, triangle, noise, dmc, frameMode, frameInhibit, frameIrq, frameCycle, cpuParity, sampleAccum, samples, pulseTable, tndTable, hpPrevIn, hpPrevOut) {
    this.pulse1 = pulse1;
    this.pulse2 = pulse2;
    this.triangle = triangle;
    this.noise = noise;
    this.dmc = dmc;
    this.frameMode = frameMode;
    this.frameInhibit = frameInhibit;
    this.frameIrq = frameIrq;
    this.frameCycle = frameCycle;
    this.cpuParity = cpuParity;
    this.sampleAccum = sampleAccum;
    this.samples = samples;
    this.pulseTable = pulseTable;
    this.tndTable = tndTable;
    this.hpPrevIn = hpPrevIn;
    this.hpPrevOut = hpPrevOut;
  }
}

const Result_Cartridge_string = {
  Ok(_0) { return { tag: 0, data: [_0] }; },
  Err(_0) { return { tag: 1, data: [_0] }; },
};

const __enumMeta = {
  "Result_Cartridge_string": [["Ok", 1], ["Err", 1]],
  "Option": [["Some", 1], ["None", 0]],
  "Result": [["Ok", 1], ["Err", 1]]
};

const FC = 1;
const FZ = 2;
const FI = 4;
const FD = 8;
const FB = 16;
const FU = 32;
const FV = 64;
const FN = 128;
const PRG_BANK = 16384;
const CHR_BANK = 8192;
const HEADER = 16;
const TRAINER = 512;
const NESPAL = [5526612, 7796, 528528, 3145864, 4456548, 6029360, 5506048, 3938304, 2107904, 539136, 16384, 15360, 12860, 0, 0, 0, 10000024, 543940, 3158764, 6037220, 8918192, 10490980, 9970208, 7879680, 5528064, 2650624, 556032, 30248, 26232, 0, 0, 0, 15527660, 5020396, 7896300, 11559660, 14963948, 15489204, 15493732, 13928480, 10529280, 7652352, 5034016, 3722348, 3716300, 3947580, 0, 0, 15527660, 11062508, 12369132, 13939436, 15511276, 15511252, 15512752, 14992528, 13423224, 11853432, 11068048, 10019508, 10540772, 10527392, 0, 0];
const CYCLES_PER_SAMPLE = 40.58442176870748;
const LENGTH_TABLE = [10, 254, 20, 2, 40, 4, 80, 6, 160, 8, 60, 10, 14, 12, 26, 14, 12, 16, 24, 18, 48, 20, 96, 22, 192, 24, 72, 26, 16, 28, 32, 30];
const NOISE_PERIOD = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];
const TRIANGLE_SEQ = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const DMC_RATE = [428, 380, 340, 320, 286, 254, 226, 214, 190, 160, 142, 128, 106, 84, 72, 54];
const DUTY_TABLE = [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1];

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

function main() {
  return 0;
}

function fallbackCart() {
  let prg = [];
  let i = 0;
  while ((i < 16384)) {
    if ((i == 16380)) {
      prg.push((0 & 0xFF));
    } else {
      if ((i == 16381)) {
        prg.push((128 & 0xFF));
      } else {
        prg.push((234 & 0xFF));
      }
    }
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  let chr = [];
  i = 0;
  while ((i < 8192)) {
    chr.push((0 & 0xFF));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return new Cartridge(prg, chr, 0, false, false, 1, 1);
}

function createNes(rom) {
  let cart = fallbackCart();
  const _t18 = parseCartridge(rom);
  if (_t18.tag === 0) {
    const c = _t18.data[0];
    cart = c;
  } else if (_t18.tag === 1) {
    const e = _t18.data[0];
    __print(("ROM parse failed: " + e) + "\n");
  }
  let bus = newBus(cart);
  let cpu = newCpuReset(bus);
  return new NesHandle(cpu, bus);
}

function setButtons(h, b) {
  h.bus.buttons = b;
}

function stepFrame(h) {
  const startFrame = h.bus.ppu.frame;
  while ((h.bus.ppu.frame == startFrame)) {
    const before = h.cpu.cyc;
    step(h.cpu, h.bus);
    const used = __ovf((h.cpu.cyc - before), -9223372036854775808, 9223372036854775807);
    let k = 0;
    while ((k < __ovf((used * 3), -9223372036854775808, 9223372036854775807))) {
      clockPpu(h.bus);
      k = __ovf((k + 1), -9223372036854775808, 9223372036854775807);
    }
    clockApu(h.bus, used);
    serviceInterrupts(h.cpu, h.bus);
  }
  renderFrame(h.bus.ppu);
}

function stepOne(h) {
  const before = h.cpu.cyc;
  step(h.cpu, h.bus);
  const used = __ovf((h.cpu.cyc - before), -9223372036854775808, 9223372036854775807);
  let k = 0;
  while ((k < __ovf((used * 3), -9223372036854775808, 9223372036854775807))) {
    clockPpu(h.bus);
    k = __ovf((k + 1), -9223372036854775808, 9223372036854775807);
  }
  clockApu(h.bus, used);
  serviceInterrupts(h.cpu, h.bus);
}

function newBus(cart) {
  const n = cart.prg.length;
  const mask = (() => {
  if ((n == 16384)) {
    return Math.trunc(16383);
  } else {
    return Math.trunc(32767);
  }
  })();
  const ppu = newPpu(cart.chr, cart.mirrorVertical);
  const banks = Math.trunc(cart.prg16kBanks);
  let bus = new Bus(Array.from({length: 2048}, () => __clone(0)), Array.from({length: 8192}, () => __clone(0)), cart.prg, mask, ppu, newApu(), 0, 0, 0, 0, 0, Math.trunc(cart.mapper), banks, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, false, false, false);
  if ((bus.mapper == 4)) {
    mmc3UpdateChr(bus);
  }
  if ((bus.mapper == 9)) {
    mmc2InitMapper(bus.ppu);
  }
  if ((bus.mapper == 227)) {
    bus.m227Hi = 0;
  }
  return bus;
}

function busRead(bus, addr) {
  const a = Math.trunc(addr);
  if ((a < 8192)) {
    return __idx(bus.ram, ((a & 2047) >>> 0));
  }
  if ((a < 16384)) {
    return ppuRegRead(bus.ppu, ((a & 7) >>> 0));
  }
  if ((a == 16406)) {
    if ((((bus.strobe & 1) & 0xFF) == 1)) {
      bus.ctrl1 = bus.buttons;
    }
    const bit = ((bus.ctrl1 & 1) & 0xFF);
    bus.ctrl1 = (((Math.floor(bus.ctrl1 / 2 ** (__sh(1, 8))) & 0xFF) | 128) & 0xFF);
    return ((bit | 64) & 0xFF);
  }
  if ((a == 16407)) {
    if ((((bus.strobe & 1) & 0xFF) == 1)) {
      bus.ctrl2 = bus.buttons2;
    }
    const bit = ((bus.ctrl2 & 1) & 0xFF);
    bus.ctrl2 = (((Math.floor(bus.ctrl2 / 2 ** (__sh(1, 8))) & 0xFF) | 128) & 0xFF);
    return ((bit | 64) & 0xFF);
  }
  if ((a == 16405)) {
    return apuReadStatus(bus.apu);
  }
  if (((a >= 24576) && (a < 32768))) {
    return __idx(bus.wram, __ovf((a - 24576), -9223372036854775808, 9223372036854775807));
  }
  if ((a >= 32768)) {
    if ((bus.mapper == 4)) {
      return __idx(bus.prg, mmc3PrgOffset(bus, a));
    }
    if ((bus.mapper == 9)) {
      const n8k = __ovf(__idiv(bus.prg.length, 8192), -9223372036854775808, 9223372036854775807);
      if ((a < 40960)) {
        return __idx(bus.prg, prgOffset(bus.prg, 8192, bus.mmc2Prg, __ovf((a - 32768), -9223372036854775808, 9223372036854775807)));
      }
      if ((a < 49152)) {
        return __idx(bus.prg, prgOffset(bus.prg, 8192, __ovf((n8k - 3), -9223372036854775808, 9223372036854775807), __ovf((a - 40960), -9223372036854775808, 9223372036854775807)));
      }
      if ((a < 57344)) {
        return __idx(bus.prg, prgOffset(bus.prg, 8192, __ovf((n8k - 2), -9223372036854775808, 9223372036854775807), __ovf((a - 49152), -9223372036854775808, 9223372036854775807)));
      }
      return __idx(bus.prg, prgOffset(bus.prg, 8192, __ovf((n8k - 1), -9223372036854775808, 9223372036854775807), __ovf((a - 57344), -9223372036854775808, 9223372036854775807)));
    }
    if ((bus.mapper == 227)) {
      if ((a < 49152)) {
        return __idx(bus.prg, prgOffset(bus.prg, 16384, bus.m227Lo, __ovf((a - 32768), -9223372036854775808, 9223372036854775807)));
      }
      return __idx(bus.prg, prgOffset(bus.prg, 16384, bus.m227Hi, __ovf((a - 49152), -9223372036854775808, 9223372036854775807)));
    }
    if ((bus.mapper == 2)) {
      if ((a < 49152)) {
        return __idx(bus.prg, prgOffset(bus.prg, 16384, bus.prgBank, __ovf((a - 32768), -9223372036854775808, 9223372036854775807)));
      }
      return __idx(bus.prg, prgOffset(bus.prg, 16384, __ovf((bus.prgBanks - 1), -9223372036854775808, 9223372036854775807), __ovf((a - 49152), -9223372036854775808, 9223372036854775807)));
    }
    return __idx(bus.prg, ((__ovf((a - 32768), -9223372036854775808, 9223372036854775807) & bus.prgMask) >>> 0));
  }
  return 0;
}

function busWrite(bus, addr, val) {
  const a = Math.trunc(addr);
  if ((a < 8192)) {
    __idxSet(bus.ram, ((a & 2047) >>> 0), val);
    return;
  }
  if ((a < 16384)) {
    ppuRegWrite(bus.ppu, ((a & 7) >>> 0), val);
    return;
  }
  if ((a == 16404)) {
    const page = Math.trunc(Math.trunc(val) * 2 ** (__sh(8, 64)));
    let i = 0;
    while ((i < 256)) {
      const b = busRead(bus, (__ovf((page + i), -9223372036854775808, 9223372036854775807) & 0xFFFF));
      ppuRegWrite(bus.ppu, 4, b);
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
    return;
  }
  if ((a == 16406)) {
    bus.strobe = ((val & 1) & 0xFF);
    if ((bus.strobe == 1)) {
      bus.ctrl1 = bus.buttons;
      bus.ctrl2 = bus.buttons2;
    }
    return;
  }
  if (((a >= 16384) && (a <= 16407))) {
    apuWrite(bus.apu, __ovf((a - 16384), -9223372036854775808, 9223372036854775807), val);
    return;
  }
  if (((a >= 24576) && (a < 32768))) {
    __idxSet(bus.wram, __ovf((a - 24576), -9223372036854775808, 9223372036854775807), val);
    return;
  }
  if ((a >= 32768)) {
    if ((bus.mapper == 2)) {
      bus.prgBank = ((Math.trunc(val) & __ovf((bus.prgBanks - 1), -9223372036854775808, 9223372036854775807)) >>> 0);
      return;
    }
    if ((bus.mapper == 4)) {
      mmc3Write(bus, a, val);
      return;
    }
    if ((bus.mapper == 9)) {
      if ((a < 40960)) {
        return;
      }
      if ((a < 45056)) {
        bus.mmc2Prg = ((Math.trunc(val) & 15) >>> 0);
      } else {
        if ((a < 49152)) {
          mmc2SetChr(bus.ppu, 0, ((Math.trunc(val) & 31) >>> 0));
        } else {
          if ((a < 53248)) {
            mmc2SetChr(bus.ppu, 1, ((Math.trunc(val) & 31) >>> 0));
          } else {
            if ((a < 57344)) {
              mmc2SetChr(bus.ppu, 2, ((Math.trunc(val) & 31) >>> 0));
            } else {
              if ((a < 61440)) {
                mmc2SetChr(bus.ppu, 3, ((Math.trunc(val) & 31) >>> 0));
              } else {
                bus.ppu.mirrorVertical = (((val & 1) & 0xFF) == 0);
              }
            }
          }
        }
      }
      return;
    }
    if ((bus.mapper == 227)) {
      mapper227Write(bus, a);
      return;
    }
    return;
  }
}

function mapper227Write(bus, a) {
  const bank = ((Math.floor(a / 2 ** (__sh(2, 64))) & 31) >>> 0);
  const l = ((Math.floor(a / 2 ** (__sh(7, 64))) & 1) >>> 0);
  const s = ((a & 1) >>> 0);
  const mirror = ((Math.floor(a / 2 ** (__sh(1, 64))) & 1) >>> 0);
  if ((l == 1)) {
    if ((s == 0)) {
      bus.m227Lo = ((bank & 30) >>> 0);
      bus.m227Hi = ((((bank & 30) >>> 0) | 1) >>> 0);
    } else {
      bus.m227Lo = bank;
      bus.m227Hi = bank;
    }
  } else {
    bus.m227Lo = bank;
    bus.m227Hi = ((((bank & 24) >>> 0) | (() => {
    if ((s == 1)) {
      return 7;
    } else {
      return 0;
    }
    })()) >>> 0);
  }
  bus.ppu.mirrorVertical = (mirror == 0);
}

function mmc3Write(bus, a, val) {
  const even = (((a & 1) >>> 0) == 0);
  const v = Math.trunc(val);
  if ((a < 40960)) {
    if (even) {
      bus.mmcSelect = v;
    } else {
      const r = ((bus.mmcSelect & 7) >>> 0);
      if ((r == 0)) {
        bus.mmcR0 = v;
      }
      if ((r == 1)) {
        bus.mmcR1 = v;
      }
      if ((r == 2)) {
        bus.mmcR2 = v;
      }
      if ((r == 3)) {
        bus.mmcR3 = v;
      }
      if ((r == 4)) {
        bus.mmcR4 = v;
      }
      if ((r == 5)) {
        bus.mmcR5 = v;
      }
      if ((r == 6)) {
        bus.mmcR6 = v;
      }
      if ((r == 7)) {
        bus.mmcR7 = v;
      }
      mmc3UpdateChr(bus);
    }
  } else {
    if ((a < 49152)) {
      if (even) {
        bus.ppu.mirrorVertical = (((v & 1) >>> 0) == 0);
      }
    } else {
      if ((a < 57344)) {
        if (even) {
          bus.irqLatch = v;
        } else {
          bus.irqReload = true;
        }
      } else {
        if (even) {
          bus.irqEnabled = false;
          bus.irqPending = false;
        } else {
          bus.irqEnabled = true;
        }
      }
    }
  }
}

function newCpuNestest() {
  return new Cpu(0, 0, 0, 253, 36, 49152, 7, 0, Array.from({length: 256}, () => __clone(false)));
}

function newCpuReset(bus) {
  const lo = Math.trunc(busRead(bus, 65532));
  const hi = Math.trunc(busRead(bus, 65533));
  return new Cpu(0, 0, 0, 253, 36, wrap16(((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0)), 0, 0, Array.from({length: 256}, () => __clone(false)));
}

function nmi(cpu, bus) {
  push16(cpu, bus, cpu.pc);
  push8(cpu, bus, ((((cpu.p & (~FB)) & 0xFF) | FU) & 0xFF));
  setFlag(cpu, FI, true);
  const lo = Math.trunc(busRead(bus, 65530));
  const hi = Math.trunc(busRead(bus, 65531));
  cpu.pc = wrap16(((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0));
  cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
}

function irq(cpu, bus) {
  push16(cpu, bus, cpu.pc);
  push8(cpu, bus, ((((cpu.p & (~FB)) & 0xFF) | FU) & 0xFF));
  setFlag(cpu, FI, true);
  const lo = Math.trunc(busRead(bus, 65534));
  const hi = Math.trunc(busRead(bus, 65535));
  cpu.pc = wrap16(((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0));
  cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
}

function serviceInterrupts(cpu, bus) {
  if (bus.nmiArmed) {
    bus.nmiArmed = false;
    nmi(cpu, bus);
  } else {
    if (bus.ppu.nmiPending) {
      bus.ppu.nmiPending = false;
      bus.nmiArmed = true;
    }
  }
  if ((((bus.irqPending || bus.apu.frameIrq) || bus.apu.dmc.irqFlag) && (!cpuFlag(cpu, 4)))) {
    bus.irqPending = false;
    irq(cpu, bus);
  }
}

function mmc3UpdateChr(bus) {
  const num1k = __ovf(__idiv(bus.ppu.chr.length, 1024), -9223372036854775808, 9223372036854775807);
  const mode = ((Math.floor(bus.mmcSelect / 2 ** (__sh(7, 64))) & 1) >>> 0);
  let w0 = 0;
  let w1 = 0;
  let w2 = 0;
  let w3 = 0;
  let w4 = 0;
  let w5 = 0;
  let w6 = 0;
  let w7 = 0;
  if ((mode == 0)) {
    w0 = ((bus.mmcR0 & 254) >>> 0);
    w1 = __ovf((((bus.mmcR0 & 254) >>> 0) + 1), -9223372036854775808, 9223372036854775807);
    w2 = ((bus.mmcR1 & 254) >>> 0);
    w3 = __ovf((((bus.mmcR1 & 254) >>> 0) + 1), -9223372036854775808, 9223372036854775807);
    w4 = bus.mmcR2;
    w5 = bus.mmcR3;
    w6 = bus.mmcR4;
    w7 = bus.mmcR5;
  } else {
    w0 = bus.mmcR2;
    w1 = bus.mmcR3;
    w2 = bus.mmcR4;
    w3 = bus.mmcR5;
    w4 = ((bus.mmcR0 & 254) >>> 0);
    w5 = __ovf((((bus.mmcR0 & 254) >>> 0) + 1), -9223372036854775808, 9223372036854775807);
    w6 = ((bus.mmcR1 & 254) >>> 0);
    w7 = __ovf((((bus.mmcR1 & 254) >>> 0) + 1), -9223372036854775808, 9223372036854775807);
  }
  __idxSet(bus.ppu.chrBankOffset, 0, __ovf((__irem(w0, num1k) * 1024), -9223372036854775808, 9223372036854775807));
  __idxSet(bus.ppu.chrBankOffset, 1, __ovf((__irem(w1, num1k) * 1024), -9223372036854775808, 9223372036854775807));
  __idxSet(bus.ppu.chrBankOffset, 2, __ovf((__irem(w2, num1k) * 1024), -9223372036854775808, 9223372036854775807));
  __idxSet(bus.ppu.chrBankOffset, 3, __ovf((__irem(w3, num1k) * 1024), -9223372036854775808, 9223372036854775807));
  __idxSet(bus.ppu.chrBankOffset, 4, __ovf((__irem(w4, num1k) * 1024), -9223372036854775808, 9223372036854775807));
  __idxSet(bus.ppu.chrBankOffset, 5, __ovf((__irem(w5, num1k) * 1024), -9223372036854775808, 9223372036854775807));
  __idxSet(bus.ppu.chrBankOffset, 6, __ovf((__irem(w6, num1k) * 1024), -9223372036854775808, 9223372036854775807));
  __idxSet(bus.ppu.chrBankOffset, 7, __ovf((__irem(w7, num1k) * 1024), -9223372036854775808, 9223372036854775807));
}

function prgOffset(prg, bankSize, bank, off) {
  const n = __ovf(__idiv(prg.length, bankSize), -9223372036854775808, 9223372036854775807);
  const b = __irem(__ovf((__irem(bank, n) + n), -9223372036854775808, 9223372036854775807), n);
  return __ovf((__ovf((b * bankSize), -9223372036854775808, 9223372036854775807) + off), -9223372036854775808, 9223372036854775807);
}

function mmc3PrgOffset(bus, a) {
  const num8k = __ovf(__idiv(bus.prg.length, 8192), -9223372036854775808, 9223372036854775807);
  const last = __ovf((num8k - 1), -9223372036854775808, 9223372036854775807);
  const mode = ((Math.floor(bus.mmcSelect / 2 ** (__sh(6, 64))) & 1) >>> 0);
  let bank = 0;
  if ((a < 40960)) {
    bank = (() => {
    if ((mode == 0)) {
      return bus.mmcR6;
    } else {
      return __ovf((last - 1), -9223372036854775808, 9223372036854775807);
    }
    })();
  } else {
    if ((a < 49152)) {
      bank = bus.mmcR7;
    } else {
      if ((a < 57344)) {
        bank = (() => {
        if ((mode == 0)) {
          return __ovf((last - 1), -9223372036854775808, 9223372036854775807);
        } else {
          return bus.mmcR6;
        }
        })();
      } else {
        bank = last;
      }
    }
  }
  return prgOffset(bus.prg, 8192, bank, ((a & 8191) >>> 0));
}

function mmc3ClockIrq(bus) {
  if (((bus.irqCounter == 0) || bus.irqReload)) {
    bus.irqCounter = bus.irqLatch;
    bus.irqReload = false;
  } else {
    bus.irqCounter = __ovf((bus.irqCounter - 1), -9223372036854775808, 9223372036854775807);
  }
  if (((bus.irqCounter == 0) && bus.irqEnabled)) {
    bus.irqPending = true;
  }
}

function clockApu(bus, cycles) {
  apuStep(bus.apu, cycles);
  if (bus.apu.dmc.needsFetch) {
    const addr = bus.apu.dmc.curAddr;
    const b = busRead(bus, (addr & 0xFFFF));
    dmcFill(bus.apu.dmc, Math.trunc(b));
  }
}

function clockPpu(bus) {
  ppuStep(bus.ppu);
  if (((((bus.mapper == 4) && (bus.ppu.dot == 260)) && (bus.ppu.scanline < 240)) && (((bus.ppu.mask & 24) & 0xFF) != 0))) {
    mmc3ClockIrq(bus);
  }
}

function cpuFlag(cpu, mask) {
  return (((cpu.p & mask) & 0xFF) != 0);
}

function setFlag(cpu, mask, on) {
  if (on) {
    cpu.p = ((cpu.p | mask) & 0xFF);
  } else {
    cpu.p = ((cpu.p & (~mask)) & 0xFF);
  }
}

function setZN(cpu, v) {
  setFlag(cpu, FZ, (v == 0));
  setFlag(cpu, FN, (((v & 128) & 0xFF) != 0));
}

function wrap16(v) {
  return (((v & 65535) >>> 0) & 0xFFFF);
}

function read16(bus, addr) {
  const lo = Math.trunc(busRead(bus, addr));
  const hi = Math.trunc(busRead(bus, wrap16(__ovf((Math.trunc(addr) + 1), -9223372036854775808, 9223372036854775807))));
  return wrap16(((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0));
}

function read16Bug(bus, addr) {
  const a = Math.trunc(addr);
  const lo = Math.trunc(busRead(bus, addr));
  const hiAddr = ((((a & 65280) >>> 0) | ((__ovf((a + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0)) >>> 0);
  const hi = Math.trunc(busRead(bus, wrap16(hiAddr)));
  return wrap16(((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0));
}

function fetch8(cpu, bus) {
  const v = busRead(bus, cpu.pc);
  cpu.pc = wrap16(__ovf((Math.trunc(cpu.pc) + 1), -9223372036854775808, 9223372036854775807));
  return v;
}

function fetch16(cpu, bus) {
  const v = read16(bus, cpu.pc);
  cpu.pc = wrap16(__ovf((Math.trunc(cpu.pc) + 2), -9223372036854775808, 9223372036854775807));
  return v;
}

function push8(cpu, bus, v) {
  busWrite(bus, wrap16(((256 | Math.trunc(cpu.sp)) >>> 0)), v);
  cpu.sp = ((cpu.sp - 1) & 0xFF);
}

function pop8(cpu, bus) {
  cpu.sp = ((cpu.sp + 1) & 0xFF);
  return busRead(bus, wrap16(((256 | Math.trunc(cpu.sp)) >>> 0)));
}

function push16(cpu, bus, v) {
  push8(cpu, bus, ((Math.floor(v / 2 ** (__sh(8, 16))) & 0xFFFF) & 0xFF));
  push8(cpu, bus, (v & 0xFF));
}

function pop16(cpu, bus) {
  const lo = Math.trunc(pop8(cpu, bus));
  const hi = Math.trunc(pop8(cpu, bus));
  return wrap16(((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0));
}

function pageCrossed(base, eff) {
  return (((Math.trunc(base) & 65280) >>> 0) != ((Math.trunc(eff) & 65280) >>> 0));
}

function read16ZP(bus, z) {
  const lo = Math.trunc(busRead(bus, (((z & 255) >>> 0) & 0xFFFF)));
  const hi = Math.trunc(busRead(bus, (((__ovf((z + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0) & 0xFFFF)));
  return wrap16(((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0));
}

function aImm(cpu) {
  const a = cpu.pc;
  cpu.pc = wrap16(__ovf((Math.trunc(cpu.pc) + 1), -9223372036854775808, 9223372036854775807));
  return a;
}

function aZp(cpu, bus) {
  return (fetch8(cpu, bus) & 0xFFFF);
}

function aZpX(cpu, bus) {
  return (((__ovf((Math.trunc(fetch8(cpu, bus)) + Math.trunc(cpu.x)), -9223372036854775808, 9223372036854775807) & 255) >>> 0) & 0xFFFF);
}

function aZpY(cpu, bus) {
  return (((__ovf((Math.trunc(fetch8(cpu, bus)) + Math.trunc(cpu.y)), -9223372036854775808, 9223372036854775807) & 255) >>> 0) & 0xFFFF);
}

function aAbs(cpu, bus) {
  return fetch16(cpu, bus);
}

function aAbsX(cpu, bus) {
  const base = fetch16(cpu, bus);
  const eff = wrap16(__ovf((Math.trunc(base) + Math.trunc(cpu.x)), -9223372036854775808, 9223372036854775807));
  if (pageCrossed(base, eff)) {
    cpu.extraCycles = 1;
  }
  return eff;
}

function aAbsY(cpu, bus) {
  const base = fetch16(cpu, bus);
  const eff = wrap16(__ovf((Math.trunc(base) + Math.trunc(cpu.y)), -9223372036854775808, 9223372036854775807));
  if (pageCrossed(base, eff)) {
    cpu.extraCycles = 1;
  }
  return eff;
}

function aIndX(cpu, bus) {
  const z = ((__ovf((Math.trunc(fetch8(cpu, bus)) + Math.trunc(cpu.x)), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
  return read16ZP(bus, z);
}

function aIndY(cpu, bus) {
  const z = Math.trunc(fetch8(cpu, bus));
  const base = read16ZP(bus, z);
  const eff = wrap16(__ovf((Math.trunc(base) + Math.trunc(cpu.y)), -9223372036854775808, 9223372036854775807));
  if (pageCrossed(base, eff)) {
    cpu.extraCycles = 1;
  }
  return eff;
}

function adc(cpu, m) {
  const a = Math.trunc(cpu.a);
  const carry = (() => {
  if (cpuFlag(cpu, FC)) {
    return Math.trunc(1);
  } else {
    return Math.trunc(0);
  }
  })();
  const sum = __ovf((__ovf((a + Math.trunc(m)), -9223372036854775808, 9223372036854775807) + carry), -9223372036854775808, 9223372036854775807);
  const r = (((sum & 255) >>> 0) & 0xFF);
  setFlag(cpu, FC, (sum > 255));
  setFlag(cpu, FV, ((((((~((a ^ Math.trunc(m)) >>> 0)) & ((a ^ Math.trunc(r)) >>> 0)) >>> 0) & 128) >>> 0) != 0));
  cpu.a = r;
  setZN(cpu, r);
}

function sbc(cpu, m) {
  adc(cpu, (((Math.trunc(m) ^ 255) >>> 0) & 0xFF));
}

function compare(cpu, reg, m) {
  setFlag(cpu, FC, (reg >= m));
  setZN(cpu, ((reg - m) & 0xFF));
}

function bitTest(cpu, m) {
  setFlag(cpu, FZ, (((Math.trunc(cpu.a) & Math.trunc(m)) >>> 0) == 0));
  setFlag(cpu, FN, (((m & 128) & 0xFF) != 0));
  setFlag(cpu, FV, (((m & 64) & 0xFF) != 0));
}

function aslV(cpu, m) {
  setFlag(cpu, FC, (((m & 128) & 0xFF) != 0));
  const r = ((m << __sh(1, 8)) & 0xFF);
  setZN(cpu, r);
  return r;
}

function lsrV(cpu, m) {
  setFlag(cpu, FC, (((m & 1) & 0xFF) != 0));
  const r = (Math.floor(m / 2 ** (__sh(1, 8))) & 0xFF);
  setZN(cpu, r);
  return r;
}

function rolV(cpu, m) {
  const cin = (() => {
  if (cpuFlag(cpu, FC)) {
    return 1;
  } else {
    return 0;
  }
  })();
  setFlag(cpu, FC, (((m & 128) & 0xFF) != 0));
  const r = ((((m << __sh(1, 8)) & 0xFF) | cin) & 0xFF);
  setZN(cpu, r);
  return r;
}

function rorV(cpu, m) {
  const cin = (() => {
  if (cpuFlag(cpu, FC)) {
    return 128;
  } else {
    return 0;
  }
  })();
  setFlag(cpu, FC, (((m & 1) & 0xFF) != 0));
  const r = (((Math.floor(m / 2 ** (__sh(1, 8))) & 0xFF) | cin) & 0xFF);
  setZN(cpu, r);
  return r;
}

function branch(cpu, bus, cond) {
  let off = Math.trunc(fetch8(cpu, bus));
  if ((off >= 128)) {
    off = __ovf((off - 256), -9223372036854775808, 9223372036854775807);
  }
  if (cond) {
    const pcNow = cpu.pc;
    const target = wrap16(__ovf((Math.trunc(cpu.pc) + off), -9223372036854775808, 9223372036854775807));
    cpu.cyc = __ovf((cpu.cyc + 1), -9223372036854775808, 9223372036854775807);
    if (pageCrossed(pcNow, target)) {
      cpu.cyc = __ovf((cpu.cyc + 1), -9223372036854775808, 9223372036854775807);
    }
    cpu.pc = target;
  }
}

function appendStr(dst, src) {
  const _t19 = src;
  for (let _t20 = 0; _t20 < _t19.length; _t20++) {
    const b = _t19.charCodeAt(_t20);
    (dst.v += String.fromCharCode(b));
  }
}

function hex2(v) {
  const d = "0123456789ABCDEF";
  let s = "";
  (s += String.fromCharCode(__sbyte(d, ((Math.floor(v / 2 ** (__sh(4, 64))) & 15) >>> 0))));
  (s += String.fromCharCode(__sbyte(d, ((v & 15) >>> 0))));
  return s;
}

function hex4(v) {
  const s = {v: hex2(((Math.floor(v / 2 ** (__sh(8, 64))) & 255) >>> 0))};
  const lo = hex2(((v & 255) >>> 0));
  appendStr(s, lo);
  return s.v;
}

function decStr(n) {
  if ((n == 0)) {
    return "0";
  }
  let v = n;
  let buf = "";
  while ((v > 0)) {
    (buf += String.fromCharCode((__ovf((__irem(v, 10) + 48), -9223372036854775808, 9223372036854775807) & 0xFF)));
    v = __ovf(__idiv(v, 10), -9223372036854775808, 9223372036854775807);
  }
  let out = "";
  let i = __ovf((buf.length - 1), -9223372036854775808, 9223372036854775807);
  while ((i >= 0)) {
    (out += String.fromCharCode(__sbyte(buf, i)));
    i = __ovf((i - 1), -9223372036854775808, 9223372036854775807);
  }
  return out;
}

function formatState(cpu) {
  const s = {v: hex4(Math.trunc(cpu.pc))};
  const a = hex2(Math.trunc(cpu.a));
  appendStr(s, " A:");
  appendStr(s, a);
  const x = hex2(Math.trunc(cpu.x));
  appendStr(s, " X:");
  appendStr(s, x);
  const y = hex2(Math.trunc(cpu.y));
  appendStr(s, " Y:");
  appendStr(s, y);
  const p = hex2(Math.trunc(cpu.p));
  appendStr(s, " P:");
  appendStr(s, p);
  const sp = hex2(Math.trunc(cpu.sp));
  appendStr(s, " SP:");
  appendStr(s, sp);
  const c = decStr(cpu.cyc);
  appendStr(s, " CYC:");
  appendStr(s, c);
  return s.v;
}

function lax(cpu, bus, addr) {
  const v = busRead(bus, addr);
  cpu.a = v;
  cpu.x = v;
  setZN(cpu, v);
}

function sax(cpu, bus, addr) {
  busWrite(bus, addr, ((cpu.a & cpu.x) & 0xFF));
}

function dcp(cpu, bus, addr) {
  const m = ((busRead(bus, addr) - 1) & 0xFF);
  busWrite(bus, addr, m);
  compare(cpu, cpu.a, m);
}

function isb(cpu, bus, addr) {
  const m = ((busRead(bus, addr) + 1) & 0xFF);
  busWrite(bus, addr, m);
  sbc(cpu, m);
}

function slo(cpu, bus, addr) {
  const m = aslV(cpu, busRead(bus, addr));
  busWrite(bus, addr, m);
  cpu.a = ((cpu.a | m) & 0xFF);
  setZN(cpu, cpu.a);
}

function rla(cpu, bus, addr) {
  const m = rolV(cpu, busRead(bus, addr));
  busWrite(bus, addr, m);
  cpu.a = ((cpu.a & m) & 0xFF);
  setZN(cpu, cpu.a);
}

function sre(cpu, bus, addr) {
  const m = lsrV(cpu, busRead(bus, addr));
  busWrite(bus, addr, m);
  cpu.a = ((cpu.a ^ m) & 0xFF);
  setZN(cpu, cpu.a);
}

function rra(cpu, bus, addr) {
  const m = rorV(cpu, busRead(bus, addr));
  busWrite(bus, addr, m);
  adc(cpu, m);
}

function anc(cpu, m) {
  cpu.a = ((cpu.a & m) & 0xFF);
  setZN(cpu, cpu.a);
  setFlag(cpu, FC, (((cpu.a & 128) & 0xFF) != 0));
}

function alr(cpu, m) {
  cpu.a = lsrV(cpu, ((cpu.a & m) & 0xFF));
}

function arr(cpu, m) {
  const cin = (() => {
  if (cpuFlag(cpu, FC)) {
    return 128;
  } else {
    return 0;
  }
  })();
  const r = (((Math.floor(((cpu.a & m) & 0xFF) / 2 ** (__sh(1, 8))) & 0xFF) | cin) & 0xFF);
  cpu.a = r;
  setZN(cpu, r);
  setFlag(cpu, FC, (((r & 64) & 0xFF) != 0));
  setFlag(cpu, FV, (((((Math.floor(Math.trunc(r) / 2 ** (__sh(6, 64))) ^ Math.floor(Math.trunc(r) / 2 ** (__sh(5, 64)))) >>> 0) & 1) >>> 0) != 0));
}

function sbx(cpu, m) {
  const ax = ((Math.trunc(cpu.a) & Math.trunc(cpu.x)) >>> 0);
  setFlag(cpu, FC, (ax >= Math.trunc(m)));
  cpu.x = (((__ovf((ax - Math.trunc(m)), -9223372036854775808, 9223372036854775807) & 255) >>> 0) & 0xFF);
  setZN(cpu, cpu.x);
}

function las(cpu, bus, addr) {
  const t = ((busRead(bus, addr) & cpu.sp) & 0xFF);
  cpu.a = t;
  cpu.x = t;
  cpu.sp = t;
  setZN(cpu, t);
}

function lxa(cpu, m) {
  cpu.a = m;
  cpu.x = m;
  setZN(cpu, m);
}

function ane(cpu, m) {
  cpu.a = ((((((cpu.a | 238) & 0xFF) & cpu.x) & 0xFF) & m) & 0xFF);
  setZN(cpu, cpu.a);
}

function hiPlus1(addr) {
  return ((__ovf((Math.floor(Math.trunc(addr) / 2 ** (__sh(8, 64))) + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0);
}

function sha(cpu, bus, addr) {
  busWrite(bus, addr, (((((((Math.trunc(cpu.a) & Math.trunc(cpu.x)) >>> 0) & hiPlus1(addr)) >>> 0) & 255) >>> 0) & 0xFF));
}

function shx(cpu, bus, addr) {
  busWrite(bus, addr, (((((Math.trunc(cpu.x) & hiPlus1(addr)) >>> 0) & 255) >>> 0) & 0xFF));
}

function shy(cpu, bus, addr) {
  busWrite(bus, addr, (((((Math.trunc(cpu.y) & hiPlus1(addr)) >>> 0) & 255) >>> 0) & 0xFF));
}

function tas(cpu, bus, addr) {
  cpu.sp = ((cpu.a & cpu.x) & 0xFF);
  busWrite(bus, addr, (((((Math.trunc(cpu.sp) & hiPlus1(addr)) >>> 0) & 255) >>> 0) & 0xFF));
}

function jam(cpu) {
  cpu.pc = wrap16(__ovf((Math.trunc(cpu.pc) - 1), -9223372036854775808, 9223372036854775807));
  cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
}

function step(cpu, bus) {
  cpu.extraCycles = 0;
  const op = fetch8(cpu, bus);
  const _t21 = op;
  if (_t21 === 0) {
    push16(cpu, bus, wrap16(__ovf((Math.trunc(cpu.pc) + 1), -9223372036854775808, 9223372036854775807)));
    push8(cpu, bus, ((((cpu.p | FB) & 0xFF) | FU) & 0xFF));
    setFlag(cpu, FI, true);
    const lo = Math.trunc(busRead(bus, 65534));
    const hi = Math.trunc(busRead(bus, 65535));
    cpu.pc = wrap16(((lo | Math.trunc(hi * 2 ** (__sh(8, 64)))) >>> 0));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 169) {
    const v = busRead(bus, aImm(cpu));
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 165) {
    const v = busRead(bus, aZp(cpu, bus));
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 181) {
    const v = busRead(bus, aZpX(cpu, bus));
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 173) {
    const v = busRead(bus, aAbs(cpu, bus));
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 189) {
    const v = busRead(bus, aAbsX(cpu, bus));
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 185) {
    const v = busRead(bus, aAbsY(cpu, bus));
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 161) {
    const v = busRead(bus, aIndX(cpu, bus));
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 177) {
    const v = busRead(bus, aIndY(cpu, bus));
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 162) {
    const v = busRead(bus, aImm(cpu));
    cpu.x = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 166) {
    const v = busRead(bus, aZp(cpu, bus));
    cpu.x = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 182) {
    const v = busRead(bus, aZpY(cpu, bus));
    cpu.x = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 174) {
    const v = busRead(bus, aAbs(cpu, bus));
    cpu.x = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 190) {
    const v = busRead(bus, aAbsY(cpu, bus));
    cpu.x = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 160) {
    const v = busRead(bus, aImm(cpu));
    cpu.y = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 164) {
    const v = busRead(bus, aZp(cpu, bus));
    cpu.y = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 180) {
    const v = busRead(bus, aZpX(cpu, bus));
    cpu.y = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 172) {
    const v = busRead(bus, aAbs(cpu, bus));
    cpu.y = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 188) {
    const v = busRead(bus, aAbsX(cpu, bus));
    cpu.y = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 133) {
    busWrite(bus, aZp(cpu, bus), cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 149) {
    busWrite(bus, aZpX(cpu, bus), cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 141) {
    busWrite(bus, aAbs(cpu, bus), cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 157) {
    busWrite(bus, aAbsX(cpu, bus), cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 153) {
    busWrite(bus, aAbsY(cpu, bus), cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 129) {
    busWrite(bus, aIndX(cpu, bus), cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 145) {
    busWrite(bus, aIndY(cpu, bus), cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 134) {
    busWrite(bus, aZp(cpu, bus), cpu.x);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 150) {
    busWrite(bus, aZpY(cpu, bus), cpu.x);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 142) {
    busWrite(bus, aAbs(cpu, bus), cpu.x);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 132) {
    busWrite(bus, aZp(cpu, bus), cpu.y);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 148) {
    busWrite(bus, aZpX(cpu, bus), cpu.y);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 140) {
    busWrite(bus, aAbs(cpu, bus), cpu.y);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 170) {
    cpu.x = cpu.a;
    setZN(cpu, cpu.x);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 168) {
    cpu.y = cpu.a;
    setZN(cpu, cpu.y);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 138) {
    cpu.a = cpu.x;
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 152) {
    cpu.a = cpu.y;
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 186) {
    cpu.x = cpu.sp;
    setZN(cpu, cpu.x);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 154) {
    cpu.sp = cpu.x;
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 72) {
    push8(cpu, bus, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 104) {
    const v = pop8(cpu, bus);
    cpu.a = v;
    setZN(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 8) {
    push8(cpu, bus, ((((cpu.p | FB) & 0xFF) | FU) & 0xFF));
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 40) {
    const v = pop8(cpu, bus);
    cpu.p = ((((v & (~FB)) & 0xFF) | FU) & 0xFF);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 41) {
    const v = busRead(bus, aImm(cpu));
    cpu.a = ((cpu.a & v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 37) {
    const v = busRead(bus, aZp(cpu, bus));
    cpu.a = ((cpu.a & v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 53) {
    const v = busRead(bus, aZpX(cpu, bus));
    cpu.a = ((cpu.a & v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 45) {
    const v = busRead(bus, aAbs(cpu, bus));
    cpu.a = ((cpu.a & v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 61) {
    const v = busRead(bus, aAbsX(cpu, bus));
    cpu.a = ((cpu.a & v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 57) {
    const v = busRead(bus, aAbsY(cpu, bus));
    cpu.a = ((cpu.a & v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 33) {
    const v = busRead(bus, aIndX(cpu, bus));
    cpu.a = ((cpu.a & v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 49) {
    const v = busRead(bus, aIndY(cpu, bus));
    cpu.a = ((cpu.a & v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 9) {
    const v = busRead(bus, aImm(cpu));
    cpu.a = ((cpu.a | v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 5) {
    const v = busRead(bus, aZp(cpu, bus));
    cpu.a = ((cpu.a | v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 21) {
    const v = busRead(bus, aZpX(cpu, bus));
    cpu.a = ((cpu.a | v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 13) {
    const v = busRead(bus, aAbs(cpu, bus));
    cpu.a = ((cpu.a | v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 29) {
    const v = busRead(bus, aAbsX(cpu, bus));
    cpu.a = ((cpu.a | v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 25) {
    const v = busRead(bus, aAbsY(cpu, bus));
    cpu.a = ((cpu.a | v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 1) {
    const v = busRead(bus, aIndX(cpu, bus));
    cpu.a = ((cpu.a | v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 17) {
    const v = busRead(bus, aIndY(cpu, bus));
    cpu.a = ((cpu.a | v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 73) {
    const v = busRead(bus, aImm(cpu));
    cpu.a = ((cpu.a ^ v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 69) {
    const v = busRead(bus, aZp(cpu, bus));
    cpu.a = ((cpu.a ^ v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 85) {
    const v = busRead(bus, aZpX(cpu, bus));
    cpu.a = ((cpu.a ^ v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 77) {
    const v = busRead(bus, aAbs(cpu, bus));
    cpu.a = ((cpu.a ^ v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 93) {
    const v = busRead(bus, aAbsX(cpu, bus));
    cpu.a = ((cpu.a ^ v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 89) {
    const v = busRead(bus, aAbsY(cpu, bus));
    cpu.a = ((cpu.a ^ v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 65) {
    const v = busRead(bus, aIndX(cpu, bus));
    cpu.a = ((cpu.a ^ v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 81) {
    const v = busRead(bus, aIndY(cpu, bus));
    cpu.a = ((cpu.a ^ v) & 0xFF);
    setZN(cpu, cpu.a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 105) {
    const v = busRead(bus, aImm(cpu));
    adc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 101) {
    const v = busRead(bus, aZp(cpu, bus));
    adc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 117) {
    const v = busRead(bus, aZpX(cpu, bus));
    adc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 109) {
    const v = busRead(bus, aAbs(cpu, bus));
    adc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 125) {
    const v = busRead(bus, aAbsX(cpu, bus));
    adc(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 121) {
    const v = busRead(bus, aAbsY(cpu, bus));
    adc(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 97) {
    const v = busRead(bus, aIndX(cpu, bus));
    adc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 113) {
    const v = busRead(bus, aIndY(cpu, bus));
    adc(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 233) {
    const v = busRead(bus, aImm(cpu));
    sbc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 229) {
    const v = busRead(bus, aZp(cpu, bus));
    sbc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 245) {
    const v = busRead(bus, aZpX(cpu, bus));
    sbc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 237) {
    const v = busRead(bus, aAbs(cpu, bus));
    sbc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 253) {
    const v = busRead(bus, aAbsX(cpu, bus));
    sbc(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 249) {
    const v = busRead(bus, aAbsY(cpu, bus));
    sbc(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 225) {
    const v = busRead(bus, aIndX(cpu, bus));
    sbc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 241) {
    const v = busRead(bus, aIndY(cpu, bus));
    sbc(cpu, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 201) {
    const v = busRead(bus, aImm(cpu));
    compare(cpu, cpu.a, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 197) {
    const v = busRead(bus, aZp(cpu, bus));
    compare(cpu, cpu.a, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 213) {
    const v = busRead(bus, aZpX(cpu, bus));
    compare(cpu, cpu.a, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 205) {
    const v = busRead(bus, aAbs(cpu, bus));
    compare(cpu, cpu.a, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 221) {
    const v = busRead(bus, aAbsX(cpu, bus));
    compare(cpu, cpu.a, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 217) {
    const v = busRead(bus, aAbsY(cpu, bus));
    compare(cpu, cpu.a, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 193) {
    const v = busRead(bus, aIndX(cpu, bus));
    compare(cpu, cpu.a, v);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 209) {
    const v = busRead(bus, aIndY(cpu, bus));
    compare(cpu, cpu.a, v);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 224) {
    const v = busRead(bus, aImm(cpu));
    compare(cpu, cpu.x, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 228) {
    const v = busRead(bus, aZp(cpu, bus));
    compare(cpu, cpu.x, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 236) {
    const v = busRead(bus, aAbs(cpu, bus));
    compare(cpu, cpu.x, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 192) {
    const v = busRead(bus, aImm(cpu));
    compare(cpu, cpu.y, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 196) {
    const v = busRead(bus, aZp(cpu, bus));
    compare(cpu, cpu.y, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 204) {
    const v = busRead(bus, aAbs(cpu, bus));
    compare(cpu, cpu.y, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 36) {
    const v = busRead(bus, aZp(cpu, bus));
    bitTest(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 44) {
    const v = busRead(bus, aAbs(cpu, bus));
    bitTest(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 230) {
    const a = aZp(cpu, bus);
    const r = ((busRead(bus, a) + 1) & 0xFF);
    busWrite(bus, a, r);
    setZN(cpu, r);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 246) {
    const a = aZpX(cpu, bus);
    const r = ((busRead(bus, a) + 1) & 0xFF);
    busWrite(bus, a, r);
    setZN(cpu, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 238) {
    const a = aAbs(cpu, bus);
    const r = ((busRead(bus, a) + 1) & 0xFF);
    busWrite(bus, a, r);
    setZN(cpu, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 254) {
    const a = aAbsX(cpu, bus);
    const r = ((busRead(bus, a) + 1) & 0xFF);
    busWrite(bus, a, r);
    setZN(cpu, r);
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 198) {
    const a = aZp(cpu, bus);
    const r = ((busRead(bus, a) - 1) & 0xFF);
    busWrite(bus, a, r);
    setZN(cpu, r);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 214) {
    const a = aZpX(cpu, bus);
    const r = ((busRead(bus, a) - 1) & 0xFF);
    busWrite(bus, a, r);
    setZN(cpu, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 206) {
    const a = aAbs(cpu, bus);
    const r = ((busRead(bus, a) - 1) & 0xFF);
    busWrite(bus, a, r);
    setZN(cpu, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 222) {
    const a = aAbsX(cpu, bus);
    const r = ((busRead(bus, a) - 1) & 0xFF);
    busWrite(bus, a, r);
    setZN(cpu, r);
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 232) {
    cpu.x = ((cpu.x + 1) & 0xFF);
    setZN(cpu, cpu.x);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 200) {
    cpu.y = ((cpu.y + 1) & 0xFF);
    setZN(cpu, cpu.y);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 202) {
    cpu.x = ((cpu.x - 1) & 0xFF);
    setZN(cpu, cpu.x);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 136) {
    cpu.y = ((cpu.y - 1) & 0xFF);
    setZN(cpu, cpu.y);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 10) {
    cpu.a = aslV(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 74) {
    cpu.a = lsrV(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 42) {
    cpu.a = rolV(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 106) {
    cpu.a = rorV(cpu, cpu.a);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 6) {
    const a = aZp(cpu, bus);
    const r = aslV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 22) {
    const a = aZpX(cpu, bus);
    const r = aslV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 14) {
    const a = aAbs(cpu, bus);
    const r = aslV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 30) {
    const a = aAbsX(cpu, bus);
    const r = aslV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 70) {
    const a = aZp(cpu, bus);
    const r = lsrV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 86) {
    const a = aZpX(cpu, bus);
    const r = lsrV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 78) {
    const a = aAbs(cpu, bus);
    const r = lsrV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 94) {
    const a = aAbsX(cpu, bus);
    const r = lsrV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 38) {
    const a = aZp(cpu, bus);
    const r = rolV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 54) {
    const a = aZpX(cpu, bus);
    const r = rolV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 46) {
    const a = aAbs(cpu, bus);
    const r = rolV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 62) {
    const a = aAbsX(cpu, bus);
    const r = rolV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 102) {
    const a = aZp(cpu, bus);
    const r = rorV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 118) {
    const a = aZpX(cpu, bus);
    const r = rorV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 110) {
    const a = aAbs(cpu, bus);
    const r = rorV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 126) {
    const a = aAbsX(cpu, bus);
    const r = rorV(cpu, busRead(bus, a));
    busWrite(bus, a, r);
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 76) {
    cpu.pc = aAbs(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 108) {
    const a = fetch16(cpu, bus);
    cpu.pc = read16Bug(bus, a);
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 32) {
    const target = fetch16(cpu, bus);
    push16(cpu, bus, wrap16(__ovf((Math.trunc(cpu.pc) - 1), -9223372036854775808, 9223372036854775807)));
    cpu.pc = target;
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 96) {
    cpu.pc = wrap16(__ovf((Math.trunc(pop16(cpu, bus)) + 1), -9223372036854775808, 9223372036854775807));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 64) {
    const v = pop8(cpu, bus);
    cpu.p = ((((v & (~FB)) & 0xFF) | FU) & 0xFF);
    cpu.pc = pop16(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 144) {
    branch(cpu, bus, (!cpuFlag(cpu, FC)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 176) {
    branch(cpu, bus, cpuFlag(cpu, FC));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 208) {
    branch(cpu, bus, (!cpuFlag(cpu, FZ)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 240) {
    branch(cpu, bus, cpuFlag(cpu, FZ));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 16) {
    branch(cpu, bus, (!cpuFlag(cpu, FN)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 48) {
    branch(cpu, bus, cpuFlag(cpu, FN));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 80) {
    branch(cpu, bus, (!cpuFlag(cpu, FV)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 112) {
    branch(cpu, bus, cpuFlag(cpu, FV));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 24) {
    setFlag(cpu, FC, false);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 56) {
    setFlag(cpu, FC, true);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 88) {
    setFlag(cpu, FI, false);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 120) {
    setFlag(cpu, FI, true);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 184) {
    setFlag(cpu, FV, false);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 216) {
    setFlag(cpu, FD, false);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 248) {
    setFlag(cpu, FD, true);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 234) {
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 26) {
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 58) {
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 90) {
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 122) {
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 218) {
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 250) {
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 128) {
    const a = aImm(cpu);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 130) {
    const a = aImm(cpu);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 137) {
    const a = aImm(cpu);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 194) {
    const a = aImm(cpu);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 226) {
    const a = aImm(cpu);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 4) {
    const a = aZp(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 68) {
    const a = aZp(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 100) {
    const a = aZp(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 20) {
    const a = aZpX(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 52) {
    const a = aZpX(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 84) {
    const a = aZpX(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 116) {
    const a = aZpX(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 212) {
    const a = aZpX(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 244) {
    const a = aZpX(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 12) {
    const a = aAbs(cpu, bus);
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 28) {
    const a = aAbsX(cpu, bus);
    const v = busRead(bus, a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 60) {
    const a = aAbsX(cpu, bus);
    const v = busRead(bus, a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 92) {
    const a = aAbsX(cpu, bus);
    const v = busRead(bus, a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 124) {
    const a = aAbsX(cpu, bus);
    const v = busRead(bus, a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 220) {
    const a = aAbsX(cpu, bus);
    const v = busRead(bus, a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 252) {
    const a = aAbsX(cpu, bus);
    const v = busRead(bus, a);
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 167) {
    lax(cpu, bus, aZp(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 183) {
    lax(cpu, bus, aZpY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 175) {
    lax(cpu, bus, aAbs(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 191) {
    lax(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 163) {
    lax(cpu, bus, aIndX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 179) {
    lax(cpu, bus, aIndY(cpu, bus));
    cpu.cyc = __ovf((__ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 135) {
    sax(cpu, bus, aZp(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 3), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 151) {
    sax(cpu, bus, aZpY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 143) {
    sax(cpu, bus, aAbs(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 131) {
    sax(cpu, bus, aIndX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 235) {
    const v = busRead(bus, aImm(cpu));
    sbc(cpu, v);
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 199) {
    dcp(cpu, bus, aZp(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 215) {
    dcp(cpu, bus, aZpX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 207) {
    dcp(cpu, bus, aAbs(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 223) {
    dcp(cpu, bus, aAbsX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 219) {
    dcp(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 195) {
    dcp(cpu, bus, aIndX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 211) {
    dcp(cpu, bus, aIndY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 231) {
    isb(cpu, bus, aZp(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 247) {
    isb(cpu, bus, aZpX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 239) {
    isb(cpu, bus, aAbs(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 255) {
    isb(cpu, bus, aAbsX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 251) {
    isb(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 227) {
    isb(cpu, bus, aIndX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 243) {
    isb(cpu, bus, aIndY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 7) {
    slo(cpu, bus, aZp(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 23) {
    slo(cpu, bus, aZpX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 15) {
    slo(cpu, bus, aAbs(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 31) {
    slo(cpu, bus, aAbsX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 27) {
    slo(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 3) {
    slo(cpu, bus, aIndX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 19) {
    slo(cpu, bus, aIndY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 39) {
    rla(cpu, bus, aZp(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 55) {
    rla(cpu, bus, aZpX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 47) {
    rla(cpu, bus, aAbs(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 63) {
    rla(cpu, bus, aAbsX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 59) {
    rla(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 35) {
    rla(cpu, bus, aIndX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 51) {
    rla(cpu, bus, aIndY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 71) {
    sre(cpu, bus, aZp(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 87) {
    sre(cpu, bus, aZpX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 79) {
    sre(cpu, bus, aAbs(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 95) {
    sre(cpu, bus, aAbsX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 91) {
    sre(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 67) {
    sre(cpu, bus, aIndX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 83) {
    sre(cpu, bus, aIndY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 103) {
    rra(cpu, bus, aZp(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 119) {
    rra(cpu, bus, aZpX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 111) {
    rra(cpu, bus, aAbs(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 127) {
    rra(cpu, bus, aAbsX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 123) {
    rra(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 7), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 99) {
    rra(cpu, bus, aIndX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 115) {
    rra(cpu, bus, aIndY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 8), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 11) {
    anc(cpu, busRead(bus, aImm(cpu)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 43) {
    anc(cpu, busRead(bus, aImm(cpu)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 75) {
    alr(cpu, busRead(bus, aImm(cpu)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 107) {
    arr(cpu, busRead(bus, aImm(cpu)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 203) {
    sbx(cpu, busRead(bus, aImm(cpu)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 171) {
    lxa(cpu, busRead(bus, aImm(cpu)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 139) {
    ane(cpu, busRead(bus, aImm(cpu)));
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 187) {
    las(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((__ovf((cpu.cyc + 4), -9223372036854775808, 9223372036854775807) + cpu.extraCycles), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 159) {
    sha(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 147) {
    sha(cpu, bus, aIndY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 6), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 158) {
    shx(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 156) {
    shy(cpu, bus, aAbsX(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 155) {
    tas(cpu, bus, aAbsY(cpu, bus));
    cpu.cyc = __ovf((cpu.cyc + 5), -9223372036854775808, 9223372036854775807);
  } else if (_t21 === 2) {
    jam(cpu);
  } else if (_t21 === 18) {
    jam(cpu);
  } else if (_t21 === 34) {
    jam(cpu);
  } else if (_t21 === 50) {
    jam(cpu);
  } else if (_t21 === 66) {
    jam(cpu);
  } else if (_t21 === 82) {
    jam(cpu);
  } else if (_t21 === 98) {
    jam(cpu);
  } else if (_t21 === 114) {
    jam(cpu);
  } else if (_t21 === 146) {
    jam(cpu);
  } else if (_t21 === 178) {
    jam(cpu);
  } else if (_t21 === 210) {
    jam(cpu);
  } else if (_t21 === 242) {
    jam(cpu);
  } else {
    if ((!__idx(cpu.unknownSeen, Math.trunc(op)))) {
      __idxSet(cpu.unknownSeen, Math.trunc(op), true);
      __eprint(((("unimplemented opcode 0x" + hex2(Math.trunc(op))) + " at pc=0x") + hex4(((__ovf((Math.trunc(cpu.pc) - 1), -9223372036854775808, 9223372036854775807) & 65535) >>> 0))));
    }
    cpu.cyc = __ovf((cpu.cyc + 2), -9223372036854775808, 9223372036854775807);
  }
}

function sliceBytes(src, off, len) {
  let out = [];
  let i = 0;
  while ((i < len)) {
    out.push(__idx(src, __ovf((off + i), -9223372036854775808, 9223372036854775807)));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  return out;
}

function parseCartridge(raw) {
  if ((raw.length < HEADER)) {
    return Result_Cartridge_string.Err("file too small for iNES header");
  }
  if (((((__idx(raw, 0) != 78) || (__idx(raw, 1) != 69)) || (__idx(raw, 2) != 83)) || (__idx(raw, 3) != 26))) {
    return Result_Cartridge_string.Err("bad iNES magic");
  }
  const prg16k = __idx(raw, 4);
  const chr8k = __idx(raw, 5);
  if ((prg16k < 1)) {
    return Result_Cartridge_string.Err("iNES header declares zero PRG banks");
  }
  const flags6 = __idx(raw, 6);
  const flags7 = __idx(raw, 7);
  const mapper = ((((flags7 & 240) & 0xFF) | (((Math.floor(flags6 / 2 ** (__sh(4, 8))) & 0xFF) & 15) & 0xFF)) & 0xFF);
  const mirrorVertical = (((flags6 & 1) & 0xFF) != 0);
  const hasBattery = (((flags6 & 2) & 0xFF) != 0);
  const hasTrainer = (((flags6 & 4) & 0xFF) != 0);
  let prgOff = HEADER;
  if (hasTrainer) {
    prgOff = __ovf((prgOff + TRAINER), -9223372036854775808, 9223372036854775807);
  }
  const prgLen = __ovf((Math.trunc(prg16k) * PRG_BANK), -9223372036854775808, 9223372036854775807);
  const chrOff = __ovf((prgOff + prgLen), -9223372036854775808, 9223372036854775807);
  const chrLen = __ovf((Math.trunc(chr8k) * CHR_BANK), -9223372036854775808, 9223372036854775807);
  if ((raw.length < __ovf((chrOff + chrLen), -9223372036854775808, 9223372036854775807))) {
    return Result_Cartridge_string.Err("file truncated: PRG/CHR banks exceed file size");
  }
  return Result_Cartridge_string.Ok(new Cartridge(sliceBytes(raw, prgOff, prgLen), sliceBytes(raw, chrOff, chrLen), mapper, mirrorVertical, hasBattery, prg16k, chr8k));
}

function newPpu(chr, mirrorVertical) {
  let c = chr;
  if ((c.length == 0)) {
    let i = 0;
    while ((i < 8192)) {
      c.push(0);
      i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
    }
  }
  return new Ppu(c, [0, 1024, 2048, 3072, 4096, 5120, 6144, 7168], Array.from({length: 2048}, () => __clone(0)), Array.from({length: 32}, () => __clone(0)), Array.from({length: 256}, () => __clone(0)), mirrorVertical, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, false, 0, 0, false, 0, 0, 0, 0, 0, 0, Array.from({length: 61440}, () => __clone(0)));
}

function mmc2UpdateChr(ppu) {
  const n4k = __ovf(__idiv(ppu.chr.length, 4096), -9223372036854775808, 9223372036854775807);
  const b0 = (() => {
  if ((ppu.mmc2Latch0 == 0)) {
    return ppu.mmc2ChrFD0;
  } else {
    return ppu.mmc2ChrFE0;
  }
  })();
  const b1 = (() => {
  if ((ppu.mmc2Latch1 == 0)) {
    return ppu.mmc2ChrFD1;
  } else {
    return ppu.mmc2ChrFE1;
  }
  })();
  let w = 0;
  while ((w < 4)) {
    __idxSet(ppu.chrBankOffset, w, __ovf((__ovf((__irem(b0, n4k) * 4096), -9223372036854775808, 9223372036854775807) + __ovf((w * 1024), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807));
    w = __ovf((w + 1), -9223372036854775808, 9223372036854775807);
  }
  while ((w < 8)) {
    __idxSet(ppu.chrBankOffset, w, __ovf((__ovf((__irem(b1, n4k) * 4096), -9223372036854775808, 9223372036854775807) + __ovf((__ovf((w - 4), -9223372036854775808, 9223372036854775807) * 1024), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807));
    w = __ovf((w + 1), -9223372036854775808, 9223372036854775807);
  }
}

function mmc2InitMapper(ppu) {
  ppu.mmc2 = true;
  mmc2UpdateChr(ppu);
}

function mmc2SetChr(ppu, which, bank) {
  if ((which == 0)) {
    ppu.mmc2ChrFD0 = bank;
  } else {
    if ((which == 1)) {
      ppu.mmc2ChrFE0 = bank;
    } else {
      if ((which == 2)) {
        ppu.mmc2ChrFD1 = bank;
      } else {
        ppu.mmc2ChrFE1 = bank;
      }
    }
  }
  mmc2UpdateChr(ppu);
}

function mmc2Latch(ppu, a) {
  let changed = false;
  if (((a >= 4056) && (a <= 4063))) {
    if ((ppu.mmc2Latch0 != 0)) {
      ppu.mmc2Latch0 = 0;
      changed = true;
    }
  } else {
    if (((a >= 4072) && (a <= 4079))) {
      if ((ppu.mmc2Latch0 != 1)) {
        ppu.mmc2Latch0 = 1;
        changed = true;
      }
    } else {
      if (((a >= 8152) && (a <= 8159))) {
        if ((ppu.mmc2Latch1 != 0)) {
          ppu.mmc2Latch1 = 0;
          changed = true;
        }
      } else {
        if (((a >= 8168) && (a <= 8175))) {
          if ((ppu.mmc2Latch1 != 1)) {
            ppu.mmc2Latch1 = 1;
            changed = true;
          }
        }
      }
    }
  }
  if (changed) {
    mmc2UpdateChr(ppu);
  }
}

function mmc2ExtraBgFetches(ppu, scrollX, scrollY) {
  const bgTable = (() => {
  if ((((ppu.ctrl & 16) & 0xFF) != 0)) {
    return 4096;
  } else {
    return 0;
  }
  })();
  let wy = scrollY;
  while ((wy >= 480)) {
    wy = __ovf((wy - 480), -9223372036854775808, 9223372036854775807);
  }
  const ntY = __ovf(__idiv(wy, 240), -9223372036854775808, 9223372036854775807);
  const ly = __ovf((wy - __ovf((ntY * 240), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
  const row = __ovf(__idiv(ly, 8), -9223372036854775808, 9223372036854775807);
  const fy = ((ly & 7) >>> 0);
  let k = 32;
  while ((k < 34)) {
    const wx = ((__ovf((((scrollX & 504) >>> 0) + __ovf((k * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) & 511) >>> 0);
    const ntX = __ovf(__idiv(wx, 256), -9223372036854775808, 9223372036854775807);
    const ntBase = __ovf((8192 + __ovf((__ovf((__ovf((ntY * 2), -9223372036854775808, 9223372036854775807) + ntX), -9223372036854775808, 9223372036854775807) * 1024), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
    const col = __ovf(__idiv(((wx & 255) >>> 0), 8), -9223372036854775808, 9223372036854775807);
    const tile = Math.trunc(ppuMemRead(ppu, (__ovf((__ovf((ntBase + __ovf((row * 32), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + col), -9223372036854775808, 9223372036854775807) & 0xFFFF)));
    mmc2Latch(ppu, __ovf((__ovf((__ovf((bgTable + __ovf((tile * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + fy), -9223372036854775808, 9223372036854775807) + 8), -9223372036854775808, 9223372036854775807));
    k = __ovf((k + 1), -9223372036854775808, 9223372036854775807);
  }
}

function mirrorNT(ppu, addr) {
  const a = ((addr & 4095) >>> 0);
  const table = __ovf(__idiv(a, 1024), -9223372036854775808, 9223372036854775807);
  const off = ((a & 1023) >>> 0);
  let phys = 0;
  if (ppu.mirrorVertical) {
    phys = __ovf((__ovf((((table & 1) >>> 0) * 1024), -9223372036854775808, 9223372036854775807) + off), -9223372036854775808, 9223372036854775807);
  } else {
    phys = __ovf((__ovf((__ovf(__idiv(table, 2), -9223372036854775808, 9223372036854775807) * 1024), -9223372036854775808, 9223372036854775807) + off), -9223372036854775808, 9223372036854775807);
  }
  return phys;
}

function chrPhys(ppu, a) {
  return __irem(__ovf((__idx(ppu.chrBankOffset, __ovf(__idiv(a, 1024), -9223372036854775808, 9223372036854775807)) + ((a & 1023) >>> 0)), -9223372036854775808, 9223372036854775807), ppu.chr.length);
}

function ppuMemRead(ppu, addr) {
  const a = ((Math.trunc(addr) & 16383) >>> 0);
  if ((a < 8192)) {
    return __idx(ppu.chr, chrPhys(ppu, a));
  }
  if ((a < 16128)) {
    return __idx(ppu.vram, mirrorNT(ppu, a));
  }
  let p = ((a & 31) >>> 0);
  if ((p == 16)) {
    p = 0;
  }
  if ((p == 20)) {
    p = 4;
  }
  if ((p == 24)) {
    p = 8;
  }
  if ((p == 28)) {
    p = 12;
  }
  return __idx(ppu.palette, p);
}

function ppuMemWrite(ppu, addr, val) {
  const a = ((Math.trunc(addr) & 16383) >>> 0);
  if ((a < 8192)) {
    __idxSet(ppu.chr, chrPhys(ppu, a), val);
    return;
  }
  if ((a < 16128)) {
    __idxSet(ppu.vram, mirrorNT(ppu, a), val);
    return;
  }
  let p = ((a & 31) >>> 0);
  if ((p == 16)) {
    p = 0;
  }
  if ((p == 20)) {
    p = 4;
  }
  if ((p == 24)) {
    p = 8;
  }
  if ((p == 28)) {
    p = 12;
  }
  __idxSet(ppu.palette, p, val);
}

function ppuRegRead(ppu, reg) {
  if ((reg == 2)) {
    const r = ((((ppu.status & 224) & 0xFF) | ((ppu.readBuffer & 31) & 0xFF)) & 0xFF);
    ppu.status = ((ppu.status & 127) & 0xFF);
    ppu.w = 0;
    return r;
  }
  if ((reg == 4)) {
    return __idx(ppu.oam, Math.trunc(ppu.oamAddr));
  }
  if ((reg == 7)) {
    const a = ppu.v;
    let result = ppu.readBuffer;
    ppu.readBuffer = ppuMemRead(ppu, a);
    if ((((Math.trunc(a) & 16383) >>> 0) >= 16128)) {
      result = ppu.readBuffer;
    }
    const inc = (() => {
    if ((((ppu.ctrl & 4) & 0xFF) != 0)) {
      return 32;
    } else {
      return 1;
    }
    })();
    ppu.v = (((__ovf((Math.trunc(ppu.v) + inc), -9223372036854775808, 9223372036854775807) & 32767) >>> 0) & 0xFFFF);
    return result;
  }
  return 0;
}

function ppuRegWrite(ppu, reg, val) {
  if ((reg == 0)) {
    ppu.ctrl = val;
    ppu.t = (((((Math.trunc(ppu.t) & 29695) >>> 0) | Math.trunc(((Math.trunc(val) & 3) >>> 0) * 2 ** (__sh(10, 64)))) >>> 0) & 0xFFFF);
    return;
  }
  if ((reg == 1)) {
    ppu.mask = val;
    return;
  }
  if ((reg == 3)) {
    ppu.oamAddr = val;
    return;
  }
  if ((reg == 4)) {
    __idxSet(ppu.oam, Math.trunc(ppu.oamAddr), val);
    ppu.oamAddr = (((__ovf((Math.trunc(ppu.oamAddr) + 1), -9223372036854775808, 9223372036854775807) & 255) >>> 0) & 0xFF);
    return;
  }
  if ((reg == 5)) {
    if ((ppu.w == 0)) {
      ppu.fineX = ((val & 7) & 0xFF);
      ppu.t = (((((Math.trunc(ppu.t) & 32736) >>> 0) | Math.floor(Math.trunc(val) / 2 ** (__sh(3, 64)))) >>> 0) & 0xFFFF);
      ppu.w = 1;
    } else {
      const hi = Math.trunc(((Math.trunc(val) & 7) >>> 0) * 2 ** (__sh(12, 64)));
      const lo = Math.trunc(((Math.trunc(val) & 248) >>> 0) * 2 ** (__sh(2, 64)));
      ppu.t = (((((((Math.trunc(ppu.t) & 3103) >>> 0) | hi) >>> 0) | lo) >>> 0) & 0xFFFF);
      ppu.w = 0;
    }
    return;
  }
  if ((reg == 6)) {
    if ((ppu.w == 0)) {
      ppu.t = (((((Math.trunc(ppu.t) & 255) >>> 0) | Math.trunc(((Math.trunc(val) & 63) >>> 0) * 2 ** (__sh(8, 64)))) >>> 0) & 0xFFFF);
      ppu.w = 1;
    } else {
      ppu.t = (((((Math.trunc(ppu.t) & 32512) >>> 0) | Math.trunc(val)) >>> 0) & 0xFFFF);
      ppu.v = ppu.t;
      ppu.w = 0;
    }
    return;
  }
  if ((reg == 7)) {
    ppuMemWrite(ppu, ppu.v, val);
    const inc = (() => {
    if ((((ppu.ctrl & 4) & 0xFF) != 0)) {
      return 32;
    } else {
      return 1;
    }
    })();
    ppu.v = (((__ovf((Math.trunc(ppu.v) + inc), -9223372036854775808, 9223372036854775807) & 32767) >>> 0) & 0xFFFF);
    return;
  }
}

function incrementY(ppu) {
  let v = Math.trunc(ppu.v);
  if ((((v & 28672) >>> 0) != 28672)) {
    v = __ovf((v + 4096), -9223372036854775808, 9223372036854775807);
  } else {
    v = ((v & (~28672)) >>> 0);
    let y = ((Math.floor(v / 2 ** (__sh(5, 64))) & 31) >>> 0);
    if ((y == 29)) {
      y = 0;
      v = ((v ^ 2048) >>> 0);
    } else {
      if ((y == 31)) {
        y = 0;
      } else {
        y = __ovf((y + 1), -9223372036854775808, 9223372036854775807);
      }
    }
    v = ((((v & (~992)) >>> 0) | Math.trunc(y * 2 ** (__sh(5, 64)))) >>> 0);
  }
  ppu.v = (((v & 32767) >>> 0) & 0xFFFF);
}

function ppuStep(ppu) {
  ppu.dot = __ovf((ppu.dot + 1), -9223372036854775808, 9223372036854775807);
  if ((ppu.dot > 340)) {
    ppu.dot = 0;
    ppu.scanline = __ovf((ppu.scanline + 1), -9223372036854775808, 9223372036854775807);
    if ((ppu.scanline > 261)) {
      ppu.scanline = 0;
      ppu.frame = __ovf((ppu.frame + 1), -9223372036854775808, 9223372036854775807);
    }
  }
  const rendering = (((ppu.mask & 24) & 0xFF) != 0);
  if (((ppu.dot == 256) && (ppu.scanline < 240))) {
    renderScanline(ppu, ppu.scanline);
    if (rendering) {
      incrementY(ppu);
    }
  }
  if ((((ppu.scanline == 261) && (ppu.dot == 280)) && rendering)) {
    const keepHoriz = ((Math.trunc(ppu.v) & 1055) >>> 0);
    const vert = ((Math.trunc(ppu.t) & 31712) >>> 0);
    ppu.v = (((keepHoriz | vert) >>> 0) & 0xFFFF);
  }
  if ((((((ppu.scanline == 261) && (ppu.dot == 304)) && rendering) && ppu.mmc2) && (((ppu.mask & 8) & 0xFF) != 0))) {
    const t = Math.trunc(ppu.t);
    const sx = __ovf((__ovf((__ovf((((Math.floor(t / 2 ** (__sh(10, 64))) & 1) >>> 0) * 256), -9223372036854775808, 9223372036854775807) + __ovf((((t & 31) >>> 0) * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + Math.trunc(ppu.fineX)), -9223372036854775808, 9223372036854775807);
    const sy = __ovf((__ovf((__ovf((((Math.floor(t / 2 ** (__sh(11, 64))) & 1) >>> 0) * 240), -9223372036854775808, 9223372036854775807) + __ovf((((Math.floor(t / 2 ** (__sh(5, 64))) & 31) >>> 0) * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ((Math.floor(t / 2 ** (__sh(12, 64))) & 7) >>> 0)), -9223372036854775808, 9223372036854775807);
    mmc2ExtraBgFetches(ppu, sx, sy);
  }
  if (((ppu.scanline == 241) && (ppu.dot == 1))) {
    ppu.status = ((ppu.status | 128) & 0xFF);
    if ((((ppu.ctrl & 128) & 0xFF) != 0)) {
      ppu.nmiPending = true;
    }
  }
  if (((ppu.scanline == 261) && (ppu.dot == 1))) {
    ppu.status = ((ppu.status & 31) & 0xFF);
  }
}

function nesColor(idx) {
  const c = Math.trunc(__idx(NESPAL, ((idx & 63) >>> 0)));
  const r = ((Math.floor(c / 2 ** (__sh(16, 64))) & 255) >>> 0);
  const g = ((Math.floor(c / 2 ** (__sh(8, 64))) & 255) >>> 0);
  const b = ((c & 255) >>> 0);
  return (((((((r | Math.trunc(g * 2 ** (__sh(8, 64)))) >>> 0) | Math.trunc(b * 2 ** (__sh(16, 64)))) >>> 0) | 4278190080) >>> 0) >>> 0);
}

function renderScanline(ppu, sl) {
  let bgOpaque = Array.from({length: 256}, () => __clone(0));
  const universal = Math.trunc(ppuMemRead(ppu, 16128));
  if ((((ppu.mask & 8) & 0xFF) != 0)) {
    const t = Math.trunc(ppu.t);
    const v = Math.trunc(ppu.v);
    ppu.scrollX = __ovf((__ovf((__ovf((((Math.floor(t / 2 ** (__sh(10, 64))) & 1) >>> 0) * 256), -9223372036854775808, 9223372036854775807) + __ovf((((t & 31) >>> 0) * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + Math.trunc(ppu.fineX)), -9223372036854775808, 9223372036854775807);
    ppu.scrollY = __ovf((__ovf((__ovf((((Math.floor(v / 2 ** (__sh(11, 64))) & 1) >>> 0) * 240), -9223372036854775808, 9223372036854775807) + __ovf((((Math.floor(v / 2 ** (__sh(5, 64))) & 31) >>> 0) * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ((Math.floor(v / 2 ** (__sh(12, 64))) & 7) >>> 0)), -9223372036854775808, 9223372036854775807);
    const bgTable = (() => {
    if ((((ppu.ctrl & 16) & 0xFF) != 0)) {
      return 4096;
    } else {
      return 0;
    }
    })();
    let lo = 0;
    let hi = 0;
    let palGroup = 0;
    let x = 0;
    while ((x < 256)) {
      const wx = ((__ovf((ppu.scrollX + x), -9223372036854775808, 9223372036854775807) & 511) >>> 0);
      if (((((wx & 7) >>> 0) == 0) || (x == 0))) {
        let wy = ppu.scrollY;
        while ((wy >= 480)) {
          wy = __ovf((wy - 480), -9223372036854775808, 9223372036854775807);
        }
        const ntX = __ovf(__idiv(wx, 256), -9223372036854775808, 9223372036854775807);
        const ntY = __ovf(__idiv(wy, 240), -9223372036854775808, 9223372036854775807);
        const ntBase = __ovf((8192 + __ovf((__ovf((__ovf((ntY * 2), -9223372036854775808, 9223372036854775807) + ntX), -9223372036854775808, 9223372036854775807) * 1024), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
        const lx = ((wx & 255) >>> 0);
        const ly = __ovf((wy - __ovf((ntY * 240), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
        const col = __ovf(__idiv(lx, 8), -9223372036854775808, 9223372036854775807);
        const row = __ovf(__idiv(ly, 8), -9223372036854775808, 9223372036854775807);
        const tile = Math.trunc(ppuMemRead(ppu, (__ovf((__ovf((ntBase + __ovf((row * 32), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + col), -9223372036854775808, 9223372036854775807) & 0xFFFF)));
        const atAddr = __ovf((__ovf((__ovf((ntBase + 960), -9223372036854775808, 9223372036854775807) + __ovf((__ovf(__idiv(row, 4), -9223372036854775808, 9223372036854775807) * 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + __ovf(__idiv(col, 4), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
        const at = Math.trunc(ppuMemRead(ppu, (atAddr & 0xFFFF)));
        const shift = __ovf((__ovf((((row & 2) >>> 0) * 2), -9223372036854775808, 9223372036854775807) + ((col & 2) >>> 0)), -9223372036854775808, 9223372036854775807);
        palGroup = ((Math.floor(at / 2 ** (__sh(shift, 64))) & 3) >>> 0);
        const fy = ((ly & 7) >>> 0);
        const patAddr = __ovf((__ovf((bgTable + __ovf((tile * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + fy), -9223372036854775808, 9223372036854775807);
        lo = Math.trunc(ppuMemRead(ppu, (patAddr & 0xFFFF)));
        hi = Math.trunc(ppuMemRead(ppu, (__ovf((patAddr + 8), -9223372036854775808, 9223372036854775807) & 0xFFFF)));
        if (ppu.mmc2) {
          mmc2Latch(ppu, __ovf((patAddr + 8), -9223372036854775808, 9223372036854775807));
        }
      }
      const bit = __ovf((7 - ((wx & 7) >>> 0)), -9223372036854775808, 9223372036854775807);
      const px = ((((Math.floor(lo / 2 ** (__sh(bit, 64))) & 1) >>> 0) | Math.trunc(((Math.floor(hi / 2 ** (__sh(bit, 64))) & 1) >>> 0) * 2 ** (__sh(1, 64)))) >>> 0);
      let colorIdx = universal;
      if ((px != 0)) {
        colorIdx = Math.trunc(ppuMemRead(ppu, (__ovf((__ovf((16128 + __ovf((palGroup * 4), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + px), -9223372036854775808, 9223372036854775807) & 0xFFFF)));
        __idxSet(bgOpaque, x, 1);
      }
      __idxSet(ppu.fb, __ovf((__ovf((sl * 256), -9223372036854775808, 9223372036854775807) + x), -9223372036854775808, 9223372036854775807), nesColor(colorIdx));
      x = __ovf((x + 1), -9223372036854775808, 9223372036854775807);
    }
    if (ppu.mmc2) {
      mmc2ExtraBgFetches(ppu, ppu.scrollX, ppu.scrollY);
    }
  } else {
    let x = 0;
    while ((x < 256)) {
      __idxSet(ppu.fb, __ovf((__ovf((sl * 256), -9223372036854775808, 9223372036854775807) + x), -9223372036854775808, 9223372036854775807), nesColor(universal));
      x = __ovf((x + 1), -9223372036854775808, 9223372036854775807);
    }
  }
  renderSpriteLine(ppu, sl, bgOpaque);
}

function renderSpriteLine(ppu, sl, bgOpaque) {
  if ((((ppu.mask & 16) & 0xFF) == 0)) {
    return;
  }
  const tall = (((ppu.ctrl & 32) & 0xFF) != 0);
  const h = (() => {
  if (tall) {
    return 16;
  } else {
    return 8;
  }
  })();
  let sprClaimed = Array.from({length: 256}, () => __clone(0));
  let i = 0;
  while ((i < 64)) {
    const base = __ovf((i * 4), -9223372036854775808, 9223372036854775807);
    const row = __ovf((sl - __ovf((Math.trunc(__idx(ppu.oam, base)) + 1), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
    if (((row >= 0) && (row < h))) {
      const rawTile = Math.trunc(__idx(ppu.oam, __ovf((base + 1), -9223372036854775808, 9223372036854775807)));
      const attr = Math.trunc(__idx(ppu.oam, __ovf((base + 2), -9223372036854775808, 9223372036854775807)));
      const sx = Math.trunc(__idx(ppu.oam, __ovf((base + 3), -9223372036854775808, 9223372036854775807)));
      const palGroup = ((attr & 3) >>> 0);
      const flipH = (((attr & 64) >>> 0) != 0);
      const flipV = (((attr & 128) >>> 0) != 0);
      const behind = (((attr & 32) >>> 0) != 0);
      const ry = (() => {
      if (flipV) {
        return __ovf((__ovf((h - 1), -9223372036854775808, 9223372036854775807) - row), -9223372036854775808, 9223372036854775807);
      } else {
        return row;
      }
      })();
      let patAddr = 0;
      if (tall) {
        patAddr = __ovf((__ovf((__ovf((((rawTile & 1) >>> 0) * 4096), -9223372036854775808, 9223372036854775807) + __ovf((__ovf((((rawTile & 254) >>> 0) + __ovf(__idiv(ry, 8), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ((ry & 7) >>> 0)), -9223372036854775808, 9223372036854775807);
      } else {
        const sprTable = (() => {
        if ((((ppu.ctrl & 8) & 0xFF) != 0)) {
          return 4096;
        } else {
          return 0;
        }
        })();
        patAddr = __ovf((__ovf((sprTable + __ovf((rawTile * 16), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + ry), -9223372036854775808, 9223372036854775807);
      }
      const lo = Math.trunc(ppuMemRead(ppu, (patAddr & 0xFFFF)));
      const hi = Math.trunc(ppuMemRead(ppu, (__ovf((patAddr + 8), -9223372036854775808, 9223372036854775807) & 0xFFFF)));
      if (ppu.mmc2) {
        mmc2Latch(ppu, __ovf((patAddr + 8), -9223372036854775808, 9223372036854775807));
      }
      let fx = 0;
      while ((fx < 8)) {
        const rx = (() => {
        if (flipH) {
          return fx;
        } else {
          return __ovf((7 - fx), -9223372036854775808, 9223372036854775807);
        }
        })();
        const px = ((((Math.floor(lo / 2 ** (__sh(rx, 64))) & 1) >>> 0) | Math.trunc(((Math.floor(hi / 2 ** (__sh(rx, 64))) & 1) >>> 0) * 2 ** (__sh(1, 64)))) >>> 0);
        if ((px != 0)) {
          const x = __ovf((sx + fx), -9223372036854775808, 9223372036854775807);
          if ((x < 256)) {
            const bgHere = (__idx(bgOpaque, x) != 0);
            if ((((i == 0) && bgHere) && (x < 255))) {
              ppu.status = ((ppu.status | 64) & 0xFF);
            }
            if ((__idx(sprClaimed, x) == 0)) {
              __idxSet(sprClaimed, x, 1);
              if ((!(behind && bgHere))) {
                const colorIdx = Math.trunc(ppuMemRead(ppu, (__ovf((__ovf((16144 + __ovf((palGroup * 4), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + px), -9223372036854775808, 9223372036854775807) & 0xFFFF)));
                __idxSet(ppu.fb, __ovf((__ovf((sl * 256), -9223372036854775808, 9223372036854775807) + x), -9223372036854775808, 9223372036854775807), nesColor(colorIdx));
              }
            }
          }
        }
        fx = __ovf((fx + 1), -9223372036854775808, 9223372036854775807);
      }
    }
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
}

function renderFrame(_ppu) {
}

function newDmc() {
  return new Dmc(false, false, false, __idx(DMC_RATE, 0), __idx(DMC_RATE, 0), 0, 49152, 1, 49152, 0, 0, 8, 0, true, true, false, false);
}

function newPulse(isPulse2) {
  return new Pulse(false, 0, 0, false, false, 0, 0, 0, 0, false, 0, 0, false, 0, false, 0, false, 0, isPulse2);
}

function newTriangle() {
  return new Triangle(false, false, 0, 0, 0, false, 0, 0, 0);
}

function newNoise() {
  return new Noise(false, false, false, 0, 0, false, 0, 0, false, 0, 0, 1);
}

function newApu() {
  let pt = Array.from({length: 31}, () => __clone(0));
  let i = 1;
  while ((i < 31)) {
    __idxSet(pt, i, (95.52 / ((8128 / (+i)) + 100)));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  let tt = Array.from({length: 203}, () => __clone(0));
  i = 1;
  while ((i < 203)) {
    __idxSet(tt, i, (163.67 / ((24329 / (+i)) + 100)));
    i = __ovf((i + 1), -9223372036854775808, 9223372036854775807);
  }
  let samples = [];
  return new Apu(newPulse(false), newPulse(true), newTriangle(), newNoise(), newDmc(), 0, false, false, 0, 0, 0, samples, pt, tt, 0, 0);
}

function apuWrite(apu, reg, val) {
  const v = Math.trunc(val);
  if ((reg <= 3)) {
    writePulse(apu.pulse1, reg, v);
  } else {
    if ((reg <= 7)) {
      writePulse(apu.pulse2, __ovf((reg - 4), -9223372036854775808, 9223372036854775807), v);
    } else {
      if ((reg <= 11)) {
        writeTriangle(apu.triangle, __ovf((reg - 8), -9223372036854775808, 9223372036854775807), v);
      } else {
        if ((reg <= 15)) {
          writeNoise(apu.noise, __ovf((reg - 12), -9223372036854775808, 9223372036854775807), v);
        } else {
          if ((reg <= 19)) {
            writeDmc(apu.dmc, __ovf((reg - 16), -9223372036854775808, 9223372036854775807), v);
          } else {
            if ((reg == 21)) {
              writeStatus(apu, v);
            } else {
              if ((reg == 23)) {
                writeFrameCounter(apu, v);
              }
            }
          }
        }
      }
    }
  }
}

function writePulse(p, idx, v) {
  if ((idx == 0)) {
    p.duty = ((Math.floor(v / 2 ** (__sh(6, 64))) & 3) >>> 0);
    p.lengthHalt = (((v & 32) >>> 0) != 0);
    p.constant = (((v & 16) >>> 0) != 0);
    p.volume = ((v & 15) >>> 0);
  } else {
    if ((idx == 1)) {
      p.sweepEnabled = (((v & 128) >>> 0) != 0);
      p.sweepPeriod = ((Math.floor(v / 2 ** (__sh(4, 64))) & 7) >>> 0);
      p.sweepNegate = (((v & 8) >>> 0) != 0);
      p.sweepShift = ((v & 7) >>> 0);
      p.sweepReload = true;
    } else {
      if ((idx == 2)) {
        p.timerPeriod = ((((p.timerPeriod & 1792) >>> 0) | v) >>> 0);
      } else {
        p.timerPeriod = ((((p.timerPeriod & 255) >>> 0) | Math.trunc(((v & 7) >>> 0) * 2 ** (__sh(8, 64)))) >>> 0);
        if (p.enabled) {
          p.length = __idx(LENGTH_TABLE, ((Math.floor(v / 2 ** (__sh(3, 64))) & 31) >>> 0));
        }
        p.dutyPos = 0;
        p.envStart = true;
      }
    }
  }
}

function writeTriangle(t, idx, v) {
  if ((idx == 0)) {
    t.control = (((v & 128) >>> 0) != 0);
    t.linearReload = ((v & 127) >>> 0);
  } else {
    if ((idx == 2)) {
      t.timerPeriod = ((((t.timerPeriod & 1792) >>> 0) | v) >>> 0);
    } else {
      if ((idx == 3)) {
        t.timerPeriod = ((((t.timerPeriod & 255) >>> 0) | Math.trunc(((v & 7) >>> 0) * 2 ** (__sh(8, 64)))) >>> 0);
        if (t.enabled) {
          t.length = __idx(LENGTH_TABLE, ((Math.floor(v / 2 ** (__sh(3, 64))) & 31) >>> 0));
        }
        t.linearReloadFlag = true;
      }
    }
  }
}

function writeNoise(n, idx, v) {
  if ((idx == 0)) {
    n.lengthHalt = (((v & 32) >>> 0) != 0);
    n.constant = (((v & 16) >>> 0) != 0);
    n.volume = ((v & 15) >>> 0);
  } else {
    if ((idx == 2)) {
      n.mode = (((v & 128) >>> 0) != 0);
      n.timerPeriod = __idx(NOISE_PERIOD, ((v & 15) >>> 0));
    } else {
      if ((idx == 3)) {
        if (n.enabled) {
          n.length = __idx(LENGTH_TABLE, ((Math.floor(v / 2 ** (__sh(3, 64))) & 31) >>> 0));
        }
        n.envStart = true;
      }
    }
  }
}

function writeDmc(d, idx, v) {
  if ((idx == 0)) {
    d.irqEnabled = (((v & 128) >>> 0) != 0);
    d.loopFlag = (((v & 64) >>> 0) != 0);
    d.rate = __idx(DMC_RATE, ((v & 15) >>> 0));
    if ((!d.irqEnabled)) {
      d.irqFlag = false;
    }
  } else {
    if ((idx == 1)) {
      d.output = ((v & 127) >>> 0);
    } else {
      if ((idx == 2)) {
        d.sampleAddr = __ovf((49152 + __ovf((v * 64), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807);
      } else {
        d.sampleLen = __ovf((__ovf((v * 16), -9223372036854775808, 9223372036854775807) + 1), -9223372036854775808, 9223372036854775807);
      }
    }
  }
}

function writeStatus(apu, v) {
  apu.pulse1.enabled = (((v & 1) >>> 0) != 0);
  if ((!apu.pulse1.enabled)) {
    apu.pulse1.length = 0;
  }
  apu.pulse2.enabled = (((v & 2) >>> 0) != 0);
  if ((!apu.pulse2.enabled)) {
    apu.pulse2.length = 0;
  }
  apu.triangle.enabled = (((v & 4) >>> 0) != 0);
  if ((!apu.triangle.enabled)) {
    apu.triangle.length = 0;
  }
  apu.noise.enabled = (((v & 8) >>> 0) != 0);
  if ((!apu.noise.enabled)) {
    apu.noise.length = 0;
  }
  apu.dmc.irqFlag = false;
  apu.dmc.enabled = (((v & 16) >>> 0) != 0);
  if ((!apu.dmc.enabled)) {
    apu.dmc.bytesRemaining = 0;
  } else {
    if ((apu.dmc.bytesRemaining == 0)) {
      apu.dmc.curAddr = apu.dmc.sampleAddr;
      apu.dmc.bytesRemaining = apu.dmc.sampleLen;
      if (apu.dmc.bufferEmpty) {
        apu.dmc.needsFetch = true;
      }
    }
  }
}

function writeFrameCounter(apu, v) {
  apu.frameMode = ((Math.floor(v / 2 ** (__sh(7, 64))) & 1) >>> 0);
  apu.frameInhibit = (((v & 64) >>> 0) != 0);
  if (apu.frameInhibit) {
    apu.frameIrq = false;
  }
  apu.frameCycle = 0;
  if ((apu.frameMode == 1)) {
    quarterFrame(apu);
    halfFrame(apu);
  }
}

function apuReadStatus(apu) {
  let r = 0;
  if ((apu.pulse1.length > 0)) {
    r = ((r | 1) >>> 0);
  }
  if ((apu.pulse2.length > 0)) {
    r = ((r | 2) >>> 0);
  }
  if ((apu.triangle.length > 0)) {
    r = ((r | 4) >>> 0);
  }
  if ((apu.noise.length > 0)) {
    r = ((r | 8) >>> 0);
  }
  if ((apu.dmc.bytesRemaining > 0)) {
    r = ((r | 16) >>> 0);
  }
  if (apu.frameIrq) {
    r = ((r | 64) >>> 0);
  }
  if (apu.dmc.irqFlag) {
    r = ((r | 128) >>> 0);
  }
  apu.frameIrq = false;
  return (r & 0xFF);
}

function apuStep(apu, cycles) {
  let c = 0;
  while ((c < cycles)) {
    clockTriangleTimer(apu.triangle);
    clockDmc(apu.dmc);
    if ((apu.cpuParity == 0)) {
      clockPulseTimer(apu.pulse1);
      clockPulseTimer(apu.pulse2);
      clockNoiseTimer(apu.noise);
    }
    apu.cpuParity = ((apu.cpuParity ^ 1) >>> 0);
    stepFrameCounter(apu);
    apu.sampleAccum = (apu.sampleAccum + 1);
    if ((apu.sampleAccum >= CYCLES_PER_SAMPLE)) {
      apu.sampleAccum = (apu.sampleAccum - CYCLES_PER_SAMPLE);
      emitSample(apu);
    }
    c = __ovf((c + 1), -9223372036854775808, 9223372036854775807);
  }
}

function stepFrameCounter(apu) {
  apu.frameCycle = __ovf((apu.frameCycle + 1), -9223372036854775808, 9223372036854775807);
  const fc = apu.frameCycle;
  if ((apu.frameMode == 0)) {
    if ((fc == 7457)) {
      quarterFrame(apu);
    } else {
      if ((fc == 14913)) {
        quarterFrame(apu);
        halfFrame(apu);
      } else {
        if ((fc == 22371)) {
          quarterFrame(apu);
        } else {
          if ((fc == 29829)) {
            quarterFrame(apu);
            halfFrame(apu);
            if ((!apu.frameInhibit)) {
              apu.frameIrq = true;
            }
          } else {
            if ((fc >= 29830)) {
              apu.frameCycle = 0;
            }
          }
        }
      }
    }
  } else {
    if ((fc == 7457)) {
      quarterFrame(apu);
    } else {
      if ((fc == 14913)) {
        quarterFrame(apu);
        halfFrame(apu);
      } else {
        if ((fc == 22371)) {
          quarterFrame(apu);
        } else {
          if ((fc == 37281)) {
            quarterFrame(apu);
            halfFrame(apu);
          } else {
            if ((fc >= 37282)) {
              apu.frameCycle = 0;
            }
          }
        }
      }
    }
  }
}

function quarterFrame(apu) {
  clockPulseEnvelope(apu.pulse1);
  clockPulseEnvelope(apu.pulse2);
  clockNoiseEnvelope(apu.noise);
  clockTriangleLinear(apu.triangle);
}

function halfFrame(apu) {
  clockPulseLength(apu.pulse1);
  clockPulseLength(apu.pulse2);
  clockPulseSweep(apu.pulse1);
  clockPulseSweep(apu.pulse2);
  if (((!apu.triangle.control) && (apu.triangle.length > 0))) {
    apu.triangle.length = __ovf((apu.triangle.length - 1), -9223372036854775808, 9223372036854775807);
  }
  if (((!apu.noise.lengthHalt) && (apu.noise.length > 0))) {
    apu.noise.length = __ovf((apu.noise.length - 1), -9223372036854775808, 9223372036854775807);
  }
}

function clockPulseTimer(p) {
  if ((p.timerVal == 0)) {
    p.timerVal = p.timerPeriod;
    p.dutyPos = ((__ovf((p.dutyPos + 1), -9223372036854775808, 9223372036854775807) & 7) >>> 0);
  } else {
    p.timerVal = __ovf((p.timerVal - 1), -9223372036854775808, 9223372036854775807);
  }
}

function clockDmc(d) {
  d.timer = __ovf((d.timer - 1), -9223372036854775808, 9223372036854775807);
  if ((d.timer > 0)) {
    return;
  }
  d.timer = d.rate;
  if ((!d.silence)) {
    if ((((d.shiftReg & 1) >>> 0) == 1)) {
      if ((d.output <= 125)) {
        d.output = __ovf((d.output + 2), -9223372036854775808, 9223372036854775807);
      }
    } else {
      if ((d.output >= 2)) {
        d.output = __ovf((d.output - 2), -9223372036854775808, 9223372036854775807);
      }
    }
  }
  d.shiftReg = Math.floor(d.shiftReg / 2 ** (__sh(1, 64)));
  d.bitsRemaining = __ovf((d.bitsRemaining - 1), -9223372036854775808, 9223372036854775807);
  if ((d.bitsRemaining <= 0)) {
    d.bitsRemaining = 8;
    if (d.bufferEmpty) {
      d.silence = true;
    } else {
      d.silence = false;
      d.shiftReg = d.bufferByte;
      d.bufferEmpty = true;
      if ((d.bytesRemaining > 0)) {
        d.needsFetch = true;
      }
    }
  }
}

function dmcFill(d, byte) {
  d.bufferByte = byte;
  d.bufferEmpty = false;
  d.needsFetch = false;
  d.curAddr = __ovf((d.curAddr + 1), -9223372036854775808, 9223372036854775807);
  if ((d.curAddr > 65535)) {
    d.curAddr = 32768;
  }
  d.bytesRemaining = __ovf((d.bytesRemaining - 1), -9223372036854775808, 9223372036854775807);
  if ((d.bytesRemaining <= 0)) {
    if (d.loopFlag) {
      d.curAddr = d.sampleAddr;
      d.bytesRemaining = d.sampleLen;
    } else {
      if (d.irqEnabled) {
        d.irqFlag = true;
      }
    }
  }
}

function clockTriangleTimer(t) {
  if ((t.timerVal == 0)) {
    t.timerVal = t.timerPeriod;
    if (((t.length > 0) && (t.linearCounter > 0))) {
      t.seqPos = ((__ovf((t.seqPos + 1), -9223372036854775808, 9223372036854775807) & 31) >>> 0);
    }
  } else {
    t.timerVal = __ovf((t.timerVal - 1), -9223372036854775808, 9223372036854775807);
  }
}

function clockNoiseTimer(n) {
  if ((n.timerVal == 0)) {
    n.timerVal = n.timerPeriod;
    const bit0 = ((n.shift & 1) >>> 0);
    const tap = (() => {
    if (n.mode) {
      return ((Math.floor(n.shift / 2 ** (__sh(6, 64))) & 1) >>> 0);
    } else {
      return ((Math.floor(n.shift / 2 ** (__sh(1, 64))) & 1) >>> 0);
    }
    })();
    const fb = ((bit0 ^ tap) >>> 0);
    n.shift = ((Math.floor(n.shift / 2 ** (__sh(1, 64))) | Math.trunc(fb * 2 ** (__sh(14, 64)))) >>> 0);
  } else {
    n.timerVal = __ovf((n.timerVal - 1), -9223372036854775808, 9223372036854775807);
  }
}

function clockPulseEnvelope(p) {
  if (p.envStart) {
    p.envStart = false;
    p.envDecay = 15;
    p.envDivider = p.volume;
  } else {
    if ((p.envDivider == 0)) {
      p.envDivider = p.volume;
      if ((p.envDecay > 0)) {
        p.envDecay = __ovf((p.envDecay - 1), -9223372036854775808, 9223372036854775807);
      } else {
        if (p.lengthHalt) {
          p.envDecay = 15;
        }
      }
    } else {
      p.envDivider = __ovf((p.envDivider - 1), -9223372036854775808, 9223372036854775807);
    }
  }
}

function clockNoiseEnvelope(n) {
  if (n.envStart) {
    n.envStart = false;
    n.envDecay = 15;
    n.envDivider = n.volume;
  } else {
    if ((n.envDivider == 0)) {
      n.envDivider = n.volume;
      if ((n.envDecay > 0)) {
        n.envDecay = __ovf((n.envDecay - 1), -9223372036854775808, 9223372036854775807);
      } else {
        if (n.lengthHalt) {
          n.envDecay = 15;
        }
      }
    } else {
      n.envDivider = __ovf((n.envDivider - 1), -9223372036854775808, 9223372036854775807);
    }
  }
}

function clockPulseLength(p) {
  if (((!p.lengthHalt) && (p.length > 0))) {
    p.length = __ovf((p.length - 1), -9223372036854775808, 9223372036854775807);
  }
}

function clockTriangleLinear(t) {
  if (t.linearReloadFlag) {
    t.linearCounter = t.linearReload;
  } else {
    if ((t.linearCounter > 0)) {
      t.linearCounter = __ovf((t.linearCounter - 1), -9223372036854775808, 9223372036854775807);
    }
  }
  if ((!t.control)) {
    t.linearReloadFlag = false;
  }
}

function clockPulseSweep(p) {
  if (p.sweepReload) {
    p.sweepDivider = p.sweepPeriod;
    p.sweepReload = false;
    return;
  }
  if ((p.sweepDivider > 0)) {
    p.sweepDivider = __ovf((p.sweepDivider - 1), -9223372036854775808, 9223372036854775807);
    return;
  }
  p.sweepDivider = p.sweepPeriod;
  if (((p.sweepEnabled && (p.sweepShift > 0)) && (!pulseMuted(p)))) {
    const change = Math.floor(p.timerPeriod / 2 ** (__sh(p.sweepShift, 64)));
    if (p.sweepNegate) {
      let d = change;
      if ((!p.isPulse2)) {
        d = __ovf((d + 1), -9223372036854775808, 9223372036854775807);
      }
      p.timerPeriod = __ovf((p.timerPeriod - d), -9223372036854775808, 9223372036854775807);
    } else {
      p.timerPeriod = __ovf((p.timerPeriod + change), -9223372036854775808, 9223372036854775807);
    }
  }
}

function pulseMuted(p) {
  return ((p.timerPeriod < 8) || (p.timerPeriod > 2047));
}

function pulseOutput(p) {
  if ((((!p.enabled) || (p.length == 0)) || pulseMuted(p))) {
    return 0;
  }
  if ((__idx(DUTY_TABLE, __ovf((__ovf((p.duty * 8), -9223372036854775808, 9223372036854775807) + p.dutyPos), -9223372036854775808, 9223372036854775807)) == 0)) {
    return 0;
  }
  if (p.constant) {
    return p.volume;
  }
  return p.envDecay;
}

function triangleOutput(t) {
  return __idx(TRIANGLE_SEQ, t.seqPos);
}

function noiseOutput(n) {
  if ((((!n.enabled) || (n.length == 0)) || (((n.shift & 1) >>> 0) == 1))) {
    return 0;
  }
  if (n.constant) {
    return n.volume;
  }
  return n.envDecay;
}

function emitSample(apu) {
  const p1 = pulseOutput(apu.pulse1);
  const p2 = pulseOutput(apu.pulse2);
  const tri = triangleOutput(apu.triangle);
  const noi = noiseOutput(apu.noise);
  const mixed = (__idx(apu.pulseTable, __ovf((p1 + p2), -9223372036854775808, 9223372036854775807)) + __idx(apu.tndTable, __ovf((__ovf((__ovf((3 * tri), -9223372036854775808, 9223372036854775807) + __ovf((2 * noi), -9223372036854775808, 9223372036854775807)), -9223372036854775808, 9223372036854775807) + apu.dmc.output), -9223372036854775808, 9223372036854775807)));
  const hp = ((mixed - apu.hpPrevIn) + (0.9995 * apu.hpPrevOut));
  apu.hpPrevIn = mixed;
  apu.hpPrevOut = hp;
  let v = (hp * 28000);
  if ((v > 32000)) {
    v = 32000;
  }
  if ((v < (-32000))) {
    v = (-32000);
  }
  apu.samples.push(((Math.trunc(v) << 16) >> 16));
}

function Unit$Eq$eq(self, _other) {
  return true;
}

function Pulse$Eq$eq(self, other) {
  return (((((((((((((((((((self.enabled == other.enabled) && (self.duty == other.duty)) && (self.dutyPos == other.dutyPos)) && (self.lengthHalt == other.lengthHalt)) && (self.constant == other.constant)) && (self.volume == other.volume)) && (self.timerPeriod == other.timerPeriod)) && (self.timerVal == other.timerVal)) && (self.length == other.length)) && (self.envStart == other.envStart)) && (self.envDivider == other.envDivider)) && (self.envDecay == other.envDecay)) && (self.sweepEnabled == other.sweepEnabled)) && (self.sweepPeriod == other.sweepPeriod)) && (self.sweepNegate == other.sweepNegate)) && (self.sweepShift == other.sweepShift)) && (self.sweepReload == other.sweepReload)) && (self.sweepDivider == other.sweepDivider)) && (self.isPulse2 == other.isPulse2));
}

function Triangle$Eq$eq(self, other) {
  return (((((((((self.enabled == other.enabled) && (self.control == other.control)) && (self.length == other.length)) && (self.linearReload == other.linearReload)) && (self.linearCounter == other.linearCounter)) && (self.linearReloadFlag == other.linearReloadFlag)) && (self.timerPeriod == other.timerPeriod)) && (self.timerVal == other.timerVal)) && (self.seqPos == other.seqPos));
}

function Noise$Eq$eq(self, other) {
  return ((((((((((((self.enabled == other.enabled) && (self.lengthHalt == other.lengthHalt)) && (self.constant == other.constant)) && (self.volume == other.volume)) && (self.length == other.length)) && (self.envStart == other.envStart)) && (self.envDivider == other.envDivider)) && (self.envDecay == other.envDecay)) && (self.mode == other.mode)) && (self.timerPeriod == other.timerPeriod)) && (self.timerVal == other.timerVal)) && (self.shift == other.shift));
}

function Dmc$Eq$eq(self, other) {
  return (((((((((((((((((self.enabled == other.enabled) && (self.irqEnabled == other.irqEnabled)) && (self.loopFlag == other.loopFlag)) && (self.rate == other.rate)) && (self.timer == other.timer)) && (self.output == other.output)) && (self.sampleAddr == other.sampleAddr)) && (self.sampleLen == other.sampleLen)) && (self.curAddr == other.curAddr)) && (self.bytesRemaining == other.bytesRemaining)) && (self.shiftReg == other.shiftReg)) && (self.bitsRemaining == other.bitsRemaining)) && (self.bufferByte == other.bufferByte)) && (self.bufferEmpty == other.bufferEmpty)) && (self.silence == other.silence)) && (self.needsFetch == other.needsFetch)) && (self.irqFlag == other.irqFlag));
}

try { main(); __flush(); } catch (__e) { __flush(); if (__e && __e.__milo_trap) { __eprint(__e.message + "\n"); if (typeof process !== 'undefined') process.exit(134); } throw __e; }
