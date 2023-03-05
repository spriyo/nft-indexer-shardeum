const { CHAIN, web3 } = require("../constants");
const { Sale } = require("../models/sale");

const saleStatus = ["create", "accept", "update", "cancel"];

const handleSaleEvent = async function (log, nft) {
	try {
		const data = web3.eth.abi.decodeParameters(
			["uint256", "uint256", "address", "bool"],
			log.data
		);
		log.address = web3.utils.toChecksumAddress(log.address);
		const saleStatusCode = web3.utils.hexToNumberString(log.topics[3]);
		console.log(data, saleStatusCode);
		if (saleStatusCode === "0") {
			await new Sale({
				sale_id: data[0],
				nft_id: nft._id,
				token_id: nft.token_id,
				contract_address: nft.contract_address,
				amount: data[1],
				createdAt: log.timestamp,
				seller: data[2],
				market_address: log.address,
				sold: data[3],
				chain_id: CHAIN.chainId,
			}).save();
		} else {
			const sale = await Sale.findOne({
				sale_id: data[0],
				nft_id: nft._id,
				market_address: log.address,
			});
			sale.status = saleStatus[parseInt(saleStatusCode)];
			sale.sold = data[3];
			sale.amount = data[1];
			if (saleStatusCode === "1") {
				sale.boughtAt = log.timestamp;
			}
			await sale.save();
		}
	} catch (error) {
		console.log({ "Market Listener: Sale": error.message });
	}
};

module.exports = { handleSaleEvent };
