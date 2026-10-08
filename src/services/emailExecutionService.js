import { QueryTypes } from "sequelize";
import { sequelize } from "../configs/database.js";
import { sendEmail } from "./emailService.js";

// Values of "emailExecutions"."status", the same as the API's enums.emailExecutionStatus.
export const executionStatus = {
	onQueue: "onQueue",
	success: "success",
	failed: "failed",
};

async function getAttachments(emailId, transaction) {
	if (!emailId) return [];

	const rows = await sequelize.query(
		'SELECT "fileName", "mimeType", "fileBuffer" FROM "emailAttachments" WHERE "emailId" = ? ORDER BY "id"',
		{ replacements: [emailId], transaction, type: QueryTypes.SELECT },
	);

	return rows.map((row) => ({
		filename: row.fileName,
		content: row.fileBuffer,
		contentType: row.mimeType,
	}));
}

async function finish(id, status, errorMessage, transaction) {
	await sequelize.query(
		`UPDATE "emailExecutions"
		 SET "status" = ?, "errorMessage" = ?, "attempts" = "attempts" + 1,
		     "sentAt" = CASE WHEN ? = '${executionStatus.success}' THEN NOW() ELSE "sentAt" END,
		     "updatedAt" = NOW()
		 WHERE "id" = ?`,
		{ replacements: [status, errorMessage, status, id], transaction },
	);
}

/**
 * Sends one row of "emailExecutions". The API has already replaced the merge tags, so the row
 * holds the final recipients, subject and body; the attachments are read from the template.
 *
 * The row is locked while it is sent, and only a row that is still on queue is sent, so a
 * message delivered twice never sends the email twice.
 */
export async function processExecution(executionId) {
	const transaction = await sequelize.transaction();

	try {
		const [execution] = await sequelize.query(
			'SELECT * FROM "emailExecutions" WHERE "id" = ? AND "status" = ? FOR UPDATE SKIP LOCKED',
			{
				replacements: [executionId, executionStatus.onQueue],
				transaction,
				type: QueryTypes.SELECT,
			},
		);

		if (!execution) {
			await transaction.commit();
			return { status: "skipped" };
		}

		let status = executionStatus.success;
		let errorMessage = null;

		try {
			await sendEmail({
				to: execution.to,
				cc: execution.cc,
				bcc: execution.bcc,
				subject: execution.subject,
				html: execution.body,
				priority: execution.priority,
				attachments: await getAttachments(execution.emailId, transaction),
			});
		} catch (err) {
			status = executionStatus.failed;
			errorMessage = err.message;
		}

		await finish(execution.id, status, errorMessage, transaction);
		await transaction.commit();

		return { status, errorMessage };
	} catch (err) {
		await transaction.rollback();
		throw err;
	}
}
