"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// GET /api/quotes?page=1&limit=20
router.get('/', async (req, res) => {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Math.min(100, Number(req.query.limit ?? 20));
        const offset = (page - 1) * limit;
        const { rows } = await (0, db_1.query)(`SELECT q.id, q.text, a.name as author_name, b.title as book_title, q.likes, q.created_at
       FROM quotes q
       JOIN authors a ON a.id = q.author_id
       JOIN books b ON b.id = q.book_id
       ORDER BY q.created_at DESC
       LIMIT $1 OFFSET $2`, [limit, offset]);
        res.json({ page, limit, items: rows });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch quotes' });
    }
});
// POST /api/quotes/:id/like
router.post('/:id/like', async (req, res) => {
    try {
        const paramsSchema = zod_1.z.object({ id: zod_1.z.string().regex(/^\d+$/) });
        const { id } = paramsSchema.parse(req.params);
        const { rows } = await (0, db_1.query)('UPDATE quotes SET likes = likes + 1 WHERE id = $1 RETURNING likes', [Number(id)]);
        if (!rows[0]) {
            return res.status(404).json({ error: 'Quote not found' });
        }
        res.json({ likes: rows[0].likes });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        res.status(500).json({ error: 'Failed to like quote' });
    }
});
exports.default = router;
//# sourceMappingURL=quotes.js.map