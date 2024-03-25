// node test/OrderBook.js
const ethers = require('ethers');
const abi = require('../abi/erc20.json');
const abi_ruby = require('../abi/rubyERC20.json');

const abi_ob = require('../abi/orderbookFactory.json');

const abi_dca = require('../abi/orderbookDCA.json');

const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);



const DCA_FACTORY = '0x4b7241173D6e0E1Ad765b96779BbcC121157Bc99';

// WHAT TOKEN TO SWAP
const XYZ = config.assets.europa.RUBY;
const XYZ_TOKEN_DECIAL = 18;// BTC ??


// DIRECTION 
const BUY_DCA = true;
const SELL_DCA = false;

// AMOUNT
const usd = ethers.utils.parseUnits("0.1", 18);
const xyz = ethers.utils.parseUnits("0.01", XYZ_TOKEN_DECIAL);

// DURATION
const DURATION_HOURS = 1;
const INTERVAL_SECONDS = 300;

// APPROVE : These Assets will be approved 
const RUBY = config.assets.europa.RUBY;
const BASE = config.assets.europa.USDP;

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
    //  console.log(" Data approval ", approval)

    await approval.wait();

    // Token Input
    const xyz = new ethers.Contract(XYZ, abi, accountOrigin);

    // approval of the WRAPPER SC address
    approval = await xyz.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    // console.log(" Data approval ", approval)

    await approval.wait();


    // Token Input
    const ruby = new ethers.Contract(RUBY, abi, accountOrigin);

    // approval of the WRAPPER SC address
    approval = await ruby.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    //  console.log(" Data approval ", approval)

    await approval.wait();
}



/*
If you know the correct DCA Order Storage ID within the factory, 
you can Execure an order with this function
*/

async function CheckOrderLength(contract, StorageINDEX) {
    const dcaFactory = new ethers.Contract(contract, abi_ob, accountOrigin);
    //  const test1 = await dcaFactory.Relayer()
    //  const test2 = await dcaFactory.StorageID()// index length
    const test3 = await dcaFactory.getAddress(StorageINDEX)// address
    console.log(test3);


    await approve(test3);

    await DCA(test3, true, true, StorageINDEX)

    const test4 = await dcaFactory.CheckTokenXYZ(StorageINDEX)

    // await test4.wait(1);
    console.log("Token ", test4);

    const test5 = await dcaFactory.CheckOrderLength(StorageINDEX, XYZ, { gasLimit: 159999999 })
    await test5.wait(1);

}

// WIP: 
//assumes the storageID is the correct tokenXYZ 
// and thinks the last storageID is the correct tokenXYZ
async function CheckOrderLength2(contract) {
    const dcaFactory = new ethers.Contract(contract, abi_ob, accountOrigin);
    //  const test1 = await dcaFactory.Relayer()
    const test2 = await dcaFactory.StorageID()// index length
    const StorageINDEX = test2.toString();


    const test3 = await dcaFactory.getAddress(StorageINDEX)// address
    console.log("Storage ", test3);
    await approve(test3);
    await DCA(test3, true, true, StorageINDEX)


    const buy = await dcaFactory.ExecuteOrders(StorageINDEX, true, { gasLimit: 159999999 }).then(res => {
        return res;
    }).catch(err => {
        console.log(err)
    })
    await buy.wait(1);

    const sell = await dcaFactory.ExecuteOrders(StorageINDEX, false, { gasLimit: 159999999 }).then(res => {
        return res;
    }).catch(err => {
        console.log(err)
    })
    await sell.wait(1);


    const test4 = await dcaFactory.CheckTokenXYZ(StorageINDEX)
    console.log("TokenXYZ ", test4);

    const test5 = await dcaFactory.CheckOrderLength(StorageINDEX, XYZ, { gasLimit: 159999999 })
    await test5.wait(1);

}

// user passing in the token address aka XYZ token , 
// SC finds the correct storageID 
async function CheckOrderLength3(contract, tokenXYZ) {
    const dcaFactory = new ethers.Contract(contract, abi_ob, accountOrigin);

    const test2 = await dcaFactory.StorageID()// index length
    const max = await dcaFactory.MAX_ORDERS()// 

    console.log(" Length of Storage: ", test2.toString(), " Max Orders: ", max.toString())

    let findStorageID = 0;

    // loop over storage ids
    for (let i = 1; i <= test2; i++) {// fix bug <= 

        // match tokenXYZ
        const tokenAddress = await dcaFactory.CheckTokenXYZ(i)

        // check the ordersLength on that SC 
        // to ensure there is enough room for another order
        if (tokenAddress === tokenXYZ) {
            console.log("Matched TokenXYZ", tokenAddress, " at storageID", i);
            const length = await dcaFactory.GetOrderLength(i);
            if (Number(length.toString()) < Number(max.toString())) {
                findStorageID = i;
            }
        }
    }

    if (findStorageID != 0) {

        const test3 = await dcaFactory.getAddress(findStorageID)// address
        console.log("Correct StorageID:", test3);


        await approve(test3);

        await DCA(test3, true, true, findStorageID)

        // ADMIN FUNCTION TO DEPLOY A NEW SC IF NEEDED
        const test5 = await dcaFactory.CheckOrderLength(findStorageID, tokenXYZ, { gasLimit: 159999999 })
        await test5.wait(1);


    }


}

// user passing in the token address aka XYZ token , 
// SC finds the correct storageID 
// Prepare is if this is the Frontend 
// how many data calls, 
// will multicall help?
async function CheckOrderLength4(contract, tokenXYZ) {


    // DCA Factory contract address is required 
    const dcaFactory = new ethers.Contract(contract, abi_ob, accountOrigin);




    const test2 = await dcaFactory.StorageID()// index length
    const max = await dcaFactory.MAX_ORDERS()// 

    console.log(" Length of Storage: ", test2.toString(), " Max Orders: ", max.toString())

    let findStorageID = 0;

    // loop over storage ids
    for (let i = 1; i <= test2; i++) {// fix bug <= 

        // match tokenXYZ
        const tokenAddress = await dcaFactory.CheckTokenXYZ(i)

        // check the ordersLength on that SC 
        // to ensure there is enough room for another order
        if (tokenAddress === tokenXYZ) {
            console.log("Matched TokenXYZ", tokenAddress, " at storageID", i);
            const length = await dcaFactory.GetOrderLength(i);
            if (Number(length.toString()) < Number(max.toString())) {
                findStorageID = i;
            }
        }
    }

    console.log(" findStorageID ", findStorageID);

    if (findStorageID != 0) {

        const test3 = await dcaFactory.getAddress(findStorageID)// address
        console.log("Correct StorageID:", test3);


        await approve(test3);

        await DCA(test3, BUY_DCA, SELL_DCA, findStorageID)

        // ADMIN FUNCTION TO DEPLOY A NEW SC IF NEEDED
        // const test5 = await dcaFactory.CheckOrderLength(findStorageID, tokenXYZ, { gasLimit: 159999999 })
        //  await test5.wait(1);


    }


}




// Place DCA Orders
// returns order count
async function DCA(contract, isLong, isShort, StorageINDEX) {

    const orderbook = new ethers.Contract(contract, abi_dca, accountOrigin);

    const max = ethers.utils.parseUnits("10000000", 18);

    console.log("Place DCA Orders");

    /*
    uint256 _dcaStorageID,
        uint256 _index,
        uint256 _intervalSeconds,
        uint256 _durationHours,
        uint256 _tokenPriceMin,
        uint256 _tokenPriceMax,
        uint256 _tokenAmount,
        bool _buyOrder
    ) public {

    */

    // sell
    if (isShort) {
        await orderbook.SubmitDCAOrder(

            INTERVAL_SECONDS,// Seconds
            DURATION_HOURS,// hour
            1,
            max,
            xyz,
            false, { gasLimit: 159999999 }
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
            true, { gasLimit: 159999999 }).then(result => {
                return result;
            }).catch(err => {
                console.log(err)
            })
    }

    let approval = await orderbook.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" OrdersLength: ", approval.toString())

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

    //  await CheckOrderLength2(ORDER_BOOK_STORAGE, STORAGE)
    //  await CheckOrderLength2(ORDER_BOOK_STORAGE)

    await CheckOrderLength4(DCA_FACTORY, XYZ)

}


async function run() {

    await collectDataForRequest();


    //  setInterval(collectDataForRequest, 120000 * 1)// 120 sec
    //  setInterval(collectDataForRequest, 12000 * 8)// 10 mimute
}





run();
