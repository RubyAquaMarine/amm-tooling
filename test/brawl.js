const ethers = require('ethers');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
const game_abi = require('../abi/brawlGameContract.json');
const nft_abi = require('../abi/brawlNFT.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Brawl); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const gameAddress = '0x3c969cfB4a7d11a270d0d8069Ab7260AeB91C11E';
const brawlersNFT = '0xD2963F7e218609B91373cDdA853b20746bA24D61';

const heroChoices = [
    1,
    0,
    0
];

async function getNFTID() {
    let okArray;
    const nft = new ethers.Contract(brawlersNFT, nft_abi, accountOrigin);
    const nftIds = await nft.heroIDsOfOwner(accountOrigin.address);
    //todo
    // what if more than 3 nfts? send back only 3 that are ready to play 
    // check cooldown per
    if (typeof nftIds.length === 'number' && nftIds.length > 3) {

        // check cooldown period on hero? 

    } else {
        okArray = nftIds.map(element => Number(ethers.utils.formatUnits(element, 0)));
    }
    // which nfts are in cool down? 
    // array of big numbers


    if (okArray) {
        return okArray;
    }

}

async function freeArenaEntry(nftArray, heros) {
    // Validate input parameters
    if (!nftArray || !heros) {
        throw new Error('Invalid input parameters');
    }

    // Create game contract instance
    const gameContract = new ethers.Contract(gameAddress, game_abi, accountOrigin);

    // Call freeArena function
    try {
        const test = await gameContract.freeArena(nftArray, heros, 0,{ gasLimit: 159999999 });
        if (test) {
            const out = await test.wait();
            return out?.transactionHash;
        }
    } catch (error) {
        console.error('Error in freeArenaEntry:', error.reason);
    }
}

async function PlayArena() {
    const nftArray = await getNFTID();
    console.log("nft data ", nftArray);
    let txHash;
    if (nftArray) {
        txHash = await freeArenaEntry(nftArray, heroChoices);
    }

    if (txHash) {
        console.log("tx data ", txHash);
    }

}

async function run() {

    await PlayArena();// Play Now

    // Play every 8 hours
    setInterval(PlayArena, (60000 * 61) * 8)// 1 hour * 8 
}
run();