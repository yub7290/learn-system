/**
 * SM3 哈希算法实现
 * 基于国密 SM3 标准的纯 JavaScript 实现
 */

// 循环左移
function rotl(x, n) {
  return ((x << n) | (x >>> (32 - n))) >>> 0
}

// 填充函数
function padding(msg) {
  const msgLen = msg.length
  const bitLen = msgLen * 8
  const padLen = ((msgLen % 64) < 56) ? (56 - msgLen % 64) : (120 - msgLen % 64)
  const padded = new Uint8Array(msgLen + padLen + 8)
  padded.set(msg)
  padded[msgLen] = 0x80
  // 写入长度（大端序）
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 8, 0, false)
  view.setUint32(padded.length - 4, bitLen, false)
  return padded
}

// 消息扩展
function expand(block) {
  const W = new Array(68)
  const W1 = new Array(64)
  const view = new DataView(block.buffer)
  
  for (let i = 0; i < 16; i++) {
    W[i] = view.getUint32(i * 4, false)
  }
  
  for (let i = 16; i < 68; i++) {
    W[i] = (P1(W[i-16] ^ W[i-9] ^ rotl(W[i-3], 15)) ^ rotl(W[i-13], 7) ^ W[i-6]) >>> 0
  }
  
  for (let i = 0; i < 64; i++) {
    W1[i] = (W[i] ^ W[i+4]) >>> 0
  }
  
  return { W, W1 }
}

// 置换函数
function P0(x) {
  return (x ^ rotl(x, 9) ^ rotl(x, 17)) >>> 0
}

function P1(x) {
  return (x ^ rotl(x, 15) ^ rotl(x, 23)) >>> 0
}

// 压缩函数
function compress(V, block) {
  const { W, W1 } = expand(block)
  let [A, B, C, D, E, F, G, H] = V
  
  for (let j = 0; j < 64; j++) {
    const T = j < 16 ? 0x79cc4519 : 0x7a879d8a
    const SS1 = rotl((rotl(A, 12) + E + rotl(T, j % 32)) >>> 0, 7)
    const SS2 = (SS1 ^ rotl(A, 12)) >>> 0
    const TT1 = ((j < 16 ? (A ^ B ^ C) : ((A & B) | (A & C) | (B & C))) + D + SS2 + W1[j]) >>> 0
    const TT2 = ((j < 16 ? (E ^ F ^ G) : ((E & F) | ((~E >>> 0) & G))) + H + SS1 + W[j]) >>> 0
    D = C
    C = rotl(B, 9)
    B = A
    A = TT1
    H = G
    G = rotl(F, 19)
    F = E
    E = P0(TT2)
  }
  
  return [(A ^ V[0]) >>> 0, (B ^ V[1]) >>> 0, (C ^ V[2]) >>> 0, (D ^ V[3]) >>> 0,
          (E ^ V[4]) >>> 0, (F ^ V[5]) >>> 0, (G ^ V[6]) >>> 0, (H ^ V[7]) >>> 0]
}

// 字节数组转十六进制字符串
function toHex(arr) {
  return arr.map(v => v.toString(16).padStart(8, '0')).join('')
}

/**
 * SM3 哈希函数
 * @param {string|Uint8Array} input - 输入数据
 * @returns {string} 十六进制哈希值
 */
export function sm3(input) {
  // 将字符串转为字节数组
  let msg
  if (typeof input === 'string') {
    msg = new TextEncoder().encode(input)
  } else {
    msg = input
  }
  
  // 初始值
  let V = [0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e]
  
  // 填充
  const padded = padding(msg)
  
  // 分块压缩
  for (let i = 0; i < padded.length; i += 64) {
    const block = padded.slice(i, i + 64)
    V = compress(V, block)
  }
  
  return toHex(V)
}
