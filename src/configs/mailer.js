import nodemailer from "nodemailer";
import { env } from "./env.js";

export const transporter = nodemailer.createTransport({
	host: env.email.host,
	port: env.email.port,
	secure: false,
	auth: {
		user: env.email.user,
		pass: env.email.pass,
	},
});
