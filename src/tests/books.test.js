const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

let authorId;
let createdBookId;

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/bookstore_test");

  // Create an author first, since books require a valid author ObjectId
  const authorRes = await request(app)
    .post("/api/authors")
    .send({ name: "Test Author", bio: "Created for testing" });

  authorId = authorRes.body._id || authorRes.body.data?._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Books API", () => {
  it("should add a new book", async () => {
    const res = await request(app).post("/api/books/addBook").send({
      title: `Test Book ${Date.now()}`,
      description: "A book created during testing",
      publishedYear: 2024,
      genre: "Fiction",
      author: authorId,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("CREATED");
    createdBookId = res.body.data.bookId;
  });

  it("should reject adding a book with no author", async () => {
    const res = await request(app).post("/api/books/addBook").send({
      title: "Book Without Author",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should fetch all books", async () => {
    const res = await request(app).get("/api/books");
    expect([200, 204]).toContain(res.statusCode);
  });

  it("should fetch a single book by id", async () => {
    const res = await request(app).get(`/api/books/${createdBookId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");
  });

  it("should update a book", async () => {
    const res = await request(app)
      .patch(`/api/books/update/${createdBookId}`)
      .send({ description: "Updated description" });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");
  });

  it("should delete a book", async () => {
    const res = await request(app).delete(`/api/books/delete/${createdBookId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("OK");
  });

    it("should return 400 for a malformed book id", async () => {
    const res = await request(app).get(`/api/books/not-a-valid-uuid`);
    expect(res.statusCode).toBe(400);
  });

  it("should return 204 for a valid-format but non-existent book id", async () => {
    const res = await request(app).get(`/api/books/00000000-0000-0000-0000-000000000000`);
    expect(res.statusCode).toBe(204);
  });
});