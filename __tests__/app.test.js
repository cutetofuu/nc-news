const request = require("supertest");
const app = require("../app");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const db = require("../db/connection");
const { string } = require("pg-format");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("app", () => {
  describe("GET /api", () => {
    it("200: responds with a string", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ text }) => {
          expect(typeof text).toBe("string");
        });
    });
  });
});

describe("topics", () => {
  describe("GET /api/topics", () => {
    it("200: responds with an array", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics).toBeInstanceOf(Array);
        });
    });
    it("200: responds with all topics with the correct keys", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics).toHaveLength(3);
          topics.forEach((topic) => {
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
  });
});

describe("articles", () => {
  describe("GET /api/articles", () => {
    it("200: responds with an array", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeInstanceOf(Array);
        });
    });
    it("200: responds with all the articles with the correct keys", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(12);
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            });
          });
        });
    });
    it("200: by default, sorts articles by date in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const copyArticles = [...articles];
          const sortedArticles = copyArticles.sort((articleA, articleB) => {
            return (
              new Date(articleB.created_at) - new Date(articleA.created_at)
            );
          });
          expect(articles).toEqual(sortedArticles);
        });
    });
  });

  describe("GET /api/articles (queries)", () => {
    it("200: filters articles by topic", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const copyArticles = [...articles];
          const filteredArticles = copyArticles.filter((article) => {
            return article.topic === "cats";
          });
          expect(articles).toEqual(filteredArticles);
        });
    });
    it("200: responds with an empty array when given a valid topic with no articles", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(0);
          expect(articles).toEqual([]);
        });
    });
    it("404: non-existent topic given", () => {
      return request(app)
        .get("/api/articles?topic=1000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Topic not found");
        });
    });
    it("200: sorts articles by title in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=title")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("title", { descending: true });
        });
    });
    it("200: sorts articles by article_id in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("article_id", { descending: true });
        });
    });
    it("400: invalid sort_by query given", () => {
      return request(app)
        .get("/api/articles?sort_by=invalid_sort_by")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid sort by option given");
        });
    });
    it("200: orders articles in ascending order", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy("created_at", { ascending: true });
        });
    });
    it("400: invalid order query given", () => {
      return request(app)
        .get("/api/articles?order=invalid_order")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid order option given");
        });
    });
  });

  describe("GET /api/articles/:article_id", () => {
    it("200: responds with an object", () => {
      return request(app)
        .get("/api/articles/4")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toBeInstanceOf(Object);
        });
    });
    it("200: responds with an article with the correct keys", () => {
      return request(app)
        .get("/api/articles/4")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
    });
    it("200: responds with an article with the correct specific values", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toEqual({
            author: "butter_bridge",
            title: "Living in the shadow of a great man",
            article_id: 1,
            body: "I find this existence challenging",
            topic: "mitch",
            created_at: article.created_at,
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            comment_count: 11,
          });
        });
    });
    it("400: invalid article id given", () => {
      return request(app)
        .get("/api/articles/banana")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: valid but non-existent article id given", () => {
      return request(app)
        .get("/api/articles/1000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No article found");
        });
    });
  });

  describe("GET /api/articles/:article_id/comments", () => {
    it("200: returns an array", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toBeInstanceOf(Array);
        });
    });
    it("200: responds with all of an article's comments with the correct keys", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(11);
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            });
          });
        });
    });
    it("200: sorts comments by most recent first", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          const copyComments = [...comments];
          const sortedComments = copyComments.sort((commentA, commentB) => {
            return (
              new Date(commentB.created_at) - new Date(commentA.created_at)
            );
          });
          expect(comments).toEqual(sortedComments);
        });
    });
    it("400: invalid article id given", () => {
      return request(app)
        .get("/api/articles/pickle/comments")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: valid but non-existent article id given", () => {
      return request(app)
        .get("/api/articles/999/comments")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No article found");
        });
    });
    it("200: responds with an empty array when given a valid article id with no comments", () => {
      return request(app)
        .get("/api/articles/7/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(0);
          expect(comments).toEqual([]);
        });
    });
  });

  describe("POST /api/articles/:article_id/comments", () => {
    it("201: responds with a comment object", () => {
      const newComment = {
        username: "lurker",
        body: "This is the best article ever!!!",
      };
      return request(app)
        .post("/api/articles/7/comments")
        .send(newComment)
        .expect(201)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toBeInstanceOf(Object);
        });
    });
    it("201: responds with a comment object with the correct keys", () => {
      const newComment = {
        username: "lurker",
        body: "This is the best article ever!!!",
      };
      return request(app)
        .post("/api/articles/7/comments")
        .send(newComment)
        .expect(201)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            article_id: expect.any(Number),
            author: expect.any(String),
            votes: expect.any(Number),
            created_at: expect.any(String),
            body: expect.any(String),
          });
        });
    });
    it("201: responds with the comment object that has been sent", () => {
      const newComment = {
        username: "lurker",
        body: "This is the best article ever!!!",
      };
      return request(app)
        .post("/api/articles/7/comments")
        .send(newComment)
        .expect(201)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toEqual({
            comment_id: 19,
            article_id: 7,
            author: newComment.username,
            votes: 0,
            created_at: comment.created_at,
            body: newComment.body,
          });
        });
    });
    it("400: missing required fields/empty body given", () => {
      return request(app)
        .post("/api/articles/7/comments")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: invalid comment object sent", () => {
      const newComment = {
        username: "rogersop",
        body: null,
      };
      return request(app)
        .post("/api/articles/7/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: invalid article id given", () => {
      const newComment = {
        username: "lurker",
        body: "This is the best article ever!!!",
      };
      return request(app)
        .post("/api/articles/philippines/comments")
        .send(newComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: valid but non-existent article id given", () => {
      const newComment = {
        username: "lurker",
        body: "This is the best article ever!!!",
      };
      return request(app)
        .post("/api/articles/965/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No article found");
        });
    });
    it("404: username given does not exist", () => {
      const newComment = {
        username: "cutetofuu",
        body: "This is an article! :)",
      };
      return request(app)
        .post("/api/articles/7/comments")
        .send(newComment)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Username does not exist");
        });
    });
  });

  describe("PATCH /api/articles/:article_id", () => {
    it("200: responds with an article object", () => {
      const newVotes = {
        inc_votes: 18,
      };
      return request(app)
        .patch("/api/articles/2")
        .send(newVotes)
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toBeInstanceOf(Object);
        });
    });
    it("200: responds with an article object with the correct keys", () => {
      const newVotes = {
        inc_votes: 18,
      };
      return request(app)
        .patch("/api/articles/2")
        .send(newVotes)
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
    });
    it("200: responds with an article object with increased votes", () => {
      const newVotes = {
        inc_votes: 18,
      };
      return request(app)
        .patch("/api/articles/6")
        .send(newVotes)
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toEqual({
            article_id: 6,
            title: "A",
            topic: "mitch",
            author: "icellusedkars",
            body: "Delicious tin of cat food",
            created_at: article.created_at,
            votes: 18,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    it("200: responds with an article object with decreased votes", () => {
      const newVotes = {
        inc_votes: -38,
      };
      return request(app)
        .patch("/api/articles/1")
        .send(newVotes)
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toEqual({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: article.created_at,
            votes: 62,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    it("400: missing required fields/empty body given", () => {
      return request(app)
        .patch("/api/articles/3")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: invalid votes object sent", () => {
      const newVotes = {
        inc_votes: "northcoders",
      };
      return request(app)
        .patch("/api/articles/8")
        .send(newVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: invalid article id given", () => {
      const newVotes = {
        inc_votes: -38,
      };
      return request(app)
        .patch("/api/articles/pickle")
        .send(newVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: valid but non-existent article id given", () => {
      const newVotes = {
        inc_votes: 18,
      };
      return request(app)
        .patch("/api/articles/860")
        .send(newVotes)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("No article found");
        });
    });
  });

  describe("GET /api/users", () => {
    it("200: responds with an array", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users).toBeInstanceOf(Array);
        });
    });
    it("200: responds with all the users with the correct keys", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users).toHaveLength(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});

describe("comments", () => {
  describe("DELETE /api/comments/:comment_id", () => {
    it("204: deletes a comment from the database", () => {
      return request(app).delete("/api/comments/6").expect(204);
    });
    it("400: invalid comment_id given", () => {
      return request(app)
        .delete("/api/comments/invalid_comment_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: valid but non-existent comment_id given", () => {
      return request(app)
        .delete("/api/comments/700")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Comment not found");
        });
    });
  });
});
