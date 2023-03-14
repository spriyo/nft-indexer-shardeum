const mongoose = require("mongoose");
const validator = require("validator");

const ListingSchema = new mongoose.Schema(
	{
		listing_id: {
			type: Number,
			required: true,
		},
		nft_id: {
			type: mongoose.Types.ObjectId,
			ref: "NFT",
			require: true,
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
		sold: {
			type: Boolean,
			required: true,
			default: false,
		},
		status: {
			type: String,
			enum: ["create", "cancel", "complete"],
			default: "create",
		},
		chain_id: {
			type: Number,
			required: true,
			trim: true,
		},
		quantity: {
			type: String,
			required: true,
			default: "1",
		},
		currency: {
			type: String,
			required: true,
			trim: true,
			validate(value) {
				if (!validator.isEthereumAddress(value.toString())) {
					throw new Error("Invalid market contract address");
				}
			},
		},
		pricePerToken: {
			type: String,
			required: true,
		},
		startTimestamp: {
			type: Number,
			required: true,
		},
		endTimestamp: {
			type: Number,
			required: true,
		},
		tokenType: {
			type: String,
			required: true,
			enum: ["ERC721", "ERC1155"],
			default: "ERC721",
		},
	},
	{ timestamps: true }
);

const Listing = new mongoose.model("Listing", ListingSchema);

module.exports = { Listing };
