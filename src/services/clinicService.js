import db from "../models/index";
require('dotenv').config();

let createNewClinic = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (!data.name || !data.address || !data.imageBase64 || !data.descriptionHTML || !data.descriptionMarkdown) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter!'
                })
            } else {
                await db.Clinic.create({
                    name: data.name,
                    address: data.address,
                    image: data.imageBase64,
                    descriptionHTML: data.descriptionHTML,
                    descriptionMarkdown: data.descriptionMarkdown
                })
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

let getAllClinic = () => {
    return new Promise( async (resolve, reject) => {
        try {
            let data = await db.Clinic.findAll();
            if (data && data.length > 0) {
                data.map(item => {
                    item.image = new Buffer(item.image, 'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode: 0,
                errMessage: "Thành công!",
                data
            })
        } catch (e) {
            reject(e)
        }
    })
}

let getDetailClinicById = (id) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter!'
                })
            } else {
                let data = await db.Clinic.findOne({
                    where: {
                        id: id
                    },
                    attributes: [
                        'descriptionHTML', 'descriptionMarkdown', 'address', 'name'
                    ],
                })
                if (data) {
                    let doctorClinic = [];
                    doctorClinic = await db.Doctor_Infor.findAll({
                        where: {
                            clinicId: id
                        },
                        attributes: [
                            'doctorId', 'provinceId'
                        ],
                    })
                    
                    data.doctorClinic = doctorClinic
                } else data = []
                resolve({
                    errCode: 0,
                    errMessage: 'Thành công!',
                    data: data
                })
            }
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    createNewClinic: createNewClinic,
    getAllClinic: getAllClinic,
    getDetailClinicById: getDetailClinicById
}