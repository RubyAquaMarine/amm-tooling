// node test/OrderBook.js
const ethers = require('ethers');
const abi = require('../abi/erc20.json');
const abi_ruby = require('../abi/rubyERC20.json');
const abi_ob = require('../abi/orderbookDCA.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);

const RUBY = config.assets.staging_europa.RUBY;

const BASE = config.assets.staging_europa.USDP;
const XYZ = config.assets.staging_europa.BTC;
const XYZ_TOKEN_DECIAL = 8;// BTC ^^

const usd = ethers.utils.parseUnits("0.1", 18);
const xyz = ethers.utils.parseUnits("0.1", XYZ_TOKEN_DECIAL);

const BUY_DCA = true;
const SELL_DCA = true;

const DURATION_HOURS = 1;
const INTERVAL_SECONDS = 300;


const STRADDLE_IN_WEI = 100;
// version 1.0 - 0x30722427D4188fBD566b5Ca7F1B190C7C5c168eF
const ORDER_BOOK_STORAGE = '0x5571e81E959bC4A119CAd383507038d4D816b9a5';// 0xccb07CFf18326dBE6Fe6C465FBC3711F69316804 staginv3 btc

const amount = ethers.utils.parseUnits("100000000", 18);

async function approve(contract) {

    // Token Input
    const usdp = new ethers.Contract(BASE, abi, accountOrigin);

    // approval of the WRAPPER SC address
    let approval = await usdp.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Data approval ", approval)

    await approval.wait();

    // Token Input
    const xyz = new ethers.Contract(XYZ, abi, accountOrigin);

    // approval of the WRAPPER SC address
    approval = await xyz.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Data approval ", approval)

    await approval.wait();


    // Token Input
    const ruby = new ethers.Contract(RUBY, abi, accountOrigin);

    // approval of the WRAPPER SC address
    approval = await ruby.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Data approval ", approval)

    await approval.wait();
}


// Place DCA Orders
// returns order count
async function DCA(contract, isLong, isShort) {


    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);

    const max = ethers.utils.parseUnits("10000000", 18);

    console.log("Place DCA Orders");

    /*
    function SubmitDCAOrder(
    uint256 _index,
    uint256 _intervalSeconds,
    uint256 _durationHours,
    uint256 _tokenPriceMin,
    uint256 _tokenPriceMax,
    uint256 _tokenAmount,
    bool _buyOrder

    */

    // sell
    if (isShort) {
        await orderbook.SubmitDCAOrder(

            INTERVAL_SECONDS,// Seconds
            DURATION_HOURS,// hour
            1,
            max,
            xyz,
            false
        ).then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })
    }


    //buy
    if (isLong) {
        await orderbook.SubmitDCAOrder(

            INTERVAL_SECONDS,// Seconds
            DURATION_HOURS,// hour
            1,
            max,
            usd,
            true).then(result => {
                return result;
            }).catch(err => {
                console.log(err)
            })
    }


    console.log(" DCA Orders Added");

    const count = await orderbook.OrdersCount().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Total OrdersCount Placed: ", count.toString())

    return count;

}

async function OrderBookStats(contract) {

    // Token Input
    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);


    approval = await orderbook.UNISWAP_V2_ROUTER().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Router ", approval)



    approval = await orderbook.USDP().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" USDP ", approval)


    approval = await orderbook.TokenXYZ().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" TokenXYZ ", approval)



    approval = await orderbook.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" OrdersLength: ", approval, approval.toString())

    approval = await orderbook.OrdersFilled().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" OrdersFilled: ", approval, approval.toString())

    approval = await orderbook.OrdersCount().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" OrdersCount: ", approval, approval.toString())


}

// retunrs the orders List
async function checkOrderList(contract, orderTotal) {

    // Token Input
    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);
    const num = Number(orderTotal.toString())

    let arryTest = []
    for (let i = 0; i < num; i++) {
        arryTest[i] = await orderbook.OrderList(i).then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })

        // console.log(" OrderList [", i, "]", arryTest[i].toString(), "Length:", num)
    }

    return arryTest;


}


async function checkPrice(contract) {

    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);

    const price = await orderbook.PoolPrice().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const pr = ethers.utils.formatUnits(price, 18);

    console.log(" Price", price.toString(), " Price: ", pr)

}


// Delete all the Orders 
async function deleteAllOrders(contract) {

    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);

    const max = await orderbook.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    const numMax = Number(max.toString());

    for (let i = 0; i < numMax; i++) {

        await orderbook.DeleteOrder(i).then(result => {
            console.log("delete", i);
            return result;
        }).catch(err => {
            console.log(err)
        })


    }

}

async function executeDCA(_contract, _buy, _sell) {

    const orderbook = new ethers.Contract(_contract, abi_ob, accountOrigin);

    const length = await orderbook.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    console.log("Execute Orders?", length.toString());

    if (_buy && length >= 1) {
        const tx = await orderbook.ExecuteOrders(
            true).then(result => {
                return result;
            }).catch(err => {
                console.log(err)
            });
        //  await tx.wait();

    }

    if (_sell && length >= 1) {
        const tx = await orderbook.ExecuteOrders(
            false).then(result => {
                return result;
            }).catch(err => {
                console.log(err)
            });
        // await tx.wait();

    }

    console.log("Execute Orderd");

}

async function executeBurn(_contract) {

    const contract = new ethers.Contract(RUBY, abi_ruby, accountOrigin);
    const orderbook = new ethers.Contract(_contract, abi_ob, accountOrigin);

    const BURN_ROLE = ethers.utils.id("BURNER_ROLE");

    let res = await contract.hasRole(ethers.utils.arrayify(BURN_ROLE), _contract);

    if (res) {
        console.log("Register already has ?_ROLE", res);
        const ok = await orderbook.burn().then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })
    } else {
        res = await contract.grantRole(ethers.utils.arrayify(BURN_ROLE), _contract);
        const rec = await res.wait(1);
        console.log("receipt: ", rec);

    }

}


async function collectDataForRequest() {

    // PLACE ORDERS
    const ordersTotal = await DCA(ORDER_BOOK_STORAGE, BUY_DCA, SELL_DCA)
    await checkPrice(ORDER_BOOK_STORAGE)

    await executeBurn(ORDER_BOOK_STORAGE) 



    // EXECUTE THE DCA ORDERS
    /*
    const tx = await executeDCA(ORDER_BOOK_STORAGE,
        true, // if BUYS
        true // if SELLS
    ).then(res => {
        return;
    }).catch(err => {
        console.log("executeDCA Error", err)
    })

    //  await tx.wait();




    // RETURN THE ORDER LIST
    const dataOrders = await checkOrderList(ORDER_BOOK_STORAGE, ordersTotal).then(res => {
        return res;
    }).catch(err => {
        console.log("checkOrderList Error", err)
    })
    console.log("Orders: \n ", dataOrders)

    */


    // IDK
    /*
    const dataStats =  await OrderBookStats(ORDER_BOOK_STORAGE).then(res => {
        return;
    }).catch(err => {
        console.log("OrderBookStats Error", err)
    })
    console.log("Stats: \n ", dataStats)
    */

}

/*
async function run (){
  await  deleteAllOrders(ORDER_BOOK_STORAGE);
}
*/





async function run() {

    await approve(ORDER_BOOK_STORAGE)

    setInterval(collectDataForRequest, 120000 * 1)// 120 sec
    // setInterval(checkPrices,60000*10)// 10 mimute
}





run();
