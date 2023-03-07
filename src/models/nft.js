const mongoose = require("mongoose");
const validator = require("validator");
const { utils } = require("web3");

const NftSchema = new mongoose.Schema(
	{
		name: {
			type: String,
		},
		description: {
			type: String,
		},
		image: {
			type: String,
		},
		metadata_url: {
			type: String,
		},
		metadata: {
			type: Object,
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
		token_id: {
			type: String,
			required: true,
		},
		chain_id: {
			type: Number,
			required: true,
			default: "0",
		},
		type: {
			type: String,
			required: true,
			enum: ["721", "1155"],
			default: "721",
		},
	},
	{ timestamps: true }
);

// Pre and Post Check
// Checksum conversion
NftSchema.pre("save", function (next) {
	if (this.isModified("contract_address")) {
		this.contract_address = utils.toChecksumAddress(this.contract_address);
	}
	next();
});

NftSchema.index({ contract_address: 1 }, { background: true });

const NFT = new mongoose.model("Nft", NftSchema);

module.exports = { NFT };
