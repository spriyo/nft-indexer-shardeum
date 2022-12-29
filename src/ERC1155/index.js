const { utils } = require("web3");
const { NFT } = require("../models/nft");
const { CHAIN, NULL_ADDRESS } = require("../constants");
const { Log } = require("../models/logs");
const { Owner } = require("../models/owner");
const { Events } = require("../models/event");

class ERC1155Logger {
	_indexing = false;
	_logs = [];
	_web3;

	constructor(web3) {
		this._web3 = web3;
	}

	async _addLog(log) {
		try {
			this._logs = this._logs.concat(log);
			if (!this._indexing) {
				this._captureLogs();
			}
		} catch (error) {
			console.log({ ERC1155_ADDLOGS: error.message });
		}
	}

	_captureLogs = async function () {
		try {
			this._indexing = true;

			while (this._indexing) {
				let log = this._getLog();
				if (!log) return;
				// Save NFT
				const from = this._web3.eth.abi.decodeParameter(
					"address",
					log.topics[2]
				);
				const to = this._web3.eth.abi.decodeParameter("address", log.topics[3]);
				// Get Transaction Details (ASYNC)
				const tx = await this._web3.eth.getTransaction(log.transactionHash);

				const tokenDetails = this._web3.eth.abi.decodeParameters(
					["uint256", "uint256"],
					log.data
				);
				let supply = parseInt(tokenDetails["1"]);

				// Create NFT
				let nft = new NFT({
					contract_address: utils.toChecksumAddress(log.address),
					token_id: tokenDetails["0"],
					chain_id: CHAIN.chainId,
					type: "1155",
				});
				const nftExist = await NFT.findOne({
					contract_address: nft.contract_address,
					token_id: nft.token_id,
					chain_id: nft.chain_id,
				});
				if (nftExist) {
					nft = nftExist;
					console.log("NFT TRANSFER", nft.token_id);
				} else {
					console.log("NEW NFT MINTED", nft.token_id);
				}
				await nft.save();

				// TODO : Add upsert here
				const owner = await Owner.findOne({
					nft_id: nft._id,
					address: to,
				});
				if (owner) {
					owner.supply += supply;
					await owner.save();
				} else {
					await Owner.create({
						nft_id: nft._id,
						token_id: nft.token_id,
						contract_address: nft.contract_address,
						chain_id: nft.chain_id,
						address: to,
						supply: supply,
					});
				}

				const oldOwner = await Owner.findOne({
					nft_id: nft._id,
					address: from,
				});
				if (oldOwner && oldOwner.address !== NULL_ADDRESS) {
					oldOwner.supply -= supply;
					await oldOwner.save();
				}

				// Block Timestamp
				const block = await this._web3.eth.getBlock(log.blockNumber);

				// Save log
				log.timestamp = block.timestamp;
				log.logId = `${log.blockNumber}-${log.transactionIndex}-${log.logIndex}`;
				log = await new Log(log).save();

				// Create Event
				await Events.create({
					method: tx.input.slice(0, 10),
					input: tx.input,
					from,
					to,
					nft_id: nft._id,
					contract_address: nft.contract_address,
					token_id: nft.token_id,
					chain_id: CHAIN.chainId,
					transaction_hash: log.transactionHash,
					log_id: log._id,
					timestamp: log.timestamp,
					value: tx.value,
				});

				// Fetch metadata in threads
				// Only fetch data if it is newly minted, i.e.from address should 0x00..00
				// if (from === NULL_ADDRESS) {
				// 	executeCommand(nft);
				// }
			}
		} catch (error) {
			console.log({ CAPTURE_LOGS_1155: error.message });
		}
	};

	_getLog() {
		try {
			const log = this._logs.pop();
			if (!log) {
				this._indexing = false;
				return false;
			}
			return log;
		} catch (error) {
			console.log({ GETLOG_1155: error.message });
			return false;
		}
	}
}

module.exports = { ERC1155Logger };
