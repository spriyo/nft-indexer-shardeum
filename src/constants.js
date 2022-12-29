const Web3 = require("web3");

const SAFETRANSFERFROM_METHODID = "0xb88d4fde";
const ERC721_TRANSFER_EVENT_HASH = Web3.utils.keccak256(
	"Transfer(address,address,uint256)"
);
const ERC1155_TRANSFER_EVENT_HASH = Web3.utils.keccak256(
	"TransferSingle(address,address,address,uint256,uint256)"
);
const ERC1155_BATCH_TRANSFER_EVENT_HASH = Web3.utils.keccak256(
	"TransferBatch(address,address,address,uint256[],uint256[])"
);

const IPFS_REGEX = /^ipfs:\/\//gm;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const CHAINS_CONFIG = {
	GOERLI: {
		chainId: "0x5",
		chainName: "Goerli",
		nativeCurrency: { name: "Goerli ETH", symbol: "GETH", decimals: 18 },
		websocketRpcUrl:
			"wss://goerli.infura.io/ws/v3/5684cb76b31641bfb9109209e457233f",
		blockExplorerUrls: ["https://goerli.etherscan.io"],
	},
	ETHEREUM: {
		chainId: "0x1",
		chainName: "Ethereum",
		nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
		websocketRpcUrl:
			"wss://mainnet.infura.io/ws/v3/5684cb76b31641bfb9109209e457233f",
		blockExplorerUrls: ["https://etherscan.io"],
	},
	POLYGON: {
		chainId: "137",
		chainName: "Polygon",
		nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
		websocketRpcUrl:
			"wss://polygon-mainnet.g.alchemy.com/v2/gH_ctmy9n5INO41To_KPjGMXXM3MSN5P",
		blockExplorerUrls: ["https://polygonscan.com/"],
	},
	MUMBAI: {
		chainId: "80001",
		chainName: "Mumbai",
		nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
		websocketRpcUrl:
			"wss://polygon-mumbai.g.alchemy.com/v2/jGTlLP4Sa_TtTr_PAKM2E7tVQ87Y4gHX",
		blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
	},
};

module.exports = {
	SAFETRANSFERFROM_METHODID,
	ERC721_TRANSFER_EVENT_HASH,
	ERC1155_TRANSFER_EVENT_HASH,
	ERC1155_BATCH_TRANSFER_EVENT_HASH,
	IPFS_REGEX,
	NULL_ADDRESS,
	CHAINS_CONFIG,
};
