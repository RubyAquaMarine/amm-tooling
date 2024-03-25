// node test/OrderBook.js
const ethers = require('ethers');
const abi = require('../abi/erc20.json');
const abi_ob = require('../abi/orderbookDCA.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const BUY_DCA = true;
const SELL_DCA = true;
//0x30722427D4188fBD566b5Ca7F1B190C7C5c168eF
const ORDER_BOOK_STORAGE = '0x5571e81E959bC4A119CAd383507038d4D816b9a5';// 0xccb07CFf18326dBE6Fe6C465FBC3711F69316804 staginv3 btc


async function checkPrice(contract) {

    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);

    const price = await orderbook.PoolPrice().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    console.log("price", price.toString())

}

async function executeDCA(_contract, _buy, _sell) {

    const orderbook = new ethers.Contract(_contract, abi_ob, accountOrigin);

    const length = await orderbook.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    // SKALE BLOCK GAS LIMIT 99,999,999
    //                       160,000,000

    console.log("Execute Orders?", length.toString());

    if (_buy && length >= 1) {
        const tx = await orderbook.ExecuteOrders(
            true, { gasLimit: 159999999 }).then(result => {
                return result;
            }).catch(err => {
                console.log(err)
            });
        //  await tx.wait();

    }

    if (_sell && length >= 1) {
        const tx = await orderbook.ExecuteOrders(
            false, { gasLimit: 159999999 }).then(result => {
                return result;
            }).catch(err => {
                console.log(err)
            });
        // await tx.wait();

    }

    const filled = await orderbook.OrdersFilled().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    console.log("Filled Orders: ", filled.toString());

}

async function checkOrderList(contract) {

    let arryTest = [];
    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);

    const count = await orderbook.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const num = Number(count.toString())
    if (count > 1) {
        for (let i = 0; i < num; i++) {
            arryTest[i] = await orderbook.OrderList(i).then(result => {
                return result.toString();
            }).catch(err => {
                console.log(err)
                return 'Error';
            })
        }
    }

    return arryTest;

}

async function collectDataForRequest() {


    await checkPrice(ORDER_BOOK_STORAGE)


    // EXECUTE THE DCA ORDERS
    const tx = await executeDCA(ORDER_BOOK_STORAGE,
        BUY_DCA, // if BUYS
        SELL_DCA // if SELLS
    ).then(res => {
        return;
    }).catch(err => {
        console.log("executeDCA Error", err)
    })

    //  await tx.wait();


    // RETURN THE ORDER LIST

    const dataOrders = await checkOrderList(ORDER_BOOK_STORAGE).then(res => {
        return res;
    }).catch(err => {
        console.log("checkOrderList Error", err)
    })
    console.log("Orders: \n ", dataOrders)


}


async function run() {

    //  await approve(ORDER_BOOK_STORAGE)

    setInterval(collectDataForRequest, 62000 * 2)// 60 sec
    // setInterval(checkPrices,60000*10)// 10 mimute
}

run();
