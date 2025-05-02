const nodemailer = require("nodemailer");
const SuperAdmin = require("../src/super-admin/super-admin-model");

const getSuperAdminEmail = async () => {
    try {
        const superAdmin = await SuperAdmin.find();
        return superAdmin[0].email;
    } catch (e) {
    }
}

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_EMAIL_HOST, // Replace with your SMTP server host
    port: process.env.MAIL_EMAIL_PORT, // Replace with your SMTP server port
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_EMAIL_ID, // Replace with your SMTP server username
        pass: process.env.MAIL_EMAIL_PASSWORD, // Replace with your SMTP server password
    },
});

const sendMail = ({ to, subject, html, from = process.env.MAIL_EMAIL_ID }) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: `Anibhavi Creation <${process.env.MAIL_EMAIL_ID}>`,
            to,
            subject,
            html,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
};

exports.sendResetPasswordSuperAdmin = async (data) => {
    const { email, token, user } = data;
    const resetLink =
        process.env.BASE_URL + `/${user}/reset-password/${token}`;

    const body = `
    <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your recovery email</title>
      <style>
          body {
              margin: 0 auto;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
          }
  
          .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              border: 1px solid gainsboro;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
          }
  
          .logo {
              margin-bottom: 20px;
          }
  
          .title {
              font-size: 24px;
              color: black;
              font-weight: 500;
              margin-top: 5%;
              margin-bottom: 5%;
          }
  
          .message {
              font-size: 16px;
              color: #272727;
              margin-bottom: 20px;
              line-height: 1.5;
              text-align: left;
          }
  
          .code {
              font-size: 36px;
              color: black;
              font-weight: 700;
              margin-bottom: 20px;
              letter-spacing: 2px;
          }
  
          .note {
              font-size: 14px;
              color: #272727;
              text-align: left;
              margin-top: 20px;
              margin-bottom: 5%;
              line-height: 1.5;
          }
  
          .footer{
              color: #4a4a4a;
              font-size: 12px;
              max-width: 600px;
              text-align: center;
          }
      </style>
  </head>
  
  <body>
      <div style="margin: 0 auto">
          <div class="container">
              <div class="logo">
                <img src="http://localhost:3000/images/logo.avif" style="width: 180px;">
              </div>
              <div class="title">Reset Password</div>
              <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
              <div class="message">
                  Oredo GPS received a request to <strong>Change Password</strong>.
                  <br><br>
                  Use this link to safely reset your password: ${resetLink}
              </div>
             <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 18-13-6/80, Rajiv Gandhi Nagar, Dastagirnagar, Chandrayangutta- 500005
              Hyderabad, Telangana</p>
          </div>
      </div>
  </body>
  
  </html>
    `

    const subject = "Reset your Password";
    return await sendMail({ to: email, subject, html: body });
};

exports.sendOtpForUserSignup = async (data) => {
    const { otp, email } = data;
    console.log("XXXXXXX", otp, email)
    const body = `
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your recovery email</title>
    <style>
        body {
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            border: 1px solid gainsboro;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }

        .logo {
            margin-bottom: 20px;
        }

        .title {
            font-size: 24px;
            color: black;
            font-weight: 500;
            margin-top: 5%;
            margin-bottom: 5%;
        }

        .message {
            font-size: 16px;
            color: #272727;
            margin-bottom: 20px;
            line-height: 1.5;
            text-align: left;
        }

        .code {
            font-size: 36px;
            color: black;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: 2px;
        }

        .note {
            font-size: 14px;
            color: #272727;
            text-align: left;
            margin-top: 20px;
            margin-bottom: 5%;
            line-height: 1.5;
        }

        .footer{
            color: #4a4a4a;
            font-size: 12px;
            max-width: 600px;
            text-align: center;
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="container">
            <div class="logo">
                <img src="https://localhost:3000/images/logo.avif" style="width: 180px;"
                    alt="Oredo GPS Logo">
            </div>
            <div class="title">Verify your Email</div>
            <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
            <div class="message">
                Oredo GPS has received a request to verify <strong>${email}</strong>.
                <br><br>
                Use this code to safely verify your email:
            </div>
            <div class="code">${otp}</div>
           <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 6-67, Yerrakunta, Chandrayangutta, Hyderabad, Telangana 500005</p>
        </div>
    </div>
</body>

</html>
  `
    const subject = "Verify your Email";
    return await sendMail({ to: email, subject, html: body });
};

exports.sendResetPassword = async (data) => {
    const { email, token, user } = data;
    // ADMIN_BASE_URL
    console.log("token_data:==", email, token);
    const baseUrl =
        user === "admin" ? process.env.ADMIN_BASE_URL : process.env.BASE_URL;
    const resetLink = baseUrl + `/Pages/reset-password/${token}`;

    const body = `
    <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your recovery email</title>
      <style>
          body {
              margin: 0 auto;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
          }
  
          .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #fff;
              border: 1px solid gainsboro;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
          }
  
          .logo {
              margin-bottom: 20px;
          }
  
          .title {
              font-size: 24px;
              color: black;
              font-weight: 500;
              margin-top: 5%;
              margin-bottom: 5%;
          }
  
          .message {
              font-size: 16px;
              color: #272727;
              margin-bottom: 20px;
              line-height: 1.5;
              text-align: left;
          }
  
          .code {
              font-size: 36px;
              color: black;
              font-weight: 700;
              margin-bottom: 20px;
              letter-spacing: 2px;
          }
  
          .note {
              font-size: 14px;
              color: #272727;
              text-align: left;
              margin-top: 20px;
              margin-bottom: 5%;
              line-height: 1.5;
          }
  
          .footer{
              color: #4a4a4a;
              font-size: 12px;
              max-width: 600px;
              text-align: center;
          }
      </style>
  </head>
  
  <body>
      <div style="margin: 0 auto">
          <div class="container">
              <div class="logo">
                  <img src="http://localhost:8000/uploads/logos/logo.png" style="width: 180px;">
              </div>
              <div class="title">Reset Password</div>
              <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
              <div class="message">
                  Anibhavi Creation received a request to <strong>Change Password</strong>.
                  <br><br>
                  Use this link to safely reset your password: ${resetLink}
              </div>
             <p class="footer">All rights reserved © 2024 | Anibhavi Creation | 18-13-6/80, Rajiv Gandhi Nagar, Dastagirnagar, Chandrayangutta- 500005
              Hyderabad, Telangana</p>
          </div>
      </div>
  </body>
  
  </html>
    `;
    const subject = "Reset your Password";
    return await sendMail({ to: email, subject, html: body });
};
// exports.sendVerificationEmailUser = async (data) => {
//     const { username, otp } = data;

//     const body = `
//   <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Verify your recovery email</title>
//     <style>
//         body {
//             margin: 0 auto;
//             padding: 0;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             height: 100vh;
//         }

//         .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #fff;
//             border: 1px solid gainsboro;
//             padding: 20px;
//             border-radius: 8px;
//             text-align: center;
//         }

//         .logo {
//             margin-bottom: 20px;
//         }

//         .title {
//             font-size: 24px;
//             color: black;
//             font-weight: 500;
//             margin-top: 5%;
//             margin-bottom: 5%;
//         }

//         .message {
//             font-size: 16px;
//             color: #272727;
//             margin-bottom: 20px;
//             line-height: 1.5;
//             text-align: left;
//         }

//         .code {
//             font-size: 36px;
//             color: black;
//             font-weight: 700;
//             margin-bottom: 20px;
//             letter-spacing: 2px;
//         }

//         .note {
//             font-size: 14px;
//             color: #272727;
//             text-align: left;
//             margin-top: 20px;
//             margin-bottom: 5%;
//             line-height: 1.5;
//         }

//         .footer{
//             color: #4a4a4a;
//             font-size: 12px;
//             max-width: 600px;
//             text-align: center;
//         }
//     </style>
// </head>

// <body>
//     <div style="margin: 0 auto">
//         <div class="container">
//             <div class="logo">
//                 <img src="https://localhost:3000/images/logo.avif" style="width: 180px;"
//                     alt="Oredo GPS Logo">
//             </div>
//             <div class="title">Verify your Email</div>
//             <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
//             <div class="message">
//                 Oredo GPS received a request to verify <strong>${username}</strong> as a verification process.

//                 <br><br>
//                 Use this code to safely verify your email:
//             </div>
//             <div class="code">${otp}</div>
//            <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 6-67, Yerrakunta, Chandrayangutta, Hyderabad, Telangana 500005</p>
//         </div>
//     </div>
// </body>

// </html>
//   `

//     const subject = "Email Verification";
//     return await sendMail({ to: username, subject, html: body });
// };


// exports.sendEmailUpdateOtp = async (data) => {
//     const { name, otp, email } = data;

//     const body = `
//   <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Verify your recovery email</title>
//     <style>
//         body {
//             margin: 0 auto;
//             padding: 0;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             height: 100vh;
//         }

//         .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #fff;
//             border: 1px solid gainsboro;
//             padding: 20px;
//             border-radius: 8px;
//             text-align: center;
//         }

//         .logo {
//             margin-bottom: 20px;
//         }

//         .title {
//             font-size: 24px;
//             color: black;
//             font-weight: 500;
//             margin-top: 5%;
//             margin-bottom: 5%;
//         }

//         .message {
//             font-size: 16px;
//             color: #272727;
//             margin-bottom: 20px;
//             line-height: 1.5;
//             text-align: left;
//         }

//         .code {
//             font-size: 36px;
//             color: black;
//             font-weight: 700;
//             margin-bottom: 20px;
//             letter-spacing: 2px;
//         }

//         .note {
//             font-size: 14px;
//             color: #272727;
//             text-align: left;
//             margin-top: 20px;
//             margin-bottom: 5%;
//             line-height: 1.5;
//         }

//         .footer{
//             color: #4a4a4a;
//             font-size: 12px;
//             max-width: 600px;
//             text-align: center;
//         }
//     </style>
// </head>

// <body>
//     <div style="margin: 0 auto">
//         <div class="container">
//             <div class="logo">
//                 <img src="https://localhost:3000/images/logo.avif" style="width: 180px;"
//                     alt="Oredo GPS Logo">
//             </div>
//             <div class="title">Verify your New Email</div>
//             <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
//             <div class="message">
//                 Oredo GPS received a request to <strong>Change email</strong>.
//                 <br><br>
//                 Use this code to safely verify your new email:
//             </div>
//             <div class="code">${otp}</div>

//            <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 6-67, Yerrakunta, Chandrayangutta, Hyderabad, Telangana 500005</p>
//         </div>
//     </div>
// </body>

// </html>
//   `

//     const subject = "Verify your Email";
//     return await sendMail({ to: email, subject, html: body });
// };



// exports.sendSubAdminLogin = async (data) => {

//     const { name, password, email } = data;

//     const body = `
//   <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Verify your recovery email</title>
//     <style>
//         body {
//             margin: 0 auto;
//             padding: 0;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             height: 100vh;
//         }

//         .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #fff;
//             border: 1px solid gainsboro;
//             padding: 20px;
//             border-radius: 8px;
//             text-align: center;
//         }

//         .logo {
//             margin-bottom: 20px;
//         }

//         .title {
//             font-size: 24px;
//             color: black;
//             font-weight: 500;
//             margin-top: 5%;
//             margin-bottom: 5%;
//         }

//         .message {
//             font-size: 16px;
//             color: #272727;
//             margin-bottom: 20px;
//             line-height: 1.5;
//             text-align: left;
//         }

//         .code {
//             font-size: 36px;
//             color: black;
//             font-weight: 700;
//             margin-bottom: 20px;
//             letter-spacing: 2px;
//         }

//         .note {
//             font-size: 14px;
//             color: #272727;
//             text-align: left;
//             margin-top: 20px;
//             margin-bottom: 5%;
//             line-height: 1.5;
//         }

//         .footer{
//             color: #4a4a4a;
//             font-size: 12px;
//             max-width: 600px;
//             text-align: center;
//         }
//     </style>
// </head>

// <body>
//     <div style="margin: 0 auto">
//         <div class="container">
//             <div class="logo">
//                 <img src="http://localhost:3000/images/logo.avif" style="width: 180px;"
//                     alt="Oredo GPS Logo">
//             </div>
//             <div class="title">Hello, ${name}</div>
//             <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
//             <div class="message">
//                 You have been given a Sub Admin role at Oredo GPS.
//                 </strong>.
//                 <br><br>
//                 Email: ${email}
//                 <br>
//                 Password: ${password}
//                 <br>
//                 Login URL: http://localhost:3000/login
//                 <br>
//             </div>
//             <div class="note">
//                 Please login in securely to Oredo GPS Admin Dashboard.
//             </div>
//            <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 6-67, Yerrakunta, Chandrayangutta, Hyderabad, Telangana 500005</p>
//         </div>
//     </div>
// </body>

// </html>
//   `

//     const subject = "You have been given a Sub Admin Role";
//     return await sendMail({ to: email, subject, html: body });
// };

// exports.sendSubAdminPasswordUpdate = async (data) => {

//     const { name, password, email } = data;

//     const body = `
//   <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Verify your recovery email</title>
//     <style>
//         body {
//             margin: 0 auto;
//             padding: 0;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             height: 100vh;
//         }

//         .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #fff;
//             border: 1px solid gainsboro;
//             padding: 20px;
//             border-radius: 8px;
//             text-align: center;
//         }

//         .logo {
//             margin-bottom: 20px;
//         }

//         .title {
//             font-size: 24px;
//             color: black;
//             font-weight: 500;
//             margin-top: 5%;
//             margin-bottom: 5%;
//         }

//         .message {
//             font-size: 16px;
//             color: #272727;
//             margin-bottom: 20px;
//             line-height: 1.5;
//             text-align: left;
//         }

//         .code {
//             font-size: 36px;
//             color: black;
//             font-weight: 700;
//             margin-bottom: 20px;
//             letter-spacing: 2px;
//         }

//         .note {
//             font-size: 14px;
//             color: #272727;
//             text-align: left;
//             margin-top: 20px;
//             margin-bottom: 5%;
//             line-height: 1.5;
//         }

//         .footer{
//             color: #4a4a4a;
//             font-size: 12px;
//             max-width: 600px;
//             text-align: center;
//         }
//     </style>
// </head>

// <body>
//     <div style="margin: 0 auto">
//         <div class="container">
//             <div class="logo">
//                 <img src="http://localhost:3000/images/logo.avif" style="width: 180px;"
//                     alt="Oredo GPS Logo">
//             </div>
//             <div class="title">Hello, ${name}</div>
//             <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
//             <div class="message">
//                 Your password has been changed by Admin at Oredo GPS.
//                 </strong>.
//                 <br><br>
//                 Your Email: ${email}
//                 <br>
//                 New Password: ${password}
//                 <br>
//                 Login URL: https://localhost:3000/login
//                 <br>
//             </div>
//             <div class="note">
//                 Please login in securely to Oredo GPS Dashboard.
//             </div>
//            <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 6-67, Yerrakunta, Chandrayangutta, Hyderabad, Telangana 500005</p>
//         </div>
//     </div>
// </body>

// </html>
//   `

//     const subject = "Your password has been changed by Admin";
//     return await sendMail({ to: email, subject, html: body });
// };

// exports.sendOtpPartnerSignUp = async (data) => {
//     const { email, otp } = data;
//     console.log('email', email, 'otp', otp)
//     const body = `
//   <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Verify your recovery email</title>
//     <style>
//         body {
//             margin: 0 auto;
//             padding: 0;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             height: 100vh;
//         }

//         .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #fff;
//             border: 1px solid gainsboro;
//             padding: 20px;
//             border-radius: 8px;
//             text-align: center;
//         }

//         .logo {
//             margin-bottom: 20px;
//         }

//         .title {
//             font-size: 24px;
//             color: black;
//             font-weight: 500;
//             margin-top: 5%;
//             margin-bottom: 5%;
//         }

//         .message {
//             font-size: 16px;
//             color: #272727;
//             margin-bottom: 20px;
//             line-height: 1.5;
//             text-align: left;
//         }

//         .code {
//             font-size: 36px;
//             color: black;
//             font-weight: 700;
//             margin-bottom: 20px;
//             letter-spacing: 2px;
//         }

//         .note {
//             font-size: 14px;
//             color: #272727;
//             text-align: left;
//             margin-top: 20px;
//             margin-bottom: 5%;
//             line-height: 1.5;
//         }

//         .footer{
//             color: #4a4a4a;
//             font-size: 12px;
//             max-width: 600px;
//             text-align: center;
//         }
//     </style>
// </head>

// <body>
//     <div style="margin: 0 auto">
//         <div class="container">
//             <div class="logo">
//                <img src="https://localhost:3000/images/logo.avif" style="width: 180px;"
//                     alt="Oredo GPS Logo">
//             </div>
//             <div class="title">Verify your Email</div>
//             <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
//             <div class="message">
//                 Oredo GPS received a request to verify <strong>${email}</strong> as an onboarding process.
//                 <br><br>
//                 Use this code to safely verify your email:
//             </div>
//             <div class="code">${otp}</div>
//           <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 6-67, Yerrakunta, Chandrayangutta, Hyderabad, Telangana 500005</p>
//         </div>
//     </div>
// </body>

// </html>
//   `

//     const subject = "Verify your Email";
//     return await sendMail({ to: email, subject, html: body });
// };

// exports.sendContactMail = async (data) => {

//     const adminEmail = await getSuperAdminEmail();

//     const body = `
//   <!DOCTYPE html>
// <html lang="en">

// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Verify your recovery email</title>
//     <style>
//         body {
//             margin: 0 auto;
//             padding: 0;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             height: 100vh;
//         }

//         .container {
//             max-width: 600px;
//             margin: 0 auto;
//             background-color: #fff;
//             border: 1px solid gainsboro;
//             padding: 20px;
//             border-radius: 8px;
//             text-align: center;
//         }

//         .logo {
//             margin-bottom: 20px;
//         }

//         .title {
//             font-size: 24px;
//             color: black;
//             font-weight: 500;
//             margin-top: 5%;
//             margin-bottom: 5%;
//         }

//         .message {
//             font-size: 16px;
//             color: #272727;
//             margin-bottom: 20px;
//             line-height: 1.5;
//             text-align: left;
//         }

//         .code {
//             font-size: 36px;
//             color: black;
//             font-weight: 700;
//             margin-bottom: 20px;
//             letter-spacing: 2px;
//         }

//         .note {
//             font-size: 14px;
//             color: #272727;
//             text-align: left;
//             margin-top: 20px;
//             margin-bottom: 5%;
//             line-height: 1.5;
//         }

//         .footer{
//             color: #4a4a4a;
//             font-size: 12px;
//             max-width: 600px;
//             text-align: center;
//         }
//     </style>
// </head>

// <body>
//     <div style="margin: 0 auto">
//         <div class="container">
//             <div class="logo">
//             <img src="https://localhost:3000/images/logo.avif" style="width: 180px;"
//                     alt="Oredo GPS Logo">
//             </div>
//             <div class="title">Hello Admin</div>
//             <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
//             <div class="message">
//                 New message received.
//                 </strong>
//                 <br><br>
//                 Name: ${data?.name}
//                 <br>
//                 Email: ${data?.email}
//                 <br>
//                 Contact Number: ${data?.number}
//                 <br>
//                 Message: ${data?.message}
//                 <br>
//                 Role: ${data?.role}
//                 <br>
//                 Address: ${data?.country}, ${data?.state}, ${data?.city}, ${data?.address}, ${data?.zipCode}
//                 <br>
//             </div>
//             <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 6-67, Yerrakunta, Chandrayangutta, Hyderabad, Telangana 500005</p>
//         </div>
//     </div>
// </body>

// </html>
//   `

//     const subject = "New Contact message received";
//     return await sendMail({ to: adminEmail, subject, html: body });
// };

// exports.sendBillingMail = async (data) => {
//     const { email, amount, companyName, totalGps, vehicleNumbers, deviceUniqueIds } = data;
//     const ratePerDayPerGps = 10;

//     const body = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Billing Information</title>
//         <style>
//             body {
//                 margin: 0 auto;
//                 padding: 0;
//                 display: flex;
//                 justify-content: center;
//                 align-items: center;
//                 height: 100vh;
//             }
//             .container {
//                 max-width: 600px;
//                 margin: 0 auto;
//                 background-color: #fff;
//                 border: 1px solid gainsboro;
//                 padding: 20px;
//                 border-radius: 8px;
//                 text-align: center;
//             }
//             .logo {
//                 margin-bottom: 20px;
//             }
//             .title {
//                 font-size: 24px;
//                 color: black;
//                 font-weight: 500;
//                 margin-top: 5%;
//                 margin-bottom: 5%;
//             }
//             .message {
//                 font-size: 16px;
//                 color: #272727;
//                 margin-bottom: 20px;
//                 line-height: 1.5;
//                 text-align: left;
//             }
//             .amount {
//                 font-size: 36px;
//                 color: black;
//                 font-weight: 700;
//                 margin-bottom: 20px;
//                 letter-spacing: 2px;
//             }
//             .note {
//                 font-size: 14px;
//                 color: #272727;
//                 text-align: left;
//                 margin-top: 20px;
//                 margin-bottom: 5%;
//                 line-height: 1.5;
//             }
//             .footer {
//                 color: #4a4a4a;
//                 font-size: 12px;
//                 text-align: center;
//             }
//             .vehicle-list {
//                 list-style-type: none;
//                 padding: 0;
//                 margin: 0;
//                 text-align: left;
//             }
//             .vehicle-list li {
//                 font-size: 14px;
//                 color: #272727;
//                 margin-bottom: 5px;
//                 display: flex;
//                 justify-content: space-between;
//             }
//             .vehicle, .device-id {
//                 display: inline-block;
//                 width: 45%;
//             }
//         </style>
//     </head>
//     <body>
//         <div style="margin: 0 auto">
//             <div class="container">
//                 <div class="logo">
//                    <img src="https://localhost:3000/images/logo.avif" style="width: 180px;" alt="Oredo GPS Logo">
//                 </div>
//                 <div class="title">Billing Information for ${companyName}</div>
//                 <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
//                 <div class="message">
//                     Dear ${companyName},<br><br>
//                     This is to inform you that a billing of <strong>&#8377;${amount}</strong> has been generated for your account based on the following details:
//                     <ul>
//                         <li>Total GPS Units: <strong>${totalGps}</strong></li>
//                         <li>Rate per GPS per day: <strong>&#8377;${ratePerDayPerGps}</strong></li>
//                     </ul>
//                     <br>
//                     <strong>Vehicle Numbers and Device IDs:</strong>
//                     <ul class="vehicle-list">
//                         ${vehicleNumbers.map((vehicle, index) => `
//                             <li>
//                                 <span class="vehicle">${vehicle}</span>
//                                 <span class="device-id">${deviceUniqueIds[index] || 'N/A'}</span>
//                             </li>
//                         `).join('')}
//                     </ul>
//                 </div>
//                 <div class="amount">Total Amount: &#8377;${amount}</div>
//                 <div class="note">Please find the attached billing PDF for further details.</div>
//                 <p class="footer">All rights reserved © 2024 | Oredo Gps Solutions Private Limited | 6-67, Yerrakunta, Chandrayangutta, Hyderabad, Telangana 500005</p>
//             </div>
//         </div>
//     </body>
//     </html>
//     `;

//     const subject = "Billing Information";
//     return await sendMail({ to: email, subject, html: body });
// };