import * as Book from '../models/bookModel.js';

export const createBook = async (req, res) => {
    try {
        const { workspaceId, title } = req.body;
        const gate = await Book.canCreateNotebook(req.user.id);
        if (!gate.allowed) {
            return res.status(403).json({
                error: "Notebook limit reached on free plan. Buy another notebook slot or unlock unlimited.",
                code: "NOTEBOOK_LIMIT_REACHED",
                entitlement: gate.entitlement
            });
        }
        const book = await Book.createBook(workspaceId, title, req.user.id);
        if (!book) return res.status(404).json({ error: "Workspace not found" });
        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBooks = async (req, res) => {
    try {
        const books = await Book.getBooksByWorkspace(req.params.workspaceId, req.user.id);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const getBook = async (req, res) => {
    try {
        const book = await Book.getBookById(req.params.id, req.user.id);
        if (!book) return res.status(404).json({ error: "Book not found" });
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const updateBook = async (req, res) => {
    try {
        const book = await Book.updateBook(req.params.id, req.body, req.user.id);
        if (!book) return res.status(404).json({ error: "Book not found" });
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const deleteBook = async (req, res) => {
    try {
        const rows = await Book.deleteBook(req.params.id, req.user.id);
        if (!rows) return res.status(404).json({ error: "Book not found" });
        res.json({ message: "Book deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getNotebookEntitlement = async (req, res) => {
    try {
        const entitlement = await Book.getNotebookEntitlement(req.user.id);
        res.json(entitlement);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const purchaseNotebookSlot = async (req, res) => {
    try {
        const quantity = Number(req.body?.quantity || 1);
        const entitlement = await Book.purchaseNotebookSlots(req.user.id, quantity);
        res.status(201).json({
            message: `Purchased ${quantity} notebook slot${quantity > 1 ? "s" : ""} (simulated).`,
            entitlement
        });
    } catch (err) {
        if (err.message === "Invalid slot quantity") {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

export const purchaseNotebookUnlimited = async (req, res) => {
    try {
        const entitlement = await Book.unlockNotebookUnlimited(req.user.id);
        res.status(201).json({
            message: "Unlimited notebooks unlocked (simulated).",
            entitlement
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
