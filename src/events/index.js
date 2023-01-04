const Web3 = require("web3");
const { CHAIN, OFFER_EVENT_HASH } = require("../constants");
const { Events } = require("../models/event");
const { Log } = require("../models/logs");
const { NFT } = require("../models/nft");
const { Offer } = require("../models/offer");
const chain = CHAIN;
const web3 = new Web3(chain.websocketRpcUrl);

const marketEventListener = async function (log) {
	try {
		let nft = await NFT.findOne({
			contract_address: web3.eth.abi.decodeParameter("address", log.topics[2]),
			token_id: web3.utils.hexToNumberString(log.topics[1]),
			chain_id: CHAIN.chainId,
		});

		if (log.topics[0] === OFFER_EVENT_HASH) {
			await createOffer(log, nft);
		}
		// Get Transaction Details (ASYNC)
		const tx = await web3.eth.getTransaction(log.transactionHash);

		// Block Timestamp
		const block = await web3.eth.getBlock(log.blockNumber);

		// Save log
		log.timestamp = block.timestamp;
		log.logId = `${log.blockNumber}-${log.transactionIndex}-${log.logIndex}`;
		log = await new Log(log).save();

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
	} catch (error) {
		console.log({ "Market Event Listener": error.message });
	}
};

async function createOffer(log, nft) {
	try {
		const data = web3.eth.abi.decodeParameters(
			["uint", "uint256", "uint256", "address", "bool"],
			log.data
		);
		await new Offer({
			offer_id: data[0],
			nft_id: nft._id,
			token_id: nft.token_id,
			amount: data[1],
			expireAt: data[2],
			offer_from: data[3],
			contract_address: nft.contract_address,
			chain_id: CHAIN.chainId,
		}).save();
	} catch (error) {
		console.log({ "Market Listener: Offer": error.message });
	}
}

module.exports = { marketEventListener };
