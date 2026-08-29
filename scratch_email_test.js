import nodemailer from 'nodemailer';

async function test() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'jdomelaurente@gmail.com',
      pass: 'dqot yzzi tnka mpyi',
    },
  });

  try {
    await transporter.verify();
    console.log('Credentials are correct and transporter is ready!');
  } catch (err) {
    console.error('Failed to verify credentials:', err);
  }
}

test();
