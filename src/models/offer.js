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
	createdAt: {
		type: Date,
		required: true,
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
				throw new Error("Invalid address");
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
	offer_status: {
		type: String,
		enum: ["created", "accepted", "canceled"],
		default: "created",
		required: true
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

// Pre and Post Check
// Checksum conversion
// All address are converted to checksum address in previous steps before creating offer.

const Offer = new mongoose.model("Offer", OfferSchema);

module.exports = { Offer };
