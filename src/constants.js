const Web3 = require("web3");

const ERC721_TRANSFER_EVENT_HASH =
	"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
// Web3.utils.keccak256("TransferSingle(address,address,address,uint256,uint256)");
const ERC1155_TRANSFER_EVENT_HASH =
	"0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62";
// Web3.utils.keccak256("TransferBatch(address,address,address,uint256[],uint256[])");
const ERC1155_BATCH_TRANSFER_EVENT_HASH =
	"0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb";

// web3.utils.keccak256("EventSale(uint256,uint256,uint256,address,address,bool,uint8)");
const SALE_EVENT_HASH =
	"0x0cd43fd9c12c0b040dc330b451adcefd47851dfa029dec57f23f570054ef4688";
// web3.utils.keccak256("EventOffer(uint256,uint256,uint256,uint256,address,address,bool,uint8)");
const OFFER_EVENT_HASH =
	"0x3d44ddf83a852335fb93dea137ad2410905452f00c66ea62151f153d0a11ae5e";
// web3.utils.keccak256("EventAuction(uint256,uint256,uint256,uint256,address,address,address,address,bool,uint8)")
const AUCTION_EVENT_HASH =
	"0x88e98201e0ee31d381fbbafcc13f7a5a0a8e8203bf21a2eb739fa2388ac87207";
// web3.utils.keccak256("EventBid(uint256,uint256,uint256,address,address)")
const BID_EVENT_HASH =
	"0x7d827aee9861babd4633b901c0e9619a8bf942083be2e2297aaf3dd5e8f7952b";

const IPFS_REGEX = /^ipfs:\/\//gm;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const CHAINS_CONFIG = {
	MUMBAI: {
		chainId: "80001",
		chainName: "Mumbai",
		nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
		websocketRpcUrl:
			"wss://polygon-mumbai.g.alchemy.com/v2/jGTlLP4Sa_TtTr_PAKM2E7tVQ87Y4gHX",
		blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
	},
	GANACHE: {
		chainId: 8545,
		chainName: "Ganache",
		nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
		websocketRpcUrl: "ws://127.0.0.1:8545",
	},
	SHARDEUM20: {
		chainId: "8081",
		chainName: "Shardeum 2.0",
		nativeCurrency: { name: "Shard", symbol: "SHM", decimals: 18 },
		websocketRpcUrl: "https://liberty20.shardeum.org",
		blockExplorerUrls: ["https://explorer-liberty20.shardeum.org"],
	},
	SHARDEUM_BETA: {
		chainId: 8082,
		chainName: "Shardeum Betanet",
		nativeCurrency: { name: "Shard", symbol: "SHM", decimals: 18 },
		websocketRpcUrl: "https://sphinx.shardeum.org",
		blockExplorerUrls: ["https://explorer-sphinx.shardeum.org/"],
	},
};

const CHAIN = CHAINS_CONFIG[process.env.CHAIN];
const web3 = new Web3(CHAIN.websocketRpcUrl);

module.exports = {
	SALE_EVENT_HASH,
	OFFER_EVENT_HASH,
	AUCTION_EVENT_HASH,
	BID_EVENT_HASH,
	ERC721_TRANSFER_EVENT_HASH,
	ERC1155_TRANSFER_EVENT_HASH,
	ERC1155_BATCH_TRANSFER_EVENT_HASH,
	IPFS_REGEX,
	NULL_ADDRESS,
	CHAINS_CONFIG,
	CHAIN,
	web3,
};
