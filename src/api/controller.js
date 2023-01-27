const {
	SALE_EVENT_HASH,
	OFFER_EVENT_HASH,
	AUCTION_EVENT_HASH,
	BID_EVENT_HASH,
	web3,
} = require("../constants");
const { NFT } = require("../models/nft");
const { executeCommand } = require("../pool");
const { marketEventListener } = require("../events");

const updateMetadata = async function (req, res) {
	try {
		const nft_id = req.params.id;
		const nft = await NFT.findById(nft_id);
		if (!nft)
			return res.status(404).send({ message: "NFT not found with given id" });
		executeCommand(nft);
		res.send({
			message: "Added to the queue, check back to find updated metadata!",
		});
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

const createEvent = async function (req, res) {
	try {
		const txid = req.params.txid;
		const tx = await web3.eth.getTransactionReceipt(txid);

		for (var i = 0; i < tx.logs.length; i++) {
			if (
				tx.logs[i].topics[0] === SALE_EVENT_HASH ||
				tx.logs[i].topics[0] === OFFER_EVENT_HASH ||
				tx.logs[i].topics[0] === AUCTION_EVENT_HASH ||
				tx.logs[i].topics[0] === BID_EVENT_HASH
			) {
				tx.logs[i].timestamp = tx.timestamp;
				tx.logs[i].transactionIndex = tx.logs[i].transactionHash;
				tx.logs[i].logIndex = i;
				tx.logs[i].timestamp = Date.now();
				marketEventListener(tx.logs[i]);
			}
		}
		res.send({ message: "Added to queue." });
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	updateMetadata,
	createEvent,
};
