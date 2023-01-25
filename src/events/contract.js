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
	async extractContractTransaction(txs) {
		try {
			let transactions = txs.filter(
				(tx) => !tx.wrappedEVMAccount.readableReceipt.to
			);
			// console.log(block, transactions[0]);

			transactions.forEach(async function (tx) {
				const contractAddress =
					tx.wrappedEVMAccount.readableReceipt.contractAddress;
				try {
					// Save Contract
					const contractExist = await Contract.findOne({
						address: contractAddress,
					});
					if (!contractExist) {
						const { name, symbol } = await getNameAndSymbol(contractAddress);

						const contract = new Contract({
							address: contractAddress,
							symbol,
							creator: tx.txFrom,
							transaction_hash: tx.txHash,
							name,
							chain_id: CHAIN.chainId,
							timestamp: tx.timestamp,
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
