import { initDb } from "./configs/database.js";
import { startEmailWorker } from "./workers/emailWorker.js";
import { startWorker } from "./workers/index.js";

async function run() {
	await initDb();
	startWorker();
	startEmailWorker();
}

run();
