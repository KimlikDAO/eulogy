import { spawn } from 'child_process';
import { getCreateAddress } from "./lib/ethereum/eravm";
import evm from "./lib/ethereum/evm";
import vm from "./lib/testing/vm";

let Count = 0;
let Started = false;

/** @const {?string} */
const dobby = process.argv.includes("--dobby");

const f = (priv) => {
  if (priv.length != 64) {
    console.log("invalid priv:", priv);
    return;
  }
  Count++;
  const deployer = vm.addr(BigInt("0x" + priv));
  const deployed = evm.adresDüzelt(getCreateAddress(deployer, 0));

  const isHit = dobby
    ? deployed.startsWith("0xD0BB7")
    : deployed.startsWith('0xcCc') && deployed.endsWith('cCc');
  
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
