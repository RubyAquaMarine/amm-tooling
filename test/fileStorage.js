const ethers = require('ethers');
const abi = require('../abi/ima1.30.json');

const Filestorage = require('@skalenetwork/filestorage.js');

const config = require('../setConfig.json');
const credentials = require('../keys.json');

//--------------------------------------ADJUST-----------------------------------||
const providerOrigin = new ethers.providers.JsonRpcProvider(config.rpc.staging_europa); // SKALE CHAIN
//--------------------------------------ADJUST-----------------------------------||
const walletOrigin = new ethers.Wallet(credentials.account.privateKeyAdmin);
const accountOrigin = walletOrigin.connect(providerOrigin);

const pKEY = credentials.account.privateKeyAdmin;



// - aqua_todo : need to assign _ROLE ALLOCATOR_ROLE = ALLOCATOR_ROLE has been granted to the address performing reserveSpace()
    // -- done
//https://staging-v3.skalenodes.com/fs/staging-legal-crazy-castor
const address = 'F63Bb14E7E9bD2882957129c3E3197E6D18933B4'.toLowerCase();// remove 0x and to lowercase
console.log("address", address)

const directoryPath = '';
const fileBuffer = Buffer.from('Test Skale Storage \n Test Line <b> html </b>')


let filestorage = new Filestorage(providerOrigin);

// - 1 File owner address (without 0x)
// - 2 File/directory path in owner's root directory

async function uploadData(_filename) {
    let filePath = '';
    //  Creates directory on the specific path. To create directory using internal signing:
    if (directoryPath === '') {
        filePath = _filename;
    } else {
        filePath = directoryPath + '/' + _filename;
        filestorage.createDirectory(address, directoryPath, pKEY);
    }

    /*
    String address	Account address
    String filePath	Path of uploaded file in account directory
    Buffer fileBuffer	Uploaded file data
    String privateKey	(optional) Account private key, to sign transactions internally
    */
    filestorage.uploadFile(address, filePath, fileBuffer, pKEY);
}

async function deleteData(_filename, _deleteDirectory) {
    let filePath = '';
    if (_deleteDirectory) {
        filestorage.deleteDirectory(address, directoryPath, accountOrigin);
    }
    // do files need to be deleted before the directory can be delete, 
    // or can we delete the directory to force delete all the files in that directory

    if (directoryPath === '') {
        filePath = _filename;
    } else {
        filePath = directoryPath + '/' + _filename;
    }

    filestorage.deleteFile(address, filePath, privateKey);
}

async function reserveSpace(){

    console.log(accountOrigin.address)

    filestorage.reserveSpace(accountOrigin.address, accountOrigin.address,100,pKEY)
}

async function run(){

    await reserveSpace();

  //  await uploadData("aqua.txt");

}

run();
