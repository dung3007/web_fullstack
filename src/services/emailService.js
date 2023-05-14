require('dotenv').config();
import nodemailer from 'nodemailer'

let sendSimpleEmail = async (dataSend) => {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_APP, // generated ethereal user
          pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
      });
    
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: '"Hoang Dung 👻" <hoangdung307198@gmail.com>', // sender address
        to: dataSend.receiveeEmail, // list of receivers
        subject: dataSend.language === 'vi'? "Thông tin đặt lịch khám bệnh" : "Information to book a medical appointment", // Subject line
        // text: "Hello world?", // plain text body
        html: getBodyHTMLEnail(dataSend), // html body
      });
}

let getBodyHTMLEnail = (dataSend) => {
  let result = ''
  if (dataSend.language === 'vi') {
    result = `
        <h3>Xin chào ${dataSend.patientName} </h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên trang Pikachu</p>
        <p>Thông tin đặt lịch khám bệnh</p>
        <div><b>Thời gian: ${dataSend.time}</b></div>
        <div><b>Bác sỹ: ${dataSend.doctorName}</b></div>

        <p>Nếu các thông tin trên là đúng sự thật, vui lòng click vào đường link để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>
        <div>Xin cảm ơn!</div>
    `
  } else {
    result = `
        <h3>Dear ${dataSend.patientName} </h3>
        <p>You received this email because you booked an online medical appointment on the site Pikachu</p>
        <p>Information to book a medical appointment</p>
        <div><b>Time: ${dataSend.time}</b></div>
        <div><b>Doctor: ${dataSend.doctorName}</b></div>

        <p>If the above information is correct, please click on the link to confirm and complete the medical appointment booking procedure.</p>
        <div>
        <a href=${dataSend.redirectLink} target="_blank">Click here</a>
        </div>
        <div>Thank you!</div>
    `
  }
  return result;
}

module.exports = {
    sendSimpleEmail: sendSimpleEmail
}