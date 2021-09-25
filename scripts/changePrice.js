const nft = artifacts.require('LazyBungalows')

module.exports = async function(callback) {
    var instance = await nft.deployed();

    try {
        await instance.setMintPrice(this.web3.utils.toWei('0.15', 'ether'));
    } catch(e) {
        console.log(e)
        callback(e)
    }
    callback()
}
