// import { Network, Alchemy, AssetTransfersCategory } from 'alchemy-sdk';
// import Web3 from 'web3';

// const ALCHEMY_API_KEY = 'KmDy5q8IZQLOWy8cKhEZB6tUcZgiAsRn';
// const ALCHEMY_API_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// export async function load() {
//   const web3 = new Web3(ALCHEMY_API_URL);
//   const settings = {
//     apiKey: ALCHEMY_API_KEY,
//     network: Network.ETH_MAINNET
//   };

//   let owner = "0x673437D956065Fa0dc416c4A519CC5c37f6AD389"
//   let options = {
//     excludeFilters: "SPAM"
//   };

//   const alchemy = new Alchemy(settings);
//   try {
//     let response = await alchemy.nft.getNftsForOwner(owner, options);
//     console.log(response.ownedNfts)
//   } catch(e){
//     console.error({ e })
//   }
// }