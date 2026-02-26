import * as Book from '../models/bookModel.js';

export const createBook = async (req, res) => {
    try {
        const { workspaceId, title } = req.body;
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
