import { config, chainId } from './store';
import {
	readContract,
	writeContract,
	multicall,
	watchContractEvent,
	getChainId
} from '@wagmi/core';

import { parseAbi } from 'viem';

import { writable, get } from 'svelte/store';

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
	const wagmiConfig = get(config);
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

export async function ownerOf(buttpluggy) {
	const wagmiConfig = get(config);
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

export async function mintWithMerkle(proofs) {
	const wagmiConfig = get(config);
	if (!wagmiConfig) throw new Error('wagmiConfig not found');
	const data = await writeContract(wagmiConfig, {
		address: BUTTPLUGGY,
		abi,
		functionName: 'mintWithMerkle',
		args: [proofs]
	});

	return data;
}

export async function mint(nonce) {
	const wagmiConfig = get(config);
	if (!wagmiConfig) throw new Error('wagmiConfig not found');
	const data = await writeContract(wagmiConfig, {
		address: BUTTPLUGGY,
		abi,
		functionName: 'mint',
		args: [nonce]
	});

	return data;
}

export const difficulty = writable();
export const salt = writable();
export const totalMinted = writable();
export const chainTimestamp = writable();

export async function currentDifficultyAndSalt() {
	const wagmiConfig = get(config);
	if (!wagmiConfig) throw new Error('wagmiConfig not found');
	const _chainId = get(chainId);
	console.log({ _chainId });

	const toWatch = {
		contracts: [
			{ address: BUTTPLUGGY, abi, functionName: 'currentDifficulty' },
			{ address: BUTTPLUGGY, abi, functionName: 'salt' },
			{ address: BUTTPLUGGY, abi, functionName: 'totalMinted' }
		]
	};
	//console.log(wagmiConfig.getClient());
	const data = await multicall(wagmiConfig, toWatch);
	difficulty.set(data[0].result);
	salt.set(data[1].result);
	totalMinted.set(data[2].result);

	const unwatch = watchContractEvent(wagmiConfig, {
		address: BUTTPLUGGY,
		abi,
		chainId: Number(_chainId),
		eventName: 'Transfer',
		async onLogs(logs) {
			const data = await multicall(wagmiConfig, toWatch);
			difficulty.set(data[0].result);
			salt.set(data[1].result);
			totalMinted.set(data[2].result);
		}
	});

	return unwatch;
}

// use multicall to get current timestamp
export async function getTimestamp() {
	const wagmiConfig = get(config);
	if (!wagmiConfig) throw new Error('wagmiConfig not found');
	const data = await readContract(wagmiConfig, {
		address:
			get(chainId) === 11155111n
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

	chainTimestamp.set(data);
}
