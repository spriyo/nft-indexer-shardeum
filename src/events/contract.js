const Web3 = require("web3");
const { Contract } = require("../models/contract");
const NFTJSONInterface = require("../contracts/ERC721.json");
const { CHAIN } = require("../constants");
const web3 = new Web3(CHAIN.websocketRpcUrl);

getNameAndSymbol = async (contract) => {
	try {
		const NFTContract = new web3.eth.Contract(NFTJSONInterface.abi, contract);

		const symbol = await NFTContract.methods.symbol().call();
		const name = await NFTContract.methods.name().call();

		return { name, symbol };
	} catch (e) {
		return { name: contract, symbol: " " };
	}
};

class CaptureContracts {
	initiate() {
		try {
			const extractFunction = this.extractContractTransaction;
			web3.eth
				.subscribe("newBlockHeaders", function (error, _) {
					if (error) console.log("error:", error);
				})
				.on("connected", function (subId) {
					console.log("Contract subid:", subId);
				})
				.on("data", async function (blockHeader) {
					extractFunction(blockHeader.number);
				});
		} catch (e) {
			console.log({ "Contract Events": e.message });
		}
	}

	async extractContractTransaction(blockNumber) {
		try {
			const block = await web3.eth.getBlock(blockNumber, true);
			if (!block || !block.transactions) {
				this.indexing = false;
				this._captureContractLogs();
				return;
			}

			let transactions = block.transactions.filter((tx) => !tx.to);
			// console.log(block, transactions[0]);

			transactions.forEach(async function (tx) {
				try {
					// Get transaction
					const transactionReceipt = await web3.eth.getTransactionReceipt(
						tx.hash
					);
					// Save Contract
					const contractExist = await Contract.findOne({
						address: transactionReceipt.contractAddress,
					});
					if (!contractExist) {
						const { name, symbol } = await getNameAndSymbol(
							transactionReceipt.contractAddress
						);

						const contract = new Contract({
							address: transactionReceipt.contractAddress,
							symbol,
							creator: tx.from,
							transaction_hash: tx.hash,
							name,
							chain_id: CHAIN.chainId,
							timestamp: block.timestamp,
						});
						await contract.save();
					}
				} catch (e) {
					console.log({ "Contract Events:0": e.message });
				}
			});
		} catch (error) {
			console.log({ "Contract Events:1": error.message });
		}
	}
}

const captureContracts = new CaptureContracts();
Object.freeze(captureContracts);

module.exports = { captureContracts };
