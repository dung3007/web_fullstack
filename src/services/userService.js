import db from '../models/index';
import bcrypt from 'bcrypt'

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise( async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (err) {
            reject(err);
        }
    })
}

let handleUserLogin = (email, password) => {
    return new Promise( async (resolve, reject) => {
        try {
            let userData = {}
            let isExist = await checkUserEmail(email)
            if (isExist) {
                let user = await db.User.findOne({
                    where: {email: email},
                    attributes: ['email', 'roleId', 'password', 'firstName', 'lastName'],
                    raw: true
                })
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password)
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = 'Thành công';
                        delete user.password
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `User's not found`
                }
            } else {
                userData.errCode = 1;
                userData.errMessage = `Your's Email isn't exist in your system. Please try other email addresses.`
                
            }
            resolve(userData);
        } catch (err) {
            reject(err);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise( async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail}
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (err) {
            reject(err)
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let users = ''
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            } 

            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId},
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)
        } catch (err) {
            reject(err)
        }
    })
}

let createNewUser = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email)
            if (check) {
                resolve({
                    errCode: 1,
                    errMessage: 'Your email is already in used, plz try another email!'
                })
            } else {
                let hashPasswordFromBcrypt = await hashUserPassword(data.password)
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phoneNumber,
                    gender: data.gender,
                    roleId: data.role,
                    positionId: data.position,
                    image: data.avatar
                })
    
                resolve({
                    errCode: 0,
                    message: 'Thành công'
                })

            }
        } catch (err) {
            reject(err)
        }
    })
}

let deleteUser = (userId) => {
    return new Promise( async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId },
            })
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: "This user isn't exist"
                })
            }
            await db.User.destroy({
                where: { id: userId }
            })

            resolve({
                errCode: 0,
                message: "The user is deleted successfully"
            })
        } catch (err) {
            reject(err)
        }
    })
}

let updateUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.roleId || !data.positionId || !data.gender) {
                resolve({
                    errCode: 2,
                    errorMessage: "Missing parameters!"
                })
            }
            let user = await db.User.findOne({
                where: {id: data.id},
                raw: false
            })

            if (user) {
                user.firstName = data.firstName,
                user.lastName = data.lastName,
                user.address = data.address,
                user.roleId = data.roleId,
                user.positionId = data.positionId,
                user.gender = data.gender,
                user.phonenumber = data.phoneNumber,
                user.image = data.avatar
                await user.save()
                resolve({
                    errCode: 0,
                    message: "Update the user success!"
                })
            } else {
                resolve({
                    errCode: 1,
                    errorMessage: "User's not found!"
                })
            }
        } catch (err) {
            reject(err)
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (!typeInput) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameters'
                })
            } else {
                let res = {};
                let allCode = await db.Allcode.findAll({
                    where: { type: typeInput }
                });
                res.errCode = 0
                res.data = allCode
                
                resolve(res)
            }
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    handleUserLogin: handleUserLogin,
    getAllUsers: getAllUsers,
    createNewUser: createNewUser,
    deleteUser: deleteUser,
    updateUser: updateUser,
    getAllCodeService: getAllCodeService
}