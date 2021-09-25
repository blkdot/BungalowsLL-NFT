const bungalows = artifacts.require('LazyBungalows');

module.exports = async function(deployer, network, accounts) {
    let instance = await deployer.deploy(bungalows);

}
