const ethers = require('ethers');
const config = require('../setConfig.json');
const token_abi = require('../abi/SkaleERC20.json');

const rpcUrl = config.rpc.fancy_rasalhague;
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('../keys.json');

const privateKey = credentials.account.privateKeyAdmin;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);


// Pkey minting
const setMinterRoleForTokenMinting = async (tokenAddr, minterAddr) => {
    const token = new ethers.Contract(tokenAddr, token_abi, account);
    const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");
    // ROlE and ADDRESS
    const res = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr).then(res => {
        return res;
    }).catch(err => {
        console.log(err)
    })

    if (typeof res === 'undefined') {
        return;
    }

    const receipt = await res.wait(1);
    console.log("recipe", receipt);

    const res2 = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
    console.log("has minter role", res2);
};



const mintToken = async (tokenAddr, minterAddr, totkenMintAmt) => {
    const token = new ethers.Contract(tokenAddr, token_abi, account);
    const decimal = await token.decimals();


    if (typeof decimal === 'undefined') {
        return;
    }

    console.log("dec:", decimal)



    const res = await token.mint(minterAddr, ethers.utils.parseUnits(totkenMintAmt, decimal)).then(res => {
        return res;
    }).catch(err => {
        console.log(err)
    })

    if (typeof res === 'undefined') {
        return;
    }


    await res.wait(1);
    const balance = await token.balanceOf(minterAddr);
    console.log("balance", balance.toString());
}


async function run() {

    await setMinterRoleForTokenMinting('0x7B841d06e56C9B7E1bfEAD470A5Db907C066fc01', account.address)
    await mintToken('0x7B841d06e56C9B7E1bfEAD470A5Db907C066fc01', account.address, '100000');
}

run();