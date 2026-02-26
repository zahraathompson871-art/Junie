import * as Book from '../models/book.js';

export const createBook = async (req, res) => {
    try {
        const { workspaceId, title } = req.body;
        const book = await Book.createBook({ workspaceId, title });
        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getBooks = async (req, res) => {
    try {
        const books = await Book.getBooksById(req.params.id);
        if (!books) return res.status(404).json({ error: "Books not found" });
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const getBook = async (req, res) => {
    try {
        const book = await Book.getBookById(req.params.id);
        if (!book) return res.status(404).json({ error: "Book not found" });
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const updateBook = async (req, res) => {
    try {
        const book = await Book.updateBook(req.params.id, req);
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }   
};

export const deleteBook = async (req, res) => {
    try {
        const rows = await Book.deleteBook(req.params.id);
        if (!rows) return res.status(404).json({ error: "Book not found" });
        res.json({ message: "Book deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};