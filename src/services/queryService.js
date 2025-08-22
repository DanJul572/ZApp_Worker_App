import { sequelize } from "../configs/database";

export async function runQuery(query) {
	try {
		const [results] = await sequelize.query(query);
		console.log("Query executed:", results);
		return results;
	} catch (err) {
		console.error("Query error:", err);
		throw err;
	}
}
