const ethers = require("ethers");
const erc20ABI = require("../../abi/erc20.json");
const routerABI = require("../../abi/amm_router.json"); // Uniswap AMM router
const nftABI = require("../../abi/rubyNFTAdmin.json"); // NFT
const config = require("../../setConfig.json");
const credentials = require("../../keys.json");
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa);
const wallet = new ethers.Wallet(credentials.account.privateKeyTokenDeployer);
const account = wallet.connect(provider);

const routerAddress = config["aqua-dex"].router;
const baseToken = config.assets.europa.AQUA; //

//--------------------------------------ADJUST-----------------------------------||
// When swapping ETH to BTC : smallest value of ETH '0.0000001'
// AMM[A -> USDP -> B] (v1 - multihop)
const fromToken = config.assets.europa.ETH;
const toToken = config.assets.europa.SKL;
const swapAmount = "0.0000001";
//--------------------------------------ADJUST-----------------------------------||

let PREVENT_LOOP = false;
const DEBUG = true;

async function doApproval(swapAmount, fromToken, routerAddress) {
  // wei amount already adjusted for the token decimals?
  const weiAmount = swapAmount;
  if (typeof fromToken === "string") {
    const fromContract = new ethers.Contract(fromToken, erc20ABI, account);

    const bal = await fromContract
      .balanceOf(account.address)
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log(err);
      });

    const dec = await fromContract
      .decimals()
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log(err);
      });

    if (typeof dec == "undefined" || typeof bal === "undefined") {
      //failed
      return;
    } else {
      const returnBalance = ethers.utils.formatUnits(bal, dec);
      console.log(" Token Balance: ", returnBalance);
    }

    const allowanceAmount = await fromContract
      .allowance(account.address, routerAddress)
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log(err);
      });

    if (DEBUG) {
      console.log(" Amount: ", weiAmount.toString());
      console.log(" Balance: ", bal.toString());
      console.log(" Router Contract Allowance: ", allowanceAmount.toString());
    }

    // make sure wallet has enough
    if (bal.gte(weiAmount)) {
      if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
        console.log("Router Contract Needs Increased Allowance: ");
        const increase = weiAmount.mul(10); // approve for 10 swaps
        const parse = await fromContract.approve(routerAddress, increase);
        const receipt = await parse.wait(1);
        console.log("Transfer to Router Contract Approval Receipt: ", receipt?.transactionHash);
        return "Approved";
      } else {
        return "Already approved";
      }
    } else {
      console.log("Swap Amount is more than userBalance: ");
      return "Not Enough Balance to Make Swap";
    }
  }
  return; // failed
}

// Swap tx gas : Gas Used by Transaction
// 223,990 | 80%
async function doStuff() {
  console.log("...");

  if (!PREVENT_LOOP) {
    PREVENT_LOOP = true; //
    console.log("Make swap: ", PREVENT_LOOP);
    const routerContract = new ethers.Contract(routerAddress, routerABI, account);
    const fromContract = new ethers.Contract(fromToken, erc20ABI, account);

    let factory = await routerContract.factory();
    let nftAdmin = await routerContract.nftAdmin();
    if (DEBUG) {
      console.log(" Debug AMM Router Contract: Factory Address: ", factory);
    }

    const nftContract = new ethers.Contract(nftAdmin, nftABI, account);
    const fee = await nftContract.calculateAmmSwapFeeDeduction(account.address);
    if (DEBUG) {
      console.log(" SwapFee ", fee.toString()); // 997
    }

    //Provider
    const blockNumber = await provider.getBlockNumber();
    const gas_try = await provider.getGasPrice();
    const blockData = await provider.getBlock(blockNumber);
    const expiryDate = ethers.BigNumber.from(blockData.timestamp + 23600);
    console.log(
      " BlockNumber: " + blockNumber + " GasPrice: " + gas_try.toString() + "\n Expires: " + expiryDate + " | Time: " + blockData.timestamp
    );

    const decimalDigit = await fromContract
      .decimals()
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log("Error: decimals ", err);
      });

    const weiAmount = ethers.utils.parseUnits(swapAmount, decimalDigit);

    await doApproval(weiAmount, fromToken, routerAddress)
      .then((ok) => {
        console.log(" Token Transfers Approved? ", ok);
      })
      .catch((err) => {
        console.log("Error: doApproval ", err);
      });

    if (
      typeof weiAmount === "undefined" ||
      typeof fromToken === "undefined" ||
      typeof baseToken === "undefined" ||
      typeof toToken === "undefined"
    ) {
      console.log("Error: token data ");
      return;
    }

    const price_try = await routerContract
      .getAmountsOut(weiAmount, [fromToken, baseToken, toToken], fee)
      .then((ok) => {
        return ok;
      })
      .catch((err) => {});

    if (typeof price_try === "undefined") {
      console.log("Error: getAmountsOut ");
      return;
    }

    // multi hop amm
    // array length for multi hop amm call
    let len_ = price_try.length - 1;

    // const amountOut = price_try[len_].sub(price_try[len_].div(10));// 10% slippage
    const amountOut = 1; // 10% slippage

    let try_string = gas_try.toString();

    if (DEBUG) {
      console.log("Amounts INN: ", weiAmount.toString());
      console.log("Amounts OUT: ", amountOut.toString());
      console.log("Amounts Real OUT: ", price_try[len_].toString());
    }

    //Signer
    const nonce = await account
      .getTransactionCount("latest")
      .then((ok) => {
        return ok;
      })
      .catch((err) => {
        console.log("Error: getAmountsOut ", err);
      });

    console.log(" TransactionCount: " + nonce);

    let swap_tx = await routerContract
      .swapExactTokensForTokens(
        weiAmount, // amountIn
        amountOut, // amountOuMin
        [fromToken, baseToken, toToken], // multi hop amm
        account.address,
        expiryDate,

        {
          gasPrice: try_string,
          gasLimit: "3000000",
          nonce: nonce,
        }
      )
      .then((result) => {
        // result is another promise =. deal with it
        let out = result
          .wait(1)
          .then((ok) => {
            console.log("Result: ", ok.transactionHash);
            return ok.transactionHash;
          })
          .catch((err) => {
            console.log("Result Error: ", err);
          });

        return out;
      })
      .catch((err) => {
        console.error("Processing Error: ", err.error);
        /*
            experienced these errors 
            - transaction nounce incorrect (code: -32004)
    
    
            */
      });

    // reset
    if (typeof swap_tx === "string") {
      PREVENT_LOOP = false;
    }
  }
}

async function run() {
  await doStuff();

  //  setInterval(doStuff, 10000)
}

run();

/*

 aqua is the base token, all swaps should be multi hops. From asset ETH to AQUA to Stable , etc. 

 this way LP earn 0.50% on every swap ( trader pays 0.60% in total and 0.1% goes to deployer and 0.50% goes to LP)

 stage 1 - normalize AQUA - USDP , AQUA - DAI pools . if ratio does not equal 100:1 , then arb. (sell aqua for amounts of stables)

*/

