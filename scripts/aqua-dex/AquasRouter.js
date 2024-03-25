const ethers = require("ethers");
const erc20ABI = require("../../abi/erc20.json");
const routerABI = require("../../abi/amm_router.json");
const nftABI = require("../../abi/rubyNFTAdmin.json"); // NFT
const rubyRouterABI = require("../../abi/ruby_router.json"); // Ruby Trade Router aka ITR
const stableSwapABI = require("../../abi/stableSwap.json");
const config = require("../../setConfig.json");
const credentials = require("../../keys.json");

//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const wallet = new ethers.Wallet(credentials.account.privateKeyTokenDeployer);
//--------------------------------------ADJUST-----------------------------------||

const account = wallet.connect(provider);
const rubyRouterAddress = config["aqua-dex"].aquasRouter;
const rubyRouterContract = new ethers.Contract(rubyRouterAddress, rubyRouterABI, account);
const stableSwapAddress = config.amm.fourPool;

//--------------------------------------ADJUST-----------------------------------||
const TOKEN_INPUT_AMOUNT = "0.0001";
// find AssetAddress and adjust the symbols as needed 
//--------------------------------------ADJUST-----------------------------------||

const StableIndex = {
  USDP: 0,
  DAI: 1,
  USDC: 2,
  USDT: 3,
};

const StableAddress = {
  USDP: config.assets.europa.USDP,
  DAI: config.assets.europa.DAI,
  USDC: config.assets.europa.USDC,
  USDT: config.assets.europa.USDT,
};

const AssetAddress = {
  RUBY: config.assets.europa.RUBY,
  ETH: config.assets.europa.ETH,
};

const SwapType = {
  AMM: 0,
  STABLE_POOL: 1,
};

const AMMSwapType = {
  EXACT_TOKENS_FOR_TOKENS: 0,
  TOKENS_FOR_EXACT_TOKENS: 1,
};

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
      const increase = weiAmount.mul(10); // approve for 10 swaps
      const parse = await fromContract.approve(routerAddress, increase);
      const receipt = await parse.wait();
      console.log("Router Contract Receipt: ", receipt);
    }
    return "Ready to Swap";
  } else {
    console.log("Swap Amount is more than userBalance: ");
    return "Not Enough Balance to Make Swap";
  }
}
// Convert 0.1 RUBY to USDP then to USDC
async function convertRubyToUSDC() {
  const ammRouterAddress = await rubyRouterContract.ammRouter();

  console.log("AMM Pool: ", ammRouterAddress);

  const ownerIs = await rubyRouterContract.owner();

  console.log("Router owner address: ", ownerIs);

  let stableActivated = await rubyRouterContract.enabledStablePools(stableSwapAddress);

  console.log("stablePool Activated: ", stableActivated);

  if (account.address == ownerIs && !stableActivated) {
    stableActivated = await rubyRouterContract.enableStablePool(stableSwapAddress);
    if (stableActivated == false) {
      console.log("ADMIN needs to activate stable swap");
      return;
    }
  }

  if (stableActivated == false) {
    console.log("ADMIN needs to activate stable swap");
    return;
  }

  let rubyAmount = ethers.utils.parseUnits(TOKEN_INPUT_AMOUNT, "ether"); // works

  console.log("Swap amount", rubyAmount.toString());

  // uniswap router working

  const routerContract = new ethers.Contract(ammRouterAddress, routerABI, account);
  let nftAdmin = await routerContract.nftAdmin();
  const nftContract = new ethers.Contract(nftAdmin, nftABI, account);
  let fee = await nftContract.calculateAmmSwapFeeDeduction(account.address);
  console.log("DEBUG swapFee ", fee.toString());

  const tokenOut = await routerContract
    .getAmountsOut(rubyAmount, [AssetAddress.RUBY, StableAddress.USDP], fee)
    .then((result) => {
      // NFT v1
      console.log("getAmountsOut Result: ", result);
      return result;
    })
    .catch((err) => {
      console.log("getAmountsOut Error: ", err);
    });

  console.log("Token In : ", tokenOut[0].toString());
  console.log("Token Out: ", tokenOut[1].toString());

  const stableSwapContract = new ethers.Contract(stableSwapAddress, stableSwapABI, account);

  let isPrice = await stableSwapContract
    .getVirtualPrice()
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.log("VirtualPrice Error: ", err);
    });

  console.log("is PRICE OF stable swap ", isPrice);

  let t0 = await stableSwapContract
    .getToken(0)
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.log("getToken Error: ", err);
    });

  let t1 = await stableSwapContract.getToken(1);
  let t2 = await stableSwapContract.getToken(2);
  let t3 = await stableSwapContract.getToken(3);

  console.log("Token Address at index 0 ", t0);
  console.log("Token Address at index 1 ", t1);
  console.log("Token Address at index 2", t2);
  console.log("Token Address at index 3", t3);

  // Pass in the AMM.getAmountsOut aka TokenOut[1]
  const usdcAmountOut = await stableSwapContract.calculateSwap(StableIndex.USDP, StableIndex.USDC, tokenOut[1]);

  console.log("USDC OUT: ", usdcAmountOut.toString());

  // approval working

  await doApproval(rubyAmount, AssetAddress.RUBY, rubyRouterAddress)
    .then((result) => {
      console.log("doApproval Result: ", result);
    })
    .catch((err) => {
      console.log("doApproval Error: ", err);
    });

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
    ammSwaps: [
      {
        swapType: AMMSwapType.EXACT_TOKENS_FOR_TOKENS,
        amountIn: rubyAmount,
        amountOut: tokenOut[1],
        path: [AssetAddress.RUBY, StableAddress.USDP],
        to: rubyRouterAddress,
        deadline: expiryDate,
      },
    ],
    stableSwaps: [
      {
        stablePool: stableSwapAddress,
        tokenIndexFrom: StableIndex.USDP,
        tokenIndexTo: StableIndex.USDC,
        dx: tokenOut[1],
        minDy: usdcAmountOut,
        deadline: expiryDate,
      },
    ],
    order: [SwapType.AMM, SwapType.STABLE_POOL],
  };

  console.log("Swap Details: ", swapDetails);

  const omg = await rubyRouterContract
    .swap(
      swapDetails
      //     {
      //         "gasPrice": try_string,
      //          "gasLimit": "280000",
      //          "nonce": nonce
      //      }
    )
    .then((result) => {
      console.log("Swap....: ", result);
      result.wait(1).then((res) => {
        console.log("Swap Result: ", res);
      });
      // console.log("Swap Result: ", result.wait(1));
      // return result;
    })
    .catch((err) => {
      console.log("Swap Error: ", err);
    });
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

async function run() {
  await convertRubyToUSDC();
}

run();
