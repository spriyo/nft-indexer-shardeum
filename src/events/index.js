const Web3 = require("web3");
const {
	CHAIN,
	OFFER_EVENT_HASH,
	AUCTION_EVENT_HASH,
	BID_EVENT_HASH,
	SALE_EVENT_HASH,
	LISTING_EVENT_HASH,
} = require("../constants");
const { Events } = require("../models/event");
const { Log } = require("../models/logs");
const { NFT } = require("../models/nft");
const { handleOfferEvent } = require("./offer");
const { handleAuctionEvent } = require("./auction");
const { handleBidEvent } = require("./bid");
const { handleSaleEvent } = require("./sale");
const { handleListingEvent } = require("./listing");
const chain = CHAIN;
const web3 = new Web3(chain.websocketRpcUrl);

const marketEventListener = async function (log) {
	try {
		// Block Timestamp
		// const block = await web3.eth.getBlock(log.blockNumber);

		// Save log
		// log.timestamp = block.timestamp;
		log.logId = `${log.transactionIndex}-${log.logIndex}`;
		log = await new Log(log).save();

		let nft;
		// New Event indexes
		if (
			log.topics[0] === LISTING_EVENT_HASH ||
			log.topics[0] === SALE_EVENT_HASH
		) {
			nft = await NFT.findOne({
				chain_id: CHAIN.chainId,
				token_id: web3.utils.hexToNumberString(log.topics[2]),
				contract_address: web3.eth.abi.decodeParameter(
					"address",
					log.topics[3]
				),
			});
		} else {
			nft = await NFT.findOne({
				contract_address: web3.eth.abi.decodeParameter(
					"address",
					log.topics[2]
				),
				token_id: web3.utils.hexToNumberString(log.topics[1]),
				chain_id: CHAIN.chainId,
			});
		}

		// Get Transaction Details (ASYNC)
		const tx = await web3.eth.getTransaction(log.transactionHash);

		// Create Event
		await Events.create({
			method: tx.input.slice(0, 10),
			input: tx.input,
			data: log.data,
			from: tx.from,
			to: tx.to,
			nft_id: nft._id,
			contract_address: nft.contract_address,
			token_id: nft.token_id,
			chain_id: CHAIN.chainId,
			transaction_hash: log.transactionHash,
			log_id: log._id,
			timestamp: log.timestamp,
			value: tx.value,
		});

		if (log.topics[0] === OFFER_EVENT_HASH) {
			handleOfferEvent(log, nft);
		} else if (log.topics[0] === AUCTION_EVENT_HASH) {
			handleAuctionEvent(log, nft);
		} else if (log.topics[0] === BID_EVENT_HASH) {
			handleBidEvent(log, nft);
		} else if (log.topics[0] === LISTING_EVENT_HASH) {
			handleListingEvent(log, nft);
		} else if (log.topics[0] === SALE_EVENT_HASH) {
			handleSaleEvent(log, nft);
		}
	} catch (error) {
		console.log({ "Market Event Listener": error.message });
	}
};

module.exports = { marketEventListener };
