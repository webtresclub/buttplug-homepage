import { walletState } from './store.svelte';
import {
    readContract,
    writeContract,
    multicall,
    watchContractEvent,
} from '@wagmi/core/actions';

import { parseAbi } from 'viem';

/// @dev Ethereum mainnet & sepolia address of the collection
export const BUTTPLUGGY = '0x0000420538CD5AbfBC7Db219B6A1d125f5892Ab0' as `0x${string}`;

const abi = parseAbi([
    //  ^? const abi: readonly [{ name: "balanceOf"; type: "function"; stateMutability:...
    'function claimed(address user) view returns (bool)',
    'function totalMinted() external view returns (uint256)',
    'function mint(uint256 nonce) external',
    'function mintWithMerkle(bytes32[] calldata proofs) external',
    'function currentDifficulty() external view returns (uint256)',
    'function salt() external view returns (bytes32)',
    'function ownerOf(uint256 tokenId) external view returns (address)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'error ErrUnauthorized()',
    'error ErrUnsafeRecipient()',
    'error ErrInvalidRecipient()',
    'error ErrAlreadyMinted()',
    'error ErrNotMinted()',
    'error ErrWrongFrom()'
]);

export async function haveClaimButtplug(user: `0x${string}`) {
    const wagmiConfig = walletState.config;
    if (!wagmiConfig) throw new Error('wagmiConfig not found');
    const data = await readContract(wagmiConfig, {
        address: BUTTPLUGGY,
        abi,
        functionName: 'claimed',
        args: [user],
        blockTag: 'safe'
    });

    return data;
}

export async function ownerOf(buttpluggy: bigint) {
    const wagmiConfig = walletState.config;
    if (!wagmiConfig) throw new Error('wagmiConfig not found');
    const data = await readContract(wagmiConfig, {
        address: BUTTPLUGGY,
        abi,
        functionName: 'ownerOf',
        args: [buttpluggy],
        blockTag: 'safe'
    });

    return data;
}

export async function mintWithMerkle(proofs: `0x${string}`[]) {
    const wagmiConfig = walletState.config;
    if (!wagmiConfig) throw new Error('wagmiConfig not found');
    const data = await writeContract(wagmiConfig, {
        address: BUTTPLUGGY,
        abi,
        functionName: 'mintWithMerkle',
        args: [proofs]
    });

    return data;
}

export async function mint(nonce: bigint) {
    const wagmiConfig = walletState.config;
    if (!wagmiConfig) throw new Error('wagmiConfig not found');
    const data = await writeContract(wagmiConfig, {
        address: BUTTPLUGGY,
        abi,
        functionName: 'mint',
        args: [nonce]
    });

    return data;
}

class ContractState {
    difficulty = $state<bigint>(0n);
    salt = $state<`0x${string}` | null>(null);
    totalMinted = $state<bigint>(0n);
    chainTimestamp = $state<bigint>(0n);

    async currentDifficultyAndSalt() {
        const wagmiConfig = walletState.config;
        if (!wagmiConfig) throw new Error('wagmiConfig not found');
        const _chainId = walletState.chainId;
        console.log({ _chainId });

        const toWatch = {
            contracts: [
                { address: BUTTPLUGGY, abi, functionName: 'currentDifficulty' },
                { address: BUTTPLUGGY, abi, functionName: 'salt' },
                { address: BUTTPLUGGY, abi, functionName: 'totalMinted' }
            ]
        } as const; // Added as const for better type inference if needed, though multicall might handle it

        //console.log(wagmiConfig.getClient());
        // @ts-ignore
        const data = await multicall(wagmiConfig, toWatch);

        // Assuming data order matches contracts order
        if (data[0].status === 'success') this.difficulty = data[0].result as bigint;
        if (data[1].status === 'success') this.salt = data[1].result as `0x${string}`;
        if (data[2].status === 'success') this.totalMinted = data[2].result as bigint;

        const unwatch = watchContractEvent(wagmiConfig, {
            address: BUTTPLUGGY,
            abi,
            chainId: Number(_chainId),
            eventName: 'Transfer',
            onLogs: async (logs) => {
                // @ts-ignore
                const data = await multicall(wagmiConfig, toWatch);
                if (data[0].status === 'success') this.difficulty = data[0].result as bigint;
                if (data[1].status === 'success') this.salt = data[1].result as `0x${string}`;
                if (data[2].status === 'success') this.totalMinted = data[2].result as bigint;
            }
        });

        return unwatch;
    }

    async getTimestamp() {
        const wagmiConfig = walletState.config;
        if (!wagmiConfig) throw new Error('wagmiConfig not found');
        const data = await readContract(wagmiConfig, {
            address:
                walletState.chainId === 11155111n
                    ? '0x25Eef291876194AeFAd0D60Dff89e268b90754Bb'
                    : '0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441', // makerdao multicall
            abi: [
                {
                    inputs: [],
                    name: 'getCurrentBlockTimestamp',
                    outputs: [{ name: 'timestamp', type: 'uint256' }],
                    payable: false,
                    stateMutability: 'view',
                    type: 'function'
                }
            ],
            functionName: 'getCurrentBlockTimestamp',
            args: []
        });

        this.chainTimestamp = data;
    }
}

export const contractState = new ContractState();
