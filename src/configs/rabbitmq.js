import { Connection } from "rabbitmq-client";
import { env } from "./env";

export const rabbit = new Connection(env.rabbitUrl);
rabbit.on("error", (err) => {
	console.log("RabbitMQ connection error", err);
});
rabbit.on("connection", () => {
	console.log("Connection successfully (re)established");
});
