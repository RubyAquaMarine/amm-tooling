
const vest_abi = require('../abi/vest_abi.json')

async function claimRubyFromVester(minAmount, vestAddress, rubyAddress, signer) {

    const contract = new ethers.Contract(vestAddress, vest_abi, signer);

    const owner = await contract.beneficiary();
    const out = await contract.released(rubyAddress);
    const rubyOut = ethers.utils.formatUnits(out, 18);

    const released = await contract.releaseableAmount(rubyAddress);
    const releasedRuby = ethers.utils.formatUnits(released, 18);
    const numRuby = Number(releasedRuby);


    //ADMIN owner
    if (numRuby > minAmount) {
        const res = await contract.release(rubyAddress, released).then(result => {
            console.log("Released Coins");
            return result;
        }).catch(err => {
            console.log("err in releasing tokens")
            return err;
        })
    }

    console.log("user: " + owner + "\nReleased: " + rubyOut + "\nClaimable:" + releasedRuby);

}

module.exports.claimRubyFromVester = claimRubyFromVester;