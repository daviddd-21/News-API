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
