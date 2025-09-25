"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const quotes_1 = __importDefault(require("./routes/quotes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express_1.default.json());
// Base route to indicate API is running
app.get('/', (_req, res) => {
    res.json({ message: 'Book Quotes API', docs: '/api' });
});
// API index route to avoid "Cannot GET /api"
app.get('/api', (_req, res) => {
    res.json({ message: 'API root', endpoints: ['/api/quotes', '/api/quotes/:id/like', '/health'] });
});
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/quotes', quotes_1.default);
// Fallback JSON 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map