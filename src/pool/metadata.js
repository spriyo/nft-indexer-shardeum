const { download } = require("../utils/download");
const { fetchMetadata } = require("../utils/fetchMetadata");
const { getIpfsUrl } = require("../utils/getIpfsUrl");
const ERC721_JSONInterface = require("../contracts/ERC721.json");
const ERC1155_JSONInterface = require("../contracts/ERC1155.json");
const { web3 } = require("../constants");

process.on("message", async (nft) => {
	const data = await mine(nft);
	process.send(data);
});

const mine = async function (nft) {
	let data = {
		metadata: {},
	};
	try {
		const isERC721 = nft.type === "721";
		const contract = new web3.eth.Contract(
			isERC721 ? ERC721_JSONInterface.abi : ERC1155_JSONInterface.abi,
			nft.contract_address
		);

		// Fetch TOKENURI (ASYNC)
		let tokenURI;
		if (isERC721) {
			tokenURI = await contract.methods.tokenURI(nft.token_id).call();
		} else {
			tokenURI = await contract.methods.uri(nft.token_id).call();
		}
		data.metadata_url = tokenURI;
		// console.log("METADATA URL: ", tokenURI);

		// Fetch Metadata (ASYNC)
		const response = await fetchMetadata(tokenURI);

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
