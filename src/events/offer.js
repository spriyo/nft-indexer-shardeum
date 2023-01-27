const Web3 = require("web3");
const { CHAIN } = require("../constants");
const web3 = new Web3();
const { Offer } = require("../models/offer");

const offerStatus = ["created", "accepted", "canceled"]

const handleOfferEvent = async function (log, nft) {
    try {
        const data = web3.eth.abi.decodeParameters(
            ["uint", "uint256", "uint256", "address", "bool"],
            log.data
        );
        const offerStatusCode = web3.utils.hexToNumberString(log.topics[3]);
        if (offerStatusCode === "0") {
            await new Offer({
                offer_id: data[0],
                nft_id: nft._id,
                token_id: nft.token_id,
                amount: data[1],
                createdAt: log.timestamp,
                expireAt: data[2],
                offer_from: data[3],
                contract_address: nft.contract_address,
                market_address: log.address,
                chain_id: CHAIN.chainId,
            }).save();
        } else {
            const offer = await Offer.findOne({
                offer_id: data[0],
                nft_id: nft._id,
                market_address: log.address,
            })
            offer.offer_status = offerStatus[parseInt(offerStatusCode)];
            offer.sold = data[4];
            await offer.save();
        }
    } catch (error) {
        console.log({ "Market Listener: Offer": error.message });
    }
}

module.exports = { handleOfferEvent }