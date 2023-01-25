const { utils } = require("web3");
const { NFT } = require("../models/nft");
const { CHAIN, NULL_ADDRESS } = require("../constants");
const { Log } = require("../models/logs");
const { Owner } = require("../models/owner");
const { Events } = require("../models/event");
const { executeCommand } = require("../pool");

class ERC721Logger {
	_indexing = false;

	constructor(web3) {
		this._web3 = web3;
	}

	async _captureLogs(log) {
		try {
			// Block Timestamp
			// const block = await this._web3.eth.getBlock(log.blockNumber);

			// Save log
			// log.timestamp = block.timestamp;
			log.logId = `${log.blockNumber}-${log.transactionIndex}-${log.logIndex}`;
			log = await new Log(log).save();

			// Save NFT
			const to = this._web3.eth.abi.decodeParameter("address", log.topics[2]);
			const from = this._web3.eth.abi.decodeParameter("address", log.topics[1]);
			// Get Transaction Details (ASYNC)
			const tx = await this._web3.eth.getTransaction(log.transactionHash);

			// Create NFT
			let nft = new NFT({
				contract_address: utils.toChecksumAddress(log.address),
				token_id: utils.hexToNumberString(log.topics[3]),
				chain_id: CHAIN.chainId,
			});
			if (from === NULL_ADDRESS) {
				console.log("NEW NFT MINTED", nft.token_id);
			} else {
				const nftExist = await NFT.findOne({
					contract_address: nft.contract_address,
					token_id: nft.token_id,
					chain_id: nft.chain_id,
				});
				if (nftExist) {
					nft = nftExist;
				}
				console.log("NFT TRANSFER", nft.token_id);
			}
			await nft.save();
			// Create Owner
			await Owner.updateOne(
				{ nft_id: nft._id },
				{
					nft_id: nft._id,
					token_id: nft.token_id,
					contract_address: nft.contract_address,
					chain_id: nft.chain_id,
					address: to,
				},
				{ upsert: true }
			);

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
			if (from === NULL_ADDRESS) {
				executeCommand(nft);
			}
		} catch (error) {
			console.log({ CAPTURE_LOGS_721: error.message });
		}
	}
}

module.exports = { ERC721Logger };
