const axios = require('axios');
const fs = require('fs');
const ethers = require('ethers');
const utils = require('../ruby_modules/users.js');
const FILENAME = "holders.json";
const URL_BASE = 'https://elated-tan-skat.explorer.mainnet.skalenodes.com/api';

const BLACK_LIST = {
    list: [
        '0xfe3fd4c4bb91800347cb4ee367332f417e70eb4a',   // treas
        '0xf7f31eB9Ed232652F2AEC8851290461477E9b95f',   // vesting contracts
        '0xc6AcAE074e67826d5DD4cFB51EE4D5b7671C7B51',
        '0xeb50B425EFBB2b391ECCc0AF73B42e73c5C1E8A2',
        '0x261413a3FCD2548069961a531C9F9894076Dc378',
        '0xA8a032FCF0268f34E7487475cfa3812516367C85',
        '0x727AFa1187857aF19cd5D059776B94aC201C753b',
        '0x0823063849B7aee13BB7e92efb980a4772574b58',
        '0x7647522644bB058D72Fa1c7e04606559D6b2918a',
        '0x27d11Cebffd6dB55a8dF8E254f01bF8ab55EB9B8',
        '0x58947298E2c56b07838DB75dA0E2cd2ad4C21a97',
        '0x57dfde4e5112185f75278325d469e58C89062A8D',
        '0x113A993B3a39F1C8491E972532CfD410BceEaFA0',
        '0x473877BeaACb19668792b1ef14b4c75c9fA42d18',
        '0xfaD4A4336481A576F46aC377F234221566C43592',
        '0x7e21FF2b2d266e780312789fb1968dBB8Ca01709',
        '0x7E97096952dFd3C9Db8c9484C26F7aFaB9681BB9',
        '0xdCa08c0EEac93052Ec6Fb53705996e450af1F6A5',
        '0x0661FDc3b24Cf3c674F05bbA894f64F10107Ae0f',
        '0x216298a0FB9F89713D7cE36354554acab4DdAc80',
        '0xf1F29230427539AEe8230f7D505853c11d8777FB',
        '0x2F8a3Cb8AF6593788299c8B9E8442271CB9D1476',
        '0x006d351Ea18e666f93d99C641813Ed60CE0790F9',
        '0x4c87235251d9cf2d23aDaDc8F6BA2d3c09bA161D',
        '0x35Bdc072e9A9B33deFCbC7D8C9db149E0128eD54',
        '0x54b14CfBC5165Ac6Dfd7c3CFaC9d4cF738B88d51',
        '0xCb336c8067C94fc640706EF6EA8142f6f131FC6d',
        '0xd6FFE765cbEDe92151C2a48020773dB589442B27',
        '0xA437eF93981df052cdE8Ec77C37C10Ad727B0Aa9',
        '0x624feCCb8cEfaD6f059d376Fc4e479ED354171C1',
        '0xFfD3D490Ba0f9544b9cb53a1Fc34D3B1DDBf4E63',
        '0x0d2F0264CEF8Dafdc85d1FFdf074EDcd36bd9665',
        '0x48Dfa9437E3167F91C8e65F9eAC8534CaefB9C7A',
        '0x831228E0289c1D97361Ec11A24a2a82cd988DCE0',
        '0x2a62d04BdFBDD7e6ADeBbB3dd34D292eC9aA3B4f',
        '0x10D375a0dF8AAa1DC92158Dae5276A909106b819',
        '0x151fDA73B4d6D1d0Ab2EF5121D50CE0f92E87706',
        '0x3b97FF2dC9Fb6c06c95546A6907a5EAeBD659C96',
        '0xC2ce3e231b2631DE71b2aF907deB88e11712AB1c',
        '0x84926a80daC81Ce781e81C25F9e6f19869C58176',
        '0xb01BE25CDc69Fcd637B8aA7C08367056a4e68122',
        '0x952b917a9CbDd44b54845a68944Ba7B30d035e17',
        '0x5180Ae3f6c09853524F12795bC590276e9C9f960',
        '0x073b3d3ccc3B4A80709B1895ad4281Ace0c81586',
        '0x3Ac54FfD78d28bdB382D323C5a1f6DC0a433bE89',
        '0x46e013983B5bb9007e0281a2Bf75D3993d5c83f3',
        '0x700789eD8E756D761063e3314Bc72F03ded6036f',
        '0xfE724d2567e38ADa1dE3f5f7b7193e38d8Cb09dA',
        '0xebA5c9Aa02D259C59E2A42acF9bE9c7569f5121D',
        '0x69Dc191F247516Cb992DB796F523992929596d5A',
        '0x5021EC385a53c5245fCF8C2b48B0bfbc0CfD07BA',
        '0xA5d044b7f8610a0f7d2652c9BeeB2767E0beB61E',
        '0x1Db1FB8C69919Efd05a456759941cb829B3F891a',
        '0xAcB37b90686714b1161deB5Cf86b22DdAFCdc452',
        '0xaE29C3c9428dA11F0cCb7B442b2D8546168C0812',
        '0xda7bB38060206e677059020e5Fa1156bC369f297'
    ]
}
// collect all api requests and write to file
async function createTokenHoldersDB(tokenAddress) {
    let limit = 500;
    let index = 1;// start at page 1
    let obj = [];

    while (limit === 500) {
        let holders = await getTokenHolders(tokenAddress, index, limit)
        const length = holders?.result.length;
        limit = length;
        obj.push(holders?.result)
        index++;
    }

    let reformat_data = {
        holders: obj
    }

    let res = await utils.writeJsonFile(FILENAME, reformat_data).then(res => {
        return res;
    }).catch(err => {
        console.log("Error : writeJsonFile ", err);
    })

    console.log("Holders write to file:", res)

}
// api calls
async function getTokenHolders(address, page, offset) {

    const stringThis = '?module=token&action=getTokenHolders&contractaddress=' + address + "&page=" + page + "&offset=" + offset

    const res = await axios.get(URL_BASE + stringThis, {

    }).then(res => {

        return res;
    }).catch(err => {
        console.log(err);
        return err;
    })

    return res.data;

}
// match addresses 
async function blicklistAddresses(walletAddress) {

    const length = BLACK_LIST.list.length;
    let bl;
    for (let i = 0; i < length; i++) {

        bl = BLACK_LIST.list[i].toLowerCase();

        if (walletAddress === bl) {
            // console.log('blacklist match: ', length, walletAddress, BLACK_LIST.list[i] , i)
            return true;
        }

    }

    return false;
}
//read file | filter out addresses | add token supply
async function sortTokenHolders() {

    const res = await utils.readJsonFile("holders.json");

    let locked_amount = 0;
    let ruby_circulatiing = 0;
    let address_total = 0;

    // api dumped data into several arrays 
    const length = res.holders.length;
    console.log("Api requests: ", length)

    for (let i = 0; i < length; i++) {

        const length = res.holders[i].length;
        console.log(' api dump # and length : ', i, length)

        for (let ii = 0; ii < length; ii++) {
            let address = res.holders[i][ii].address;
            let value = res.holders[i][ii].value;
            value = ethers.BigNumber.from(value);
            let test_value = ethers.utils.formatEther(value);
            // is address blacklisted 
            let isBlocked = await blicklistAddresses(address);
            if (!isBlocked) {
                ruby_circulatiing += Number(test_value);
            } else {
                locked_amount += Number(test_value);
            }

            address_total++;
        }
    }

    const total_supply = ruby_circulatiing + locked_amount;
    const burnt = 200000000 - total_supply;

    console.log("Circulating: ", ruby_circulatiing);
    console.log("Locked: ", locked_amount);
    console.log("Total (incl burnt): ", total_supply);
    console.log("Burnt: ", burnt);
    console.log("Holders", address_total);

}

async function run() {
    await createTokenHoldersDB('0x2B4e4899b53E8b7958c4591a6d02f9C0b5c50F8f');
    await sortTokenHolders();
}

run();