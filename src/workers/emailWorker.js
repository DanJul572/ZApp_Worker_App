import amqp from "amqplib";
import { env } from "../configs/env.js";
import { processExecution } from "../services/emailExecutionService.js";

const RECONNECT_DELAY_MS = 5000;

function scheduleReconnect() {
	console.log(
		`Email worker: reconnecting in ${RECONNECT_DELAY_MS / 1000} seconds...`,
	);
	setTimeout(startEmailWorker, RECONNECT_DELAY_MS);
}

/**
 * Consumes the send email queue. Each message is { executionId } and points to a row of
 * "emailExecutions" that the API has already filled with a ready-to-send email.
 */
export async function startEmailWorker() {
	let connection;

	try {
		connection = await amqp.connect(env.rabbitUrl);
	} catch (err) {
		console.error("Email worker: RabbitMQ connection failed:", err.message);
		scheduleReconnect();
		return;
	}

	connection.on("error", (err) =>
		console.error("Email worker: RabbitMQ error:", err.message),
	);
	connection.on("close", scheduleReconnect);

	const channel = await connection.createChannel();
	await channel.assertQueue(env.emailQueue, { durable: true });
	channel.prefetch(env.emailConcurrency);

	console.log(`Email worker: waiting for messages on ${env.emailQueue}`);

	channel.consume(
		env.emailQueue,
		async (msg) => {
			if (!msg) return;

			let executionId;
			try {
				({ executionId } = JSON.parse(msg.content.toString()));
			} catch {
				console.error("Email worker: invalid message", msg.content.toString());
				channel.nack(msg, false, false);
				return;
			}

			try {
				const result = await processExecution(executionId);
				console.log(`Email worker: execution ${executionId} ${result.status}`);
				channel.ack(msg);
			} catch (err) {
				// Database errors: the row stays on queue and can be sent again from the
				// email log. Requeueing here would retry the same failure in a loop.
				console.error(`Email worker: execution ${executionId} failed:`, err);
				channel.nack(msg, false, false);
			}
		},
		{ noAck: false },
	);
}
