const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '..', '..', 'uploads', 'admin_logs.json');

function readLogs() {
    try {
        if (!fs.existsSync(LOG_FILE)) {
            fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
            fs.writeFileSync(LOG_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(LOG_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading admin logs:", e);
        return [];
    }
}

function writeLog(log) {
    try {
        const logs = readLogs();
        const nextId = Math.max(0, ...logs.map(l => l.id || 0)) + 1;
        const newLog = {
            id: nextId,
            ...log,
            created_at: new Date().toISOString()
        };
        logs.unshift(newLog);
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
        return newLog;
    } catch (e) {
        console.error("Error writing admin log:", e);
        return null;
    }
}

module.exports = {
    readLogs,
    writeLog
};
