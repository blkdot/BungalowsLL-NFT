const nft = artifacts.require('LazyBungalows')

module.exports = async function(callback) {
    var instance = await nft.deployed();

    try {
        await instance.setOpenFree(true);
    } catch(e) {
        console.log(e)
        callback(e)
    }
    callback()
}
