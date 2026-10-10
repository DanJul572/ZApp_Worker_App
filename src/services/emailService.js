import { env } from "../configs/env.js";
import { transporter } from "../configs/mailer.js";

export async function sendEmail({
	to,
	cc,
	bcc,
	subject,
	text,
	html,
	attachments,
	priority,
	headers,
}) {
	try {
		const info = await transporter.sendMail({
			from: env.email.from,
			to,
			cc: cc || undefined,
			bcc: bcc || undefined,
			subject,
			text,
			html,
			attachments,
			priority,
			headers,
		});
		console.log("Email sent:", info.messageId);
		return info;
	} catch (err) {
		console.error("Email error:", err);
		throw err;
	}
}
