import dotenv from "dotenv-flow";

dotenv.config({
	node_env: process.env.NODE_ENV || "development",
});

const nodeEnv = process.env.NODE_ENV || "development";

export const env = {
	rabbitUrl: process.env.MESSAGE_BROKER_URL,
	// Same name the API publishes to (its config/rabbitmq.js), built from NODE_ENV.
	emailQueue: process.env.EMAIL_QUEUE_NAME || `${nodeEnv}_send_email_queue`,
	emailConcurrency: Number.parseInt(process.env.EMAIL_CONCURRENCY, 10) || 5,
	db: {
		host: process.env.DATABASE_HOST,
		port: process.env.DATABASE_PORT,
		name: process.env.DATABASE_NAME,
		user: process.env.DATABASE_USERNAME,
		password: process.env.DATABASE_PASSWORD,
		driver: process.env.DATABASE_DRIVER,
	},
	email: {
		service: process.env.EMAIL_SERVICE,
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		secure: process.env.EMAIL_SECURE === "true",
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD,
		from: process.env.EMAIL_FROM || '"Worker Service" <no-reply@example.com>',
	},
};
