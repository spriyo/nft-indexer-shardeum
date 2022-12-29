const Web3 = require("web3");

const {
	ERC721_TRANSFER_EVENT_HASH,
	ERC1155_TRANSFER_EVENT_HASH,
	ERC1155_BATCH_TRANSFER_EVENT_HASH,
} = require("./constants");

const { CHAINS_CONFIG } = require("./constants");
const chain = CHAINS_CONFIG[process.env.CHAIN];
const web3 = new Web3(chain.websocketRpcUrl);

const subscribe = async function () {
	try {
		web3.eth
			.subscribe(
				"logs",
				{
					topics: [
						[
							ERC721_TRANSFER_EVENT_HASH,
							ERC1155_TRANSFER_EVENT_HASH,
							ERC1155_BATCH_TRANSFER_EVENT_HASH,
						],
					],
				},
				function (error, _) {
					if (error) console.log("error:", error);
				}
			)
			.on("connected", function (subId) {
				console.log("subid:", subId);
			})
			.on("data", async function (data) {
				if (data.topics[0] === ERC721_TRANSFER_EVENT_HASH) {
					console.log(`ERC721 - ${data.transactionHash}`);
				} else if (data.topics[0] === ERC1155_TRANSFER_EVENT_HASH) {
					console.log(`ERC1155 - ${data.transactionHash}`);
				} else if (data.topics[0] === ERC1155_BATCH_TRANSFER_EVENT_HASH) {
					console.log(`ERC1155BATCH - ${data.transactionHash}`);
				}
			})
			.on("error", console.error);
	} catch (e) {
		console.log({ "Listener Message": e.message });
	}
};

module.exports = { subscribe };
