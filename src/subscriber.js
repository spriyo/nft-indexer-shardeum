const Web3 = require("web3");
const { default: axios } = require("axios");
const {
	ERC721_TRANSFER_EVENT_HASH,
	ERC1155_TRANSFER_EVENT_HASH,
	ERC1155_BATCH_TRANSFER_EVENT_HASH,
} = require("./constants");

const { CHAIN } = require("./constants");
const chain = CHAIN;
const web3 = new Web3(chain.websocketRpcUrl);

// Listeners
const { ERC721Logger } = require("./ERC721");
const { ERC1155Logger } = require("./ERC1155");
const { ERC1155BatchLogger } = require("./ERC1155Batch");
const { captureContracts } = require("./events/contract");

function timeout(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

class Subscribe {
	_currentCycle = 0;
	_indexingCycle;
	_erc721Logger;
	_erc1155Logger;
	_erc1155BatchLogger;
	_contractLogger;

	constructor({ indexingCycle = 0 }) {
		this._initiate(indexingCycle);
	}

	async _initiate(indexingCycle) {
		if (!indexingCycle || parseInt(indexingCycle) === 0) {
			indexingCycle = await this._getCurrentCycle();
		}
		this._indexingCycle = indexingCycle;
		this._erc721Logger = new ERC721Logger(web3);
		this._erc1155Logger = new ERC1155Logger(web3);
		this._erc1155BatchLogger = new ERC1155BatchLogger(web3);
		this._contractLogger = captureContracts;
		this._listenForCycle();
	}

	async _listenForCycle() {
		try {
			while (true) {
				this._currentCycle = await this._getCurrentCycle();
				console.log(
					`INDEXING CYCLE: ${this._indexingCycle}; NETWORK CYCLE: ${this._currentCycle}`
				);

				let totalTransactions = 0;
				let baseUrlCycleAddress = `${chain.blockExplorerUrls[0]}/api/transaction?startCycle=${this._indexingCycle}&endCycle=${this._indexingCycle}`;
				let req = await axios.get(baseUrlCycleAddress);
				const data = req.data;
				totalTransactions = data.totalTransactions;

				let pageIndex = 1;

				for (var i = 0; i < totalTransactions; i += 10) {
					let filterUrl = baseUrlCycleAddress + "&page=" + pageIndex;
					let req = await axios.get(filterUrl);
					const data = req.data;
					// Contract Indexer
					this._contractLogger.extractContractTransaction(data.transactions);

					for (var k = 0; k < data.transactions.length; k++) {
						let tx = data.transactions[k];
						const tx_logs = tx.wrappedEVMAccount.readableReceipt.logs;
						if (tx_logs && tx_logs.length > 0) {
							for (var j = 0; j < tx_logs.length; j++) {
								let log = tx_logs[j];
								if (log.topics.length === 4) {
									log.timestamp = tx.timestamp;
									log.blockNumber = tx.cycle;
									log.transactionIndex = log.transactionHash;
									log.logIndex = j;
									if (log.topics[0] === ERC721_TRANSFER_EVENT_HASH) {
										this._erc721Logger._captureLogs(log);
									} else if (log.topics[0] === ERC1155_TRANSFER_EVENT_HASH) {
										this._erc1155Logger._captureLogs(log);
									} else if (
										log.topics[0] === ERC1155_BATCH_TRANSFER_EVENT_HASH
									) {
										this._erc1155BatchLogger._captureLogs(log);
									}
								}
							}
						}
					}
					pageIndex++;
				}

				this._indexingCycle++;
				if (this._indexingCycle > this._currentCycle) {
					await timeout(60 * 1000);
				}
			}
		} catch (error) {
			console.log(error)
			console.log({ LISTENER_LISTEN: error.message });
			if (this._indexingCycle > this._currentCycle) {
				await timeout(60 * 1000);
			}
			this._listenForCycle();
		}
	}

	async _getCurrentCycle() {
		let cycle = await web3.eth.getBlockNumber();
		const currentCycle = Math.floor(cycle / 10);
		this._currentCycle = currentCycle;
		return this._currentCycle;
	}
}

module.exports = { Subscribe };
