import { transporter } from "../configs/mailer";

export async function sendEmail({ to, subject, text }) {
	try {
		const info = await transporter.sendMail({
			from: '"Worker Service" <no-reply@example.com>',
			to,
			subject,
			text,
		});
		console.log("Email sent:", info.messageId);
	} catch (err) {
		console.error("Email error:", err);
		throw err;
	}
}
