const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { toHex } = require("ethereum-cryptography/utils"); // allows us to convert the byte array address to hexadecimal
const { keccak256 } = require("ethereum-cryptography/keccak");

const privateKey = secp.utils.randomPrivateKey();

console.log("private key", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

console.log("public key", toHex(publicKey));
console.log(`ADDRESS ---->  0x${toHex(getAddress(publicKey))}`);

function getAddress(pubKey) {
  // the first bye indicates whether the key is compressed form or not
  //note these keys are represented as byte arrays, therefore to get the address we need to get
  // the keccak hash of the last 20 bits of the public key
  return keccak256(pubKey.slice(1).slice(-20));
}
