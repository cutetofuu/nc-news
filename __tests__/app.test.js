const request = require("supertest");
const app = require("../app");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const db = require("../db/connection");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("app", () => {
  describe("server errors", () => {
    it("404: valid but non-existent path given", () => {
      return request(app)
        .get("/non_existent_path")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Path not found");
        });
    });
  });
  describe("GET /api", () => {
    it("200: responds with an object", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          const { parsedFile } = body;
          expect(typeof parsedFile).toBe("object");
        });
    });
    it("200: responds with all the available API endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          const { parsedFile } = body;
          expect(parsedFile).toMatchObject({
            "GET /api": expect.any(Object),
            "GET /api/topics": expect.any(Object),
            "GET /api/articles": expect.any(Object),
            "GET /api/articles/:article_id": expect.any(Object),
            "GET /api/articles/:article_id/comments": expect.any(Object),
            "POST /api/articles/:article_id/comments": expect.any(Object),
            "POST /api/articles": expect.any(Object),
            "PATCH /api/articles/:article_id": expect.any(Object),
            "GET /api/users": expect.any(Object),
            "GET /api/users/:username": expect.any(Object),
            "DELETE /api/comments/:comment_id": expect.any(Object),
            "PATCH /api/comments/:comment_id": expect.any(Object),
          });
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
    it("200: by default, returns 10 articles", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(10);
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

  describe("GET /api/articles (pagination)", () => {
    it("200: limits the number of articles returned", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(5);
        });
    });
    it("200: responds with the most recent articles when only given a limit", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const copyArticleData = [...testData.articleData];
          const sortedArticles = copyArticleData.sort((articleA, articleB) => {
            return (
              new Date(articleB.created_at) - new Date(articleA.created_at)
            );
          });
          for (let i = 0; i < articles.length; i++) {
            expect(articles[i].title).toEqual(sortedArticles[i].title);
            expect(articles[i].author).toEqual(sortedArticles[i].author);
            expect(articles[i].topic).toEqual(sortedArticles[i].topic);
          }
        });
    });
    it("200: responds with all the articles, when limit number given > number of available articles", () => {
      return request(app)
        .get("/api/articles?limit=20")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toHaveLength(12);
        });
    });
    it("400: invalid limit query given", () => {
      return request(app)
        .get("/api/articles?limit=invalid_query")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid limit option given");
        });
    });
    it("200: responds with the correct articles when only given a page", () => {
      return request(app)
        .get("/api/articles?p=2")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const copyArticleData = [...testData.articleData];
          const sortedArticles = copyArticleData.sort((articleA, articleB) => {
            return (
              new Date(articleB.created_at) - new Date(articleA.created_at)
            );
          });
          const pageTwoArticles = sortedArticles.slice(10, 20);
          for (let i = 0; i < articles.length; i++) {
            expect(articles[i].title).toEqual(pageTwoArticles[i].title);
            expect(articles[i].author).toEqual(pageTwoArticles[i].author);
            expect(articles[i].topic).toEqual(pageTwoArticles[i].topic);
          }
        });
    });
    it("200: responds with the correct articles when given limit and page queries", () => {
      return request(app)
        .get("/api/articles?limit=5&p=2")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const copyArticleData = [...testData.articleData];
          const sortedArticles = copyArticleData.sort((articleA, articleB) => {
            return (
              new Date(articleB.created_at) - new Date(articleA.created_at)
            );
          });
          const pageTwoArticles = sortedArticles.slice(5, 10);
          for (let i = 0; i < articles.length; i++) {
            expect(articles[i].title).toEqual(pageTwoArticles[i].title);
            expect(articles[i].author).toEqual(pageTwoArticles[i].author);
            expect(articles[i].topic).toEqual(pageTwoArticles[i].topic);
          }
        });
    });
    it("200: responds with an empty array when page number given > number of available articles", () => {
      return request(app)
        .get("/api/articles?p=5")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toEqual([]);
        });
    });
    it("400: invalid page query given", () => {
      return request(app)
        .get("/api/articles?p=invalid_query")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid page option given");
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
    it("200: by default, responds with 10 of an article's comments with the correct keys", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(10);
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

  describe("GET /api/articles/:article_id/comments (pagination)", () => {
    it("200: limits the number of comments returned", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(5);
        });
    });
    it("200: responds with the most recent comments when only given a limit", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=5")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          const copyCommentData = [...testData.commentData];
          const sortedComments = copyCommentData.sort((commentA, commentB) => {
            return (
              new Date(commentB.created_at) - new Date(commentA.created_at)
            );
          });
          const filteredComments = sortedComments.filter((comment) => {
            return comment.article_id === 1;
          });

          for (let i = 0; i < comments.length; i++) {
            expect(comments[i].article_id).toBe(filteredComments[i].article_id);
            expect(comments[i].votes).toBe(filteredComments[i].votes);
            expect(comments[i].author).toBe(filteredComments[i].author);
            expect(comments[i].body).toBe(filteredComments[i].body);
          }
        });
    });
    it("200: responds with all the comments, when limit number given > number of available comments", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=20")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toHaveLength(11);
        });
    });
    it("400: invalid limit query given", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=invalid_query")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid limit option given");
        });
    });
    it("200: responds with the correct articles when only given a page", () => {
      return request(app)
        .get("/api/articles/1/comments?p=2")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          const copyCommentData = [...testData.commentData];
          const sortedComments = copyCommentData.sort((commentA, commentB) => {
            return (
              new Date(commentB.created_at) - new Date(commentA.created_at)
            );
          });
          const filteredComments = sortedComments.filter((comment) => {
            return comment.article_id === 1;
          });
          const pageTwoComments = filteredComments.slice(10, 20);

          for (let i = 0; i < comments.length; i++) {
            expect(comments[i].article_id).toEqual(
              pageTwoComments[i].article_id
            );
            expect(comments[i].votes).toEqual(pageTwoComments[i].votes);
            expect(comments[i].author).toEqual(pageTwoComments[i].author);
            expect(comments[i].body).toEqual(pageTwoComments[i].body);
          }
        });
    });
    it("200: responds with an empty array when page number given > number of available comments", () => {
      return request(app)
        .get("/api/articles/1/comments?p=5")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toEqual([]);
        });
    });
    it("400: invalid page query given", () => {
      return request(app)
        .get("/api/articles/1/comments?p=invalid_query")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Invalid page option given");
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

  describe("POST /api/articles", () => {
    it("201: responds with an article object", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Kate loves her cat Pickle",
        body: "Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff.",
        topic: "cats",
        article_img_url:
          "https://www.pexels.com/photo/brown-and-black-cat-37337/",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toBeInstanceOf(Object);
        });
    });
    it("201: responds with an article object with the correct keys", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Kate loves her cat Pickle",
        body: "Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff.",
        topic: "cats",
        article_img_url:
          "https://www.pexels.com/photo/brown-and-black-cat-37337/",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            body: expect.any(String),
            topic: expect.any(String),
            article_img_url: expect.any(String),
            article_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
    });
    it("201: responds with the article object that has been sent", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Kate loves her cat Pickle",
        body: "Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff.",
        topic: "cats",
        article_img_url:
          "https://www.pexels.com/photo/brown-and-black-cat-37337/",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toEqual({
            author: "butter_bridge",
            title: "Kate loves her cat Pickle",
            body: "Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff.",
            topic: "cats",
            article_img_url:
              "https://www.pexels.com/photo/brown-and-black-cat-37337/",
            article_id: 13,
            votes: 0,
            created_at: article.created_at,
            comment_count: 0,
          });
        });
    });
    it("201: article_img_url will default if not provided", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Kate loves her cat Pickle",
        body: "Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff.",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toEqual({
            author: "butter_bridge",
            title: "Kate loves her cat Pickle",
            body: "Kitty ipsum dolor sit amet, shed everywhere shed everywhere stretching attack your ankles chase the red dot, hairball run catnip eat the grass sniff.",
            topic: "cats",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            article_id: 13,
            votes: 0,
            created_at: article.created_at,
            comment_count: 0,
          });
        });
    });
    it("400: missing required fields/empty body given", () => {
      return request(app)
        .post("/api/articles")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: invalid article object given", () => {
      const newArticle = {
        author: "cutetofuu",
        title: 5678910534,
        body: 123456789,
        topic: "invalid topic",
        article_img_url: true,
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
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
});

describe("users", () => {
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
  describe("GET /api/users/:username", () => {
    it("200: responds with a user object", () => {
      return request(app)
        .get("/api/users/icellusedkars")
        .expect(200)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toBeInstanceOf(Object);
        });
    });
    it("200: responds with a user object with the correct keys", () => {
      return request(app)
        .get("/api/users/icellusedkars")
        .expect(200)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toMatchObject({
            username: expect.any(String),
            avatar_url: expect.any(String),
            name: expect.any(String),
          });
        });
    });
    it("404: non-existent username given", () => {
      return request(app)
        .get("/api/users/invalid_username15")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Username does not exist");
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

  describe("PATCH /api/comments/:comment_id", () => {
    it("200: responds with a comment object", () => {
      const newVotes = {
        inc_votes: 27,
      };
      return request(app)
        .patch("/api/comments/9")
        .send(newVotes)
        .expect(200)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toBeInstanceOf(Object);
        });
    });
    it("200: responds with a comment object with the correct keys", () => {
      const newVotes = {
        inc_votes: 27,
      };
      return request(app)
        .patch("/api/comments/9")
        .send(newVotes)
        .expect(200)
        .then(({ body }) => {
          const { comment } = body;
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
    it("200: responds with a comment object with increased votes", () => {
      const newVotes = {
        inc_votes: 27,
      };
      return request(app)
        .patch("/api/comments/9")
        .send(newVotes)
        .expect(200)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toEqual({
            comment_id: 9,
            body: "Superficially charming",
            article_id: 1,
            author: "icellusedkars",
            votes: 27,
            created_at: comment.created_at,
          });
        });
    });
    it("200: responds with a comment object with decreased votes", () => {
      const newVotes = {
        inc_votes: -15,
      };
      return request(app)
        .patch("/api/comments/7")
        .send(newVotes)
        .expect(200)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toEqual({
            comment_id: 7,
            body: "Lobster pot",
            article_id: 1,
            author: "icellusedkars",
            votes: -15,
            created_at: comment.created_at,
          });
        });
    });
    it("400: missing required fields/empty body given", () => {
      return request(app)
        .patch("/api/comments/4")
        .send({})
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: invalid votes object sent", () => {
      const newVotes = {
        inc_votes: "invalid_votes",
      };
      return request(app)
        .patch("/api/comments/7")
        .send(newVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("400: invalid comment id given", () => {
      const newVotes = {
        inc_votes: 46,
      };
      return request(app)
        .patch("/api/comments/invalid_id")
        .send(newVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    });
    it("404: valid but non-existent comment id given", () => {
      const newVotes = {
        inc_votes: 10,
      };
      return request(app)
        .patch("/api/comments/1000")
        .send(newVotes)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Comment not found");
        });
    });
  });
});
