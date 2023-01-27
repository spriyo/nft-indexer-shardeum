const { utils } = require("web3");
const { NFT } = require("../models/nft");
const { CHAIN, NULL_ADDRESS, web3 } = require("../constants");
const { Log } = require("../models/logs");
const { Owner } = require("../models/owner");
const { Events } = require("../models/event");
const { executeCommand } = require("../pool");

const erc1155CaptureLogs = async function (log) {
	try {
		// Block Timestamp
		// const block = await web3.eth.getBlock(log.blockNumber);

		// Save log
		// log.timestamp = block.timestamp;
		log.logId = `${log.blockNumber}-${log.transactionIndex}-${log.logIndex}`;
		log = await new Log(log).save();

		// Save NFT
		const from = web3.eth.abi.decodeParameter("address", log.topics[2]);
		const to = web3.eth.abi.decodeParameter("address", log.topics[3]);
		// Get Transaction Details (ASYNC)
		const tx = await web3.eth.getTransaction(log.transactionHash);

		const tokenDetails = web3.eth.abi.decodeParameters(
			["uint256", "uint256"],
			log.data
		);
		let supply = parseInt(tokenDetails["1"]);

		// Create NFT
		let nft = await NFT.findOne({
			contract_address: utils.toChecksumAddress(log.address),
			token_id: tokenDetails["0"],
			chain_id: CHAIN.chainId,
		});
		if (!nft) {
			nft = new NFT({
				contract_address: utils.toChecksumAddress(log.address),
				token_id: tokenDetails["0"],
				chain_id: CHAIN.chainId,
				type: "1155",
			});
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
				supply,
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
			supply,
		});

		// Fetch metadata in threads
		// Only fetch data if it is newly minted, i.e.from address should 0x00..00
		if (from === NULL_ADDRESS) {
			executeCommand(nft);
		}
	} catch (error) {
		console.log({ CAPTURE_LOGS_1155: error.message });
	}
};

module.exports = { erc1155CaptureLogs };
