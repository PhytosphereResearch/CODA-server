const db = require('../db');

module.exports = {
	async getAuditRecords(tableRecordId, tableName) {
		try {
			const data = await db.auditLogs.findAll({
				where: { table_record_id: tableRecordId, table_name: tableName }, raw: true, })
				return data

		} catch (error) {
			console.log("Error retrieving audit log record", error)
			return [];
		}

	}

}