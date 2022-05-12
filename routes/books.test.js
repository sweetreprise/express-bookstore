process.env.NODE_ENV = 'test';
const request = require('supertest');
const app  = require('../app');
const db = require('../db');

let testBook;

beforeEach(async () => {
    const result = await db.query(`INSERT INTO books 
    (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES
    (
        '01',
        'www.test.com',
        'Joana Marie',
        'English',
        100,
        'Test Press',
        'The Book',
        1989
    ) RETURNING *`);
    testBook = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM books`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /books", () => {
    test("Get list of books", async () => {
        const res = await request(app).get(`/books`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ books: [testBook] });
    });
});

describe("GET /books/:isbn", () => {
    test("Get a single book with isbn", async () => {
        const res = await request(app).get(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ book: testBook });
    });
    test("Responds with a 404 for invalid isbn", async () => {
        const res = await request(app).get(`/companies/fakeisbn`);
        expect(res.statusCode).toBe(404);
    })
});

describe("POST /books", () => {
    test("Creates a book", async () => {
        const res = await request(app).post('/books').send({ 
            data: {
                isbn: '02',
                amazon_url: 'www.test.com',
                author: 'John Doe',
                language: "English",
                pages: 100,
                publisher: "Penguin House",
                title: "Penguins are Cool",
                year: 2007
            }
        });
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({
            book: {
                isbn: '02',
                amazon_url: 'www.test.com',
                author: 'John Doe',
                language: "English",
                pages: 100,
                publisher: "Penguin House",
                title: "Penguins are Cool",
                year: 2007
            }
        });
    });
});

describe("PUT /companies", () => {
    test("Updates a book", async () => {
        const res = await request(app).put(`/books/${testBook.isbn}`).send({
            data: {
                amazon_url: 'This is an update test',
                author: 'Haha Test',
                language: "French",
                pages: 200,
                publisher: "Sunrise Publishing",
                title: "Cake Recipes",
                year: 2002
            }
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            book: {
                isbn: '01',
                amazon_url: 'This is an update test',
                author: 'Haha Test',
                language: "French",
                pages: 200,
                publisher: "Sunrise Publishing",
                title: "Cake Recipes",
                year: 2002
            }
        });
    });
    test("Responds with 404 if attempting to update invalid isbn", async () => {
        const res = await request(app).put(`/books/fakeisbn`).send({
            data: {
                amazon_url: 'This is an update test',
                author: 'Haha Test',
                language: "French",
                pages: 200,
                publisher: "Sunrise Publishing",
                title: "Cake Recipes",
                year: 2002
            }
        });
        expect(res.statusCode).toBe(404);
    });
});

describe("DELETE /books", () => {
    test("Deletes a book", async () => {
        const res = await request(app).delete(`/books/${testBook.isbn}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ message: "Book deleted" });
    });
});