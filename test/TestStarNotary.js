const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let tokenId = 2021;
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided 
    assert.equal(await instance.name(), 'SJC Token');
    assert.equal(await instance.tiker(), 'SJCTok');
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let User1 = accounts[1];
    let User2 = accounts[2];
    // 1. create 2 Stars with different tokenId
    let Star1ID = 2018;
    let Star2ID = 2021;

    await instance.createStar('Star1', Star1ID, { from: User1 });
    await instance.createStar('Star2', Star2ID, { from: User2 });
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(Star1ID, Star2ID, { from: User1 });
    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf(Star1ID), User2);
    assert.equal(await instance.ownerOf(Star2ID), User1);
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let User1 = accounts[1];
    let User2 = accounts[2];


    // 1. create a Star with different tokenId
    let StarID = 2019;
    await instance.createStar('lookUptokenIdToStarInfo test', StarID, { from: User1 });

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(User2, StarID, { from: User1 });
    // 3. Verify the star owner changed.
    assert.equal(User2, await instance.ownerOf(StarID));
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    // 1. create a Star with different tokenId
    let StarID = 2093;
    await instance.createStar('lookUptokenIdToStarInfo test', StarID, { from: accounts[0] });
    // 2. Call your method lookUptokenIdToStarInfo
    await instance.lookupTokenToStartInfo(StarID);
    // 3. Verify if you Star name is the same
    assert.equal(await instance.lookupTokenToStartInfo(StarID), 'lookUptokenIdToStarInfo test');
});