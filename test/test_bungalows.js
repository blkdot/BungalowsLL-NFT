const nft = artifacts.require("LazyBungalows")

const {
  balance,
  BN,
  ether,
  expectRevert,
  expectEvent,
  time
} = require('@openzeppelin/test-helpers');


const BigNumber = web3.utils.BN;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bn')(BigNumber))
  .should();

contract("Bungalows: Contract Tests", accounts => {
  beforeEach(async function() {
    this.owner = accounts[9];

    this.instance = await nft.new({from: this.owner});
    await this.instance.setOpen(true, {from: this.owner});
  })
  it('Mints an NFT', async function() {
    await this.instance.mint(1, {from: accounts[1], value: ether('0.3')})
    let balance = await this.instance.balanceOf(accounts[1]);
    balance.should.be.bignumber.equal(new BN('1'));

    let owner0 = await this.instance.ownerOf(0);
    owner0.should.be.equal(accounts[1])
  })
  it('Rejects a purchase under of insufficient value', async function() {
    await expectRevert(this.instance.mint(1, {from: accounts[1], value: ether('0.2')}), "Not enough ETH sent")

  })
  it("Doesn't allow a purchase over the limit", async function() {
    await this.instance.mint(10, {from: accounts[1], value: ether('3')})
    let balance = await this.instance.balanceOf(accounts[1]);
    balance.should.be.bignumber.equal(new BN('5'));
  })
  // Deploy contract with BUYABLE_SUPPLY = 15
  //it('Checks buyable supply max', async function() {
  //  //buys 5
  //  await this.instance.mint(5, {from: accounts[1], value: ether('1.5')})
  //  let balance = await this.instance.balanceOf(accounts[1]);
  //  balance.should.be.bignumber.equal(new BN('5'));

  //  let owner0 = await this.instance.ownerOf(0);
  //  owner0.should.be.equal(accounts[1])

  //  //buys 10 total

  //  await this.instance.mint(5, {from: accounts[1], value: ether('1.5')})
  //  let balance1 = await this.instance.balanceOf(accounts[1]);
  //  balance1.should.be.bignumber.equal(new BN('10'));

  //  //buys 15 total

  //  await this.instance.mint(5, {from: accounts[1], value: ether('1.5')})
  //  let balance2 = await this.instance.balanceOf(accounts[1]);
  //  balance2.should.be.bignumber.equal(new BN('15'));

  //  //should still be 15

  //  await expectRevert(this.instance.mint(5, {from: accounts[1], value: ether('1.5')}), "Sold Out");
  //  let balance3 = await this.instance.balanceOf(accounts[1]);
  //  balance3.should.be.bignumber.equal(new BN('15'));

  //})
  //it('Checks buyable supply max', async function() {
  //  //buys 5
  //  await this.instance.mint(5, {from: accounts[1], value: ether('1.5')})
  //  let balance = await this.instance.balanceOf(accounts[1]);
  //  balance.should.be.bignumber.equal(new BN('5'));

  //  let owner0 = await this.instance.ownerOf(0);
  //  owner0.should.be.equal(accounts[1])

  //  //buys 10 total

  //  await this.instance.mint(5, {from: accounts[1], value: ether('1.5')})
  //  let balance1 = await this.instance.balanceOf(accounts[1]);
  //  balance1.should.be.bignumber.equal(new BN('10'));

  //  //buys 13 total

  //  await this.instance.mint(3, {from: accounts[1], value: ether('0.9')})
  //  let balance2 = await this.instance.balanceOf(accounts[1]);
  //  balance2.should.be.bignumber.equal(new BN('13'));

  //  //should still be 15

  //  await this.instance.mint(5, {from: accounts[1], value: ether('1.5')})
  //  let balance3 = await this.instance.balanceOf(accounts[1]);
  //  balance3.should.be.bignumber.equal(new BN('15'));

  //})
  it('Implements Dutch auction pricing', async function() {
    await this.instance.setMintPrice(ether('0.2'), {from: this.owner});
    await this.instance.mint(1, {from: accounts[1], value: ether('3')});
    let bal1 = await this.instance.balanceOf(accounts[1]);
    bal1.should.be.bignumber.equal(new BN('1'))
    await this.instance.setMintPrice(ether('0.15'), {from: this.owner});
    await expectRevert(
      this.instance.mint(1, {from: accounts[1], value: ether('0.1')}),
      "Not enough ETH sent"
    )
    await this.instance.mint(1, {from: accounts[1], value: ether('0.15')})
    let bal2 = await this.instance.balanceOf(accounts[1])
    bal2.should.be.bignumber.equal(new BN('2'))
  })
  // ============= REQUIRES MOCK ==========================
  it('Mints free', async function() {
    await this.instance.setOpenFree(true, {from: this.owner});
    await this.instance.mintFree({from: accounts[0]});
    let owner111 = await this.instance.ownerOf(1);
    owner111.should.be.equal(accounts[0])

  })
  it('Rejects non original nft holder from minting free', async function() {
    await this.instance.setOpenFree(true, {from: this.owner});

    await this.instance.mintFree({from: accounts[1]});

    let balance = await this.instance.balanceOf(accounts[1]);
    balance.should.be.bignumber.equal(new BN('0'));
  })
  it("Mints some free", async function() {
    await this.instance.setOpenFree(true, {from: this.owner});

    await this.instance.mintFreeSome(0, 5);
    let bal = await this.instance.balanceOf(accounts[0]);
    bal.should.be.bignumber.equal(new BN('6'))
    await this.instance.mintFreeSome(2, 6);
    let bal2 = await this.instance.balanceOf(accounts[0]);
    bal2.should.be.bignumber.equal(new BN('7'))
    await this.instance.mintFreeSome(7, 25);
    let bal3 = await this.instance.balanceOf(accounts[0]);
    bal3.should.be.bignumber.equal(new BN('26'))
    await expectRevert(this.instance.mintFreeSome(26, 30), "Not Enough Lions");
    let bal4 = await this.instance.balanceOf(accounts[0]);
    bal4.should.be.bignumber.equal(new BN('26'))
    await this.instance.mintFreeSome(26, 29)
    let bal5 = await this.instance.balanceOf(accounts[0]);
    bal5.should.be.bignumber.equal(new BN('30'))
  })
  it('Doesnt allow free mint twice', async function() {
    await this.instance.setOpenFree(true, {from: this.owner});
    await this.instance.mintFree({from: accounts[0]})
    let bal = await this.instance.balanceOf(accounts[0]);
    bal.should.be.bignumber.equal(new BN('30'))

    await this.instance.mintFree({from: accounts[0]})
    let bal2 = await this.instance.balanceOf(accounts[0]);
    bal2.should.be.bignumber.equal(new BN('30'))
  })
   it("Mints Free One at a time", async function() {
       await this.instance.setOpenFree(true, {from: this.owner});
       await this.instance.mintFreeOne({from: accounts[0]})
       let bal = await this.instance.balanceOf.call(accounts[0])
       let owner = await this.instance.ownerOf.call(0);
       owner.should.be.equal(accounts[0])
       bal.should.be.bignumber.equal(new BN('1'))
       await this.instance.mintFreeOne({from: accounts[0]})
       let owner2 = await this.instance.ownerOf.call(1);
       owner.should.be.equal(accounts[0])
       let bal2 = await this.instance.balanceOf.call(accounts[0])
       bal2.should.be.bignumber.equal(new BN('2'))
       await this.instance.mintFreeOne({from: accounts[0]})
       let owner3 = await this.instance.ownerOf.call(2);
       owner3.should.be.equal(accounts[0])
       let bal3 = await this.instance.balanceOf.call(accounts[0])
       bal3.should.be.bignumber.equal(new BN('3'))
   })
  it("Should not allow claims in excess of existing claims", async function() {
    await this.instance.setOpenFree(true, {from: this.owner});
    let claims = await this.instance.freeMints.call(accounts[0])
    // Do a couple single mints
    await this.instance.mintFreeOne({from: accounts[0]})
    await this.instance.mintFreeOne({from: accounts[0]})
    await this.instance.mintFreeOne({from: accounts[0]})
    await this.instance.mintFreeOne({from: accounts[0]})
    // Mint the rest
    await this.instance.mintFree({from: accounts[0]})
    // Check that balance is equal to max claims
    let balance = await this.instance.balanceOf.call(accounts[0]);
    balance.should.be.bignumber.equal(claims)
    // try to single mint again
    let balance2 = await this.instance.balanceOf.call(accounts[0]);
    balance2.should.be.bignumber.equal(claims)

    //try to full mint over the limit
    await this.instance.mintFree({from: accounts[0]})
    let balance3 = await this.instance.balanceOf.call(accounts[0])
    balance3.should.be.bignumber.equal(claims)

  })
   // =======================================================
  it('Allows Owner to Mint 100', async function() {
    await this.instance.reserveBungalows(this.owner, 100, {from: this.owner});
    let balance = await this.instance.balanceOf(this.owner);
    balance.should.be.bignumber.equal(new BN('100'))
  })
  it('Allows Owner to Mint 100 in chunks of 25', async function() {
    await this.instance.reserveBungalows(this.owner, 25, {from: this.owner});
    let balance = await this.instance.balanceOf(this.owner);
    balance.should.be.bignumber.equal(new BN('25'))
    await this.instance.reserveBungalows(this.owner, 25, {from: this.owner});
    balance = await this.instance.balanceOf(this.owner);
    balance.should.be.bignumber.equal(new BN('50'))
    await this.instance.reserveBungalows(this.owner, 25, {from: this.owner});
    balance = await this.instance.balanceOf(this.owner);
    balance.should.be.bignumber.equal(new BN('75'))
    await this.instance.reserveBungalows(this.owner, 25, {from: this.owner});
    balance = await this.instance.balanceOf(this.owner);
    balance.should.be.bignumber.equal(new BN('100'))
    await expectRevert(this.instance.reserveBungalows(this.owner, 25, {from: this.owner}), "Not Enough reserves left for team")
  })
  it('Rejects an Owner mint over the limit', async function(){
    await this.instance.reserveBungalows(this.owner, 99, {from: this.owner})
    let balance = await this.instance.balanceOf(this.owner);
    balance.should.be.bignumber.equal(new BN('99'));

    await expectRevert(this.instance.reserveBungalows(this.owner, 2, {from: this.owner}), "Not Enough reserves left for team")

    await this.instance.reserveBungalows(this.owner, 1, {from: this.owner});
    let balance2 = await this.instance.balanceOf(this.owner);
    balance2.should.be.bignumber.equal(new BN('100'));


  })
  it('Withdraws balance to the owner', async function() {
    let balance_tracker = await balance.tracker(this.owner)
    await this.instance.mint(2, {from: accounts[3], value: ether('0.6')})
    await this.instance.withdraw({from: this.owner});
    let total = await balance_tracker.deltaWithFees();
    let totalDelta = total.delta.add(total.fees)
    totalDelta.should.be.bignumber.equal(ether('0.6'))

  })
  it('Withdraws partial balance to arbitrary wallet', async function() {
    let balance_tracker = await balance.tracker(accounts[5])
    await this.instance.mint(2, {from: accounts[3], value: ether('0.6')})
    await this.instance.partialWithdraw(ether('0.3'), accounts[5], {from: this.owner});
    let total = await balance_tracker.delta();
    total.should.be.bignumber.equal(ether('0.3'))

  })
  it("Utilizes the tokensOfOwner function", async function() {
    await this.instance.reserveBungalows(this.owner, 100, {from: this.owner});

    let tokens = await this.instance.tokensOfOwner.call(this.owner);
    let len = tokens.length;
    len.should.be.equal(100)
    tokens.forEach(function(token) {
      // console.log(token.toNumber())

    })
  })
  it("Walks through starting index logic", async function() {
    await this.instance.mint(1, {from: accounts[0], value: ether('0.3')})
    //await expectRevert(this.instance.setStartingIndex(), "Starting index block must be set")
    let startingIndexBlock = await this.instance.startingIndexBlock.call();
    console.log(startingIndexBlock.toNumber())

    let last_block = await time.latestBlock()
    startingIndexBlock.should.be.bignumber.equal(last_block)

    await time.increase(time.duration.hours(26));
    await this.instance.mint(2, {from: accounts[3], value: ether('0.6')})


    await this.instance.setStartingIndex();

    let starting_index = await this.instance.startingIndex.call()

    console.log(starting_index.toNumber())
    starting_index.should.be.bignumber.above(new BN('0'))
    starting_index.should.be.bignumber.at.most(new BN('11679'))

  })
  it('checks base uri', async function() {
    await this.instance.setBaseURI('ipfs://xxxyyyyzzz/', {from: this.owner})
    await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
    let uri = await this.instance.tokenURI.call(1);
    uri.should.be.equal('ipfs://xxxyyyyzzz/1')

  })
  it('check tokenByIndex', async function() {
    await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
    let token0 = await this.instance.tokenByIndex.call(0)
    let token1 = await this.instance.tokenByIndex.call(1)

    console.log('token0', token0.toString())
    console.log('token1', token1.toString())
    token0.should.be.bignumber.equal(new BN('0'))
    token1.should.be.bignumber.equal(new BN('1'))

  })
  it('Sets frame content', async function() {
    let EXTERNAL_NFT = "0xbC8563B5b1363a9d833eA72B3f46bA51d1012625";
    await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
    await this.instance.setFrame(EXTERNAL_NFT, 3, 0, 0, {from: accounts[0]})
    let frame = await this.instance.frames.call(0, 0);
    console.log(frame.external_nft, ' : ', frame.tokenId.toString())
    let frames = await this.instance.getFrames.call(0);
    console.log(frames)

    await expectRevert(this.instance.setFrame(EXTERNAL_NFT, 3, 0, 3, {from: accounts[0]}), 'Ran out of frames')
    //frame.should.be.equal('ipfs://xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz')
  })
  //it('Sets all frames', async function() {
  //  await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
  //  await this.instance.setAllFrames(1, 'ipfs://xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz', 'ipfs://111111111111','ipfs://222222222222222222222',{from: accounts[0]})
  //  let frames = await this.instance.getAllFrames(1);
  //  console.log(frames)

  //})
  //it('rejects a frame set by a wrong account', async function() {
  //  await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
  //  await expectRevert(this.instance.setFrame0(1, 'ipfs://abcxyz', {from: accounts[3]}), 'Must Own bungalow to Set Frames');
  //})
  //it('rejects a frame set to a token that does not exist', async function() {
  //  await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
  //  await expectRevert(this.instance.setFrame0(2, 'ipfs://xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz', {from: accounts[0]}), 'owner query for nonexistent token')
  //})
  //it('Sets multiple frames one at a time', async function() {
  //  await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
  //  await this.instance.setFrame0(1, 'ipfs://000', {from: accounts[0]})
  //  await this.instance.setFrame1(1, 'ipfs://111', {from: accounts[0]})
  //  await this.instance.setFrame2(1, 'ipfs://222', {from: accounts[0]})
  //  let frame0 = await this.instance.frame0.call(1);
  //  let frame1 = await this.instance.frame1.call(1);
  //  let frame2 = await this.instance.frame2.call(1);
  //  frame0.should.be.equal('ipfs://000')
  //  frame1.should.be.equal('ipfs://111')
  //  frame2.should.be.equal('ipfs://222')
  //  await this.instance.setFrame0(1, 'ipfs://333', {from: accounts[0]})
  //  let frame3 = await this.instance.frame0.call(1);
  //  frame3.should.be.equal('ipfs://333')
  //})
  //it('checks base uri, tokenuri', async function() {
  //  await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
  //  await this.instance.setBaseURI('ipfs://abc/', {from: this.owner});
  //  let token1URI = await this.instance.tokenURI(1);
  //  console.log(token1URI)
  //  token1URI.should.be.equal('ipfs://abc/1')
  //})
  //it('How long can frame content be', async function() {
  //  await this.instance.mint(2, {from: accounts[0], value: ether('0.6')})
  //  await this.instance.setFrame0(1, 'ipfs://xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111', {from: accounts[0]})
  //  let frame = await this.instance.frame0.call(1);
  //  frame.should.be.equal('ipfs://xyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyzxyz11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111')
  //})





})
