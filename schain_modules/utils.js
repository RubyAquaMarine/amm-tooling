const ethers = require('ethers');
const poolABI = require('../abi/communityPool.json');
const token_abi = require('../abi/SkaleERC20.json');
const erc20ABI = require('../abi/erc20.json');
const depositBoxABI = require('../abi/depositBox.json');// L1 depositBox
const token_manager_abi = require('../abi/skale_l2_token_manager.json');
const token_linker_abi = require('../abi/skale_token_linker.json');

const token_message_proxy_abi = require('../abi/skale_message_proxy.json');

async function sendFUEL(sendAmount, toAddress, account, provider) {
    const send_amount = ethers.utils.parseUnits(sendAmount, 'ether');
    console.log("Sending sFuel Amount: ", send_amount.toString());
    //Provider 
    const gas_try = await provider.getGasPrice().then((transaction) => {
        return transaction;
    }).catch(err => {
        console.log("Error getGasPrice:", err)
    })

    if(typeof gas_try === 'undefined'){
        console.log("Error getGasPrice:")
        return;
    }

    const try_string = gas_try.toString();
    console.log("Gas Price: ", try_string);

    //Signer 
    const nonceTx = await account.getTransactionCount("latest").then((transaction) => {
        return transaction;
    }).catch(err => {
        console.log("Error getTransactionCount:", err)
    })

    if(typeof nonceTx === 'undefined'){
        console.log("Error getTransactionCount:")
        return;
    }
    console.log("Nonce: ", nonceTx);
    
    //--- TO SEND ETH aka sFUEL
    const tx = {
        from: account.address,
        to: toAddress,
        value: send_amount,
        nonce: nonceTx,
        gasLimit: ethers.utils.hexlify(50000),
        gasPrice: gas_try
    }

    let res = await account.sendTransaction(tx).then((transaction) => {
        console.log("Transfer Complete:", transaction)
        return transaction;
    }).catch(err => {
        console.log("Error with transfer:", err)
        return err;
    })
}

async function exitCommunityPool(schainName, account, provider) {
    const schain = schainName;
    const poolAddress = config.skale.deposit_box;
    const poolContract = new ethers.Contract(poolAddress, poolABI, account);

    const proxyAddress = await poolContract.messageProxy();

    const SkaleManagerAddress = await poolContract.contractManagerOfSkaleManager();

    let ethBalance = await poolContract.getBalance(account.address, schain);
    console.log("Pool Balance: " + ethBalance);
    let humanAmount = ethers.utils.formatUnits(ethBalance, 18);
    console.log("Pool Balance norm: " + humanAmount);
    humanAmount = humanAmount - 0.0021; // min amount in community pool 0.002 at all times
    console.log("TransferAmount norm: ", humanAmount);
    const weiAmount = ethers.utils.parseUnits(humanAmount.toString(), 18);

    //Provider 
    const gas_try = await provider.getGasPrice();
    const try_string = gas_try.toString();
    //Signer 
    const nonce = await account.getTransactionCount("latest");
    console.log("TransactionCount: " + nonce);

    const objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce
    }

    let ok = await poolContract.withdrawFunds(schain, weiAmount, objectBlock);
    await ok.wait(1);

    console.log("ProxyAddress: " + proxyAddress +
        "\nCommunityPoolAddress: " + poolAddress +
        "\nBalance: " + humanAmount +
        "\nSkaleManagerAddress: " + SkaleManagerAddress +
        "\nResult: " + ok

    );

}

async function gasAnyUserWallet(transferAmount, walletAddress, skalePoolAddress, schain, accountSigner, rpcProvider) {
    console.log("schain " + schain);
    const poolContract = new ethers.Contract(skalePoolAddress, poolABI, accountSigner);
    let ethBalance = await poolContract.getBalance(walletAddress, schain);
    console.log("schain gasWallet Balance" + ethBalance);
    let humanAmount = ethers.utils.formatUnits(ethBalance, 18);
    const weiAmount = ethers.utils.parseUnits(transferAmount, 18);
    //Provider 
    const gas_try = await rpcProvider.getGasPrice();
    const try_string = gas_try.toString();
    //Signer 
    const nonce = await accountSigner.getTransactionCount("latest");
    console.log("TransactionCount: " + nonce);

    const objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce,
        "value": weiAmount
    }

    let ok = await poolContract.rechargeUserWallet(schain, walletAddress, objectBlock);
    let final = await ok.wait(1);

    console.log(
        "\nBalance: " + humanAmount +
        "\nRechargeWalletAddress: " + walletAddress +
        "\nResult: " + ok.toString()

    );
    return final;
}

/* Bridge ERC20 from mainnet to scahin
sends a % of balanceOf

Parameters
- percentageToSend : percentage balance to send to L2
- token : tokenAddress on mainnet
- depositBox: depositBox address on skale's l1 smart contact


*/
async function bridgeAssetstoSchain(percentageToSend, token, depositBox, schain, accountSigner, rpcProvider) {
    const account = accountSigner;
    const percentageOf = percentageToSend;
    let tokenA = token;
    //DepositBoxERC20 IMA contract on Ethereum
    const depositBoxAddress = depositBox;
    const boxContract = new ethers.Contract(depositBoxAddress, depositBoxABI, account);
    // Any erc20 token address
    const usdpContract = new ethers.Contract(tokenA, erc20ABI, account);
    let weiAmount = await usdpContract.balanceOf(account.address);

    let decimal = await usdpContract.decimals();


    let humanAmount = ethers.utils.formatUnits(weiAmount, decimal)
    console.log("Balance: ", humanAmount);
    console.log('DepositBoxAddressL ', depositBoxAddress);

    const gas_try = await rpcProvider.getGasPrice();
    const try_string = gas_try.toString();
    //Signer 
    let nonce = await account.getTransactionCount("latest");
    console.log("TransactionCount: " + nonce + " GasPrice: " + try_string);

    let objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce
    }

    let allowanceAmount = await usdpContract.allowance(account.address, depositBoxAddress);
    console.log("allowanceAmount : ", allowanceAmount.toString());
    console.log("balanceAmount : ", weiAmount.toString());


    if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
        console.log("Increased Allowance: ");
        let parse = await usdpContract.approve(depositBoxAddress, weiAmount, objectBlock).then(result => {
            return result;
        }).catch(err => {
            console.log(err)
        })

        if (parse) {
            console.log("APPROVAL TX:")
            let out = parse.wait().then(ok => {
                // console.log("Result: ", ok);
            }).catch(err => {
                console.log("Result Error: ", err);
            });
        }


    }

    const sendAmount = weiAmount.div(percentageOf);
    console.log("Send Amount: ", sendAmount.toString());

    nonce = await account.getTransactionCount("latest");
    let pendingNonce = await account.getTransactionCount("latest");
    console.log("pending " + pendingNonce + " nonce  + nonce");

    objectBlock = {
        "gasPrice": try_string,
        "gasLimit": "280000",
        "nonce": nonce
    }

    const res = await boxContract.depositERC20(schain, tokenA, sendAmount, objectBlock);
    console.log(res);
    let ok = await res.wait(1);// wait for 1 block confirmation
    //  console.log("Transfer Complete");
    return ok;
}

async function whiteListTokenFromL1(schainName, token, depositBoxAddress, accountSigner) {

    const depositBoxContract = new ethers.Contract(depositBoxAddress, depositBoxABI, accountSigner);
    const tokenExists = await depositBoxContract.getSchainToERC20(schainName, token);
    console.log("Token Exists", tokenExists);

    if (tokenExists == true) {
        console.log("whiteListTokenOnL1: Finished");
        return
    }// else add the token to the Deposit Box contract on L1 with the schain name and the l1 token address

    const res = await depositBoxContract.addERC20TokenByOwner(schainName, token);
    const rec = await res.wait(1);
    console.log("whiteListTokenOnL1: added new token: ", rec);
}

async function whiteListTokenOnL2(schainName, mainnetTokenAddress, SkaleChainTokenAddress, SkaleTokenManagerAddress, accountSigner) {

    const tokenManager = new ethers.Contract(SkaleTokenManagerAddress, token_manager_abi, accountSigner);

    // does l2 token exist
    const token = new ethers.Contract(SkaleChainTokenAddress, token_abi, accountSigner);
    const balance = await token.balanceOf(accountSigner.address);
    console.log("balance:", balance.toString());

    console.log("whiteListTokenOnL2 ", schainName);
    console.log("Token In: ", mainnetTokenAddress);
    console.log("Token Out: ", SkaleChainTokenAddress);
    res = await tokenManager.addERC20TokenByOwner(schainName, mainnetTokenAddress, SkaleChainTokenAddress).then(result => {  // Working... 
        return result
    }).catch(err => {
        console.log("whiteListTokenOnL2: Error: ", err)
    })


    res = await res.wait(1).then(result => {
        console.log("whiteListTokenOnL2fromOrigin: result: ", result);
        return result
    }).catch(err => {
        console.log("whiteListTokenOnL2fromOrigin: ERROR  ", err);
    })
    console.log("whiteListTokenOnL2fromOrigin: Ending ", res);
}

async function mintERC20(init_token_amount, init_token_address_origin, accountSigner) {
    const addr = accountSigner.address;
    const token = new ethers.Contract(init_token_address_origin, token_abi, accountSigner);
  
    const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");
    let res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), addr);
    if (res) {

    } else {
        res = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), addr);
        const rec = await res.wait(1);
        console.log("receipt for MINTER_ROLE being granted: ", rec);
    }

    //mint
    const decimal = await token.decimals();
    res = await token.mint(addr, ethers.utils.parseUnits(init_token_amount, decimal)).then(result=>{
        return result;
    }).catch(err=>{
        console.log("token mint err", err)
    })
    await res.wait(1);
    const balance = await token.balanceOf(addr);
    console.log("balance", balance.toString());
}

async function sendERC20ToChain(init_token_amount,check_token_address_origin, send_token_address_target, init_schain_target, schain_tokenManager, init_rpc, init_signer) {
   
    const tokenManagerContract = new ethers.Contract(schain_tokenManager, token_manager_abi, init_signer);// L2
   
    const usdpContract = new ethers.Contract(check_token_address_origin, token_abi, init_signer);// L2

    const decimal = await usdpContract.decimals();

    let weiAmount = await usdpContract.balanceOf(init_signer.address);

    let humanAmount = ethers.utils.formatUnits(weiAmount, decimal)

    let allowanceAmount = await usdpContract.allowance(init_signer.address, schain_tokenManager);

    console.log("Allowance Amount: ", allowanceAmount.toString());
    console.log("Balance Amount: ", weiAmount.toString());
    console.log("Balance Norm: ", humanAmount);

    //Provider 
    const gas_try = await init_rpc.getGasPrice();
    const try_string = gas_try.toString();

    let nonce;
    let objectBlock;

    if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {

        nonce = await init_signer.getTransactionCount("latest");

        objectBlock = {
            "gasPrice": try_string,
            "gasLimit": "280000",
            "nonce": nonce
        }
        console.log("Increased Allowance: ", objectBlock);

        let parse = await usdpContract.approve(schain_tokenManager, weiAmount, objectBlock).then(result => {
            console.log(result);
            return result;
        }).catch(err => {
            console.log("error on approval: ", err);
        })

        await parse.wait(1).then(result => {
            console.log("Receipt:", result);
        }).catch(err => {
            console.log("Receipt Error:", err);
        })


    }

    // now its time to bridge the assets
    const sendAmount = ethers.utils.parseUnits(init_token_amount, decimal);
    humanAmount = ethers.utils.formatUnits(sendAmount, decimal)
    console.log("Send Balance: ", humanAmount);

    /*
   
    transferToSchainERC20(
            string calldata targetSchainName,
            address contractOnMainnet,
            uint256 amount
    */
    nonce = await init_signer.getTransactionCount("latest");
    objectBlock = {
        from: init_signer.address,
        nonce: nonce,
        gasLimit: 6500000,
        gasPrice: 100000000,
    }

    console.log("destChainName: ", "|" + init_schain_target + "|");
    console.log("mainnetTokenAddress: |", send_token_address_target + "|");
    console.log("sendAmount: ", sendAmount.toString());

    let ok = await tokenManagerContract.transferToSchainERC20(init_schain_target, send_token_address_target, sendAmount, objectBlock).then(result => {
        console.log("Result: ", result);
        return result;
    }).catch(err => {
        console.log("Eroor with transfer", err)
    })


    await ok.wait(1).then(result => {
        console.log("Receipt:", result);
        return result;
    }).catch(err => {
        console.log("Receipt Error:", err);
    })

}

async function setMinterRole(tokenAddressOnTarget, minterAddr, init_signer) {
    const token = new ethers.Contract(tokenAddressOnTarget, token_abi, init_signer);
    const MINTER_ROLE = ethers.utils.id("MINTER_ROLE");
    let res = await token.hasRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
    console.log("Completed: MinterAddress has MINTER_ROLE", res);
    if (res) {
        return
    }
    // ROlE and ADDRESS
    res = await token.grantRole(ethers.utils.arrayify(MINTER_ROLE), minterAddr);
    const rec = await res.wait(1);
    console.log("receipt for MINTER_ROLE being granted: ", rec);
};

async function setBurnerRole(tokenAddressOnTarget, minterAddr, init_signer) {
    const token = new ethers.Contract(tokenAddressOnTarget, token_abi, init_signer);
    const BURNER_ROLE = ethers.utils.id("BURNER_ROLE");

    let res = await token.hasRole(ethers.utils.arrayify(BURNER_ROLE), minterAddr);
    console.log("Completed: MinterAddress has BURNER_ROLE", res);
    if (res) {
        return
    }
    // ROlE and ADDRESS
    res = await token.grantRole(ethers.utils.arrayify(BURNER_ROLE), minterAddr);
    const rec = await res.wait(1);
    console.log("receipt for BURNER_ROLE being granted: ", rec);
};

async function isRegistarRole(schain_tokenLinker, init_signer) {

    console.log("DUBG: ", schain_tokenLinker);
    const tokenManagerLinkerContract = new ethers.Contract(schain_tokenLinker, token_linker_abi, init_signer);

    let isConnected = await tokenManagerLinkerContract.REGISTRAR_ROLE().then(result => {
        return result;
    }).catch(err => {
        console.log("Registar Error: ", err);
        return false;
    })

    console.log("Registar Role byte32: ", isConnected);

    return isConnected;

}

async function isSkaleChainConnected(init_schain_target,schain_tokenLinker, init_signer) {

    console.log("hasSchain\nContract Address | schain | ", schain_tokenLinker, init_schain_target);
    const tokenManagerLinkerContract = new ethers.Contract(schain_tokenLinker, token_linker_abi, init_signer);

    let isConnected = await tokenManagerLinkerContract.hasSchain(init_schain_target).then(result => {
        return result;
    }).catch(err => {
        console.log("hasSchain Error: ", err);
        return false;
    })

    console.log("is Skale Chain connected: ", isConnected);

    return isConnected;
}

async function isSkaleChainConnectedV2(init_schain_target,schain_message_proxy, init_signer) {

    console.log("isConnectedChain\nContract Address | schain | ", schain_message_proxy, init_schain_target);
    const tokenManagerLinkerContract = new ethers.Contract(schain_message_proxy, token_message_proxy_abi, init_signer);

    let isConnected = await tokenManagerLinkerContract.isConnectedChain(init_schain_target).then(result => {
        return result;
    }).catch(err => {
        console.log("hasSchain Error: ", err);
        return false;
    })

    console.log("is Skale Chain connected: ", isConnected);

}

async function connectSkaleChain(init_schain_target,schain_tokenLinker, init_signer) {

    console.log("DUBG: ", schain_tokenLinker);
    const tokenManagerLinkerContract = new ethers.Contract(schain_tokenLinker, token_linker_abi, init_signer);

    let isConnected = await tokenManagerLinkerContract.hasSchain(init_schain_target).then(result => {
        return result;
    }).catch(err => {
        console.log("hasSchain Error: ", err);
        return false;
    })

    console.log("is Skale Chain connected: ", isConnected);


    if (isConnected) return

    let tx = await tokenManagerLinkerContract.connectSchain(init_schain_target).then(result => {
        return result;
    }).catch(err => {
        console.log("connectSchain Error: ", err);
    })

    const rec = await tx.wait(1).then(result => {
        return result;
    }).catch(err => {
        console.log("tx err", err);
        return err;
    })

    console.log("receipt", rec);
}

// USER functions
module.exports.bridgeAssetstoSchain = bridgeAssetstoSchain;
module.exports.sendERC20ToChain = sendERC20ToChain;
module.exports.sendFUEL = sendFUEL;
module.exports.exitCommunityPool = exitCommunityPool;
module.exports.gasAnyUserWallet = gasAnyUserWallet;
//ADMIN functions 
module.exports.whiteListTokenOnL2 = whiteListTokenOnL2;
module.exports.whiteListTokenFromL1 = whiteListTokenFromL1;
module.exports.mintERC20 = mintERC20;
module.exports.setMinterRole = setMinterRole;
module.exports.setBurnerRole = setBurnerRole;
module.exports.connectSkaleChain = connectSkaleChain;
module.exports.isSkaleChainConnected = isSkaleChainConnected;
module.exports.isSkaleChainConnectedV2 = isSkaleChainConnectedV2;
module.exports.isRegistarRole = isRegistarRole;