const axios = require('axios');



/*
https://elated-tan-skat.explorer.mainnet.skalenodes.com/
api?module=token
&action=getTokenHolders
&contractaddress=0x2B4e4899b53E8b7958c4591a6d02f9C0b5c50F8f
*/

const URL_BASE = 'https://elated-tan-skat.explorer.mainnet.skalenodes.com/api';

//const URL_BASE = 'http://fancy-rasalhague.testnet-explorer.skalenodes.com/api'


// modules 
// account
async function getTokenList(address) {
    //?module=account&action=tokenlist&address={addressHash}
    const stringThis = '?module=account&action=tokenList&address=' + address

    const res = await axios.get(URL_BASE + stringThis, {

    }).then(res => {
       
        return res;
    }).catch(err => {
        console.log(err);
        return err;
    })

    return res.data;

}

async function bridgedTokenList() {

    const stringThis = '?module=token&action=bridgedTokenList'

    const res = await axios.get(URL_BASE + stringThis, {

    }).then(res => {
        console.log(res);
        return res;
    }).catch(err => {
        console.log(err);
        return err;
    })

    return res.data;

}

async function testAPI() {


    const data = {
        module: "account",
        action: "balance",
        address: "0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8"
    }


    //  let formData = new FormData()
    //  Object.entries(data).map((obj) => formData.append(obj[0], obj[1]))

    //https://fancy-rasalhague.testnet-explorer.skalenodes.com/api?module=token&action=getTokenHolders&contractaddress=0x83B38f79cFFB47CF74f7eC8a5F8D7DD69349fBf7


    const json = JSON.stringify(data);
    const res = await axios.get(URL_BASE + '?module=account&action=balance&address=0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8', {

    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    })


    /*
        let ok = await axios.post('https://testnet-proxy.skalenodes.com/v1/fancy-rasalhague/api?module=account&action=balance&address=0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8', {
            module: "account",
            action: "balance",
            address:"0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8"
        }).then(res => {
            console.log(res);
        }).catch(err => {
            console.log(err);
        })
    */

}


async function getTokenHolders(address, page, offset) {
   
    const stringThis = '?module=token&action=getTokenHolders&contractaddress=' + address + "&page=" + page + "&offset=" + offset

    const res = await axios.get(URL_BASE + stringThis, {

    }).then(res => {
       
        return res;
    }).catch(err => {
        console.log(err);
        return err;
    })

    return res.data;

}

async function run() {
 //let data =    await getTokenList('0xfD6D3ab833f312B3CE7344D234832574Ad94B8e8');
 // console.log(data?.result)

 // let data2 =    await getTokenList('0xD2aAA00500000000000000000000000000000000');
//  console.log(data2?.result)
  

 // let data3 =      await bridgedTokenList();
 // console.log(data3?.result)
    // testAPI();


let testValue = 500;
let index = 0;
let obj=[];
while(testValue === 500){

    let holders = await getTokenHolders('0x2B4e4899b53E8b7958c4591a6d02f9C0b5c50F8f', index, testValue) 

    const length = holders?.result.length;
    testValue = length;

    console.log(length)
   // console.log(holders?.result)

    obj.push(holders?.result)

    index++;

    console.log("index", index)

}

// write to file
console.log(obj.length)


}

run();