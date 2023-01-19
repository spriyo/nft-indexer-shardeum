const Web3 = require("web3");

const {
	ERC721_TRANSFER_EVENT_HASH,
	ERC1155_TRANSFER_EVENT_HASH,
	ERC1155_BATCH_TRANSFER_EVENT_HASH,
	SALE_EVENT_HASH,
	OFFER_EVENT_HASH,
	AUCTION_EVENT_HASH,
	BID_EVENT_HASH,
} = require("./constants");

const { CHAINS_CONFIG } = require("./constants");
const chain = CHAINS_CONFIG[process.env.CHAIN];
const web3 = new Web3(chain.websocketRpcUrl);

// Listeners
const { ERC721Logger } = require("./ERC721");
const { ERC1155Logger } = require("./ERC1155");
const { ERC1155BatchLogger } = require("./ERC1155Batch");
const { marketEventListener } = require("./events");
let {
	global_indexingBlockNumber,
	global_currentBlockNumber,
	global_listeningToBlock,
} = require("./gloabalVariables");
const { captureContracts } = require("./events/contract");

class Subscribe {
	_erc721Logger;
	_erc1155Logger;
	_erc1155BatchLogger;
	_block_subscriber;

	constructor() {
		this._erc721Logger = new ERC721Logger(web3);
		this._erc1155Logger = new ERC1155Logger(web3);
		this._erc1155BatchLogger = new ERC1155BatchLogger(web3);
		this._listenForBLockHeader();
	}

	async _initiate() {
		try {
			const erc721Logger = this._erc721Logger;
			const erc1155Logger = this._erc1155Logger;
			const erc1155BatchLogger = this._erc1155BatchLogger;
			web3.eth
				.subscribe(
					"logs",
					{
						topics: [
							[
								ERC721_TRANSFER_EVENT_HASH,
								ERC1155_TRANSFER_EVENT_HASH,
								ERC1155_BATCH_TRANSFER_EVENT_HASH,
								SALE_EVENT_HASH,
								OFFER_EVENT_HASH,
								AUCTION_EVENT_HASH,
								BID_EVENT_HASH,
							],
						],
					},
					function (error, _) {
						if (error) console.log("error:", error);
					}
				)
				.on("connected", function (subId) {
					console.log("subid:", subId);
				})
				.on("data", async function (data) {
					// Send logs to indexer's
					if (data.topics.length === 4) {
						if (data.topics[0] === ERC721_TRANSFER_EVENT_HASH) {
							erc721Logger._captureLogs(data);
							console.log(`ERC721 - ${data.transactionHash}`);
						} else if (data.topics[0] === ERC1155_TRANSFER_EVENT_HASH) {
							erc1155Logger._captureLogs(data);
							console.log(`ERC1155 - ${data.transactionHash}`);
						} else if (data.topics[0] === ERC1155_BATCH_TRANSFER_EVENT_HASH) {
							erc1155BatchLogger._captureLogs(data);
							console.log(`ERC1155BATCH - ${data.transactionHash}`);
						} else if (
							data.topics[0] === SALE_EVENT_HASH ||
							data.topics[0] === OFFER_EVENT_HASH ||
							data.topics[0] === AUCTION_EVENT_HASH ||
							data.topics[0] === BID_EVENT_HASH
						) {
							marketEventListener(data);
						}
					}
				})
				.on("error", console.error);
		} catch (e) {
			console.log({ "Listener Message": e.message });
		}
	}

	async _listenForBLockHeader() {
		global_currentBlockNumber = await web3.eth.getBlockNumber();
		if (global_indexingBlockNumber > global_currentBlockNumber) {
			this._initiate();
			captureContracts.initiate();
			return;
		}

		if (!global_listeningToBlock) {
			global_listeningToBlock = true;
			this.indexBlocks();
		}

		this._block_subscriber = web3.eth
			.subscribe("newBlockHeaders", function (error, _) {
				if (error) console.log("error:", error);
			})
			.on("connected", function (subId) {
				console.log("BlockHeader subid:", subId);
			})
			.on("data", async function (blockHeader) {
				global_currentBlockNumber = blockHeader;
			});
	}

	async indexBlocks() {
		try {
			// Get Past Logs (ASYNC)
			const logs = await web3.eth.getPastLogs({
				topics: [ERC721_TRANSFER_EVENT_HASH],
				fromBlock: global_indexingBlockNumber,
				toBlock: global_indexingBlockNumber,
			});
			captureContracts.extractContractTransaction(global_indexingBlockNumber);

			console.log(
				`Block: ${global_indexingBlockNumber}; Total Transfers: ${logs.length}`
			);

			for (var i = 0; i < logs.length; i++) {
				// Send logs to indexer's
				if (logs[i].topics.length === 4) {
					if (logs[i].topics[0] === ERC721_TRANSFER_EVENT_HASH) {
						this._erc721Logger._captureLogs(logs[i]);
						console.log(`ERC721 - ${logs[i].transactionHash}`);
					} else if (logs[i].topics[0] === ERC1155_TRANSFER_EVENT_HASH) {
						this._erc1155Logger._captureLogs(logs[i]);
						console.log(`ERC1155 - ${logs[i].transactionHash}`);
					} else if (logs[i].topics[0] === ERC1155_BATCH_TRANSFER_EVENT_HASH) {
						this._erc1155BatchLogger._captureLogs(logs[i]);
						console.log(`ERC1155BATCH - ${logs[i].transactionHash}`);
					}
				}
			}
			global_indexingBlockNumber++;

			if (global_indexingBlockNumber > global_currentBlockNumber) {
				this._block_subscriber.unsubscribe();
				global_listeningToBlock = false;
				this._initiate();
				captureContracts.initiate();
			} else {
				this.indexBlocks();
			}
		} catch (error) {
			global_indexingBlockNumber++;
			this.indexBlocks();
			console.log({ "Block Listener": error.message });
		}
	}
}

module.exports = { Subscribe };
