const mongoose = require("mongoose");
const validator = require("validator");

const BidSchema = new mongoose.Schema(
	{
		auction_id: {
			type: mongoose.Types.ObjectId,
			ref: "Auction",
			required: true,
		},
		auctionId: {
			type: String,
			required: true,
		},
		nft_id: {
			type: mongoose.Types.ObjectId,
			ref: "NFT",
			required: true,
		},
		bidder: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft contract address");
				}
			},
		},
		token_id: {
			type: String,
			required: true,
		},
		contract_address: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft contract address");
				}
			},
		},
		market_address: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid market contract address");
				}
			},
		},
		amount: {
			type: String,
			required: true,
		},
		chain_id: {
			type: Number,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

const Bid = new mongoose.model("Bid", BidSchema);

module.exports = { Bid };
