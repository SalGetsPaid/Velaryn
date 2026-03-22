import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import type { ForgeEvent } from "@/app/ledger/types";

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_FORGE_LOGGER_CONTRACT || "0x0000000000000000000000000000000000000000") as `0x${string}`;
const ABI = parseAbi([
  "function logEvent(uint256 id, string title, uint256 amount, string impact, string date, bytes32 hash)",
  "event ForgeLogged(uint256 id, string title, uint256 amount, string impact, string date, bytes32 hash)",
]);

export const publicClient = createPublicClient({ chain: base, transport: http() });

export async function logForgeEventToChain(event: ForgeEvent, privateKey: `0x${string}`) {
  if (!privateKey || CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    return (`0x${event.id.toString(16).padStart(64, "0")}`) as `0x${string}`;
  }

  const walletClient = createWalletClient({
    chain: base,
    transport: http(),
    account: privateKeyToAccount(privateKey),
  });

  const pseudoHash = (`0x${Date.now().toString(16).padStart(64, "0")}`) as `0x${string}`;

  const hash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "logEvent",
    args: [
      BigInt(event.id),
      event.title,
      BigInt(Math.max(0, Math.round(event.amount))),
      event.impact,
      event.date,
      pseudoHash,
    ],
  });

  return hash;
}
