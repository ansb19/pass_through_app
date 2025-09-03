import { gcm } from '@noble/ciphers/aes';
import { bytesToUtf8, utf8ToBytes } from '@noble/ciphers/utils';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { Buffer } from 'buffer'; // ✅ RN/Expo 호환
import { getRandomBytesAsync } from 'expo-crypto';
// import { hash } from 'argon2-browser'; // ✅ Argon2id으로 나중에 변경

// ===== 파라미터 =====
const ITERATIONS = 10_000; // PBKDF2 반복 성능 문제로 argon2id로 바꿀 예정
const KEYLEN = 32;          // 32 bytes = 256-bit
const SALT_LEN = 16;        // 16 bytes
const IV_LEN = 12;          // 12 bytes (GCM 권장)

// const Argon2id_time = 3; // 반복 횟수
// const Argon2id_memory = 32 * 1024;// 32MB (실기기 성능에 맞게 조절)


// ===== 타입 =====
export type EncBundle = {
  algo: 'AES-GCM';
  kdf: 'PBKDF2';
  iterations: number;
  digest: 'SHA-256';
  keyLength: number;        // bytes
  ciphertext_b64: string;
  salt_b64: string;
  nonce_b64: string;
  version: 'v1';
};

// 나중에 eas build 환경에서 argon2-browser로 변경
// export type EncBundle = {
//   algo: 'AES-GCM';
//   kdf: 'Argon2id';     // ✅ 변경
//   memoryCost: number;  // KB 단위
//   timeCost: number;
//   parallelism: number;
//   keyLength: number;
//   ciphertext_b64: string;
//   salt_b64: string;
//   nonce_b64: string;
//   version: 'v2';       // ✅ 버전업
// };

// ===== 유틸 =====
function b64enc(buf: Uint8Array): string {
  return Buffer.from(buf).toString('base64');
}
function b64dec(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

// ===== Key Derivation =====
function deriveKey(pin: string, salt: Uint8Array): Uint8Array {
  return pbkdf2(sha256, utf8ToBytes(pin), salt, { c: ITERATIONS, dkLen: KEYLEN });
}

// ===== Key Derivation (Argon2id) =====
// async function deriveKey(pin: string, salt: Uint8Array): Promise<Uint8Array> {
//   const res = await hash({
//     pass: pin,
//     salt,
//     type: 2,            // 2 = Argon2id
//     time: Argon2id_time,            // 반복 횟수
//     mem: Argon2id_memory,     // 32MB (실기기 성능에 맞게 조절)
//     parallelism: 1,
//     hashLen: KEYLEN,

//   });
//   return res.hash; // Uint8Array
// }

// ===== (1) MasterKey 생성 =====
export async function generateMasterKey(): Promise<Uint8Array> {
  return new Uint8Array(await getRandomBytesAsync(KEYLEN));
}

// ===== (2) PIN으로 MasterKey 암호화 =====
export async function wrapMasterKeyWithPin(pin: string, masterKey: Uint8Array): Promise<EncBundle> {
  const salt = new Uint8Array(await getRandomBytesAsync(SALT_LEN));
  const iv   = new Uint8Array(await getRandomBytesAsync(IV_LEN));
  const key  = deriveKey(pin, salt);

  const aes = gcm(key, iv);
  const ciphertext = aes.encrypt(masterKey);   // ✅ 평문은 masterKey (Uint8Array)

  return {
    algo: 'AES-GCM',
    kdf: 'PBKDF2',
    iterations: ITERATIONS,
    digest: 'SHA-256',
    keyLength: KEYLEN,
    ciphertext_b64: b64enc(ciphertext),
    salt_b64: b64enc(salt),
    nonce_b64: b64enc(iv),
    version: 'v1',
  };

  // return {
  //   algo: 'AES-GCM',
  //   kdf: 'Argon2id',
  //   memoryCost: Argon2id_memory,
  //   timeCost: Argon2id_time,
  //   parallelism: 1,
  //   keyLength: KEYLEN,
  //   ciphertext_b64: b64enc(ciphertext),
  //   salt_b64: b64enc(salt),
  //   nonce_b64: b64enc(iv),
  //   version: 'v2',
  // };
}

// ===== (3) PIN으로 MasterKey 복호화 =====
export async function unwrapMasterKeyWithPin(pin: string, enc: EncBundle): Promise<Uint8Array> {
  const salt = b64dec(enc.salt_b64);
  const iv   = b64dec(enc.nonce_b64);
  const ct   = b64dec(enc.ciphertext_b64);

  const key = deriveKey(pin, salt);
  const aes = gcm(key, iv);
  return aes.decrypt(ct);   // ✅ 복호화하면 masterKey (Uint8Array)
}

// ===== (4) 일반 문자열 암호화/복호화 (옵션) =====
export async function deriveAndEncrypt(pin: string, plainText: string): Promise<EncBundle> {
  const masterKey = utf8ToBytes(plainText);
  return wrapMasterKeyWithPin(pin, masterKey);
}

export async function decryptWithPin(pin: string, enc: EncBundle): Promise<string> {
  const plain = await unwrapMasterKeyWithPin(pin, enc);
  return bytesToUtf8(plain);
}
