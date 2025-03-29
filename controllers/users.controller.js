import User from "../models/users.model.js";

import { DateTime } from "luxon";
import { scheduleEmail, cancelEmail } from "./agenda.controller.js";

/**
 * Retrieve all users with pagination
 * @route GET /users
 * @group Users - User operations
 * @param {number} page.query - Page number
 * @param {number} limit.query - Number of users per page
 * @param {string} search.query - Search term for filtering users
 * @returns {object} 200 - An array of user objects
 */

export const getUsers = async (req, res) => {
  let { page, limit } = req.query;
  let { search } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  let errors = [];

  // Early return if query parameters are invalid
  if (isNaN(page) || isNaN(limit)) {
    errors.push("Page and limit must be numbers");
  }
  if (page < 1 || limit < 1) {
    errors.push("Page and limit must be greater than 0");
  }
  if (limit > 100) {
    errors.push("Limit cannot exceed 100");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors,
    });
  }

  const skip = (page - 1) * limit;
  const totalUsers = await User.countDocuments();
  const totalPages = Math.ceil(totalUsers / limit);

  if (page > totalPages) {
    return res.status(400).json({
      message: "No users found",
      errors: ["No users found"],
    });
  }

  let users = [];
  if (search) {
    search = search.toLowerCase();
    const regex = new RegExp(search, "i");
    users = await User.find({ name: regex }).skip(skip).limit(limit);
  } else {
    users = await User.find().skip(skip).limit(limit);
  }

  if (users.length === 0) {
    return res.status(400).json({
      message: "No users found",
      errors: ["No users found"],
    });
  }

  return res.status(200).json({
    message: "Users retrieved successfully",
    data: users,
    pagination: {
      page,
      limit,
      totalUsers,
      totalPages,
    },
  });
};

/**
 * Retrieve a user by ID
 * @route GET /users/{id}
 * @group Users - User operations
 * @param {string} id.path.required - User ID
 * @returns {object} 200 - User object
 * @returns {object} 404 - User not found
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  let errors = [];

  // Early return if ID is invalid
  if (!id) {
    errors.push("ID is required");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Invalid parameters",
      errors,
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      errors: ["User not found"],
    });
  }

  return res.status(200).json({
    message: "User retrieved successfully",
    data: user,
  });
}

/**
 * Create a new user
 * @route POST /users
 * @group Users - User operations
 * @param {User.model} user.body.required - User object
 * @returns {object} 201 - User created successfully
 * @returns {object} 400 - Validation errors
 */
export const createUser = async (req, res) => {
  const { name, email, birthday, timezone } = req.body;
  let errors = [];


  // Early return if request body is invalid
  if (!name || !email || !birthday || !timezone) {
    return res.status(400).json({
      message: "Name, email, birthday, and timezone are required",
      errors: ["Name, email, birthday, and timezone are required"],
    });
  }
  if (name.length < 3) {
    errors.push("Name must be at least 3 characters long");
  }
  // Check if email is valid
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email is not valid");
  }
  // Check if bithday is not ISO 8601 format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    errors.push("Birthday must be in YYYY-MM-DD format");
  }
  if (!DateTime.now().setZone(timezone).isValid) {
    errors.push("Invalid timezone");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Invalid request body",
      errors,
    });
  }

  const user = new User({ name, email, birthday, timezone });
  user.save()
    .then(savedUser => {
      // Schedule email job for the user's birthday at 9AM in the user's timezone
      const birthdayDate = DateTime.fromISO(birthday + " 09:00", { zone: timezone });
      const birthdayJobDate = birthdayDate.set({ year: DateTime.now().year }).toJSDate();

      if (birthdayJobDate < DateTime.now().toJSDate()) {
        birthdayJobDate.setFullYear(birthdayJobDate.getFullYear() + 1);
      }

      scheduleEmail(email, name, birthdayJobDate)

      return savedUser
    })
    .then(savedUser => {
      return res.status(201).json({
        message: "User created successfully",
        data: savedUser,
      });
    })
    .catch(error => {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Email already exists",
          errors: ["Email already exists"],
        });
      }
      return res.status(500).json({
        message: "Internal server error",
        errors: [error.message],
      });
    });

}

/**
 * Update a user by ID
 * @route PUT /users/{id}
 * @group Users - User operations
 * @param {string} id.path.required - User ID
 * @param {User.model} user.body.required - User object
 * @returns {object} 200 - User updated successfully
 * @returns {object} 404 - User not found
 */
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, birthday, timezone } = req.body;

  let errors = [];
  // Early return if ID is invalid
  if (!id) {
    return res.status(400).json({
      message: "ID is required",
      errors: ["ID is required"],
    });
  }
  // Early return if request body is invalid
  if (!name || !email || !birthday || !timezone) {
    return res.status(400).json({
      message: "Name, email, birthday, and timezone are required",
      errors: ["Name, email, birthday, and timezone are required"],
    });
  }
  if (name.length < 3) {
    errors.push("Name must be at least 3 characters long");
  }
  // Check if email is valid
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Email is not valid");
  }
  // Check if bithday is not ISO 8601 format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
    errors.push("Birthday must be in YYYY-MM-DD format");
  }
  if (!DateTime.now().setZone(timezone).isValid) {
    errors.push("Invalid timezone");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Invalid request body",
      errors,
    });
  }

  await User.findByIdAndUpdate(id, { name, email, birthday, timezone }, { new: true })
    .then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found",
          errors: ["User not found"],
        });
      }

      return updatedUser
    })
    .then(updatedUser => {
      // Cancel the previous birthday job if it exists
      cancelEmail(updatedUser.email);

      // Schedule a new email job for the updated user's birthday at 9AM in the user's timezone
      const birthdayDate = DateTime.fromISO(birthday + "T09:00:00", { zone: timezone });
      const birthdayJobDate = birthdayDate.set({ year: DateTime.now().year }).toJSDate();

      if (birthdayJobDate < DateTime.now().toJSDate()) {
        birthdayJobDate.setFullYear(birthdayJobDate.getFullYear() + 1);
      }

      scheduleEmail(updatedUser.email, updatedUser.name, birthdayJobDate)

      return updatedUser
    })
    .then(updatedUser => {
      return res.status(200).json({
        message: "User updated successfully",
        data: updatedUser,
      });
    })
    .catch(error => {
      if (error.code === 11000) {
        return res.status(400).json({
          message: "Email already exists",
          errors: ["Email already exists"],
        });
      }
      return res.status(500).json({
        message: "Internal server error",
        errors: [error.message],
      });
    });
}

/**
 * Delete a user by ID
 * @route DELETE /users/{id}
 * @group Users - User operations
 * @param {string} id.path.required - User ID
 * @returns {object} 200 - User deleted successfully
 * @returns {object} 404 - User not found
 */
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  let errors = [];

  // Early return if ID is invalid
  if (!id) {
    errors.push("ID is required");
  }
  if (errors.length > 0) {
    return res.status(400).json({
      message: "Invalid parameters",
      errors,
    });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      errors: ["User not found"],
    });
  }

  return res.status(200).json({
    message: "User deleted successfully",
    data: user,
  });
}