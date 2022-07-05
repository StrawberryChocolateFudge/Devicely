import nodemailer from "nodemailer";

async function getTransporter() {
  return await nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.EMAILUSER,
      pass: process.env.EMAILPASS,
    },
  });
}

function getMail(to: string, subject: string, text: string) {
  return {
    from: "noreply.devicely.xyz", // sender address
    to, // list of receivers
    subject, // Subject line
    text, // plain text body
    // html body
  };
}

export async function sendMail(to: string, subject: string, text: string) {
  try {
    const transporter = await getTransporter();
    const mail = getMail(to, subject, text);
    let info = await transporter.sendMail(mail);
    console.log(info);
    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.log(err);
  }
}
