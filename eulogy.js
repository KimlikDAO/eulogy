import { spawn } from 'child_process';
import { getCreateAddress as evmCreateAddress } from "ethers";
import { getCreateAddress as eravmCreateAddress } from "./lib/ethereum/eravm";
import evm from "./lib/ethereum/evm";
import vm from "./lib/testing/vm";

/** @type {number} */
let Count = 0;
/** @type {boolean} */
let Started = false;
/** @const {boolean} */
const dobby = process.argv.includes("--dobby");
/** @const {boolean} */
const zkSync = process.argv.includes("--zksyncera");

const f = (priv) => {
  if (priv.length != 64) {
    console.log("invalid priv:", priv);
    return;
  }
  Count++;
  /** @const {string} */
  const deployer = vm.addr(BigInt("0x" + priv));
  /** @const {string} */
  const deployed = evm.adresDüzelt(zkSync
    ? eravmCreateAddress(deployer, 0)
    : evmCreateAddress({ from: deployer, nonce: 0 })
  );

  const isHit = dobby
    ? deployed.startsWith("0xD0BB7")
    : deployed.startsWith('0x1DAO') && deployed.endsWith('1DAO');

  console.log(`C: ${("" + Count).padStart(3, " ")} ` +
    `${isHit ? " hit" : "miss"}: ${deployed} ${priv} ${deployer}`);
};

const cmd = spawn('./profanity', process.argv.slice(2));

cmd.stdout.on('data', (data) => {
  const line = data.toString().trim();
  if (line.includes('START'))
    Started = true;
  if (Started)
    f(line);
});

cmd.stderr.on('data', (data) => console.error(`stderr: ${data}`));
cmd.on('close', (code) => console.log(`child process exited with code ${code}`));
