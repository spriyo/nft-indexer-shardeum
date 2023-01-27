const router = require("express").Router();
const { updateMetadata, createEvent } = require("./controller");

router.get("/metadata/:id", updateMetadata);

router.get("/createEvents/:txid", createEvent);

module.exports = router;
