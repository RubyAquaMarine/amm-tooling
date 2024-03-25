// node test/OrderBookDCAExecWIP
const ethers = require('ethers');

const abi_dcaFactory = require('../abi/dcaFactory2.json');

const abi_ob = require('../abi/orderbookDCA.json');

const abi_ruby = require('../abi/rubyERC20.json');

const abi = require('../abi/erc20.json');


const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey);
const accountOrigin = walletOrigin.connect(providerOrigin);

const BUY_DCA = true;
const SELL_DCA = false;

const DCA_FACTORY = '0xd38E77C2CDBafBBaA11ec53d6CCc75Bf7C242e6a';// PROD '0xd38E77C2CDBafBBaA11ec53d6CCc75Bf7C242e6a'
const RUBY = config.assets.europa.RUBY;
const BASE = config.assets.europa.USDP;
const XYZ = config.assets.europa.RUBY;
const XYZ_TOKEN_DECIAL = 18;// BTC ^^

const usd = ethers.utils.parseUnits("0.1", 18);
const xyz = ethers.utils.parseUnits("0.1", XYZ_TOKEN_DECIAL);


const DURATION_HOURS = 1;
const INTERVAL_SECONDS = 300;

console.log("DCA:", DCA_FACTORY)
console.log("WALLET:", accountOrigin.address)

async function approve(contract) {
    const amount = ethers.utils.parseUnits("100000000", 18);

    // Token Input
    const usdp = new ethers.Contract(BASE, abi, accountOrigin);


    let approval = await usdp.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })


    await approval.wait();
    console.log(" Data approval ", approval)

    // Token Input
    const xyz = new ethers.Contract(XYZ, abi, accountOrigin);


    approval = await xyz.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })


    await approval.wait();
    console.log(" Data approval ", approval)


    // Token Input
    const ruby = new ethers.Contract(RUBY, abi, accountOrigin);


    approval = await ruby.approve(contract, amount).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })


    await approval.wait();
    console.log(" Data approval ", approval)
}

// WIP 
// 
async function executeDCA2(_contract, _buy, _sell) {

    if (!_contract) {
        return;
    }

    const dcaFactoryContract = new ethers.Contract(_contract, abi_dcaFactory, accountOrigin);

    /*
     const executeAll = await dcaFactoryContract.ExecuteAllOrders({ gasLimit: 159999999 }).then(result => {
         return result;
     }).catch(err => {
         console.log(err)
     })
 
     await executeAll.wait(1);
 */


    // WIP
    //if this tx fails, out of gas, then run the code below
    // OPTION TWO when gasLimit Reached



    const length = await dcaFactoryContract.StorageID().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    if (length !== 0) {
        console.log("length does not equal zero", length.toString())
    } else {
        return;
    }

    for (let i = 1; i < length; i++) {

        let tx = await dcaFactoryContract.ExecuteOrders(i, BUY_DCA, { gasLimit: 159999999 }).then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })

        await tx.wait(1);

        console.log("Buy done", i)


        tx = await dcaFactoryContract.ExecuteOrders(i, SELL_DCA, { gasLimit: 159999999 }).then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })

        await tx.wait(1);

        console.log("Sell done", i)

    }


}

async function executeDCA3(_contract, _storageID) {

    if (!_contract) {
        return;
    }

    const dcaFactoryContract = new ethers.Contract(_contract, abi_dcaFactory, accountOrigin);

    /*
     const executeAll = await dcaFactoryContract.ExecuteAllOrders({ gasLimit: 159999999 }).then(result => {
         return result;
     }).catch(err => {
         console.log(err)
     })
 
     await executeAll.wait(1);
 */


    // WIP
    //if this tx fails, out of gas, then run the code below
    // OPTION TWO when gasLimit Reached



    const length = await dcaFactoryContract.StorageID().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    if (length !== 0) {
        console.log("length does not equal zero", length.toString())
    } else {
        return;
    }




    let tx = await dcaFactoryContract.ExecuteOrders(_storageID, BUY_DCA, { gasLimit: 159999999 }).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    await tx.wait(1);

    console.log("Buy done")


    tx = await dcaFactoryContract.ExecuteOrders(_storageID, SELL_DCA, { gasLimit: 159999999 }).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    await tx.wait(1);

    console.log("Sell done")

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

    for (let i = 1; i < numMax; i++) {

        const tx = await orderbook.DeleteOrder(i).then(result => {
            console.log("delete", i);
            return result;
        }).catch(err => {
            console.log(err)
        })

        await tx.wait(1)


    }

}


async function checkOrderList(contract) {

    let arryTest = [];
    const dcaFactoryContract = new ethers.Contract(contract, abi_dcaFactory, accountOrigin);

    const count = await dcaFactoryContract.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const num = Number(count.toString())
    if (count > 1) {
        for (let i = 0; i < num; i++) {
            arryTest[i] = await dcaFactoryContract.OrderList(i).then(result => {
                return result.toString();
            }).catch(err => {
                console.log(err)
                return 'Error';
            })
        }
    }

    return arryTest;

}

async function checkOrderListV2(contract) {

    let arryTest = [];
    const dcaStorageContract = new ethers.Contract(contract, abi_ob, accountOrigin);

    const count = await dcaStorageContract.OrdersLength().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    const num = Number(count.toString())
    if (num >= 1) {
        for (let i = 0; i < num; i++) {// aqua bug: value should start at 1?
            arryTest[i] = await dcaStorageContract.OrderList(i).then(result => {
                return result.toString();
            }).catch(err => {
                console.log(err)
                return 'Error';
            })
        }
    }

    console.log(` -- StorageLength: ${num} Data:`, arryTest)

    return arryTest;

}

async function executeStorage(contract) {

    let arryTest = [];
    const dcaStorageContract = new ethers.Contract(contract, abi_ob, accountOrigin);

    let tx = await dcaStorageContract.ExecuteOrders(false, { gasLimit: 159999999 }).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    await tx.wait(1);

    console.log(" buy done");

    tx = await dcaStorageContract.ExecuteOrders(true, { gasLimit: 159999999 }).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    await tx.wait(1);

    console.log(" sell done");

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


/*

version 2.0

*/

async function testAll(contract) {

    // Token Input
    const orderbook = new ethers.Contract(contract, abi_dcaFactory, accountOrigin);


    approval = await orderbook.Relayer().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Relayer ", approval)



    approval = await orderbook.Router().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" Router ", approval)


    approval = await orderbook.EntryFee().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" EntryFee ", approval.toString())



    approval = await orderbook.MAX_ORDERS().then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })
    console.log(" MAX_ORDERS ", approval.toString())


    approval = await orderbook.GetStorageAddressUsingToken(RUBY).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    console.log(" GetStorageAddressUsingToken ", approval.toString())


    // deploys
    /*
    const tx = await orderbook.GetStorageAddressUsingTokenV2(RUBY).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    await tx.wait()
    */

    const storageAddress = await orderbook.GetStorageAddressUsingToken(RUBY).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    console.log(" GetStorageAddressUsingToken ", approval.toString())

    approval = await orderbook.GetIndexUsingStorageAddress(storageAddress).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    console.log(" GetIndexUsingStorageAddress", approval.toString());




}

async function testAllWrite(contract) {

    // Token Input
    const orderbook = new ethers.Contract(contract, abi_dcaFactory, accountOrigin);

    approval = await orderbook.ExecuteOrderRange(1, { gasLimit: 159999999 }).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    if(approval){
        await approval.wait();
    }
   

    console.log(" tx ", approval?.returnData)
    console.log(" tx all", approval)

    /*
    approval = await orderbook.ExecuteOrders(1, true).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    await approval.wait();

    console.log(" tx ", approval);
    */


}

async function testSubmit(contract) {

    // Token Input
    const orderbook = new ethers.Contract(contract, abi_dcaFactory, accountOrigin);


    approval = await orderbook.ExecuteOrderRange(1).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    await approval.wait();

    console.log(" tx ", approval?.transactionHash)

    approval = await orderbook.ExecuteOrders(1, true).then(result => {
        return result;
    }).catch(err => {
        console.log(err)
    })

    await approval.wait();

    console.log(" tx ", approval);


}



async function collectDataForRequest() {

    //  await testAll(DCA_FACTORY);
    await testAllWrite(DCA_FACTORY);

}


async function run() {

    //   await approve(DCA_FACTORY);// to submit orders


    //  await collectDataForRequest();

    setInterval(collectDataForRequest, 62000 * 1)// 60 sec
    // setInterval(collectDataForRequest,60000*10)// 10 mimute
}

run();

