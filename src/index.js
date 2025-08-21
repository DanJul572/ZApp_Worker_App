import { initDb } from "./configs/database.js";
import { startWorker } from "./workers/index.js";

async function run() {
	await initDb();
	startWorker();
}

run();
