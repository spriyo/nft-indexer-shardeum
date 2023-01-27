const {
	SALE_EVENT_HASH,
	OFFER_EVENT_HASH,
	AUCTION_EVENT_HASH,
	BID_EVENT_HASH,
	web3,
	ERC721_TRANSFER_EVENT_HASH,
	ERC1155_TRANSFER_EVENT_HASH,
	ERC1155_BATCH_TRANSFER_EVENT_HASH,
} = require("../constants");
const { NFT } = require("../models/nft");
const { executeCommand } = require("../pool");
const { marketEventListener } = require("../events");
const { erc721CaptureLogs } = require("../ERC721");
const { erc1155CaptureLogs } = require("../ERC1155");
const { erc1155BatchCaptureLogs } = require("../ERC1155Batch");

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
			tx.logs[i].timestamp = Date.now();
			tx.logs[i].transactionIndex = tx.logs[i].transactionHash;
			tx.logs[i].logIndex = i;

			if (tx.logs[i].topics[0] === ERC721_TRANSFER_EVENT_HASH) {
				erc721CaptureLogs(tx.logs[i]);
			} else if (tx.logs[i].topics[0] === ERC1155_TRANSFER_EVENT_HASH) {
				erc1155CaptureLogs(tx.logs[i]);
			} else if (tx.logs[i].topics[0] === ERC1155_BATCH_TRANSFER_EVENT_HASH) {
				erc1155BatchCaptureLogs(tx.logs[i]);
			} else if (
				tx.logs[i].topics[0] === SALE_EVENT_HASH ||
				tx.logs[i].topics[0] === OFFER_EVENT_HASH ||
				tx.logs[i].topics[0] === AUCTION_EVENT_HASH ||
				tx.logs[i].topics[0] === BID_EVENT_HASH
			) {
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
