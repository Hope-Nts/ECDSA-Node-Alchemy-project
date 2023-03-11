import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import * as secp from "ethereum-cryptography/secp256k1";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  // this will create a signed transaction that we will send to the client from which
  // we will recover the public key
  const createSignature = async (address, recipient, amount) => {
    const tnx = `Send ${amount} from ${address} to ${recipient}`;
    const byteTxn = utf8ToBytes(tnx);
    const hashedTnx = toHex(keccak256(byteTxn));
    const signature = await secp.sign(hashedTnx, address);
    const hashedSig = toHex(signature);

    return {
      msg: tnx,
      signature: hashedSig,
    };
  };

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const signature = await createSignature(address, recipient, sendAmount);
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: toHex(secp.getPublicKey(address)),
        amount: parseInt(sendAmount),
        signature: signature,
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient (Public Addresss)
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
