import projectModel from '../models/project.model.js';
import * as projectServices from '../services/project.service.js';
import { validationResult } from 'express-validator';
import userModel from '../models/user.model.js';

/**
 * @desc Create a new project
 * @route POST /projects/create
 * @access Private
 */
export const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const newProject = await projectServices.createProject({
            name,
            userId: loggedInUser._id
        });

        return res.status(201).json(newProject);
    } catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * @desc Get all projects for the logged-in user
 * @route GET /projects/all
 * @access Private
 */
export const getAllProject = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const allUserProjects = await projectServices.getAllProjectByUserId({
            userId: loggedInUser._id
        });

        return res.status(200).json({ projects: allUserProjects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * @desc Add a user to a project
 * @route POST /projects/add-user
 * @access Private
 */
export const addUserToProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { projectId, users } = req.body;
        const loggedInUser = await userModel.findOne({ email: req.user.email });

        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const project = await projectServices.addUserToProject({
            projectId,
            users,
            userId: loggedInUser._id
        });

        return res.status(200).json({ project });
    } catch (error) {
        console.error("Error adding user to project:", error);
        return res.status(500).json({ error: error.message });
    }
};

/**
 * @desc Get project by ID
 * @route GET /projects/:projectId
 * @access Private
 */
export const getProjectById = async (req, res) => {
    try {
        console.log("Decoded User Data:", req.user); // Debugging log

        if (!req.user || !req.user.id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const { projectId } = req.params;
        if (!projectId) {
            return res.status(400).json({ error: "Project ID is required" });
        }

        const project = await getProjectByIdService(projectId, req.user.id);
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.status(200).json({ project });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
