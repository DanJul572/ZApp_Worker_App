import dotenv from "dotenv-flow";

dotenv.config();

export const env = {
	rabbitUrl: process.env.MESSAGE_BROKER_URL,
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
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD,
	},
};
