import { initDb } from "./configs/database";
import { startWorker } from "./workers/index";

async function run() {
	await initDb();
	startWorker();
}

run();
