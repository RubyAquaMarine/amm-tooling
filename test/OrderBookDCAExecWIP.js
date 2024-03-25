// node test/OrderBookDCAExecWIP
const ethers = require('ethers');

const abi_dcaFactory = require('../abi/dcaFactory.json');

const abi_ob = require('../abi/orderbookDCA.json');

const abi_ruby = require('../abi/rubyERC20.json');


const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyTokenDeployer);
const accountOrigin = walletOrigin.connect(providerOrigin);

const BUY_DCA = true;
const SELL_DCA = false;

const DCA_FACTORY = config.amm.dcaFactory;// PROD '0xd38E77C2CDBafBBaA11ec53d6CCc75Bf7C242e6a'
const RUBY = config.assets.europa.RUBY;

console.log("DCA:", DCA_FACTORY)

console.log("WALLET:", accountOrigin.address)



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

async function collectDataForRequest() {


    // PROD 
    // ruby : 0x28DFD207a7FbDe7c841A153f46b6d2cFA3Abd617

    //  await executeBurn('');

    // storage
  //  await deleteAllOrders('')
   await checkOrderListV2('0x28DFD207a7FbDe7c841A153f46b6d2cFA3Abd617')

     await executeStorage('0x28DFD207a7FbDe7c841A153f46b6d2cFA3Abd617')

     /*
    const tx = await executeDCA3(DCA_FACTORY,
        1// STORAGE INDEX 
    ).then(res => {
        return;
    }).catch(err => {
        console.log("executeDCA Error", err)
    })
    */


}


async function run() {


  //  await collectDataForRequest();

      setInterval(collectDataForRequest, 62000 * 1)// 60 sec
    // setInterval(collectDataForRequest,60000*10)// 10 mimute
}

run();


/*
 order.trader = msg.sender;
            order.interval = _intervalSeconds;
            order.duration = _durationHours;

            order.tokenPriceMin = _tokenPriceMin;
            order.tokenPriceMax = _tokenPriceMax;

            order.tokenAmount = _tokenAmount;
            order.tokenAmountDust = _tokenAmount;

            order.buyOrder = _buyOrder;
            order.orderTicketNumber = OrdersCount;

            order.lastSwapTime = 0;

            order.lastSwapCount = 1; // First swap is indexed as 1
            order.totalSwapSum = swaps;

data [
  '0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8,

  30000000000000000000,// interval > duration
  24000000000000000000,

  11111000000000000,
  101111000000000000,

  4800000000000000,
  4800000000000000,

  false,5,

  1,// lastSwapTime became "1"? how,
  0,// no swaps have taken place

  2880',// total swaps
  '0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8,5000000000000000000,12000000000000000000,11111000000000000,101111000000000000,14400000000000000,14400000000000000,false,6,1,0,8640'
]

*/
