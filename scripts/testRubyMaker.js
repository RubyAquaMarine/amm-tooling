const ethers = require('ethers');
const makerABI = require('../abi/rubyMaker.json');
const factoryABI = require('../abi/factory.json');
const erc20ABI = require('../abi/erc20.json');
const token_abi = require('../abi/SkaleERC20.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const provider = new ethers.providers.JsonRpcProvider(config.rpc.schainHub);
const wallet = new ethers.Wallet(credentials.account.privateKey);
const account = wallet.connect(provider);

const rubyMakerAddress = config.ammv2.maker;
const factoryAddress = config.ammv2.factory

const USDP = config.assets.fancy.USDP;
const RUBY = config.assets.fancy.RUBY;
const ETH = config.assets.fancy.ETH;
const SKL = config.assets.fancy.SKL;


const setBurnerRole = async (tokenAddr, minterAddr) => {
    const token = new ethers.Contract(tokenAddr, token_abi, account);
    const MINTER_ROLE = ethers.utils.id("BURNER_ROLE");
    // ROlE and ADDRESS
    let res = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
    const receipt = await res.wait(1);
    console.log("recipe", receipt);

    res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
    console.log("has minter role", res);
};

const isBurnerRole = async (tokenAddr, minterAddr) => {
    const token = new ethers.Contract(tokenAddr, token_abi, account);
    const MINTER_ROLE = ethers.utils.id("BURNER_ROLE");
    res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
    console.log("has minter role", res);
};

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

async function setBurnPercentage(value) {
    const makerContract = new ethers.Contract(rubyMakerAddress, makerABI, account);
    let set = await makerContract.setBurnPercent(value).then(result => {
        // console.log(result);
    }).catch(err => {
        console.log(err);
    })
}

async function test() {
    const makerContract = new ethers.Contract(rubyMakerAddress, makerABI, account);

    let factoryRegistered = await makerContract.factory()

    if (factoryRegistered == factoryAddress) {
        console.log(" AMM Matches: Proceed")
    }

    // check burn percent, if burnPercent is zero, function convert doesn't work?
    let testBurnPercent = await makerContract.burnPercent()
    console.log(" Burn Percentage: ", testBurnPercent.toString())

    // run some checks before converting, ensure usdp address is correct
    let usdpAddress = await makerContract.usdToken()
    let rubyAddress = await makerContract.rubyToken()

    // do lp tokens exist? 
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
    const RUBYUSDP = await factoryContract.getPair(usdpAddress, rubyAddress)
    console.log(" LP Address", RUBYUSDP)

    // token
    const tokenContract = new ethers.Contract(RUBYUSDP, erc20ABI, account);
    let balance = await tokenContract.balanceOf(rubyMakerAddress)
    console.log(" Balance ", balance.toString())


    if (usdpAddress != USDP && rubyAddress != RUBY) {
        return;
    } else {
        console.log(" USDP and RUBY Addresses Matches: ")

        // let swap = await makerContract.convertMultiple([USDP, USDP], [RUBY, ETH]).then(result => {
        let swap = await makerContract.convert(RUBY, USDP).then(result => {
            // console.log(result);
            return result
        }).catch(err => {
            //  console.log(err);
        })

        swap.wait(1).then(result => {
            // console.log(result);
        }).catch(err => {
            // console.log(err);
        })


    }

    let balance2 = await tokenContract.balanceOf(rubyMakerAddress)
    console.log(" Balance ", balance2.toString())
    let withdrawNext = false
    if (balance.eq(balance2)) {
        console.log("RubyMaker LP Conversion Failed")
        withdrawNext = true
    } else {
        console.log("RubyMaker LP Conversion Passed")
    }

    /* Back up plan, withdraw the LP tokens
    if (withdrawNext) {
        //withdrawLP
        let swap = await makerContract.withdrawLP(RUBYUSDP).then(result => {
            // console.log(result);
            return result
        }).catch(err => {
            //  console.log(err);
        })

    }
    */

}
async function testPair(usdpAddress, xyzAddress) {
    const makerContract = new ethers.Contract(rubyMakerAddress, makerABI, account);

    let factoryRegistered = await makerContract.factory()

    if (factoryRegistered == factoryAddress) {
        console.log(" AMM Matches: Proceed")
    }

    // check burn percent, if burnPercent is zero, function convert doesn't work?
    let testBurnPercent = await makerContract.burnPercent()
    console.log(" Burn Percentage: ", testBurnPercent.toString())

    // do lp tokens exist? 
    const factoryContract = new ethers.Contract(factoryAddress, factoryABI, account);
    const XYZUSDP = await factoryContract.getPair(usdpAddress, xyzAddress)
    console.log(" LP Address", XYZUSDP)

    // token
    const tokenContract = new ethers.Contract(XYZUSDP, erc20ABI, account);
    let balance = await tokenContract.balanceOf(rubyMakerAddress)
    console.log(" Balance ", balance.toString())

    // approve token transfer? of factory i think in order to burn the lp token
    // await doApproval(balance, XYZUSDP, factoryRegistered) 
    const nonce = await account.getTransactionCount("latest");
    const gas_try = await provider.getGasPrice();
    let try_string = gas_try.toString();

    const tx_block = {
        "gasPrice": try_string,
        "gasLimit": "990000",
        "nonce": nonce
    }

    let swap = await makerContract.convert(xyzAddress, usdpAddress, tx_block).then(result => {
        // console.log(result);
        return result
    }).catch(err => {
        //  console.log(err);
    })

    swap.wait(1).then(result => {
        console.log(result);
    }).catch(err => {
        console.log(err);
    })


    let balance2 = await tokenContract.balanceOf(rubyMakerAddress)
    console.log(" Balance ", balance2.toString())
    let withdrawNext = false
    if (balance.eq(balance2)) {
        console.log("RubyMaker LP Conversion Failed")
        withdrawNext = true
    } else {
        console.log("RubyMaker LP Conversion Passed")
    }

    /* Back up plan, withdraw the LP tokens
    if (withdrawNext) {
        //withdrawLP
        let swap = await makerContract.withdrawLP(XYZUSDP).then(result => {
            // console.log(result);
            return result
        }).catch(err => {
            //  console.log(err);
        })

    }
    */

}
async function run() {
    // await test();


    // await setBurnPercentage(20);

  //  await setBurnerRole(RUBY, rubyMakerAddress);

  isBurnerRole(RUBY, account.address) 



    await testPair(USDP, RUBY)
    //  await testPair(USDP, ETH)
    //  await testPair(USDP, SKL)


        // must set the Burner Role back to the TokemManager otherwise the ima bridge to l1 will stop working
   // await setBurnerRole(RUBY, config.ammv2.tokenManager);
}
run();