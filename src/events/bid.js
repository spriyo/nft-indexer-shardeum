const Web3 = require("web3");
const { CHAIN } = require("../constants");
const { Auction } = require("../models/auction");
const { Bid } = require("../models/bid");
const web3 = new Web3();

const handleBidEvent = async function (log, nft) {
	try {
		const data = web3.eth.abi.decodeParameters(
			["uint256", "uint256"],
			log.data
		);
		const auction = await Auction.findOne({
			auction_id: data[0],
			token_id: nft.token_id,
			contract_address: nft.contract_address,
		});
		const bid = await new Bid({
			auction_id: auction._id,
			auctionId: auction.auction_id,
			nft_id: nft._id,
			token_id: nft.token_id,
			contract_address: nft.contract_address,
			amount: data[1],
			bidder: web3.eth.abi.decodeParameter("address", log.topics[3]),
			market_address: log.address,
			chain_id: CHAIN.chainId,
		}).save();
		auction.bids = auction.bids.concat(bid._id);
		await auction.save();
	} catch (error) {
		console.log({ "Market Listener: Bid": error.message });
	}
};

module.exports = { handleBidEvent };
