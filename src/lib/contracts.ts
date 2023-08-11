import { readContract, writeContract } from '@wagmi/core'
 
import { parseAbi } from 'viem'

// renderer: address 0x5f11247f960D9C818bd450F082db8673A56CBaFd
// huffplug: address 0x0000420188cF40067F2c57C241E220aa8d0FbD20

/// @dev sepolia address of the minter contract
const MINTER_BUTTPLUG = '0x47A68C343A9c35c6b397D997E7C15a6B4FA4787F';

const abiPlugger = parseAbi([
  //  ^? const abi: readonly [{ name: "balanceOf"; type: "function"; stateMutability:...
  'function claimed(address user) view returns (bool)',
  'function mint(uint256 nonce) external',
  'function mintWithMerkle(bytes32[] calldata proofs) external',
  'function currentDifficulty() public view returns (uint256)',
  'function salt() public view returns (bytes32)'
])

export async function haveClaimButtplug(user: `0x${string}`) {
    const data = await readContract({
        address: MINTER_BUTTPLUG,
        abi: abiPlugger,
        functionName: 'claimed',
        args: [user],
        blockTag: 'safe',
        chainId: 5 // sepolia
    });

    return data;
}

export async function mintWithMerkle(proofs) {
    const data = await writeContract({
        address: MINTER_BUTTPLUG,
        abi: abiPlugger,
        functionName: 'mintWithMerkle',
        args: [proofs],
        chainId: 5 // sepolia
    });

    return data;
}

export async function mint(nonce) {
    const data = await writeContract({
        address: MINTER_BUTTPLUG,
        abi: abiPlugger,
        functionName: 'mint',
        args: [nonce],
        chainId: 5 // sepolia
    });

    return data;
}