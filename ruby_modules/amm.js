const ethers = require('ethers');
const routerABI = require('../abi/amm_router.json');
const factoryABI = require('../abi/factory.json');
const pairABI = require('../abi/pair.json');
const erc20ABI = require('../abi/erc20.json');
const rrc20ABI = require('../abi/rubyERC20.json');
const swapABI = require('../abi/stableSwap.json');
const utils = require('./utils.js')

const CONSTANTS = require('../Constants.json')

const SS_ADDRESS = CONSTANTS.stableswap.address;

async function staticTokenBalance(tokenAddress, checkThisAddress, accountSigner) {
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, accountSigner);
    const dec = await tokenContract.decimals();
    let balance = await tokenContract.callStatic.balanceOf(checkThisAddress);
    let formatBalance = ethers.utils.formatUnits(balance, dec);
    return formatBalance;
}
//1 rpc call
async function getTokenPrice(LPTokenAddress, accountSigner) {

    //if lptokenaddress is 4pool return 1.0 
    if (typeof LPTokenAddress === 'string') {

        if (LPTokenAddress === SS_ADDRESS) {
            return 1.00000000;
        }
        // else
        const poolContract = new ethers.Contract(LPTokenAddress, pairABI, accountSigner);

        const pairReserves = await poolContract.getReserves().then(result => {
            return result;
        }).catch(err => {
            console.log("getTokenPrice Error: ", err);
        })

        if (typeof pairReserves === "undefined") {
            console.log("getTokenPrice : getReserves Error: ");
            return;
        }

        const getTokenData = await utils.getTokenData(LPTokenAddress).then(result => {
            return result;
        }).catch(err => {
            console.log("getTokenPrice Error: ", err)
        })

        if (typeof getTokenData === "undefined") {
            console.log("getTokenPrice : getTokenData Error: ");
            return;
        }

        const tokenA_decimal = Number(getTokenData.token0decimal);
        const tokenB_decimal = Number(getTokenData.token1decimal);

        const token0sym = getTokenData.token0symbol;
        const token1sym = getTokenData.token1symbol;

        let tokenA_Price = 0;

        // Token 0 is  USDP  BASE ASSET
        if (typeof token0sym === 'string' && token0sym === 'USDP') {
            let pairA = Number(ethers.utils.formatUnits(pairReserves[0], tokenA_decimal));
            let pairB = Number(ethers.utils.formatUnits(pairReserves[1], tokenB_decimal));
            tokenA_Price = pairA / pairB;
        }

        // Token 1 is  USDP  BASE ASSET
        if (typeof token1sym === 'string' && token1sym === 'USDP') {
            let pairA = Number(ethers.utils.formatUnits(pairReserves[0], tokenA_decimal));
            let pairB = Number(ethers.utils.formatUnits(pairReserves[1], tokenB_decimal));
            tokenA_Price = pairB / pairA;
        }

        //return Number
        return tokenA_Price;
    }

    //fail
    return 0;
}
//1 rpc call
async function getTokenPriceFromSymbol(tokenAddress, accountSigner) {
    // handle all stable coins
    for (let i = 0; i < 4; i++) {
        let stableAddress = await utils.getStableSwapTokenAddress(i).then(result => {
            return result;
        }).catch(err => {
            console.log("Error getTokenPriceFromSymbol: getStableSwapTokenAddress : ", err)
        })

        if (typeof stableAddress === 'string' && typeof tokenAddress === 'string') {
            if (tokenAddress === stableAddress) {
                return 1.00;
            }
        }
    }

    const pairAddress = await utils.getLPTokenAddress(tokenAddress).then(result => {
        return result;
    }).catch(err => {
        console.log("Error getTokenPriceFromSymbol : getLPTokenAddress ", err)
    })

    if (typeof pairAddress === "undefined") {
        return;
    }

    const getTokenData = await utils.getTokenData(pairAddress).then(result => {
        return result;
    }).catch(err => {
        console.log("Error getTokenPriceFromSymbol : getTokenData ", err)
    })

    if (typeof getTokenData === "undefined") {
        return;
    }

    const token0sym = getTokenData.token0symbol;
    const token1sym = getTokenData.token1symbol;

    const tokenA_decimal = Number(getTokenData.token0decimal);
    const tokenB_decimal = Number(getTokenData.token1decimal);


    const poolContract = new ethers.Contract(pairAddress, pairABI, accountSigner);

    const pairReserves = await poolContract.getReserves().then(result => {
        return result;
    }).catch(err => {
        console.log("getTokenPriceFromSymbol: getReserves():  Error: ", err)
    })

    if (typeof pairReserves === "undefined") {
        return;
    }

    let tokenA_Price = 0;
    if (typeof token0sym === 'string' && token0sym === 'USDP') {
        let pairA = Number(ethers.utils.formatUnits(pairReserves[0], tokenA_decimal));
        let pairB = Number(ethers.utils.formatUnits(pairReserves[1], tokenB_decimal));
        // create price
        tokenA_Price = pairA / pairB;

    }

    if (typeof token1sym === 'string' && token1sym === 'USDP') {

        let pairA = Number(ethers.utils.formatUnits(pairReserves[0], tokenA_decimal));
        let pairB = Number(ethers.utils.formatUnits(pairReserves[1], tokenB_decimal));
        // create price
        tokenA_Price = pairB / pairA;

    }
    //norm decimials and returns a string => Number
    tokenA_Price = Number(tokenA_Price.toFixed(8));
    //return Number
    return tokenA_Price;
}
//1 rpc call
async function getAMMPoolTVL(LPTokenAddress, accountSigner) {

    // get pair info from factory 
    const poolContract = new ethers.Contract(LPTokenAddress, pairABI, accountSigner);
    const pairReserves = await poolContract.getReserves().then(result => {
        return result;
    }).catch(err => {
        console.log("getAMMPoolTVL Error: ", err)
    })

    if (typeof pairReserves === "undefined") {
        return;
    }

    const poolData = await utils.getTokenData(LPTokenAddress).then(result => {
        return result;
    }).catch(err => {
        console.log("getAMMPoolTVL Error: ", err)
    })

    if (typeof poolData === "undefined") {
        return;
    }

    const tokenA_Address = poolData.token0address;
    const tokenB_Address = poolData.token1address;

    const tokenA_Decimal = Number(poolData.token0decimal);
    const tokenB_Decimal = Number(poolData.token1decimal)

    const tokenA_Symbol = poolData.token0symbol;
    const tokenB_Symbol = poolData.token1symbol;


    let poolIs;
    let tokenA_Price;
    let tokenB_Price;
    let pairA, pairB, factorTVL;


    // FIND USDP LOCATION
    if (tokenA_Symbol === "USDP") {
        tokenA_Price = 1;
        //normalize to string then convert to numbers for math
        pairA = Number(ethers.utils.formatUnits(pairReserves[0], tokenA_Decimal));
        pairB = Number(ethers.utils.formatUnits(pairReserves[1], tokenB_Decimal));
        tokenB_Price = pairA / pairB;
        factorTVL = pairA + pairB * tokenB_Price;

    } else if (tokenB_Symbol === "USDP") {
        // tokenB == USDP, tokenA = XYZ ... calc price.. aka rubyusdp pool
        tokenB_Price = 1;
        //normalize to string then convert to numbers for math
        pairA = Number(ethers.utils.formatUnits(pairReserves[0], tokenA_Decimal));
        pairB = Number(ethers.utils.formatUnits(pairReserves[1], tokenB_Decimal))
        tokenA_Price = pairB / pairA;
        factorTVL = pairB + pairA * tokenA_Price;
    } else {
        // todo
        // NON USDP pools (only testnet pools atm)
        // values will not be correct (poolPrice)
        tokenB_Price = 1;
        //normalize to string then convert to numbers for math
        pairA = Number(ethers.utils.formatUnits(pairReserves[0], tokenA_Decimal));
        pairB = Number(ethers.utils.formatUnits(pairReserves[1], tokenB_Decimal))
        tokenA_Price = pairB / pairA;
        factorTVL = pairB + pairA * tokenA_Price;
    }

    if (tokenA_Price == 1) {
        poolIs = tokenB_Price;
    } else {
        poolIs = tokenA_Price;
    }

    const tvlObject = {
        poolPrice: poolIs,
        address: LPTokenAddress,
        isSS: false,
        token0: {
            symbol: tokenA_Symbol,
            address: tokenA_Address,
            price: tokenA_Price

        },
        token1: {
            symbol: tokenB_Symbol,
            address: tokenB_Address,
            price: tokenB_Price

        },
        reserves0: pairA,
        reserves1: pairB,
        tvl: factorTVL
    }
    return tvlObject;

}
//4 rpc call
async function stableSwapTokenBalance(LpTokenAddress, swapAddress, accountSigner) {

    const contract = new ethers.Contract(swapAddress, swapABI, accountSigner);

    const poolPrice = await stableSwapVirtualPrice(swapAddress, accountSigner).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance poolPrice Error: ", err)
    })

    if (typeof poolPrice === "undefined") {
        console.log("stableSwapTokenBalance poolPrice Error: ")
        return;
    }


    let bal0 = await contract.getTokenBalance(0).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof bal0 === "undefined") {
        console.log("stableSwapTokenBalance Error: ")
        return;
    }

    let bal1 = await contract.getTokenBalance(1).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof bal1 === "undefined") {
        console.log("stableSwapTokenBalance Error: ")
        return;
    }
    let bal2 = await contract.getTokenBalance(2).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof bal2 === "undefined") {
        console.log("stableSwapTokenBalance Error: ")
        return;
    }

    let bal3 = await contract.getTokenBalance(3).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof bal3 === "undefined") {
        console.log("stableSwapTokenBalance Error: ")
        return;
    }

    const address0 = await utils.getStableSwapTokenAddress(0).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof address0 === "undefined") {
        console.log("stableSwapTokenBalance: address Error: ")
        return;
    }

    const address1 = await utils.getStableSwapTokenAddress(1).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof address1 === "undefined") {
        console.log("stableSwapTokenBalance: address Error: ")
        return;
    }

    const address2 = await utils.getStableSwapTokenAddress(2).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof address2 === "undefined") {
        console.log("stableSwapTokenBalance: address Error: ")
        return;
    }

    const address3 = await utils.getStableSwapTokenAddress(3).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof address3 === "undefined") {
        console.log("stableSwapTokenBalance: address Error: ")
        return;
    }

    const sym0 = await utils.getStableSwapTokenSymbol(0).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof sym0 === "undefined") {
        console.log("stableSwapTokenBalance: sym Error: ")
        return;
    }

    const sym1 = await utils.getStableSwapTokenSymbol(1).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof sym1 === "undefined") {
        console.log("stableSwapTokenBalance: sym Error: ")
        return;
    }

    const sym2 = await utils.getStableSwapTokenSymbol(2).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof sym2 === "undefined") {
        console.log("stableSwapTokenBalance: sym Error: ")
        return;
    }

    const sym3 = await utils.getStableSwapTokenSymbol(3).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapTokenBalance Error: ", err)
    })

    if (typeof sym3 === "undefined") {
        console.log("stableSwapTokenBalance: sym Error: ")
        return;
    }


    bal0 = format18(bal0)
    bal1 = format18(bal1)
    bal2 = format6(bal2)
    bal3 = format6(bal3)

    // string to numbers
    bal0 = parseFloat(bal0)
    bal1 = parseFloat(bal1)
    bal2 = parseFloat(bal2)
    bal3 = parseFloat(bal3)


    const tvlBalance = bal0 + bal1 + bal2 + bal3;

    const objectBlock =

    {
        address: LpTokenAddress,
        isSS: true,
        token0: { symbol: sym0, address: address0 },
        token1: { symbol: sym1, address: address1 },
        token2: { symbol: sym2, address: address2 },
        token3: { symbol: sym3, address: address3 },
        reserves0: bal0,
        reserves1: bal1,
        reserves2: bal2,
        reserves3: bal3,
        tvl: tvlBalance,
        poolPrice: poolPrice
    };

    return objectBlock;

}
// 1 rpc call
async function stableSwapVirtualPrice(swapAddress, accountSigner) {
    const contract = new ethers.Contract(swapAddress, swapABI, accountSigner);
    const price = await contract.getVirtualPrice().then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapVirtualPrice Error: ", err)
    })

    if (typeof price === "undefined") {
        return;
    }

    const pricev2 = ethers.utils.formatUnits(price, 18);
    return pricev2;
}
//4 rpc call
async function getAdminFeeBalances(swapAddress, accountSigner) {
    const contract = new ethers.Contract(swapAddress, swapABI, accountSigner);

    const getRewards = await contract.getAdminBalance(0).then(result => {
        return result;
    }).catch(err => {
        console.log("getAdminFeeBalances Error: ", err)
    })

    if (typeof getRewards === "undefined") {
        return;
    }

    const getRewards1 = await contract.getAdminBalance(1).then(result => {
        return result;
    }).catch(err => {
        console.log("getAdminFeeBalances Error: ", err)
    })

    if (typeof getRewards1 === "undefined") {
        return;
    }

    const getRewards2 = await contract.getAdminBalance(2).then(result => {
        return result;
    }).catch(err => {
        console.log("getAdminFeeBalances Error: ", err)
    })

    if (typeof getRewards2 === "undefined") {
        return;
    }

    const getRewards3 = await contract.getAdminBalance(3).then(result => {
        return result;
    }).catch(err => {
        console.log("getAdminFeeBalances Error: ", err)
    })

    if (typeof getRewards3 === "undefined") {
        return;
    }


    const a = ethers.utils.formatUnits(getRewards, 18);
    const aa = ethers.utils.formatUnits(getRewards1, 18);
    const aaa = ethers.utils.formatUnits(getRewards2, 6);
    const aaaa = ethers.utils.formatUnits(getRewards3, 6);

    // string to number
    const totalReward = parseFloat(a) + parseFloat(aa) + parseFloat(aaa) + parseFloat(aaaa);

    return totalReward;
}
// 2 rpc call
async function checkTokenBalance(tokenAddress, checkThisAddress, accountSigner) {
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, accountSigner);
    const dec = await tokenContract.decimals().then(result => {
        return result;
    }).catch(err => {
        console.log("checkTokenBalance Error: ", err)
    })

    if (typeof dec === "undefined") {
        return;
    }

    const balance = await tokenContract.balanceOf(checkThisAddress).then(result => {
        return result;
    }).catch(err => {
        console.log("checkTokenBalance Error: ", err)
    })

    if (typeof balance === "undefined") {
        return;
    }

    const formatBalance = ethers.utils.formatUnits(balance, dec);
    return formatBalance;
}
// 2 rpc call
async function checkTokenTotalSupply(tokenAddress, accountSigner) {
    const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, accountSigner);
    const dec = await tokenContract.decimals().then(result => {
        return result;
    }).catch(err => {
        console.log("checkTokenTotalSupply Error: ", err)
    })

    if (typeof dec === "undefined") {
        return;
    }

    const balance = await tokenContract.totalSupply().then(result => {
        return result;
    }).catch(err => {
        console.log("checkTokenTotalSupply Error: ", err)
    })

    if (typeof balance === "undefined") {
        return;
    }

    const formatBalance = ethers.utils.formatUnits(balance, dec);
    return formatBalance;
}

async function checkTokenBurnedAmount(tokenAddress, accountSigner) {
    const tokenContract = new ethers.Contract(tokenAddress, rrc20ABI, accountSigner);
    const balance = await tokenContract.burnedAmount().then(result => {
        return result;
    }).catch(err => {
        console.log("checkTokenBurnedAmount Error: ", err)
    })

    if (typeof balance === "undefined") {
        return;
    }

    const formatBalance = ethers.utils.formatUnits(balance, 18);// Known (RUBY TOKEN)
    return formatBalance;
}

//aqua todo 
async function removeAMMLPToken(tokenA, tokenB, routerAddress, accountSigner, provider) {
    console.log("remove ALL AMMLPToken started ");
    const routerContract = new ethers.Contract(routerAddress, routerABI, accountSigner);
    //get the pair address 
    const factoryAddress = await routerContract.factory().then(result => {
        return result;
    }).catch(err => {
        console.log("removeAMMLPToken Error: ", err)
    })

    if (typeof factoryAddress === "undefined") {
        return;
    }

    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, accountSigner);

    const pairAddress = await factoryContract.getPair(tokenA, tokenB).then(result => {
        return result;
    }).catch(err => {
        console.log("removeAMMLPToken Error: ", err)
    })

    if (typeof pairAddress === "undefined") {
        return;
    }

    // CREATE PAIR CONTACT
    const pairContract = new ethers.Contract(pairAddress, pairABI, accountSigner);

    const pairBalance = await pairContract.balanceOf(accountSigner.address).then(result => {
        return result;
    }).catch(err => {
        console.log("removeAMMLPToken Error: ", err)
    })

    if (typeof pairBalance === "undefined") {
        return;
    }

    console.log("Pair Address: ", pairAddress);
    console.log("Pair Balance: ", pairBalance.toString());

    // check the balance 
    const balance = parseFloat(pairBalance.toString());

    let checkApproval;
    if (typeof balance === 'number' && balance > 0) {
        checkApproval = await doApproval(pairBalance, pairAddress, routerAddress, accountSigner);
    }

    if (typeof checkApproval === "undefined") {
        console.log("Error : removeAMMLPToken : Balance zero: ");
        return;
    }

    const blockNumber = await provider.getBlockNumber().then(result => {
        return result;
    }).catch(err => {
        console.log("removeAMMLPToken Error: ", err)
    })

    if (typeof blockNumber === "undefined") {
        return;
    }

    const blockData = await provider.getBlock(blockNumber).then(result => {
        return result;
    }).catch(err => {
        console.log("removeAMMLPToken Error: ", err)
    })

    if (typeof blockData === "undefined") {
        return;
    }

    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);


    //wtf aqua
    let value = ethers.BigNumber.from(1);
    let amountAmin = value;
    let amountBmin = value;

    console.log("Remove LP Expires: " + expiryDate + " | TimeStamp: " + blockData.timestamp + " | Amount Out min: " + value.toString() + " | Amount In: " + pairBalance.toString());

    let ok = await routerContract.removeLiquidity(
        tokenA,
        tokenB,
        pairBalance,
        amountAmin,
        amountBmin,
        accountSigner.address,
        expiryDate
    ).then(result => {
        console.log("Processing Result: ", result);
        // result is another promise =. deal with it 
        let out = result.wait(1).then(ok => {
            console.log("Result 1: ", ok?.transactionHash);
        }).catch(err => {
            console.log("Result 1 Error: ", err);
            // transaction wait is another promise =. deal with it 
            err.transaction.wait(1).then(more_erro => {
                console.log("Result 2: ", more_erro);
            }).catch(more_err => {
                console.log("Result 2 Error: ", more_err)
            })
        });
        
    }).catch(err => {
        console.log("Processing Error: ", err);
    });
}

async function addAssetsToAMMPool(percentToAdd, tokenA, tokenB, routerAddress, accountSigner, provider) {
    console.log("addAssetsToAMMPool started");
    const routerContract = new ethers.Contract(routerAddress, routerABI, accountSigner);

    const tokenAA = new ethers.Contract(tokenA, erc20ABI, accountSigner);
    const tokenBB = new ethers.Contract(tokenB, erc20ABI, accountSigner);

    const symAA = await tokenAA.symbol().then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof symAA === "undefined") {
        return;
    }

    const symBB = await tokenBB.symbol().then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof symBB === "undefined") {
        return;
    }


    const decimalBB = await tokenBB.decimals().then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof decimalBB === "undefined") {
        return;
    }

    const decimalAA = await tokenAA.decimals().then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof decimalAA === "undefined") {
        return;
    }

    // Deposit 100% 
    let balanceOfTokenA = await tokenAA.balanceOf(accountSigner.address).then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof balanceOfTokenA === "undefined") {
        return;
    }

    //-----------------------
    balanceOfTokenA = balanceOfTokenA.div(percentToAdd);
    //-----------------------
    let balanceOfTokenB = await tokenBB.balanceOf(accountSigner.address).then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof balanceOfTokenB === "undefined") {
        return;
    }


    //get the pair address 
    const factoryAddress = await routerContract.factory().then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof factoryAddress === "undefined") {
        return;
    }


    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, accountSigner);

    const pairAddress = await factoryContract.getPair(tokenA, tokenB).then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof pairAddress === "undefined") {
        return;
    }

    const poolContract = new ethers.Contract(pairAddress, pairABI, accountSigner);

    let reserve = await poolContract.getReserves().then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof reserve === "undefined") {
        return;
    }

    const matchWithThisAmount = await routerContract.quote(balanceOfTokenA, reserve[0], reserve[1]).then(result => {
        return result;
    }).catch(err => {
        console.log("addAssetsToAMMPool Error: ", err)
    })

    if (typeof matchWithThisAmount === "undefined") {
        return;
    }

    const humanBalance = ethers.utils.formatUnits(balanceOfTokenA, decimalAA)
    const humanBalanceB = ethers.utils.formatUnits(balanceOfTokenB, decimalBB)
    const humanAmount = ethers.utils.formatUnits(matchWithThisAmount, decimalBB)

    console.log("BalanceOf  ", humanBalance + " " + symAA)
    console.log("Send with: ", humanAmount + " " + symBB)
    console.log("BalanceOf  ", humanBalanceB + " " + symBB)

    // Add Liquidity
    if (balanceOfTokenB.gte(matchWithThisAmount)) {
        console.log("Available Balance on " + symBB + " is enough to Add Liquidity")
        let amountAmin = balanceOfTokenA;
        let amountBmin = matchWithThisAmount;
        let amountAdesired = amountAmin;
        let amountBdesired = amountBmin;

        await doApproval(amountAdesired, tokenA, routerAddress, accountSigner)
        await doApproval(amountBdesired, tokenB, routerAddress, accountSigner)

        const blockNumber = await provider.getBlockNumber().then(result => {
            return result;
        }).catch(err => {
            console.log("addAssetsToAMMPool Error: ", err)
        })

        if (typeof blockNumber === "undefined") {
            return;
        }


        const blockData = await provider.getBlock(blockNumber).then(result => {
            return result;
        }).catch(err => {
            console.log("addAssetsToAMMPool Error: ", err)
        })

        if (typeof blockData === "undefined") {
            return;
        }

        const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);

        let ok = await routerContract.addLiquidity(
            tokenA,
            tokenB,
            amountAdesired,
            amountBdesired,
            amountAmin,
            amountBmin,
            accountSigner.address,
            expiryDate
        ).then(result => {
            // result is another promise =. deal with it 
            let out = result.wait().then(ok => {
                // console.log("Result: ", ok);
            }).catch(err => {
                console.log("Result Error: ", err);
            });
        }).catch(err => {
            console.log("Processing Error: ", err);
        });
    } else {
        console.log(" Not enough in Balance to make the Liquidity Add: Switch the Input Asset.Names ")
    }
}

async function stableSwapAddUSD(amounts, minToMint, swapAddress, usdp, dai, usdc, usdt, accountSigner, provider) {

    const contract = new ethers.Contract(swapAddress, swapABI, accountSigner);

    const blockNumber = await provider.getBlockNumber().then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapAddUSD Error: ", err)
    })

    if (typeof blockNumber === "undefined") {
        return;
    }

    const blockData = await provider.getBlock(blockNumber).then(result => {
        return result;
    }).catch(err => {
        console.log("stableSwapAddUSD Error: ", err)
    })

    if (typeof blockData === "undefined") {
        return;
    }

    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);


    // convert values back to bigInt

    amounts[0] = ethers.utils.parseUnits(amounts[0].toString(), 18)


    console.log("USDP", amounts[0])

    amounts[1] = ethers.utils.parseUnits(amounts[1].toString(), 18)

    console.log("DAI", amounts[1])

    amounts[2] = amounts[2].toFixed(6)
    amounts[2] = ethers.utils.parseUnits(amounts[2], 6)

    console.log("USDC", amounts[2])

    amounts[3] = amounts[3].toFixed(6)
    amounts[3] = ethers.utils.parseUnits(amounts[3], 6)

    console.log("DAI", amounts[3])

    await doApproval(amounts[0], usdp, swapAddress, accountSigner)
    await doApproval(amounts[1], dai, swapAddress, accountSigner)
    await doApproval(amounts[2], usdc, swapAddress, accountSigner)
    await doApproval(amounts[3], usdt, swapAddress, accountSigner)


    console.log(" READY TO ADD LIQUIDITY ")
    console.log(" --------------------- ")

    const res = await contract.addLiquidity(amounts, minToMint, expiryDate).then(result => {
        // result is another promise =. deal with it 
        let out = result.wait().then(ok => {
            // console.log("Result: ", ok);
        }).catch(err => {
            console.log("Result Error: ", err);
        });
    }).catch(err => {
        console.log("Processing Error: ", err);
    });

    console.log(res)

}

async function doApproval(amount, tokenAddress, destAddress, accountSigner) {
    const weiAmount = amount;
    const pairContract = new ethers.Contract(tokenAddress, erc20ABI, accountSigner);

    let allowanceAmount = await pairContract.allowance(accountSigner.address, destAddress).then(result => {
        return result;
    }).catch(err => {
        console.log("doApproval Error: ", err)
    })

    if (typeof allowanceAmount === "undefined") {
        return;
    }

    console.log("Router Contract Allowance: " + allowanceAmount.toString());

    if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
        console.log("Router Contract Needs Increased Allowance: ");
        const parse = await pairContract.approve(destAddress, weiAmount).then(result => {
            return result;
        }).catch(err => {
            console.log("doApproval Error: ", err)
        })

        if (typeof parse === "undefined") {
            return;
        }

        const receipt = await parse.wait(1);
        console.log("Router Contract Result: ", receipt?.transactionHash);
    }

    return 'ok';
}
//helpers
function format6(bigvalue) {
    let value = ethers.utils.formatUnits(bigvalue, 6)
    return value
}
function format18(bigvalue) {
    let value = ethers.utils.formatUnits(bigvalue, 18)
    return value
}
//utils
module.exports.checkTokenBurnedAmount = checkTokenBurnedAmount;
module.exports.checkTokenTotalSupply = checkTokenTotalSupply;
module.exports.checkTokenBalance = checkTokenBalance;
module.exports.getTokenPrice = getTokenPrice;
module.exports.getTokenPriceFromSymbol = getTokenPriceFromSymbol;
module.exports.getAMMPoolTVL = getAMMPoolTVL;
module.exports.staticTokenBalance = staticTokenBalance;
//amm
module.exports.removeAMMLPToken = removeAMMLPToken;
module.exports.addAssetsToAMMPool = addAssetsToAMMPool;
//stable swap
module.exports.stableSwapVirtualPrice = stableSwapVirtualPrice;
module.exports.stableSwapTokenBalance = stableSwapTokenBalance;
module.exports.stableSwapAddUSD = stableSwapAddUSD;
module.exports.getAdminFeeBalances = getAdminFeeBalances;



