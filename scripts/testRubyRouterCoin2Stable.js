const ethers = require('ethers');
const erc20ABI = require('./abi/erc20.json');
const routerABI = require('./abi/amm_router.json');
const rubyRouterABI = require('./abi/ruby_router.json');// Ruby Trade Router aka ITR
const stableSwapABI = require('./abi/stableSwap.json');

const rpcUrl = "https://dappnet-api.skalenodes.com/v1/melodic-murzim";
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const credentials = require('./keys.json');
const privateKey = credentials.account.privateKey;
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);

const rubyRouterAddress = '0x699D09C9B1E33518eC3715F30ac696C59a2d34c8';
const rubyRouterContract = new ethers.Contract(rubyRouterAddress, rubyRouterABI, account);
const stableSwapAddress = "0xc06F44513915A0d949c80719460636Bb7148206d";
const stableSwapContract = new ethers.Contract(stableSwapAddress, stableSwapABI, account);
//0x0EB4a542fcCBe6c985Eaa08e7A5De0f27cb50938 | 0x059Fc87C315c659Bc11B0F7F524d20413A4A0fAC | 0x788c12145E5E15717020095172d3471Fd6C0569f | 0x9DBFcCd94c26cd219b60754215abcC32c26F41c2
const StableIndex = {
    USDP: 0,
    DAI: 1,
    USDC: 2,
    USDT: 3,
}

const StableAddress = {
    USDP: '0x0EB4a542fcCBe6c985Eaa08e7A5De0f27cb50938',
    DAI: '0x059Fc87C315c659Bc11B0F7F524d20413A4A0fAC',
    USDC: '0x788c12145E5E15717020095172d3471Fd6C0569f',
    USDT: '0x9DBFcCd94c26cd219b60754215abcC32c26F41c2',
}

const AssetAddress = {
    RUBY: '0x58F2b35dde559F49B9870Ec101c3b1B8433C644d',
    ETH: '0xd2aaa00700000000000000000000000000000000',
}

const SwapType = {
    AMM: 0,
    STABLE_POOL: 1,
}

const AMMSwapType = {
    EXACT_TOKENS_FOR_TOKENS: 0,
    TOKENS_FOR_EXACT_TOKENS: 1,
}

// Input: wei amount
// Input: base token
// Input: routerAddress: AMM router address if the AMM route is first,  othertimes we need to approve the StableSwap Address
async function doApproval(swapAmount, fromToken, routerAddress) {
    const fromContract = new ethers.Contract(fromToken, erc20ABI, account);
    const weiAmount = swapAmount;
    const bal = await fromContract.balanceOf(account.address);
    console.log("fromToken Balance: " + bal.toString());
    let allowanceAmount = await fromContract.allowance(account.address, routerAddress);
    console.log("Router Contract Allowance: " + allowanceAmount.toString());
    if (bal.gte(weiAmount)) {
        if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
            console.log("Router Contract Needs Increased Allowance: ");
            const increase = weiAmount.mul(10);// approve for 10 swaps
            const parse = await fromContract.approve(routerAddress, increase);
            const receipt = await parse.wait();
            console.log("Router Contract Receipt: ", receipt);
        }
        return 'Ready to Swap';
    } else {
        console.log("Swap Amount is more than userBalance: ");
        return 'Not Enough Balance to Make Swap';
    }
}

async function testRouter() {

    const ammRouterAddress = await rubyRouterContract.ammRouter();

    //  console.log("AMM Pool: ", ammRouterAddress);

    //  const poolAddress = await rubyRouterContract.owner();

    //  console.log("Deployer: ", poolAddress);

    //  const stableActivated = await rubyRouterContract.enabledStablePools(stableSwapAddress);

    //  console.log("stableActivated: ", stableActivated);

    let rubyAmount = ethers.utils.parseUnits("782", 'ether');// works

    console.log("Swap amount", rubyAmount.toString())

    // uniswap router working

    const routerContract = new ethers.Contract(ammRouterAddress, routerABI, account);
    const tokenOut = await routerContract.getAmountsOut(rubyAmount, [AssetAddress.RUBY, StableAddress.USDP]).then(result => {
        return result;
    }).catch(err => {
        console.log("getAmountsOut Error: ", err);
    })

    console.log("Token In : ", tokenOut[0].toString());
    console.log("Token Out: ", tokenOut[1].toString());

    //  const usdcAmountOut = await stableSwapContract.calculateSwap(StableIndex.USDP, StableIndex.USDC, tokenOut[1]);

    //  console.log("USDC OUT: ", usdcAmountOut.toString());

    // approval working

    await doApproval(rubyAmount, AssetAddress.RUBY, rubyRouterAddress).then(result => {
        console.log("doApproval Result: ", result);
    }).catch(err => {
        console.log("doApproval Error: ", err);
    })

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();
    const blockNumber = await provider.getBlockNumber();
    const blockData = await provider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 43600);


    //Signer 
    const address = await account.getAddress();

    const nonce = await account.getTransactionCount("latest");

    // Swaping 
    const swapDetails = {
        ammSwaps: [{
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
            amountIn: rubyAmount,
            amountOut: tokenOut[1],
            path: [AssetAddress.RUBY, StableAddress.USDP],
            to: rubyRouterAddress,
            deadline: expiryDate

        }
        ],
             stableSwaps: [],
        order: [SwapType.AMM]
    };




    console.log("Swap Details: ", swapDetails);

    const omg = await rubyRouterContract.swap(swapDetails
        //     {
        //         "gasPrice": try_string,
        //          "gasLimit": "280000",
        //          "nonce": nonce
        //      }
    ).then(result => {

        result.wait(1).then(res => {
            console.log("Swap Result: ", res);
        })
        // console.log("Swap Result: ", result.wait(1));
        // return result;
    }).catch(err => {
        console.log("Swap Error: ", err);
    })
    /*
        let value = await omg.wait().then(result => {
            console.log("OMG Swap Result: ", result);
            return result;
        }).catch(err => {
           
            console.log("OMG Swap Error: ", err);
            if (err.transaction === undefined) {
                let ok = err.transaction.wait();
                console.log('OK: ', ok)
            }
    
        })
    
    
        let value2 = await value.wait().then(result => {
            console.log("VALUE 2: ", result);
            return result;
        }).catch(err => {
            console.log("VALUE 2 ERR: ", err);
        })
    */
}

testRouter();



