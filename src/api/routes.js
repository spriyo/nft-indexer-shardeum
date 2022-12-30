const router = require("express").Router();
const { updateMetadata } = require("./controller");

router.get("/metadata/:id", updateMetadata);

module.exports = router;
