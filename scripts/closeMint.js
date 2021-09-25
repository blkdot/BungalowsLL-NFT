const nft = artifacts.require('LazyBungalows')

module.exports = async function(callback) {
    var instance = await nft.deployed();

    try {
        await instance.setOpen(false);
    } catch(e) {
        console.log(e)
        callback(e)
    }
    callback()
}
