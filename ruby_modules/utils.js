const CONSTANTS = require('../Constants.json')

// pass in strings
// get historical price
async function getSwapPrice(amountIn, amountOut, symbolIn, symbolOut) {

    //input Stables 
    //output BTC,SKL,RUBY,ETH,etc
    if (symbolIn == 'DAI' || symbolIn == 'USDC' || symbolIn == 'USDT' || symbolIn == 'USDP') {
        // not stable
        if (symbolOut != 'DAI' && symbolOut != 'USDC' && symbolOut != 'USDT' && symbolOut != 'USDP') {
            let poolPrice = parseFloat(amountIn) / parseFloat(amountOut);
            return poolPrice;
        } else {
            return 1.0;// stable in, stable out
        }
    }

    //input BTC,SKL,RUBY,ETH,etc with 
    //output stables
    if (symbolOut == 'DAI' || symbolOut == 'USDC' || symbolOut == 'USDT' || symbolOut == 'USDP') {
        // not stables output
        if (symbolIn != 'DAI' && symbolIn != 'USDC' && symbolIn != 'USDT' && symbolIn != 'USDP') {
            let poolPrice = parseFloat(amountOut) / parseFloat(amountIn);
            return poolPrice;
        } else {
            return 1.0;// stable in, stable out
        }
    }
    // if XYZ to XYZ ........
    //todo
    // returns the base exchange rate of one base token = target
    // eth / ruby = 0.00019 , means 1 ruby = 0.00019 
    let poolPrice = parseFloat(amountIn) / parseFloat(amountOut);
    return poolPrice;
}

async function getSwapPriceV2(amountIn, amountOut, symbolIn, symbolOut) {

    //input Stables 
    //output BTC,SKL,RUBY,ETH,etc
    if (symbolIn == 'USDP') {
        // not stable
            let poolPrice = parseFloat(amountIn) / parseFloat(amountOut);
            return poolPrice;
        
    }

    //input BTC,SKL,RUBY,ETH,etc with 
    //output stables
    if (symbolOut == 'USDP') {
        // not stables output
            let poolPrice = parseFloat(amountOut) / parseFloat(amountIn);
            return poolPrice;
    }
}

// ADD NEW TOKENS
async function getTokenLogos(tokenSymbol) {
    //https://ruby.exchange/images/tokens/usdp-square.png


    if (tokenSymbol == 'DAI') {
        return 'https://ruby.exchange/images/tokens/dai-square.png';
    }

    if (tokenSymbol == 'USDT') {
        return 'https://ruby.exchange/images/tokens/usdt-square.png';
    }

    if (tokenSymbol == 'USDC') {
        return 'https://ruby.exchange/images/tokens/usdc-square.png';
    }

    if (tokenSymbol == 'USDP') {
        return 'https://ruby.exchange/images/tokens/usdp-square.png';
    }

    if (tokenSymbol == 'RUBY') {
        return 'https://ruby.exchange/images/tokens/ruby-square.png';
    }

    if (tokenSymbol == 'ETHC') {
        return 'https://ruby.exchange/images/tokens/eth-square.png';
    }

    if (tokenSymbol == 'WBTC') {
        return 'https://ruby.exchange/images/tokens/btc-square.png';
    }

    if (tokenSymbol == 'SKL') {
        return 'https://ruby.exchange/images/tokens/skl-square.png';
    }

    if (tokenSymbol == undefined) {
        return 'https://ruby.exchange';
    }
    //default (future token listings)
    return 'https://ruby.exchange/images/tokens/' + tokenSymbol.toLowerCase() + '-square.png';
}

async function getAMMURL(tokenA, tokenB) {
    // stable swap
    if (tokenA == undefined && tokenB == undefined) {
        return 'https://ruby.exchange/stableSwap';
    }
    // https://app.uniswap.org/#/swap?inputCurrency=0x45804880de22913dafe09f4980848ece6ecbaf78&outputCurrency=0x8e870d67f660d95d5be530380d0ec0bd388289e1&chain=mainnet
    const baseURL = "https://ruby.exchange/swap";
    const link = "?inputCurrency=" + tokenA + "&outputCurrency=" + tokenB;
    return baseURL + link;
}

async function getLPTokenAddress(tokenAddress) {

    // todo 
        // needs to handle both amm and 4 pool token addresses 
        // as of now, when using USDP,returns the first pool with base USDP == ruby_USDP
        for (let i = 0; i < 4; i++) {
            let stableAddress = await getStableSwapTokenAddress(i);
            if (typeof stableAddress === 'string' && typeof tokenAddress === 'string') {
                if (tokenAddress === stableAddress) {
                    return CONSTANTS.stableswap.address;
                }
            }
        }

    let tryToFind = CONSTANTS.data.find(obj => obj.token0address === tokenAddress || obj.token1address === tokenAddress)
    return tryToFind?.poolAddress;
}

async function getLPTokenAddressWithSymbol(tokenSymbol, tokenBase) {
    //|| obj.token0symbol === tokenBase && obj.token1symbol == tokenSymbol 
    //obj.token1symbol === tokenBase && obj.token0symbol == tokenSymbol
    let tryToFind = CONSTANTS.data.find(obj => obj.token0symbol === tokenBase && obj.token1symbol == tokenSymbol || obj.token1symbol === tokenBase && obj.token0symbol == tokenSymbol  )
    return tryToFind?.poolAddress;
}
//input lp token address, 
//output symbols, decimals
async function getTokenData(lpTokenAddress) {
    let tryToFind = CONSTANTS.data.find(obj => obj.poolAddress.toLowerCase() === lpTokenAddress || obj.poolAddress === lpTokenAddress )
    return tryToFind;
}

async function getStableSwapTokenAddress(index) {
    if (index == 0) {
        return CONSTANTS.stableswap.token0.address;
    }
    if (index == 1) {
        return CONSTANTS.stableswap.token1.address;
    }
    if (index == 2) {
        return CONSTANTS.stableswap.token2.address;
    }
    if (index == 3) {
        return CONSTANTS.stableswap.token3.address;
    }
}

async function getStableSwapTokenSymbol(index) {
    if (index == 0) {
        return CONSTANTS.stableswap.token0.name;
    }
    if (index == 1) {
        return CONSTANTS.stableswap.token1.name;
    }
    if (index == 2) {
        return CONSTANTS.stableswap.token2.name;
    }
    if (index == 3) {
        return CONSTANTS.stableswap.token3.name;
    }
}

module.exports.getSwapPrice = getSwapPrice;
module.exports.getSwapPriceV2 = getSwapPriceV2;
module.exports.getLPTokenAddress = getLPTokenAddress;
module.exports.getLPTokenAddressWithSymbol = getLPTokenAddressWithSymbol;
module.exports.getTokenData = getTokenData;
module.exports.getStableSwapTokenAddress = getStableSwapTokenAddress;
module.exports.getStableSwapTokenSymbol = getStableSwapTokenSymbol;
module.exports.getAMMURL = getAMMURL;
module.exports.getTokenLogos = getTokenLogos;
