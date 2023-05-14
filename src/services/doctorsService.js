import db from '../models/index';
require('dotenv').config();
import _, { reject } from 'lodash'

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE
let getTopDoctorsHome = (limit) => {
    return new Promise( async (resolve, reject) => {
        try {
            let users = await db.User.findAll({ 
                limit: limit,
                where: {roleId: 'R2'},
                order: [["createdAt", "DESC"]],
                attributes: {
                    exclude: ['password']
                },
                include: [
                    { model: db.Allcode, as: 'positionData', attribute: ['valueEn', 'valueVi']},
                    { model: db.Allcode, as: 'genderData', attribute: ['valueEn', 'valueVi']}
                ],
                raw: true,
                nest: true
            })
            resolve({
                errCode: 0,
                data: users
            })
        } catch (e) {
            reject(e);
        }
    })
}

let getAllDoctors = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let doctors = await db.User.findAll({
                where: {roleId: 'R2'},
                attributes: {
                    exclude: ['password', 'image']
                },
            })
            resolve({
                errCode: 0,
                data: doctors
            })
        } catch (e) {
            reject(e);
        }
    })
}

let postInfoDoctor = (inputData) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!inputData.doctorId || !inputData.contentHTML || !inputData.contentMarkdown || !inputData.action || !inputData.selectedPrice || !inputData.selectedPayment || !inputData.selectedProvince || !inputData.nameClinic || !inputData.addressClinic) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter!'
                })
            } else {

                // Upsert to Markdown
                if(inputData.action === 'CREATE') {
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId: inputData.doctorId
                    })
                } else if(inputData.action === 'EDIT') {
                    let doctorMarkdown = await db.Markdown.findOne({
                        where: { doctorId: inputData.doctorId},
                        raw: false
                    })
                    if (doctorMarkdown) {
                        doctorMarkdown.contentHTML = inputData.contentHTML,
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown,
                        doctorMarkdown.description = inputData.description,
                        doctorMarkdown.updatedAt = new Date()

                        await doctorMarkdown.save()
                    }
                }

                // Upsert to Doctor Info
                let doctorInfo = await db.Doctor_Infor.findOne({
                    where: {doctorId: inputData.doctorId},
                    raw: false
                })
                

                if (doctorInfo) {
                    // update
                    doctorInfo.doctorId = inputData.doctorId;
                    doctorInfo.priceId = inputData.selectedPrice;
                    doctorInfo.paymentId = inputData.selectedPayment;
                    doctorInfo.provinceId = inputData.selectedProvince;
                    doctorInfo.addressClinic = inputData.addressClinic;
                    doctorInfo.nameClinic = inputData.nameClinic;
                    doctorInfo.note = inputData.note

                    await doctorInfo.save()
                } else {
                    // create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId: inputData.selectedPrice,
                        paymentId: inputData.selectedPayment,
                        provinceId: inputData.selectedProvince,
                        addressClinic: inputData.addressClinic,
                        nameClinic: inputData.nameClinic,
                        note: inputData.note
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save infor doctor successd!'
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getDetailDoctorById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter!'
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: id
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown']},
                        { model: db.Doctor_Infor, 
                        attributes: { exclude: ['id', 'doctorId']}, 
                        include: [
                            { model: db.Allcode, as: 'priceData', attributes: ['valueEn', 'valueVi']},
                            { model: db.Allcode, as: 'paymentData', attributes: ['valueEn', 'valueVi']},
                            { model: db.Allcode, as: 'provinceData', attributes: ['valueEn', 'valueVi']},
                        ]
                        },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']}
                    ],
                    raw: true,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    errMessage: 'Thành công!',
                    data: data
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let bulkCreateSchedule = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.arrSchedule || !data.doctorId || !data.date) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter!'
                })
            } else {
                let schedule = data.arrSchedule;
                if (schedule && schedule.length > 0) {
                    schedule = schedule.map(item => {
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }

                let existing = await db.Schedule.findAll({ 
                    where: { doctorId: data.doctorId, date: data.date},
                    attribute: ['timeType', 'date', 'doctorId', 'maxNumber'],
                    raw: true
                })

                // if (existing && existing.length > 0) {
                //     existing = existing.map(item => {
                //         item.date = new Date(item.date).getTime();
                //         return item;
                //     })
                // }

                let toCreate = _.differenceWith(schedule, existing, (a, b) => {
                    return a.timeType === b.timeType && +a.date === +b.date
                })

                if (toCreate && toCreate.length > 0) {  
                    await db.Schedule.bulkCreate(toCreate);
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Thành công!'
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getScheduleDoctorByDate = (doctorId, date) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!doctorId || !date) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!"
                })
            } else {
                let data = await db.Schedule.findAll({
                    where: {
                        doctorId: doctorId,
                        date: date
                    },
                    include: [
                        { model: db.Allcode, as: "timeTypeData", attribute: ['valueEn', 'valueVi']},
                        { model: db.User, as: "doctorData", attribute: ['firstName', 'lastName']}
                    ],
                    raw: false,
                    nest: true
                })
                if (!data) data = []
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getExtraInforDoctorById = (doctorId) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!"
                })
            } else {
                let data = await db.Doctor_Infor.findOne({
                    where: {
                        doctorId: doctorId
                    },
                    attributes: { exclude: ['id', 'doctorId']}, 
                    include: [
                        { model: db.Allcode, as: 'priceData', attributes: ['valueEn', 'valueVi']},
                        { model: db.Allcode, as: 'paymentData', attributes: ['valueEn', 'valueVi']},
                        { model: db.Allcode, as: 'provinceData', attributes: ['valueEn', 'valueVi']},
                    ],
                    raw: false,
                    nest: true
                })
                if (!data) data = {}
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

let getProfileDoctorById = (doctorId) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (!doctorId) {
                resolve({
                    errCode: 1,
                    errMessage: "Missing required parameters!"
                })
            } else {
                let data = await db.User.findOne({
                    where: {
                        id: doctorId
                    },
                    attributes: {
                        exclude: ['password']
                    },
                    include: [
                        { model: db.Markdown, attributes: ['description', 'contentHTML', 'contentMarkdown']},
                        { model: db.Doctor_Infor, 
                        attributes: { exclude: ['id', 'doctorId']}, 
                        include: [
                            { model: db.Allcode, as: 'priceData', attributes: ['valueEn', 'valueVi']},
                            { model: db.Allcode, as: 'paymentData', attributes: ['valueEn', 'valueVi']},
                            { model: db.Allcode, as: 'provinceData', attributes: ['valueEn', 'valueVi']},
                        ]
                        },
                        { model: db.Allcode, as: 'positionData', attributes: ['valueEn', 'valueVi']}
                    ],
                    raw: true,
                    nest: true
                })

                if (data && data.image) {
                    data.image = new Buffer(data.image, 'base64').toString('binary');
                }
                if (!data) data = {};
                resolve({
                    errCode: 0,
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    getTopDoctorsHome: getTopDoctorsHome,
    getAllDoctors: getAllDoctors,
    postInfoDoctor: postInfoDoctor,
    getDetailDoctorById: getDetailDoctorById,
    bulkCreateSchedule: bulkCreateSchedule,
    getScheduleDoctorByDate: getScheduleDoctorByDate,
    getExtraInforDoctorById: getExtraInforDoctorById,
    getProfileDoctorById: getProfileDoctorById
}