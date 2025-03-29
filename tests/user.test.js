/**
 * Integration tests for the User API endpoints.
 */

import request from 'supertest';
import app from '../src/index.js';
import User from '../src/models/users.model.js';
import { db, connectWithRetry, closeConnection } from '../src/services/db.service.js';

/* Test setup and teardown:
 * - `beforeAll`: Establishes a connection to the database before running the tests.
 * - `afterAll`: Closes the database connection after all tests are completed.
 * - `afterEach`: Cleans up the database by removing all users after each test.
 */

beforeAll(async () => {
  await connectWithRetry();
})

afterAll(async () => {
  await closeConnection();
});

afterEach(async () => {
  await User.deleteMany({});
})


/* - `GET /api/users`:
 *   - Returns an error when query parameters `page` and `limit` are not numbers.
 *   - Returns an empty array when no users are present in the database.
 *   - Returns a list of users when users exist in the database.
 */  

describe('GET/api/users', () => {

  it('Should return a invalid query parameters error when page and limit are not numbers', async () => {
    const response = await request(app).get('/api/users?page=abc&limit=xyz');
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual("Invalid query parameters");
  })

  it('Should return an empty array when no users are present', async () => {
    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual("No users found");
    expect(response.body.errors).toEqual(["No users found"]);
  });

  it('Should return a list of users', async () => {
    const users = [
      { name: 'John Doe', email: 'john@example.com', birthday: '1990-01-01', timezone: 'UTC' },
      { name: 'Jane Doe', email: 'jane@example.com', birthday: '1992-02-02', timezone: 'UTC' },
    ];
    await User.insertMany(users);

    const response = await request(app).get('/api/users');
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'John Doe', email: 'john@example.com', birthday: '1990-01-01T00:00:00.000Z', timezone: 'UTC' }),
        expect.objectContaining({ name: 'Jane Doe', email: 'jane@example.com', birthday: '1992-02-02T00:00:00.000Z', timezone: 'UTC' }),
      ])
    );
  });

})

/* - `GET /api/users/:id`:
 *   - Retrieves a user by their unique ID.
 *   - Returns a 404 error if the user with the specified ID is not found.
 */ 
 
describe('GET/api/users/:id', () => {

  it('Should return a user by ID', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    });

    const response = await request(app).get(`/api/users/${user._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: 'John Doe',
        email: 'john@example.com',
        birthday: '1990-01-01T00:00:00.000Z',
        timezone: 'UTC',
      })
    );
  });

  it('Should return a 404 error if user is not found', async () => {
    const nonExistentId = '635f1f1f1f1f1f1f1f1f1f1f';
    const response = await request(app).get(`/api/users/${nonExistentId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual('User not found');
  });

})

/* - `POST /api/users`:
 *   - Successfully creates a new user when valid data is provided.
 *   - Returns a validation error when required fields are missing.
 *   - Returns a 400 error when the provided email is invalid.
 *   - Returns a 409 error when attempting to create a user with an email that already exists.
 */

describe('POST/api/users', () => {

  it('Should create a new user successfully', async () => {
    const newUser = {
      name: 'Alice Smith',
      email: 'alice@example.com',
      birthday: '1995-05-15',
      timezone: 'UTC',
    };

    const response = await request(app).post('/api/users').send(newUser);
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: 'Alice Smith',
        email: 'alice@example.com',
        birthday: '1995-05-15T00:00:00.000Z',
        timezone: 'UTC',
      })
    );

    const userInDb = await User.findOne({ email: 'alice@example.com' });
    expect(userInDb).not.toBeNull();
    expect(userInDb.name).toBe('Alice Smith');
  });

  it('Should return a validation error if required fields are missing', async () => {
    const incompleteUser = {
      email: 'incomplete@example.com',
    };

    const response = await request(app).post('/api/users').send(incompleteUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Name, email, birthday, and timezone are required');
    expect(response.body.errors).toContain('Name, email, birthday, and timezone are required');
  });

  it('Should return a 400 error if email is invalid', async () => {
    const invalidEmailUser = {
      name: 'Invalid Email',
      email: 'invalid-email',
      birthday: '1995-05-15',
      timezone: 'UTC',
    };

    const response = await request(app).post('/api/users').send(invalidEmailUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Invalid request body');
    expect(response.body.errors).toContain('Email is not valid');
  });

  it('Should return a 400 error if birthday is invalid', async () => {
    const invalidBirthDayUser = {
      name: 'Invalid Birthday',
      email: 'invalid-birthday@mail.com',
      birthday: '1995-invalid-date',
      timezone: 'UTC',
    };

    const response = await request(app).post('/api/users').send(invalidBirthDayUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Invalid request body');
    expect(response.body.errors).toContain('Birthday must be in YYYY-MM-DD format');
  })

  it('Should return a 400 error if timezone is invalid', async () => {
    const invalidTimezoneUser = {
      name: 'Invalid Timezone',
      email: 'invalid-timezone@mail.com',
      birthday: '1995-05-15',
      timezone: 'Invalid/Timezone',
    };

    const response = await request(app).post('/api/users').send(invalidTimezoneUser);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Invalid request body');
    expect(response.body.errors).toContain('Invalid timezone');
  })

  it('Should return a 409 error if email already exists', async () => {
    const existingUser = {
      name: 'Existing User',
      email: 'existing@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    };

    await User.create(existingUser);

    const response = await request(app).post('/api/users').send(existingUser);
    expect(response.statusCode).toBe(409);
    expect(response.body.message).toEqual('Email already exists');
  });
});

/* - `PUT /api/users/:id`:
 *   - Successfully updates a user when valid data is provided.
 *   - Returns a 404 error if the user with the specified ID is not found.
 *   - Returns a validation error when required fields are missing or invalid.
 */

describe('PUT/api/users/:id', () => {

  it('Should update a user successfully', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    });

    const updatedData = {
      name: 'John Updated',
      email: 'john.updated@example.com',
      birthday: '1991-01-01',
      timezone: 'UTC',
    };

    const response = await request(app).put(`/api/users/${user._id}`).send(updatedData);
    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        name: 'John Updated',
        email: 'john.updated@example.com',
        birthday: '1991-01-01T00:00:00.000Z',
        timezone: 'UTC',
      })
    );

    const userInDb = await User.findById(user._id);
    expect(userInDb.name).toBe('John Updated');
    expect(userInDb.email).toBe('john.updated@example.com');
  });

  it('Should return a 404 error if user is not found', async () => {
    const nonExistentId = '635f1f1f1f1f1f1f1f1f1f1f';
    const updatedData = {
      name: 'Nonexistent User',
      email: 'nonexistent@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    };

    const response = await request(app).put(`/api/users/${nonExistentId}`).send(updatedData);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual('User not found');
  });

  it('Should return a validation error if required fields are missing', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    });

    const incompleteData = {
      email: 'updated@example.com',
    };

    const response = await request(app).put(`/api/users/${user._id}`).send(incompleteData);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Name, email, birthday, and timezone are required');
    expect(response.body.errors).toContain('Name, email, birthday, and timezone are required');
  });

  it('Should return a 400 error if email is invalid', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    });

    const invalidEmailData = {
      name: 'John Doe',
      email: 'invalid-email',
      birthday: '1990-01-01',
      timezone: 'UTC',
    };

    const response = await request(app).put(`/api/users/${user._id}`).send(invalidEmailData);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Invalid request body');
    expect(response.body.errors).toContain('Email is not valid');
  });

  it('Should return a 400 error if birthday is invalid', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    });

    const invalidBirthdayData = {
      name: 'John Doe',
      email: 'john@example.com',
      birthday: 'invalid-date',
      timezone: 'UTC',
    };

    const response = await request(app).put(`/api/users/${user._id}`).send(invalidBirthdayData);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Invalid request body');
    expect(response.body.errors).toContain('Birthday must be in YYYY-MM-DD format');
  });

  it('Should return a 400 error if timezone is invalid', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    });

    const invalidTimezoneData = {
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'Invalid/Timezone',
    };

    const response = await request(app).put(`/api/users/${user._id}`).send(invalidTimezoneData);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Invalid request body');
    expect(response.body.errors).toContain('Invalid timezone');
  });
});

/* - `DELETE /api/users/:id`:
 *   - Successfully deletes a user when a valid ID is provided.
 *   - Returns a 404 error if the user with the specified ID is not found.
 */

describe('DELETE/api/users/:id', () => {

  it('Should delete a user successfully', async () => {
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      birthday: '1990-01-01',
      timezone: 'UTC',
    });

    const response = await request(app).delete(`/api/users/${user._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toEqual('User deleted successfully');

    const userInDb = await User.findById(user._id);
    expect(userInDb).toBeNull();
  });

  it('Should return a 404 error if user is not found', async () => {
    const nonExistentId = '635f1f1f1f1f1f1f1f1f1f1f';
    const response = await request(app).delete(`/api/users/${nonExistentId}`);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual('User not found');
  });

});
