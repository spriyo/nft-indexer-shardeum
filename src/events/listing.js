const { CHAIN, web3 } = require("../constants");
const { Listing } = require("../models/listing");

const saleStatus = ["create", "cancel", "complete"];
const tokenType = ["ERC721", "ERC1155"];

const handleListingEvent = async function (log, nft) {
	try {
		const data = web3.eth.abi.decodeParameters(
			[
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
		const sold = data[4];
		const saleStatusCode = saleStatus[parseInt(data[11])];
		if (saleStatusCode === "create") {
			await new Listing({
				listing_id: data[0],
				nft_id: nft._id,
				token_id: nft.token_id,
				contract_address: nft.contract_address,
				createdAt: log.timestamp,
				seller: data[3],
				market_address: log.address,
				sold,
				chain_id: CHAIN.chainId,
				quantity: data[5],
				currency: data[6],
				pricePerToken: data[7],
				startTimestamp: data[8],
				endTimestamp: data[9],
				tokenType: tokenType[parseInt(data[10])],
			}).save();
		} else if (saleStatusCode === "cancel") {
			const listing = await Listing.findOne({
				listing_id: data[0],
				nft_id: nft._id,
				market_address: log.address,
			});
			// Cancel Listing
			listing.sold = sold;
            listing.status = saleStatusCode;
			await listing.save();
		}
		// Update Listing
		// TODO: Add update listing logic here
	} catch (error) {
		console.log({ "Market Listener: Listing": error.message });
	}
};

module.exports = { handleListingEvent };
