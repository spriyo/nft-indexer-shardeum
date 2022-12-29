const Web3 = require("web3");
const { CHAIN } = require("../constants");
const { download } = require("../utils/download");
const { fetchMetadata } = require("../utils/fetchMetadata");
const { getIpfsUrl } = require("../utils/getIpfsUrl");
const ERC721_JSONInterface = require("../contracts/Spriyo.json");

const chain = CHAIN;
const web3 = new Web3(chain.websocketRpcUrl);

process.on("message", async (nft) => {
	const data = await mine(nft);
	process.send(data);
});

const mine = async function (nft) {
	let data = {};
	try {
		const contract = new web3.eth.Contract(
			ERC721_JSONInterface.abi,
			nft.contract_address
		);

		// Fetch TOKENURI (ASYNC)
		let tokenURI = await contract.methods.tokenURI(nft.token_id).call();
		// console.log("METADATA URL: ", tokenURI);

		// Fetch Metadata (ASYNC)
		const response = await fetchMetadata(tokenURI);

		data.metadata_url = tokenURI;
		data.metadata = response ? response.data : {};

		// Download Image (ASYNC)
		let imageUrl = data.metadata.image;
		if (imageUrl) {
			imageUrl = getIpfsUrl(imageUrl);
			const path = `${nft.contract_address}/${nft.token_id}/`;
			data.image = await download(imageUrl, path);
			// console.log(`IMAGE URL: ${data.image}`);
		}

		return { nft, data };
	} catch (e) {
		console.log({ "Transfer Message": e.message });
		return { nft, data };
	}
};
