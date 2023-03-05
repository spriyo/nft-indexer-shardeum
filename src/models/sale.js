const mongoose = require("mongoose");
const validator = require("validator");

const SaleSchema = new mongoose.Schema(
	{
		sale_id: {
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
		amount: {
			type: String,
			required: true,
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
		boughtAt: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["create", "update", "cancel", "accept"],
			default: "create",
		},
		chain_id: {
			type: Number,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

const Sale = new mongoose.model("Sale", SaleSchema);

module.exports = { Sale };
