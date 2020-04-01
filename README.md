# Answer to [StackOverflow Question][q]

I have a router with the following route:

```javascript
router.post('/login', async (req, res, next) => {
  try {
    console.log(req.body);
    const { username, password } = req.body;
    const identity = await userService.getUserInfo(username, password);

    if (!identity.authenticated) {
      return res.json({});
    }

    const requiredTenantId = process.env.TENANT_ID;
    const tenant = identity.tenants.find((it) => it.id === requiredTenantId);

    if (requiredTenantId && !tenant) {
      return res.json({});
    }

    const userResponse = {
      ...identity,
      token: jwt.sign(
        identity,
        envVars.getVar(envVars.variables.AUTH_TOKEN_SECRET),
        { expiresIn: '2h' }
      )
    };

    return res.json(userResponse);
  } catch (err) {
    return next(err);
  }
});
```

Which is basically an *asynchronous* function.

This is the working test sample:
   
```javascript
const request = require('supertest');
const user = require('../../routes/user');

describe('Test user login path', () => {
  test('If authorized, it should response with authorized JWT token', () => {
    request(user).
      post('api/user/login/').
      send({
        username: 'admin',
        password: 'admin'
      }).
      expect(200);
  });
});
```

If I add async before the function call and await before `request` user:
```javascript
    test('If authorized, it should response with authorized JWT token', async () => {
        await request(user).
```
the test will fail with the following error:
```bash
    connect ECONNREFUSED 127.0.0.1:80
```
Can somebody explain why it is like that? Because in the router I'm using the asynchronous route function.

[q]: https://stackoverflow.com/questions/60969402/asynchronous-function-call-is-not-working-synchronous-is-working