const ethers = require('ethers');
const factoryABI = require('../abi/factory.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');

const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const account = walletOrigin.connect(providerOrigin);

const factoryAddress = config.ammv2.factory;
const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);

const ruby = "0xF97048222D434e7A1a83e57462a3B0aaB626313d";
const usdp = "0xdA5E2Ee40DE7b265C28B2028E6e1e568fa4Cf66e";

async function getPoolAddress(tokenA, tokenB) {
    // get the pool contract for ruby-usdp
    let value4 = await factoryContract.getPair(tokenA,tokenB);
    console.log("RUBYUSDP: ", value4.toString());
}

async function getAllPools() {
    // Get the number of Pools within the Factory contract
    let value = await factoryContract.allPairsLength();
    let valueS = Number(value.toString());
    console.log("Total Pools: ", value.toString());
    // Print out all the Pool Addresses
    for (let i = 0; i < valueS; i++) {
        let value3 = await factoryContract.allPairs(i);
        console.log("[" + i + "]" + " Pool Address: ", value3.toString());
    }

    let value2 = await factoryContract.feeTo();
    console.log("feeTo: ", value2.toString());
}

function run() {
    getAllPools();
  //  getPoolAddress(ruby,usdp);
}
run();

/*
 // if fee is on, mint liquidity equivalent to 1/6th of the growth in sqrt(k)
    function _mintFee(uint112 _reserve0, uint112 _reserve1) private returns (bool feeOn) {
        address feeTo = IUniswapV2Factory(factory).feeTo();
        feeOn = feeTo != address(0);
        uint _kLast = kLast; // gas savings
        if (feeOn) {
            if (_kLast != 0) {
                uint rootK = Math.sqrt(uint(_reserve0).mul(_reserve1));
                uint rootKLast = Math.sqrt(_kLast);
                if (rootK > rootKLast) {
                    uint numerator = totalSupply.mul(rootK.sub(rootKLast));
                    uint denominator = rootK.mul(5).add(rootKLast);
                    uint liquidity = numerator / denominator;
                    if (liquidity > 0) _mint(feeTo, liquidity);
                }
            }
        } else if (_kLast != 0) {
            kLast = 0;
        }
    }


    function _mintFee(uint112 _reserve0, uint112 _reserve1) private returns (bool feeOn) {
        address feeTo = IUniswapV2Factory(factory).feeTo();
        feeOn = feeTo != address(0);
        uint256 _kLast = kLast; // gas savings
        if (feeOn) {
            if (_kLast != 0) {
                uint256 rootK = Math.sqrt(uint256(_reserve0).mul(_reserve1));
                uint256 rootKLast = Math.sqrt(_kLast);
                if (rootK > rootKLast) {
                    uint256 numerator = totalSupply.mul(rootK.sub(rootKLast));
                    uint256 denominator = rootK.mul(5).add(rootKLast);
                    uint256 liquidity = numerator / denominator;
                    if (liquidity > 0) _mint(feeTo, liquidity);
                }
            }
        } else if (_kLast != 0) {
            kLast = 0;
        }
    }
*/
