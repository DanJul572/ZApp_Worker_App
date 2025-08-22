import { build } from "esbuild";

build({
	entryPoints: ["src/index.js"],
	bundle: true,
	platform: "node",
	format: "esm",
	outfile: "dist/bundle.js",
	external: [
		"nodemailer",
		"pg",
		"pg-hstore",
		"rabbitmq-client",
		"sequelize",
		"dotenv-flow",
	],
}).catch(() => process.exit(1));
