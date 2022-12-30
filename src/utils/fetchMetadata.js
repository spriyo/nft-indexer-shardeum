const { default: axios } = require("axios");
const { getIpfsUrl } = require("./getIpfsUrl");

// TODO: Add timeout of 10 seconds
const fetchMetadata = async function (tokenURI, tokenId) {
	try {
		if (!tokenURI || tokenURI === "") return;

		// ERC1155 Standard check
		if (tokenURI.includes("{id}") && tokenId) {
			tokenURI = tokenURI.split("/");
			tokenURI.pop();
			tokenURI.push(`${tokenId}`);
			tokenURI = tokenURI.join("/");
		}
		tokenURI = getIpfsUrl(tokenURI);

		const response = await axios.get(tokenURI);
		return response;
	} catch (error) {
		console.log({ "FETCH METADATA": error.message });
	}
};

module.exports = { fetchMetadata };
