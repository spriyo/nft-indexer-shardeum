const { fork } = require("child_process");
const GenericPool = require("generic-pool");
const { NFT } = require("../models/nft");

const commandProcessorsPool = GenericPool.createPool(
	{
		create: () => {
			const commandProcessor = fork("./src/pool/metadata.js");

			// console.log(`Forked command processor with pid ${commandProcessor.pid}`);

			return commandProcessor;
		},
		destroy: (commandProcessor) => {
			console.log(
				`Destroying command processor with pid ${commandProcessor.pid}`
			);

			commandProcessor.removeAllListeners();
			commandProcessor.kill("SIGKILL");
		},
		validate: (commandProcessor) =>
			commandProcessor.connected && !commandProcessor.killed,
	},
	{
		testOnBorrow: true,
		min: 2, // Depending on your load, set a MINIMUM number of processes that should always be available in the pool
		max: 2, // Depending on your load, set a MAXIMUM number of processes that should always be available in the pool
	}
);

commandProcessorsPool.on("factoryCreateError", (message) =>
	console.log({ POOL: message })
);
commandProcessorsPool.on("factoryDestroyError", (message) =>
	console.log({ POOL: message })
);

async function executeCommand(nft) {
	const commandProcessor = await commandProcessorsPool.acquire();

	try {
		const commandProcessorTask = () => {
			return new Promise((resolve, reject) => {
				// https://nodejs.org/api/child_process.html#child_process_event_error
				commandProcessor.on("error", reject);

				commandProcessor.on("message", async (response) => {
					commandProcessor.removeAllListeners();
					try {
						const { nft, data } = response;
						await NFT.updateOne(
							{ _id: nft._id },
							{
								name: data.metadata.name ?? "",
								description: data.metadata.description ?? "",
								image: data.image ?? "",
								metadata_url: data.metadata_url,
								metadata: data.metadata,
							}
						);
						resolve(true);
					} catch (error) {
						console.log({ "pool.js:86": error.message });
						resolve(false);
					}
				});

				commandProcessor.send(nft);
			});
		};

		await commandProcessorTask();
	} finally {
		// Make sure that the command processor is returned to the pool no matter what happened
		commandProcessorsPool.release(commandProcessor);
	}
}

module.exports = { executeCommand };
