// src/tests/api.test.js
const request = require('supertest');
const app = require('./../../app.js');


const un = "jane.doe@gmail.com";
const pd = "JaneDoe123";
const fn = "Jane";
const ln = "Doe"


describe('v1/user API', () => {
    let server;
    const payload = {
        "first_name": fn,
        "last_name": ln,
        "password": pd,
        "username": un
    };
    const expectedBody = {
        "first_name": fn,
        "last_name": ln,
        "username": un
    };
    const updatePayload = {
        "first_name": "Jack",
        "last_name": ln,
        "is_verified": true
    }
    const expectedUpdatedBody = {
        "first_name": "Jack",
        "last_name": ln,
        "username": un
    };
    beforeAll(() => {
        const PORT = process.env.PORT || 3000;
        server = app.listen(PORT);
    });
    afterAll((done) => {
        server.close(done);
    });


    //Test 0 - Test database connection
    test('test database connection', async () => {
        const createUserRes = await request(app)
            .get('/healthz');
        expect(createUserRes.statusCode).toEqual(200);
    });

    //Test 1 - Create an account, and using the GET call, validate account exists.
    test('return user details on GET request after user creation', async () => {
        const createUserRes = await request(app)
            .post('/v1/user')
            .auth(un, pd)
            .send(payload);
        expect(createUserRes.statusCode).toEqual(201);


        const getCreatedRes = await request(app)
            .get('/v1/user/self')
            .set('Custom-Header', 'integrationTests') // Add custom header with string
            .auth(un, pd);
        expect(getCreatedRes.statusCode).toEqual(200);


        let userDetails = JSON.parse(getCreatedRes.text);
        delete userDetails.account_created;
        delete userDetails.account_updated;
        delete userDetails.id;
        delete userDetails.is_verified;
        delete userDetails.verificationExpiry;
        delete userDetails.verificationToken;
        expect(userDetails).toEqual(expectedBody);

    });

    // Test 2 - Update the account and using the GET call, validate the account was updated.
    test('return user details on GET request after user update', async () => {


        const updateUser = await request(app)
            .put('/v1/user/self')
            .auth(un, pd)
            .set('Custom-Header', 'integrationTests') // Add custom header with string
            .send(updatePayload);

        const getUpdatedRes = await request(app)
            .get('/v1/user/self')
            .set('Custom-Header', 'integrationTests') // Add custom header with string
            .auth(un, pd);


        expect(getUpdatedRes.statusCode).toEqual(200);
        let newUserDetails = JSON.parse(getUpdatedRes.text);
        delete newUserDetails.account_created;
        delete newUserDetails.account_updated;
        delete newUserDetails.id;
        delete newUserDetails.is_verified;
        delete newUserDetails.verificationExpiry;
        delete newUserDetails.verificationToken;
        expect(newUserDetails).toEqual(expectedUpdatedBody);


    });
});
