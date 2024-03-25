// node test/OrderBook.js
const ethers = require('ethers');
const abi = require('../abi/erc20.json');
const abi_ob = require('../abi/orderbook.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey2);
const accountOrigin = walletOrigin.connect(providerOrigin);

const BASE = config.assets.staging_europa.USDP;
const XYZ = config.assets.staging_europa.RUBY;

const ORDER_BOOK_STORAGE = '0x8B6D7C6Ec01aB00b53f8d8fA83502fC232F17AfB';

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

    // Token Input
    const xyz = new ethers.Contract(XYZ, abi, accountOrigin);

    // approval of the WRAPPER SC address
    approval = await xyz.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Data approval ", approval)
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


    approval = await orderbook.PoolPrice().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" PoolPrice", approval, approval.toString())


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

async function checkPoolPrice(contract) {

    // Token Input
    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);

    let approval = await orderbook.SetPoolPrice().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })


    approval = await orderbook.PoolPrice().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const nePrice = ethers.utils.formatUnits(approval, 18);
    console.log(" PoolPrice", approval.toString(), nePrice)

}

async function checkOrderList(contract) {

    // Token Input
    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);

    const length = await orderbook.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const num = Number(length.toString())

    let arryTest = []
    for (let i = 0; i < num; i++) {
        arryTest[i] = await orderbook.OrderList(i).then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })
    }

    console.log(" OrderList", arryTest.toString(), "Length:", num)

}

// Place Limit Orders
async function straddle1(contract, priceEntry ) {

    // Token Input
    const orderbook = new ethers.Contract(contract, abi_ob, accountOrigin);


    const price = await orderbook.PoolPrice().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    // Distance to place the limit orders from the current pool price
    const straddle = ethers.utils.parseUnits(priceEntry, 18);// be careful here, beacuse we can have a negative value 
    const xyz = ethers.utils.parseUnits("1", 18);

    // compare to prevent bug
    if (price.sub(straddle) > 0) {
        console.log("Place Limit Orders");
        const sell = price.add(straddle);
        const buy = price.sub(straddle);

        await orderbook.SubmitOrder(
            0,
            sell,
            xyz,
            false).then(result => {
                return result;
            }).catch(err => {
                console.log(err)
            })


        await orderbook.SubmitOrder(
            0,
            buy,
            xyz,
            true).then(result => {
                return result;
            }).catch(err => {
                console.log(err)
            })

    }

    const count = await orderbook.OrdersCount().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Total OrdersCount Placed: ", count.toString())

}


async function run() {

    await checkPoolPrice(ORDER_BOOK_STORAGE)

    await checkOrderList(ORDER_BOOK_STORAGE)

  //  await approve(ORDER_BOOK_STORAGE)

    await straddle1(ORDER_BOOK_STORAGE, '0.125')

    await OrderBookStats(ORDER_BOOK_STORAGE)
}

run();