import nodemailer from "nodemailer";
import { env } from "./env.js";

export const transporter = nodemailer.createTransport({
	host: env.email.host,
	port: Number(env.email.port),
	secure: env.email.secure,
	// A local test server (Mailpit, MailHog) usually needs no login.
	auth: env.email.user
		? {
				user: env.email.user,
				pass: env.email.pass,
			}
		: undefined,
});
