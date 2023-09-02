import { readContract, writeContract, multicall, watchMulticall } from '@wagmi/core'
import { configureChains, createConfig } from '@wagmi/core'
import { goerli, mainnet } from '@wagmi/core/chains'
 
import { parseAbi } from 'viem'

import { publicProvider } from '@wagmi/core/providers/public'

import { writable } from 'svelte/store';


// huffplug: address 0x11A0Da1d19b37A433e4f6031a86E90AA3DD5585F
/// @dev sepolia address of the minter contract
const MINTER_BUTTPLUG = '0x11A0Da1d19b37A433e4f6031a86E90AA3DD5585F';

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

export const difficulty = writable(5n);
export const salt = writable('');

export async function currentDifficultyAndSalt() {
    let config = await getConfigWagmi();
    config = {
        ...config,
        contracts: [
            {
                address: MINTER_BUTTPLUG,
                abi: abiPlugger,
                functionName: 'currentDifficulty',
                chainId: 5 // sepolia
            },
            {
                address: MINTER_BUTTPLUG,
                abi: abiPlugger,
                functionName: 'salt',
                chainId: 5 // sepolia
            },
        ],
    };
   
    const data = await multicall(config);
    debugger;
    console.log(data);
    const unwatch = watchMulticall(config, (data_) => {
        difficulty.set(data_[0].result);
        salt.set(data_[1].result);
    })
    difficulty.set(data[0].result);
    salt.set(data[1].result);
    return unwatch;
}

let _configWagmi;

export async function getConfigWagmi() {
    if (_configWagmi) {
        return _configWagmi;
    }

    const { chains, publicClient, webSocketPublicClient } = configureChains(
        [goerli],
        [publicProvider()],
    );

    _configWagmi = await createConfig({
        //chains,
        publicClient,
        webSocketPublicClient,
    });

}