const request = require("supertest");
const user = require("../../routes/user");
const express = require("express");
var bodyParser = require("body-parser");

jest.mock(
  "../../routes/path/to/user/service",
  () => ({
    getUserInfo: jest.fn().mockResolvedValue({
      authenticated: true,
      tenants: [
        {
          id: "x12",
          mockInfo: "mock-info-value"
        }
      ],
      mother: "Superwoman",
      father: "Superman"
    })
  }),
  {
    virtual: true
  }
);

jest.mock(
  "../../routes/path/to/jwt",
  () => ({
    sign: jest.fn().mockReturnValue("mock-token-687hu9ji")
  }),
  {
    virtual: true
  }
);

jest.mock(
  "../../routes/path/to/envVars",
  () => ({
    getVar: jest.fn().mockReturnValue("mock-token-secret"),
    variables: {
      AUTH_TOKEN_SECRET: "mock-secret-key"
    }
  }),
  {
    virtual: true
  }
);

const app = express();
app.use(bodyParser.json());
app.use("/api/user", user);

describe("Test user login path", () => {

  let server;
  beforeAll(() => {
    server = app.listen(3000);
  })

  afterAll(() => {
    server.close();
  })

  describe("with tenantId in tenants", () => {
    beforeAll(() => {
      process.env.TENANT_ID = "x12";
    });

    test("If authorized, it should response with authorized JWT token", async () => {
      await request(app)
        .post("/api/user/login")
        .send({
          username: "admin",
          password: "admin"
        })
        .expect(200, {
          authenticated: true,
          tenants: [{ id: "x12", mockInfo: "mock-info-value" }],
          mother: "Superwoman",
          father: "Superman",
          token: "mock-token-687hu9ji"
        });
    });
  });

  describe("with tenantId NOT in tenants", () => {
    beforeAll(() => {
      process.env.TENANT_ID = "asoidj10d1";
    });

    test("If authorized, it should response with authorized JWT token", async () => {
      await request(app)
        .post("/api/user/login")
        .send({
          username: "admin",
          password: "admin"
        })
        .expect(200, {});
    });
  });
});
