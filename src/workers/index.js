// worker.js
import amqp from "amqplib";
import { env } from "../configs/env.js";
import { sendEmail } from "../services/emailService.js";
import { runQuery } from "../services/queryService.js";

export async function startWorker() {
	try {
		// 1. konek ke RabbitMQ
		const connection = await amqp.connect(env.rabbitUrl);
		const channel = await connection.createChannel();

		// 2. buat exchange tipe topic
		const exchangeName = "zapp-events";
		await channel.assertExchange(exchangeName, "topic", { durable: true });

		// 3. buat queue
		const queueName = "user-events";
		await channel.assertQueue(queueName, { durable: true });

		// 4. binding queue ke exchange dengan pola routingKey
		await channel.bindQueue(queueName, exchangeName, "users.*");

		// 5. atur QoS (prefetch: berapa pesan max yang diambil per worker)
		channel.prefetch(2);

		console.log("Worker started, waiting for messages...");

		// 6. consume pesan dari queue
		channel.consume(
			queueName,
			async (msg) => {
				if (!msg) return;

				const routingKey = msg.fields.routingKey;
				const content = msg.content.toString();
				const payload = JSON.parse(content);

				console.log("Message received:", routingKey, payload);

				try {
					if (routingKey === "users.query") {
						await runQuery(payload);
					} else if (routingKey === "users.email") {
						await sendEmail(payload);
					} else {
						console.warn("Unknown routingKey:", routingKey);
					}

					// tandai sukses
					channel.ack(msg);
				} catch (err) {
					console.error("Processing failed:", err);

					// tandai gagal → pesan dikembalikan ke queue
					channel.nack(msg, false, true);
					// argumen ke-3 = true → requeue lagi
					// kalau false → pesan dibuang atau masuk DLX kalau ada
				}
			},
			{ noAck: false }, // noAck false artinya kita yang kontrol ack/nack
		);
	} catch (err) {
		console.error("Worker error:", err);
	}
}
