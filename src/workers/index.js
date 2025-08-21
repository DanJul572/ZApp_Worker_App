import { rabbit } from "../configs/rabbitmq.js";

export function startWorker() {
	console.log("🚀 Worker started, listening for messages...");
	rabbit.createConsumer(
		{
			queue: "user-events",
			queueOptions: { durable: true },
			qos: { prefetchCount: 2 },
			exchanges: [{ exchange: "my-events", type: "topic" }],
			queueBindings: [{ exchange: "my-events", routingKey: "users.*" }],
		},
		async (msg) => {
			console.log("📩 Message received:", msg);
		},
	);
}
