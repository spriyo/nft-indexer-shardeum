const Web3 = require("web3");
const { CHAIN } = require("../constants");
const { Auction } = require("../models/auction");
const web3 = new Web3();

const auctionStatus = ["create", "update", "cancel", "settle"];

const handleAuctionEvent = async function (log, nft) {
	try {
		const data = web3.eth.abi.decodeParameters(
			[
				"uint256",
				"uint256",
				"uint256",
				"address",
				"address",
				"address",
				"bool",
			],
			log.data
		);
		const auctionStatusCode = web3.utils.hexToNumberString(log.topics[3]);
		if (auctionStatusCode === "0") {
			await new Auction({
				auction_id: data[0],
				nft_id: nft._id,
				token_id: nft.token_id,
				contract_address: nft.contract_address,
				reserve_price: data[1],
				createdAt: log.timestamp,
				expireAt: data[2],
				previous_bidder: data[3],
				current_bidder: data[4],
				seller: data[5],
				market_address: log.address,
				chain_id: CHAIN.chainId,
			}).save();
		} else {
			const auction = await Auction.findOne({
				auction_id: data[0],
				nft_id: nft._id,
				market_address: log.address,
			});
			auction.status = auctionStatus[parseInt(auctionStatusCode)];
			auction.sold = data[6];
			auction.reserve_price = data[1];
			auction.previous_bidder = data[3];
			auction.current_bidder = data[4];
			await auction.save();
		}
	} catch (error) {
		console.log({ "Market Listener: Auction": error.message });
	}
};

module.exports = { handleAuctionEvent };
