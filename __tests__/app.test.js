const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const fs = require("fs/promises");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => db.end());

describe("/api/topics", () => {
  test("GET:200, responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.topics)).toBe(true);
        expect(body.topics.length > 0).toBe(true);
        body.topics.forEach((topic) => {
          expect(typeof topic).toBe("object");
        });
      });
  });
  test("Each object in the array should have appriopriate properties", () => {
    return request(app)
      .get("/api/topics")
      .then(({ body }) => {
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("/api", () => {
  test("GET:200, responds with an array of objects providing all the available endpoints available", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        return Promise.all([
          body,
          fs.readFile(`${__dirname}/../endpoints.json`, "utf-8"),
        ]);
      })
      .then(([body, expectedEndpoints]) => {
        expect(body.endpoints).toEqual(expectedEndpoints);
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET:200, responds with correct article corresponding with the article_id provided in the endpoint", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 2,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("responds with a 404 and an appriopriate message when given a non-existent article_id", () => {
    return request(app)
      .get("/api/articles/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("responds with a 404 and an appriopriate message when given an invalid article_id", () => {
    return request(app)
      .get("/api/articles/ten")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("/api/articles", () => {
  test("GET:200", () => {
    return request(app).get("/api/articles").expect(200);
  });
  test("responds with an array containing article objects containing all article properties except the body and also include a comment_count property", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article.body).toBe(undefined);
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
  test("should be sorted by date in date in desceding order", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET:200, responds with an array of all the comments of the given article_id in the endpoint sorted by most recent comments", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length > 0).toBe(true);
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
        expect(body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("returns with a 404 status code and an appriopriate message when given an article_id that exists but has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("returns with a 404 status code and an appriopriate message when given a non-existent article_id", () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("returns with a 400 status code and an appriopriate message when given an invalid article_id", () => {
    return request(app)
      .get("/api/articles/twelve/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("POST:201, responds with the posted comment", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "rogersop",
        body: "This was a great read, good article",
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.postedComment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: "This was a great read, good article",
          article_id: 2,
        });
      });
  });
  test("responds with a 404 status code with an appriopriate message when given a non-existent username", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "daviddd_21",
        body: "This was a great read, good article",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username or article does not exist");
      });
  });
  test("responds with a 404 status code with an appriopriate message when given a non-existent article_id", () => {
    return request(app)
      .post("/api/articles/99999/comments")
      .send({
        username: "rogersop",
        body: "This was a great read, good article",
      })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Username or article does not exist");
      });
  });
  test("responds with a 400 status code with an appriopriate message when given an invalid article_id", () => {
    return request(app)
      .post("/api/articles/twelve/comments")
      .send({
        username: "rogersop",
        body: "This was a great read, good article",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("responds with a 400 status code with an appriopriate message when missing a required information in the body", () => {
    return request(app)
      .post("/api/articles/2/comments")
      .send({
        username: "rogersop",
      })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing some required information");
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("PATCH:201, responds with the updated article", () => {
    let originalVotes;
    return request(app)
      .get("/api/articles/2")
      .then(({ body }) => {
        originalVotes = body.article.votes;
      })
      .then(() => {
        return request(app)
          .patch("/api/articles/2")
          .send({ inc_votes: 1 })
          .expect(201)
          .then(({ body }) => {
            expect(body.updatedArticle).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: 2,
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: originalVotes + 1,
              article_img_url: expect.any(String),
            });
          });
      });
  });
  test("responds with a 404 status code and an appriopriate message when given a non existent article_id", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 4 })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("responds with a 400 status code and an appriopriate message when given a invalid article_id", () => {
    return request(app)
      .patch("/api/articles/twelve")
      .send({ inc_votes: 4 })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("responds with a 400 status code and an appriopriate message when given a invalid body", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({ inc_votes: "four" })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
  test("responds with a 400 status code and an appriopriate message when body is missing a required information in the body", () => {
    return request(app)
      .patch("/api/articles/2")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing some required information");
      });
  });
});

describe("/api/comments/:comment_id", () => {
  test("DELETE:204", () => {
    return request(app).delete("/api/comments/2").expect(204);
  });
  test("returns a 404 status code when given a non-exitent comment_id", () => {
    return request(app)
      .delete("/api/comments/99999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
  test("returns a 400 status code when given an invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/eight")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("/api/users", () => {
  test("GET:200", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        expect(body.users.length > 0).toBe(true);
        body.users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("/api/articles?topic", () => {
  test("GET:200, responds with articles filtered by the topic specified in the endpoint", () => {
    const topic = "mitch";
    return request(app)
      .get(`/api/articles?topic=${topic}`)
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
          expect(article.topic).toBe(topic);
        });
      });
  });
  test("GET:200, responds with all articles when topic query is missing", () => {
    return request(app)
      .get(`/api/articles`)
      .expect(200)
      .then(({ body }) => {
        body.articles.forEach((article) => {
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
  test("responds with a 404 status code and an appriopriate message when given a non-existent topic", () => {
    const topic = "football";
    return request(app)
      .get(`/api/articles?topic=${topic}`)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not found");
      });
  });
});

describe("/api/articles/:article_id?comment_count", () => {
  test("GET:200, responds with the specified article with a comment_count included", () => {
    return request(app)
      .get("/api/articles/1?comment_count=true")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 1,
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
          body: expect.any(String),
        });
      });
  });
  test("GET:200, responds with the specified article without a comment_count if omitted in the endpoint", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article.comment_count).toBe(undefined);
        expect(body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 1,
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          body: expect.any(String),
        });
      });
  });
});
