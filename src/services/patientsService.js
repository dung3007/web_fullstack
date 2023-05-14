import db from "../models/index";
require('dotenv').config();
import emailService from './emailService'

let postBookAppointment = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            if (!data.email || !data.doctorId || !data.date || !data.timeType || !data.fullName) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing parameter!'
                })
            }  else {
                // upsert patient
                await emailService.sendSimpleEmail({
                    receiveeEmail: data.email,
                    patientName: data.fullName,
                    time: data.timeString,
                    doctorName: data.doctorName,
                    language: data.language,
                    redirectLink: "https://www.youtube.com/watch?v=3ZiOS4-L3fE"
                })
                let user = await db.User.findOrCreate({
                    where: { email: data.email},
                    defaults: {
                        email: data.email,
                        roleId: 'R3'
                    }
                })

                // create a booking record
                if (user && user[0]) {
                    await db.Booking.findOrCreate({
                        where: { patientId: user[0].id},
                        defaults: {
                            statusId: 'S1',
                            doctorId: data.doctorId,
                            patientId: user[0].id,
                            date: data.date,
                            timeType: data.timeType
                        }
                            
                    })
                }

                resolve({
                    errCode: 0,
                    errMessage: 'Save infor patient successed!'
                })
            }
        } catch (err) {
            reject(err)
        }
    })
}

module.exports = {
    postBookAppointment: postBookAppointment
}