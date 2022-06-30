import subprocess

import rlp
from eth_account import Account
from eth_utils import keccak, to_bytes, to_checksum_address


def contract_address(sender: str, nonce=0) -> str:
    sender_bytes = to_bytes(hexstr=sender)
    raw = rlp.encode([sender_bytes, nonce])
    h = keccak(raw)
    address_bytes = h[12:]
    return to_checksum_address(address_bytes)

def f(priv):
    acc = Account.from_key(priv)
    deployer = acc.address
    deployed = contract_address(acc.address)
    if deployed.startswith("0xcCc") and deployed.endswith("cCc"):
        print("Found: ", priv, deployer, deployed)
    else:
        print("Missed:", priv, deployer, deployed)


started = False
cmd = subprocess.Popen(["./profanity"], stdout=subprocess.PIPE)
for line in iter(cmd.stdout.readline, ""):
    if line.startswith(b'START'):
        started = True
    if started and len(line) >= 60:
        f(line[:-1].decode('utf-8'))
cmd.wait()