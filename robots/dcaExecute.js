const ethers = require('ethers');
const abi = require('../abi/dcaFactory.json');
const config = require('../setConfig.json');
const credentials = require('../keys.json');
//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.schain_Europa); // SKALE CHAIN
const walletOrigin = new ethers.Wallet(credentials.account.privateKey2);
const accountOrigin = walletOrigin.connect(providerOrigin);
const DCA_FACTORY = config.amm.dcaFactory;
const MINIMUM_ORDER_COUNT = 250;


async function getDCAOrderCount() {
  const contract = new ethers.Contract(DCA_FACTORY, abi, accountOrigin);
  let storage_id;

  try {

    if (contract) {
      storage_id = await contract.StorageID();
      console.log('Total Storages in Factory ', storage_id.toString());
    }

    if (storage_id) {
      const promises = [];
      for (let i = 1; i <= storage_id; i++) {
        promises.push(contract.GetOrderLength(i));
      }

      const order_counts = await Promise.all(promises);// array of bigNumbers
      // normalize 
      const orders = [];
      for (let i = 0; i < order_counts.length; i++) {
        orders.push(Number(ethers.utils.formatUnits(order_counts[i], 0)));// big -> string -> number
      }
      return orders;
    }
  } catch (err) {
    console.log('Failed GetOrderLength');
    return "failed";
  }

}

async function executeSwapsOnDCAFactory(executeID) {
  const contract = new ethers.Contract(DCA_FACTORY, abi, accountOrigin);
  let approval;
  try {
    approval = await contract.ExecuteOrderRange(executeID, { gasLimit: 159999999 });
  } catch (err) {
    console.log('Failed ExecuteOrderRange');
    return "failed";
  }

  if (approval) {
    await approval.wait(1);
    return "ok";
  }
}

/*
todo : create logic that can keep track of what storaages were executed 
and what storages still need to be executed based on the gasLimit

-- logic only needs to be triggered if all the combined orders is 250 ++ ,

-- if one storage has 250 orders, then this needs to be executed using this storage ID 

*/
async function getTheIndexArray(arrayOrders) {
  // return an array with the index that needs to be executed 

  // such as [1,6,87,99,55] etc.  

  // Loop through the Length of the array with the executeSwapsOnDCAFactory(index)

  let breakIfCountReachesMax = 0;
  for (let i = 0; i < arrayOrders.length; i++) {
    breakIfCountReachesMax += arrayOrders[i];
  }
  console.log(" Total orders across all storage contracts: ", breakIfCountReachesMax)
  // how many interals  
  if (breakIfCountReachesMax < MINIMUM_ORDER_COUNT) {
    return [1];
  }


}

async function collectDataForRequest() {
  const startAtStorageID = await getDCAOrderCount();// array : number of orders within all storages 
  let arrayExecution;

  // Data should be an array
  if (typeof startAtStorageID !== 'string') {
    arrayExecution = await getTheIndexArray(startAtStorageID);
  }

  if (arrayExecution) {
    for (let i = 0; i < arrayExecution.length; i++) {
      const out = await executeSwapsOnDCAFactory(arrayExecution[i]);
      console.log(`Execution at StorageID: ${arrayExecution[i]} ${out}`)
    }
  }

}

async function run() {
  setInterval(collectDataForRequest, 62000 * 1)// 60 sec
}

run();