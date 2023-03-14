const { CHAIN, web3 } = require("../constants");
const { Listing } = require("../models/listing");
const { Sale } = require("../models/sale");

const saleStatus = ["create", "cancel", "complete"];
const tokenType = ["ERC721", "ERC1155"];

const handleSaleEvent = async function (log, nft) {
	try {
		const data = web3.eth.abi.decodeParameters(
			[
				"address",
				"uint256",
				"uint256",
				"uint256",
				"uint256",
				"address",
				"address",
				"bool",
				"uint256",
				"address",
				"uint256",
				"uint128",
				"uint128",
				"uint8",
				"uint8",
			],
			log.data
		);
		log.address = web3.utils.toChecksumAddress(log.address);
		const listingId = web3.utils.hexToNumber(log.topics[1]);
		await new Sale({
			listing_id: listingId,
			nft_id: nft._id,
			token_id: nft.token_id,
			contract_address: nft.contract_address,
			seller: data[6],
			buyer: data[0],
			market_address: log.address,
			boughtAt: log.timestamp,
			chain_id: CHAIN.chainId,
			quantity: data[1],
			currency: data[9],
			pricePerToken: data[10],
			totalAmount: data[2],
			tokenType: tokenType[parseInt(data[14])],
		}).save();
		const availableListingQuantity = data[8];
		const listingStatusCode = saleStatus[parseInt(data[14])];

		const listing = await Listing.findOne({
			listing_id: listingId,
			nft_id: nft._id,
			market_address: log.address,
		});
		listing.sold = data[7];
		listing.status = listingStatusCode;
		listing.quantity = availableListingQuantity;
		await listing.save();
	} catch (error) {
		console.log({ "Market Listener: Sale": error.message });
	}
};

module.exports = { handleSaleEvent };
