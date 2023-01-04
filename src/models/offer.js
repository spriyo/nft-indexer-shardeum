const mongoose = require("mongoose");
const validator = require("validator");

const OfferSchema = new mongoose.Schema({
	offer_id: {
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
	amount: {
		type: String,
		required: true,
		trim: true,
	},
	expireAt: {
		type: Date,
		required: true,
	},
	offer_from: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (!validator.isEthereumAddress(value.toString())) {
				throw new Error("Invalid nft contract address");
			}
		},
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
	offer_status: {
		type: String,
		enum: ["created", "accepted", "declined"],
		default: "created",
	},
	sold: {
		type: Boolean,
		required: true,
		default: false,
	},
	chain_id: {
		type: Number,
		required: true,
		trim: true,
	},
});

const Offer = new mongoose.model("Offer", OfferSchema);

module.exports = { Offer };
