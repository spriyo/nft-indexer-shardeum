const { NFT } = require("../models/nft");
const { executeCommand } = require("../pool");

const updateMetadata = async function (req, res) {
	try {
		const nft_id = req.params.id;
		const nft = await NFT.findById(nft_id);
		if (!nft)
			return res.status(404).send({ message: "NFT not found with given id" });
		executeCommand(nft);
		res.send({
			message: "Added to the queue, check back to find updated metadata!",
		});
	} catch (error) {
		res.status(500).send({ message: error.message });
	}
};

module.exports = {
	updateMetadata,
};
