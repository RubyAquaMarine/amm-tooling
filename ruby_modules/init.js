const ethers = require('ethers');
const factoryABI = require('../abi/factory.json');
const pairABI = require('../abi/pair.json');
const erc20ABI = require('../abi/erc20.json');
const swapABI = require('../abi/stableSwap.json');

// MUST BE CALLED FIRST. 
// output: object {}
// builds the Constants.json that is used within utils = require('./utils.js')
async function initAMM(subgraphURL, routerAddress, rubyRouterAddress, stakerAddress, lotteryAddress, masterChefAddress, factoryAddress, sswapAddress, sswapLpAddress, accountSigner) {

    // make root object first
    let dataObject = {
        project: {},
        data: [],
        stableswap: {}
    }

    // more data 
    const rpcURL = accountSigner?.provider.connection.url;

    const inputData = {
        subgraph: subgraphURL,
        rpc: rpcURL,
        masterchef: masterChefAddress,
        factory: factoryAddress,
        fourPool: sswapAddress,
        lottery: lotteryAddress,
        stake: stakerAddress,
        router: routerAddress,
        rubyRouter: rubyRouterAddress
    }
  
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, accountSigner);

    let length = await factoryContract.allPairsLength().then(result => {
        return result;
    }).catch(err => {
        console.log("Error in allPairsLength: ", err)
    })

    if (typeof length === 'undefined') {
        console.log("Error in allPairsLength: ", err);
        return;
    }

    length = Number(length);//Big to num

    if (typeof length === 'number') {

        // save lp token address
        let objectOut = [];
        for (let i = 0; length > i; i++) {
            let lp = await factoryContract.allPairs(i)
            objectOut[i] = lp;
        }

        //amm
        for (let i = 0; length > i; i++) {
            const lpTokenContract = new ethers.Contract(objectOut[i], pairABI, accountSigner);

            const token_a_address = await lpTokenContract.token0();
            const token_b_address = await lpTokenContract.token1();

            const tokenContractA = new ethers.Contract(token_a_address, erc20ABI, accountSigner);
            const symA = await tokenContractA.symbol();
            const decA = await tokenContractA.decimals();
            const totalA = await tokenContractA.totalSupply();

            const tokenContractB = new ethers.Contract(token_b_address, erc20ABI, accountSigner);
            const symB = await tokenContractB.symbol();
            const decB = await tokenContractB.decimals();
            const totalB = await tokenContractB.totalSupply();


            const aSupply = ethers.utils.formatUnits(totalA, decA)
            const bSupply = ethers.utils.formatUnits(totalB, decB)

            dataObject.data[i] = {
                pool: i,
                poolAddress: objectOut[i],
                token0address: token_a_address,
                token0symbol: symA.toUpperCase(),
                token0decimal: decA.toString(),
                token0supply: aSupply,

                token1address: token_b_address,
                token1symbol: symB.toUpperCase(),
                token1decimal: decB.toString(),
                token1supply: bSupply,
            }

        }

    } else {
        console.log("ERROR in Constants.json: Please run script again:")
    }



    //stableswap data
    const contract = new ethers.Contract(sswapAddress, swapABI, accountSigner);

    let address0 = await contract.getToken(0);
    let address1 = await contract.getToken(1);
    let address2 = await contract.getToken(2);
    let address3 = await contract.getToken(3);

    const contractToken0 = new ethers.Contract(address0, erc20ABI, accountSigner);
    const contractToken1 = new ethers.Contract(address1, erc20ABI, accountSigner);
    const contractToken2 = new ethers.Contract(address2, erc20ABI, accountSigner);
    const contractToken3 = new ethers.Contract(address3, erc20ABI, accountSigner);

    let sym0 = await contractToken0.symbol();
    let sym1 = await contractToken1.symbol();
    let sym2 = await contractToken2.symbol();
    let sym3 = await contractToken3.symbol();

    let bal0 = await contract.getTokenBalance(0)
    let bal1 = await contract.getTokenBalance(1)
    let bal2 = await contract.getTokenBalance(2)
    let bal3 = await contract.getTokenBalance(3)

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

    const ssBlock =

    {
        address: sswapLpAddress,
        isSS: true,
        token0: { name: sym0, address: address0 },
        token1: { name: sym1, address: address1 },
        token2: { name: sym2, address: address2 },
        token3: { name: sym3, address: address3 },
        reserves0: bal0,
        reserves1: bal1,
        reserves2: bal2,
        reserves3: bal3,
        tvl: tvlBalance
    };

    dataObject.stableswap = ssBlock;

    dataObject.project = inputData;


    // let testThis = JSON.stringify(dataObject)
    // return testThis;
    return dataObject;
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

module.exports.initAMM = initAMM;




