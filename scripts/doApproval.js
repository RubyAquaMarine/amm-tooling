const erc20ABI = require('../abi/erc20.json');
const ethers = require('ethers');


exports.Approval = function (swapAmount, fromToken, routerAddress, account) {
    return doApproval(swapAmount, fromToken, routerAddress, account)
}

// Input: wei amount
// Input: base token
// Input: routerAddress: AMM router address if the AMM route is first,  othertimes we need to approve the StableSwap Address
// Input: wallet.connect(provider);
async function doApproval(swapAmount, fromToken, routerAddress, account) {
    const fromContract = new ethers.Contract(fromToken, erc20ABI, account);
    const weiAmount = swapAmount;
    const bal = await fromContract.balanceOf(account.address);
    let allowanceAmount = await fromContract.allowance(account.address, routerAddress);

    console.log("Router Contract Allowance: " + allowanceAmount.toString());
    console.log("Approval Amount: " + weiAmount.toString());
    console.log("fromToken Balance: " + bal.toString());

    let nonce = await account.getTransactionCount("latest");

    console.log("fromToken Balance: " + nonce);

    let objectBlock = {
        "gasLimit": "280000",
        "nonce": nonce
    }


    if (bal.gte(weiAmount)) {
        console.log("BALANCE > AMOUNT ");
        if (allowanceAmount.toString() == "0" || weiAmount.gt(allowanceAmount)) {
            console.log("Router Contract Needs Increased Allowance: ");
            const parse = await fromContract.approve(routerAddress, weiAmount, objectBlock);
            const receipt = await parse.wait(1);
            console.log("Router Contract Receipt: ", receipt);
            console.log("Receipt: ", parse);
        }
        return 'Ready to Swap';
    } else {
        console.log("BALANCE < AMOUNT : Approve balanceOf ");
        const parse = await fromContract.approve(routerAddress, bal, objectBlock);
        const receipt = await parse.wait(1);
        console.log("Router Contract Receipt: ", receipt);
        console.log("Receipt: ", parse);
        return 'Ready to Swap';
    }
}