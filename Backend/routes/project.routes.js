import {Router} from 'express';
const router=Router();
import * as projectController from '../controllers/project.controller.js';
import {body} from 'express-validator';
import * as authMiddleWare from '../middleware/auth.middleware.js';


router.post('/create',
    authMiddleWare.authUser,
    body('name').isString().withMessage('Name is required'),
    projectController.createProject
)

router.get('/all',
    authMiddleWare.authUser,
    projectController.getAllProject
)

router.put('/add-user',
    authMiddleWare.authUser,
    body('projectId').isString().withMessage('Project ID is required'),  
    body('users').isArray({min:1}).withMessage('Users must be an array of string').bail().
    custom((users)=>users.every(user=>typeof user ==='string')).withMessage('Users must be an array of strings'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId',
    authMiddleWare.authUser,
    projectController.getProjectById
)



export default router;