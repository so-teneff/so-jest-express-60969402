const express = require("express");
const router = express.Router();
const userService = require("./path/to/user/service");
const jwt = require("./path/to/jwt");
const envVars = require("./path/to/envVars");

router.post("/login", async (req, res, next) => {
  try {
    console.log(req.body);
    const { username, password } = req.body;
    const identity = await userService.getUserInfo(username, password);

    if (!identity.authenticated) {
      return res.json({});
    }

    const requiredTenantId = process.env.TENANT_ID;
    const tenant = identity.tenants.find(it => it.id === requiredTenantId);

    if (requiredTenantId && !tenant) {
      return res.json({});
    }

    const userResponse = {
      ...identity,
      token: jwt.sign(
        identity,
        envVars.getVar(envVars.variables.AUTH_TOKEN_SECRET),
        { expiresIn: "2h" }
      )
    };

    return res.json(userResponse);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
