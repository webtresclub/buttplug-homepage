import { config, chainId } from './store';
import { readContract, writeContract, multicall, watchContractEvent } from '@wagmi/core';


import { parseAbi } from 'viem'

import { writable, get } from 'svelte/store';

/// @dev Ethereum mainnet & sepolia address of the collection
const BUTTPLUGGY = '0x0000420538CD5AbfBC7Db219B6A1d125f5892Ab0';

const abi = parseAbi([
    //  ^? const abi: readonly [{ name: "balanceOf"; type: "function"; stateMutability:...
    'function claimed(address user) view returns (bool)',
    'function totalMinted() external view returns (uint256)',

    'function mint(uint256 nonce) external',
    'function mintWithMerkle(bytes32[] calldata proofs) external',
    'function currentDifficulty() public view returns (uint256)',
    'function salt() public view returns (bytes32)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'error ErrUnauthorized()',
    'error ErrUnsafeRecipient()',
    'error ErrInvalidRecipient()',
    'error ErrAlreadyMinted()',
    'error ErrNotMinted()',
    'error ErrWrongFrom()'
])

export async function haveClaimButtplug(user: `0x${string}`) {
    const data = await readContract(get(config), {
        address: BUTTPLUGGY,
        abi,
        functionName: 'claimed',
        args: [user],
        blockTag: 'safe',
    });
    
    return data;
}

export async function mintWithMerkle(proofs) {
    const data = await writeContract(get(config), {
        address: BUTTPLUGGY,
        abi,
        functionName: 'mintWithMerkle',
        args: [proofs],
    });

    return data;
}

export async function mint(nonce) {
    const data = await writeContract(get(config), {
        address: BUTTPLUGGY,
        abi,
        functionName: 'mint',
        args: [nonce],
    });

    return data;
}

export const difficulty = writable();
export const salt = writable();
export const totalMinted = writable();

export async function currentDifficultyAndSalt() {   
    const _config = get(config);

    const toWatch = {
        contracts: [
            { address: BUTTPLUGGY, abi, functionName: 'currentDifficulty' },
            { address: BUTTPLUGGY, abi, functionName: 'salt' },
            { address: BUTTPLUGGY, abi, functionName: 'totalMinted' },
        ],
    };
    //console.log(_config.getClient());
    const data = await multicall(_config, toWatch);
    difficulty.set(data[0].result);
    salt.set(data[1].result);
    totalMinted.set(data[2].result);

    
    const unwatch = watchContractEvent(_config, {        
        address: BUTTPLUGGY,
        abi,
        chainId: get(chainId),
        eventName: 'Transfer',
        async onLogs(logs) {
            const data = await multicall(_config, toWatch);
            difficulty.set(data[0].result);
            salt.set(data[1].result);
            totalMinted.set(data[2].result);
        },
    });
    
    return unwatch;
}