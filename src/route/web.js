import express from 'express';
import homeController from '../controllers/homeController'
import userController from '../controllers/userController'
import doctorsController from '../controllers/doctorsController'

let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage)

    router.get('/crud', homeController.getCRUD)
    router.post('/post-crud', homeController.postCRUD)
    router.get('/get-crud', homeController.displayGetCRUD)

    router.post('/api/login', userController.handleLogin)
    router.get('/api/get-all-users', userController.handleGetAllUsers)
    router.post('/api/create-new-user', userController.handleCreateNewUser)
    router.put('/api/edit-user', userController.handleEditUser)
    router.delete('/api/delete-user', userController.handleDeleteUser)
    router.get('/api/allcode', userController.getAllCode)
    // Doctors
    router.get('/api/top-doctors-home', doctorsController.getTopDoctorsHome)
    router.get('/api/get-all-doctors', doctorsController.getAllDoctors)
    router.post('/api/save-infor-doctor', doctorsController.postInfoDoctor)
    router.get('/api/get-detail-doctor-by-id', doctorsController.getDetailDoctorById)
    router.post('/api/bulk-create-schedule', doctorsController.bulkCreateSchedule)

    return app.use("/", router)
}

module.exports = initWebRoutes;