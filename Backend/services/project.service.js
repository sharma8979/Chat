import projectModel from "../models/project.model.js";
import userModel from "../models/user.model.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

/**
 * @desc Create a new project
 * @param {Object} params - { name, userId }
 * @returns {Object} Newly created project
 */
export const createProject = async ({ name, userId }) => {
    if (!name) {
        throw new Error("Project name is required");
    }
    if (!userId) {
        throw new Error("User ID is required");
    }

    try {
        const project = await projectModel.create({
            name,
            users: [userId], // Ensures the creator is added to the project
        });
        return project;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error("Project name must be unique");
        }
        throw error;
    }
};

/**
 * @desc Get all projects associated with a user
 * @param {Object} params - { userId }
 * @returns {Array} List of projects
 */
export const getAllProjectByUserId = async ({ userId }) => {
    if (!userId) {
        throw new Error("User is required");
    }

    const allUserProjects = await projectModel.find({
        users: userId, // ✅ Ensures the user is part of the project
    });

    return allUserProjects;
};


/**
 * @desc Add users to a project
 * @param {Object} params - { projectId, users, userId }
 * @returns {Object} Updated project
 */
export const addUserToProject = async ({ projectId, users, userId }) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    if (!users || !Array.isArray(users) || users.length === 0) {
        throw new Error("Users must be a non-empty array");
    }
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid project ID format");
    }

    // Validate user IDs in the array
    for (const id of users) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid user ID format: ${id}`);
        }
    }

    const project = await projectModel.findOne({
        _id: projectId,
        users: userId, // Ensures only project members can add users
    });

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    // Check if all users exist before adding them
    const existingUsers = await userModel.find({ _id: { $in: users } });
    if (existingUsers.length !== users.length) {
        throw new Error("One or more users do not exist");
    }

    const updatedProject = await projectModel.findByIdAndUpdate(
        projectId,
        {
            $addToSet: {
                users: { $each: users }, // Ensures no duplicate users are added
            },
        },
        { new: true }
    );

    return updatedProject;
};

/**
 * @desc Get project by ID
 * @param {Object} params - { projectId, userId }
 * @returns {Object} Project details
 */
export const getProjectById = async ({ projectId, userId }) => {
    if (!projectId) {
        throw new Error("Project ID is required");
    }
    if (!userId) {
        throw new Error("User ID is required");
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid project ID format");
    }

    const project = await projectModel
        .findOne({
            _id: projectId,
            users: userId, // Ensures only project members can access details
        })
        .populate("users", "name email"); // Fetch user details (name & email)

    if (!project) {
        throw new Error("Project not found or access denied");
    }

    return project;
};
