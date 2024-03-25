const ethers = require('ethers');
const erc20ABI = require('../abi/erc20.json');
const routerABI = require('../abi/amm_router.json');// STD AMM
const nftABI = require('../abi/rubyNFTAdmin.json');// NFT 
const rubyRouterABI = require('../abi/ruby_router.json');// Ruby Trade Router aka ITR
const stableSwapABI = require('../abi/stableSwap.json');
// Input: wei amount
// Input: base token
// Input: routerAddress: AMM router address if the AMM route is first,  othertimes we need to approve the StableSwap Address
// Output: should be true/false
async function doApproval(swapAmount, fromToken, routerAddress, account) {

    const DEBUG = false;

    // wei amount already adjusted for the token decimals?
    const weiAmount = swapAmount;
    if (typeof fromToken === 'string') {
        const fromContract = new ethers.Contract(fromToken, erc20ABI, account);

        const bal = await fromContract.balanceOf(account.address).then(ok => {
            return ok;
        }).catch(err => {
            console.log(err)
        })

        const dec = await fromContract.decimals().then(ok => {
            return ok;
        }).catch(err => {
            console.log(err)
        })

        if (typeof dec == 'undefined' || typeof bal === 'undefined') {
            //failed
            return;
        } else {
            const returnBalance = ethers.utils.formatUnits(bal, dec);
            console.log("-- Token Balance: ", returnBalance);
        }

        const allowanceAmount = await fromContract.allowance(account.address, routerAddress).then(ok => {
            return ok;
        }).catch(err => {
            console.log(err)
        })

        if (DEBUG) {
            console.log(typeof weiAmount, weiAmount, weiAmount.toString())
            console.log(typeof bal, bal, bal.toString())
            console.log("Router Contract Allowance: ", typeof allowanceAmount, allowanceAmount, allowanceAmount.toString())
        }

        // make sure wallet has enough 
        if (bal.gte(weiAmount)) {

            if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
                console.log("Router Contract Needs Increased Allowance: ");
                const increase = weiAmount.mul(10);// approve for 10 swaps
                const parse = await fromContract.approve(routerAddress, increase);
                const receipt = await parse.wait(1);
                console.log("Transfer to Router Contract Approval Receipt: ", receipt);
                return 'Approved';
            } else {
                return 'Already approved';
            }
        } else {
            console.log("Swap Amount is more than userBalance: ");
            return 'Not Enough Balance to Make Swap';
        }
    }
    return;// failed
}

async function swapCoinToAnyStable(transferAmount, tokenInAddress, stableInIndex, stableOutIndex, routerAddress, routerRubyAddress, routerStableAddress, USDPAddress, accountSigner, rpcProvider) {
    console.log("SwapCoin_to_Stable")
    const SwapType = {
        AMM: 0,
        STABLE_POOL: 1,
    }

    const AMMSwapType = {
        EXACT_TOKENS_FOR_TOKENS: 0,
        TOKENS_FOR_EXACT_TOKENS: 1,
    }

    const rubyRouterContract = new ethers.Contract(routerRubyAddress, rubyRouterABI, accountSigner);
    const stableSwapContract = new ethers.Contract(routerStableAddress, stableSwapABI, accountSigner);

    const tokenContract = new ethers.Contract(tokenInAddress, erc20ABI, accountSigner);

    let digits = await tokenContract.decimals().then((transaction) => {
        return transaction;
    }).catch(err => {
        console.log("Error decimals:", err)
    })

    if (typeof digits === 'undefined') {
        return;
    }

    let tokenInAmount = ethers.utils.parseUnits(transferAmount, digits);


    // amm router working 
    const routerContract = new ethers.Contract(routerAddress, routerABI, accountSigner);
    /*
        let nftAdmin = await routerContract.nftAdmin();
        const nftContract = new ethers.Contract(nftAdmin, nftABI, accountSigner);
        let fee = await nftContract.calculateAmmSwapFeeDeduction(accountSigner.address)
        console.log("DEBUG swapFee ", fee.toString())
    */
    let fee = 997;

    const tokenOut = await routerContract.getAmountsOut(tokenInAmount, [tokenInAddress, USDPAddress], fee).then(result => {
        return result;
    }).catch(err => {
        console.log("getAmountsOut Error: ", err);
    })

    if (typeof tokenOut === 'undefined') {
        console.log("getAmountsOut Error: ");
        return;
    }



    const usdcAmountOut = await stableSwapContract.calculateSwap(stableInIndex, stableOutIndex, tokenOut[1]).then(result => {
        return result;
    }).catch(err => {
        console.log("calculateSwap Error: ", err);
    })

    if (typeof usdcAmountOut === 'undefined') {
        console.log("stableSwapContract calculateSwap Error: ");
        return;
    }

    if (usdcAmountOut.toString() === '0') {
        console.log("stableSwapContract calculateSwap Error: Token Out is Zero, Increase TokenInput amount");
        return;
    }


    // approval working

    await doApproval(tokenInAmount, tokenInAddress, routerRubyAddress, accountSigner).then(result => {

    }).catch(err => {
        console.log("doApproval Error: ", err);
    })


    const blockNumber = await rpcProvider.getBlockNumber().then(result => {
        return result;
    }).catch(err => {
        console.log("getBlockNumber Error: ", err);
    })

    if (typeof blockNumber === 'undefined') {
        return;
    }

    const blockData = await rpcProvider.getBlock(blockNumber).then(result => {
        return result;
    }).catch(err => {
        console.log("calculateSwap Error: ", err);
    })

    if (typeof blockData === 'undefined') {
        return;
    }

    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 43600);

    // Swapping 
    const swapDetails = {
        ammSwaps: [{
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
            amountIn: tokenInAmount,
            amountOut: tokenOut[1],
            path: [tokenInAddress, USDPAddress],
            to: routerRubyAddress,
            deadline: expiryDate
        }
        ],
        stableSwaps: [{
            stablePool: routerStableAddress,
            tokenIndexFrom: stableInIndex,
            tokenIndexTo: stableOutIndex,
            dx: tokenOut[1],
            minDy: usdcAmountOut,
            deadline: expiryDate
        }],
        order: [SwapType.AMM, SwapType.STABLE_POOL]
    };

    console.log("Swap Details: ", swapDetails);

    const omg = await rubyRouterContract.swap(swapDetails,
        //     {
        //         "gasPrice": try_string,
        //          "gasLimit": "280000",
        //          "nonce": nonce
        //      }
    ).then(result => {

        result.wait(1).then(res => {

        }).catch(err => {
            console.log("Swap Result Error: ", err);
        })
        // console.log("Swap Result: ", result.wait(1));
        // return result;
    }).catch(err => {
        console.log("Swap Error: ", err);
    })
}

async function swapCoinToUSDP(transferAmount, tokenInAddress, routerAddress, routerRubyAddress, USDPAddress, accountSigner, rpcProvider, slippage) {
    console.log("SwapCoin_to_USDP")
    const SwapType = {
        AMM: 0,
        STABLE_POOL: 1,
    }

    const AMMSwapType = {
        EXACT_TOKENS_FOR_TOKENS: 0,
        TOKENS_FOR_EXACT_TOKENS: 1,
    }

    const rubyRouterContract = new ethers.Contract(routerRubyAddress, rubyRouterABI, accountSigner);

    const tokenContract = new ethers.Contract(tokenInAddress, erc20ABI, accountSigner);

    let digits = await tokenContract.decimals();

    let tokenInAmount = ethers.utils.parseUnits(transferAmount, digits);

    // amm router working 
    const routerContract = new ethers.Contract(routerAddress, routerABI, accountSigner);


    let nftAdmin = await routerContract.nftAdmin();
    const nftContract = new ethers.Contract(nftAdmin, nftABI, accountSigner);
    let fee = await nftContract.calculateAmmSwapFeeDeduction(accountSigner.address)


    // ONLY AMM , No multi hop call (more than two elements)
    // array will be two elements 
    const tokenOut = await routerContract.getAmountsOut(tokenInAmount, [tokenInAddress, USDPAddress], fee).then(result => {

        return result;
    }).catch(err => {
        console.log("getAmountsOut Error: ", err);
    })


    //slippage 
    let slippThisMuch = tokenOut[1].div(slippage);// 1%
    const usdcAmountOut = tokenOut[1].sub(slippThisMuch);


    await doApproval(tokenInAmount, tokenInAddress, routerRubyAddress, accountSigner).then(result => {

    }).catch(err => {
        console.log("doApproval Error: ", err);
    })

    //Provider 
    const blockNumber = await rpcProvider.getBlockNumber();
    const blockData = await rpcProvider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 43600);

    // Swaping 
    const swapDetails = {
        ammSwaps: [{
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
            amountIn: tokenInAmount,
            amountOut: usdcAmountOut,
            path: [tokenInAddress, USDPAddress],
            to: routerRubyAddress,
            deadline: expiryDate
        }
        ],
        stableSwaps: [],
        order: [SwapType.AMM]
    };

    console.log("Swap Details: ", swapDetails);

    const omg = await rubyRouterContract.swap(swapDetails,
        //     {
        //         "gasPrice": try_string,
        //          "gasLimit": "280000",
        //          "nonce": nonce
        //      }
    ).then(result => {

        result.wait(1).then(res => {
            // console.log("Swap Result: ", res);
            return "SWAP SUCESSFUL"
        })
        // console.log("Swap Result: ", result.wait(1));
        // return result;
    }).catch(err => {
        console.log("Swap Error: ", err);
    })


    return 'SWAP COMPLETE'
}

async function swapUSDPToCoin(transferAmount, tokenOutAddress, routerAddress, routerRubyAddress, USDPAddress, accountSigner, rpcProvider, slippage) {
    console.log("SwapUSDP_to_Coin")
    const SwapType = {
        AMM: 0,
        STABLE_POOL: 1,
    }

    const AMMSwapType = {
        EXACT_TOKENS_FOR_TOKENS: 0,
        TOKENS_FOR_EXACT_TOKENS: 1,
    }

    const rubyRouterContract = new ethers.Contract(routerRubyAddress, rubyRouterABI, accountSigner);

    const tokenContract = new ethers.Contract(tokenOutAddress, erc20ABI, accountSigner);

    let digits = await tokenContract.decimals();

    let tokenInAmount = ethers.utils.parseUnits(transferAmount, digits);



    // amm router working 
    const routerContract = new ethers.Contract(routerAddress, routerABI, accountSigner);

    let nftAdmin = await routerContract.nftAdmin();
    const nftContract = new ethers.Contract(nftAdmin, nftABI, accountSigner);
    let fee = await nftContract.calculateAmmSwapFeeDeduction(accountSigner.address)



    // ONLY AMM , No multi hop call (more than two elements)
    // array will be two elements 
    const tokenOut = await routerContract.getAmountsOut(tokenInAmount, [USDPAddress, tokenOutAddress], fee).then(result => {

        return result;
    }).catch(err => {
        console.log("getAmountsOut Error: ", err);
    })


    //slippage 
    let slippThisMuch = tokenOut[1].div(slippage);// 1%
    const usdcAmountOut = tokenOut[1].sub(slippThisMuch);


    // approval working

    await doApproval(tokenInAmount, USDPAddress, routerRubyAddress, accountSigner).then(result => {

    }).catch(err => {
        console.log("doApproval Error: ", err);
    })

    //Provider 

    const blockNumber = await rpcProvider.getBlockNumber();
    const blockData = await rpcProvider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 43600);

    // Swaping 
    const swapDetails = {
        ammSwaps: [{
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
            amountIn: tokenInAmount,
            amountOut: tokenOut[1],
            path: [USDPAddress, tokenOutAddress],
            to: routerRubyAddress,
            deadline: expiryDate
        }
        ],
        stableSwaps: [],
        order: [SwapType.AMM]
    };

    console.log("Swap Details: ", swapDetails);

    const swap_result = await rubyRouterContract.swap(swapDetails,
        //     {
        //         "gasPrice": try_string,
        //          "gasLimit": "280000",
        //          "nonce": nonce
        //      }
    ).then(result => {

        result.wait(1).then(res => {
            // console.log("Swap Result: ", res);
            return "SWAP SUCESSFUL"
        })
        // console.log("Swap Result: ", result.wait(1));
        // return result;
    }).catch(err => {
        console.log("Swap Error: ", err);
    })

    return 'SWAP COMPLETE'
}

async function swapStableToCoin(transferAmount, tokenInAddress, tokenOutAddress, stableInIndex, routerAddress, routerRubyAddress, routerStableAddress, USDPAddress, accountSigner, rpcProvider, slippage) {

    const SwapType = {
        AMM: 0,
        STABLE_POOL: 1,
    }

    const AMMSwapType = {
        EXACT_TOKENS_FOR_TOKENS: 0,
        TOKENS_FOR_EXACT_TOKENS: 1,
    }

    const rubyRouterContract = new ethers.Contract(routerRubyAddress, rubyRouterABI, accountSigner);
    const stableSwapContract = new ethers.Contract(routerStableAddress, stableSwapABI, accountSigner);

    const tokenContract = new ethers.Contract(tokenInAddress, erc20ABI, accountSigner);

    let digits = await tokenContract.decimals();

    let tokenInAmount = ethers.utils.parseUnits(transferAmount, digits);



    // amm router working 
    const routerContract = new ethers.Contract(routerAddress, routerABI, accountSigner);

    let nftAdmin = await routerContract.nftAdmin();
    const nftContract = new ethers.Contract(nftAdmin, nftABI, accountSigner);
    let fee = await nftContract.calculateAmmSwapFeeDeduction(accountSigner.address)


    // SSwap
    const usdcAmountOut = await stableSwapContract.calculateSwap(stableInIndex, 0, tokenInAmount);// USDP


    //AMM
    const tokenOut = await routerContract.getAmountsOut(usdcAmountOut, [USDPAddress, tokenOutAddress], fee).then(result => {

        return result;
    }).catch(err => {
        console.log("getAmountsOut Error: ", err);
    })



    // approval working
    await doApproval(tokenInAmount, tokenInAddress, routerRubyAddress, accountSigner).then(result => { //bugfix

    }).catch(err => {
        console.log("doApproval Error: ", err);
    })

    //Provider 
    const blockNumber = await rpcProvider.getBlockNumber();
    const blockData = await rpcProvider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 43600);


    //slippage 
    let slippThisMuch = tokenOut[1].div(slippage);// 1%
    const swapOutput = tokenOut[1].sub(slippThisMuch);


    // Swaping 
    const swapDetails = {
        ammSwaps: [{
            swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
            amountIn: tokenOut[0],
            amountOut: swapOutput,
            path: [USDPAddress, tokenOutAddress],
            to: routerRubyAddress,
            deadline: expiryDate
        }
        ],
        stableSwaps: [{
            stablePool: routerStableAddress,
            tokenIndexFrom: stableInIndex,
            tokenIndexTo: 0,        // USDP
            dx: tokenInAmount,
            minDy: usdcAmountOut,
            deadline: expiryDate
        }],
        order: [SwapType.STABLE_POOL, SwapType.AMM]
    };

    console.log("Swap Details: ", swapDetails);

    const omg = await rubyRouterContract.swap(swapDetails,
        //     {
        //         "gasPrice": try_string,
        //          "gasLimit": "280000",
        //          "nonce": nonce
        //      }
    ).then(result => {

        result.wait().then(res => {

        }).catch(err => {
            console.log("Swap Error", err)
        })
        // console.log("Swap Result: ", result.wait(1));
        // return result;
    }).catch(err => {
        console.log("Swap Error: ", err);
    })

}


// Export it to make it available outside
module.exports.swapStableToCoin = swapStableToCoin
module.exports.swapCoinToAnyStable = swapCoinToAnyStable;

module.exports.swapCoinToUSDP = swapCoinToUSDP;
module.exports.swapUSDPToCoin = swapUSDPToCoin;



