import { Sequelize } from "sequelize";
import { env } from "./env";

export const sequelize = new Sequelize(
	env.db.name,
	env.db.user,
	env.db.password,
	{
		host: env.db.host,
		dialect: env.db.driver,
		port: env.db.port,
		logging: false,
	},
);

export async function initDb() {
	try {
		await sequelize.authenticate();
		console.log("Database: connection successfully");
	} catch {
		console.error("Database: connection failed");
	}
}
