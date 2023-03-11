const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const app = express();
const cors = require("cors");
const port = 8000;

app.use(cors());
app.use(express.json());

const balances = {
  "0436711356d71b6bfb0f678282f9d7f1cd40c24b5401a0986e709a1a5d5f3d5a90647426132572849e18f5448532b01b563cac5abf4a091608cc21c339b7d1978f": 100, // dan
  "04486f5a63d364e4dcb29107cef1a6cb151f8d60c513377f642c122da3799400d60200f1e293e819ce768ae343083221de6a0ab8b991717186349e74f966fcca38": 50, // al
  "045f19c4af0949aeb14f88f10a14f4aa27f4f23e7d14c774885924720fa51e64488a51d5556abe3f59b8898afb28638ea3c7c77360fbf40304c93cab9f7ed72c51": 75, // ben
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  try {
    const { sender, recipient, amount, signature } = req.body;

    const msg = signature.msg;
    const hashedSig = signature.signature;
    const byteMsg = utf8ToBytes(msg);
    const hashedMsg = toHex(keccak256(byteMsg));

    setInitialBalance(sender);
    setInitialBalance(recipient);
    for (key in balances) {
      if (secp.verify(hashedSig, hashedMsg, key)) {
        if (balances[sender] < amount) {
          res.status(400).send({ message: "Not enough funds!" });
        } else if (balances[sender]) {
          balances[sender] -= amount;
          balances[recipient] += amount;
          res.send({ balance: balances[sender] });
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
