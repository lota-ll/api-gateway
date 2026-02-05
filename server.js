const express = require('express');
const app = express();
const port = 8080;

app.use(express.json());

// ВРАЗЛИВІСТЬ: Information Disclosure (розкриття внутрішньої IP через заголовок)
app.use((req, res, next) => {
    res.setHeader('X-Backend-Server', '192.168.100.20');
    res.setHeader('X-Powered-By', 'Express/4.18.2');
    next();
});

// Mock database credentials (HARDCODED CREDENTIALS - Flag #3 part)
// Атакуючий знайде це, якщо отримає доступ до файлів (LFI або через backup)
const DB_CONFIG = {
    host: "192.168.20.20", // CSMS Internal IP
    user: "csms_admin",
    password: "Csms@2024!Secure", // <-- LEAKED CREDENTIALS
    database: "citrineos"
};

// Middleware для "перевірки" API Key (імітація)
const checkAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    // Hardcoded API Key which might be found in Public Web .env
    if (apiKey === 'ec0ch4rg3_4p1_k3y_2024!') {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized: Invalid API Key" });
    }
};

// Mock data for IDOR
const transactions = {
    "101": [{ id: 1, station: "EV-CH-001", kwh: 15.5, cost: 155.0 }],
    "102": [{ id: 2, station: "EV-CH-002", kwh: 45.0, cost: 450.0, note: "Admin charging session" }],
    "999": [{ id: 3, station: "EV-CH-001", kwh: 120.0, cost: 0.0, note: "TEST MODE - FREE CHARGE" }] 
};

// Public Endpoint
app.get('/api/v1/stations', (req, res) => {
    res.json([
        { id: "EV-CH-001", status: "Available", type: "Type 2", location: "Kyiv-Center" },
        { id: "EV-CH-002", status: "Occupied", type: "CCS 2", location: "Kyiv-Mall" }
    ]);
});

// ВРАЗЛИВИЙ ЕНДПОІНТ: IDOR
// Атакуючий змінює user_id і бачить чужі транзакції
app.get('/api/v1/user/transactions', checkAuth, (req, res) => {
    const userId = req.query.user_id;
    
    if (!userId) {
        return res.status(400).json({ error: "Missing user_id parameter" });
    }

    // VULNERABILITY: No check if the authenticated user owns this userId
    const data = transactions[userId];
    
    if (data) {
        res.json({ user_id: userId, transactions: data });
    } else {
        res.status(404).json({ error: "User not found" });
    }
});

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
    console.log(`[DEBUG] DB Connection: postgres://${DB_CONFIG.user}:${DB_CONFIG.password}@${DB_CONFIG.host}:5432/${DB_CONFIG.database}`);
});