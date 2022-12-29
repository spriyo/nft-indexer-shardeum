const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
	{
		address: {
			type: String,
			required: true,
		},
		blockHash: {
			type: String,
			required: true,
		},
		blockNumber: {
			type: Number,
			required: true,
		},
		data: {
			type: String,
			required: true,
		},
		topics: [{ type: String }],
		transactionHash: {
			type: String,
			required: true,
		},
		logIndex: {
			type: Number,
			required: true,
		},
		transactionIndex: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: ["pending", "finished"],
			default: "pending",
		},
		logId: {
			type: String,
			required: true,
			unique: true,
		},
		timestamp: {
			type: Number,
			required: true,
		},
	},
	{ timestamps: true }
);

const Log = new mongoose.model("Log", LogSchema);

module.exports = { Log };
