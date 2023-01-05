const mongoose = require("mongoose");
const validator = require("validator");

const AuctionSchema = new mongoose.Schema(
	{
		auction_id: {
			type: String,
			required: true,
		},
		nft_id: {
			type: mongoose.Types.ObjectId,
			ref: "NFT",
			required: true,
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
		reserve_price: {
			type: String,
			required: true,
			default: "0",
		},
		createdAt: {
			type: Date,
			required: true,
		},
		expireAt: {
			type: Date,
			required: true,
		},
		previous_bidder: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid address");
				}
			},
		},
		current_bidder: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft contract address");
				}
			},
		},
		seller: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid nft owner address");
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
		bids: [
			{
				type: mongoose.Types.ObjectId,
				ref: "Bid",
			},
		],
		sold: {
			type: Boolean,
			required: true,
			default: false,
		},
		status: {
			type: String,
			enum: ["create", "accept", "cancel", "settle"],
			default: "create",
		},
		chain_id: {
			type: Number,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

const Auction = new mongoose.model("Auction", AuctionSchema);

module.exports = { Auction };
