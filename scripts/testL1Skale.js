const ethers = require('ethers');
const poolABI = require('../abi/communityPool.json');
const boxABI = require('../abi/depositBox.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

const provider = new ethers.providers.JsonRpcProvider(config.rpc.mainnet);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);

async function doNow(){

   
        const contractV2 = new ethers.Contract(config.skale.deposit_box, boxABI , account);

  

         res = await contractV2.contractManagerOfSkaleManager().then(result =>{
            console.log(" is this result: ", result)
        }).catch(err=>{
            console.log(" is this err: ", err)
        })

        console.log(" is this res: ", res)

}

async function run(){
    await doNow()
}

run();

{
    "bounty_v2": "0x801BA194f775a6CB0B5759FdDCe6A35e401787BF",
    "constants_holder": "0x3d30A62AceEB6720312c3318D28620194e749e38",
    "contract_manager": "0xC04A10Fd5e6513242558f47331568aBD6185a310",
    "decryption": "0x9257B149889A76c7A86BFfA5820f06FaBca3a9a1",
    "delegation_controller": "0x06dD71dAb27C1A3e0B172d53735f00Bf1a66Eb79",
    "delegation_period_manager": "0x54a663E39621D2E644F6B9b6966CDf66db973ab3",
    "distributor": "0x2a42Ccca55FdE8a9CA2D7f3C66fcddE99B4baB90",
    "e_c_d_h": "0x1A77D7617f919e20F8E0fA98A292DEAF1072b77E",
    "key_storage": "0x921a97c815E4E7508D1aD639b56A21E942a3a152",
    "node_rotation": "0xEC4EA4802Cb323645B87441AEB5622c800d72CCd",
    "nodes": "0xD489665414D051336CE2F2C6e4184De0409e40ba",
    "pricing": "0x39c289a3EF68127C272dE21F3db67B0CDeCDFEE1",
    "punisher": "0xbcA0eCdD44203DE76AF389d5F9931015529b7F1E",
    "schains": "0x0fCa003F483313869ee54e86B281348980B4cbf6",
    "schains_internal": "0x836Df73065Cb143bdDF3106e46783d43C12C6012",
    "skale_d_k_g": "0xfcc84F7b6d88d671C6a1841549c0b2E70110884f",
    "skale_manager": "0x8b32F750966273cb6D804C02360F3E2743E2B511",
    "skale_token": "0x00c83aeCC790e8a4453e5dD3B0B4b3680501a7A7",
    "skale_verifier": "0x32F50e2a898F14687f2a714D8b2D405317eB4641",
    "slashing_table": "0x1a7bB775611b58375a3177Dcf3D8E4f7F6d2ed4B",
    "time_helpers": "0x05946b1b80ce4DE235350d8955c5c751860D5399",
    "token_state": "0x4eE5F270572285776814e32952446e9B7Ee15C86",
    "validator_service": "0x840C8122433A5AA7ad60C1Bcdc36AB9DcCF761a5",
    "wallets": "0xbAec960713a6c41d391C93AE42128d72C916965f",
    "sync_manager_address": "0xBC896522b1649dc2e43bC093d08665822529d087"
}
{
    "bounty_v2": "0x801BA194f775a6CB0B5759FdDCe6A35e401787BF",
    "constants_holder": "0x3d30A62AceEB6720312c3318D28620194e749e38",
    "contract_manager": "0xC04A10Fd5e6513242558f47331568aBD6185a310",
    "decryption": "0x9257B149889A76c7A86BFfA5820f06FaBca3a9a1",
    "delegation_controller": "0x06dD71dAb27C1A3e0B172d53735f00Bf1a66Eb79",
    "delegation_period_manager": "0x54a663E39621D2E644F6B9b6966CDf66db973ab3",
    "distributor": "0x2a42Ccca55FdE8a9CA2D7f3C66fcddE99B4baB90",
    "e_c_d_h": "0x1A77D7617f919e20F8E0fA98A292DEAF1072b77E",
    "key_storage": "0x921a97c815E4E7508D1aD639b56A21E942a3a152",
    "node_rotation": "0xEC4EA4802Cb323645B87441AEB5622c800d72CCd",
    "nodes": "0xD489665414D051336CE2F2C6e4184De0409e40ba",
    "pricing": "0x39c289a3EF68127C272dE21F3db67B0CDeCDFEE1",
    "punisher": "0xbcA0eCdD44203DE76AF389d5F9931015529b7F1E",
    "schains": "0x0fCa003F483313869ee54e86B281348980B4cbf6",
    "schains_internal": "0x836Df73065Cb143bdDF3106e46783d43C12C6012",
    "skale_d_k_g": "0xfcc84F7b6d88d671C6a1841549c0b2E70110884f",
    "skale_manager": "0x8b32F750966273cb6D804C02360F3E2743E2B511",
    "skale_token": "0x00c83aeCC790e8a4453e5dD3B0B4b3680501a7A7",
    "skale_verifier": "0x32F50e2a898F14687f2a714D8b2D405317eB4641",
    "slashing_table": "0x1a7bB775611b58375a3177Dcf3D8E4f7F6d2ed4B",
    "time_helpers": "0x05946b1b80ce4DE235350d8955c5c751860D5399",
    "token_state": "0x4eE5F270572285776814e32952446e9B7Ee15C86",
    "validator_service": "0x840C8122433A5AA7ad60C1Bcdc36AB9DcCF761a5",
    "wallets": "0xbAec960713a6c41d391C93AE42128d72C916965f"
}