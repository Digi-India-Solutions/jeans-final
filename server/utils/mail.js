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
    secure: true,
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

    const resetLink = `${process.env.BASE_URL}/${user}/reset-password/${token}`;

    const body = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
    </head>

    <body style="margin:0; padding:0; background:#f5f5f5; font-family:Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:20px 0;">
            <tr>
                <td align="center">

                    <!-- Main Container -->
                    <table width="600" cellpadding="0" cellspacing="0" 
                        style="background:#ffffff; border-radius:8px; border:1px solid gainsboro; padding:20px;">

                        <!-- Logo -->
                        <tr>
                            <td align="center" style="padding-bottom:20px;">
                                <img src="https://api.sddipl.com/uploads/logo/logowithText.png" 
                                     alt="Logo" width="180" 
                                     style="display:block; margin:0 auto;" />
                            </td>
                        </tr>

                        <!-- Title -->
                        <tr>
                            <td align="center" 
                                style="font-size:24px; font-weight:600; color:#000; padding:10px 0;">
                                Reset Password
                            </td>
                        </tr>

                        <tr>
                            <td>
                                <hr style="opacity:0.2; border:0; height:1px; background:#000;">
                            </td>
                        </tr>

                        <!-- Message -->
                        <tr>
                            <td 
                                style="font-size:16px; color:#272727; line-height:1.6; text-align:left; padding:20px;">
                                
                                Anibhavi Creation received a request to 
                                <strong>Change Password</strong>.
                                <br><br>

                                Click the link below to reset your password safely:
                                <br><br>

                                <a href="${resetLink}" 
                                   style="color:#0066cc; font-weight:600; word-break:break-all;">
                                   ${resetLink}
                                </a>

                                <br><br>
                                If you did not request this, please ignore this email.
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" 
                                style="font-size:12px; color:#4a4a4a; padding:20px 10px;">
                                
                                All rights reserved © 2024 | Anibhavi Creation  
                                <br>
                                9/7308, Guru Govind Singh Gali, Kailash Nagar, Gandhinagar, Delhi, 110031
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>

    </body>
    </html>
    `;

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
                <img src="https://api.sddipl.com/uploads/logo/logowithText.png"  style="width: 180px;"
                    alt="Anibhavi Creation">
            </div>
            <div class="title">Verify your Email</div>
            <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
            <div class="message">
                Anibhavi Creation has received a request to verify <strong>${email}</strong>.
                <br><br>
                Use this code to safely verify your email:
            </div>
            <div class="code">${otp}</div>
          <p class="footer">All rights reserved © 2024 | Anibhavi Creation | 18-13-6/80, Rajiv Gandhi Nagar, Dastagirnagar, Chandrayangutta- 500005 Hyderabad, Telangana</p>
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
    const baseUrl = user === "admin" ? process.env.ADMIN_BASE_URL : process.env.BASE_URL;
    const resetLink = `https://app.anibhavi.creation/pages/reset-password/${token}`;

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

exports.sendEmailByUserForRequastActiveAccount = async ({ email, fullName, mobile }) => {
    // Email to the User
    console.log("User Email:", email);
    const userSubject = "Account Activation Requested";
    const userBody = `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f2f2f2;
                margin: 0;
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
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .title {
                font-size: 24px;
                color: #333;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #666;
                margin-bottom: 20px;
            }
            .footer {
                font-size: 12px;
                color: #888;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="title">Activation Request Sent</h1>
            <p class="message">Hi ${fullName},</p>
            <p class="message">We have received your request to activate your account. Our team will review your details and activate your account shortly.</p>
            <p class="message">If you have any urgent queries, feel free to reach out to us. </p>
            <p class="message">Contact Number: 8506854624 </p>
            <p class="footer">All rights reserved © 2024 | The Anibhavi Creation</p>
        </div>
    </body>
    </html>`;

    // Email to the Admin
    const adminSubject = "New Account Activation Request";
    const adminBody = `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                border: 1px solid #ddd;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h2 {
                color: #333;
                margin-bottom: 20px;
            }
            .info {
                font-size: 16px;
                color: #555;
                margin-bottom: 10px;
            }
            .footer {
                font-size: 12px;
                color: #aaa;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Account Activation Request</h2>
            <p class="info"><strong>Full Name:</strong> ${fullName}</p>
            <p class="info"><strong>Email:</strong> ${email}</p>
            <p class="info"><strong>Mobile:</strong> ${mobile}</p>
            <p class="info">The above user has requested account activation. Please review and activate the account if everything is in order.</p>
            <p class="footer">Admin Portal | The Anibhavi Creation Pvt Ltd</p>
        </div>
    </body>
    </html>`;

    // Send to user
    await sendMail({ to: email, subject: userSubject, html: userBody });

    // Send to admin
    await sendMail({ to: "aasibkhan155471@gmail.com", subject: adminSubject, html: adminBody });

    return true;
};

exports.sendEmailByAdminForRequastActiveAccount = async ({ email, fullName, mobile }) => {
    // Email to the Admin
    console.log("Admin Email:", email);
    const adminSubject = "New Account Activation Request";
    const adminBody = `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                border: 1px solid #ddd;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h2 {
                color: #333;
                margin-bottom: 20px;
            }
            .info {
                font-size: 16px;
                color: #555;
                margin-bottom: 10px;
            }
            .footer {
                font-size: 12px;
                color: #aaa;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Account Activation Request</h2>
            <p class="info"><strong>Full Name:</strong> ${fullName}</p>
            <p class="info"><strong>Email:</strong> ${email}</p>
            <p class="info"><strong>Mobile:</strong> ${mobile}</p>
            <p class="info">The above user has requested account activation. Please review and activate the account if everything is in order.</p>
            <p class="footer">Admin Portal | The Anibhavi Creation</p>
        </div>
    </body>
    </html>`;

    // Send to admin
    await sendMail({ to: process.env.ADMIN_EMAIL, subject: adminSubject, html: adminBody });

    return true;
};

exports.sendEmailActiveUserAccount = async ({ email, fullName, isActive }) => {
    console.log(`Sending ${isActive ? 'Activation' : 'Deactivation'} Email To:`, email);

    const subject = isActive
        ? "🎉 Your Account is Now Active!"
        : "⚠️ Your Account Has Been Deactivated";

    const html = `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                border: 1px solid #ddd;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h2 {
                color: ${isActive ? '#4CAF50' : '#f44336'};
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #333;
                margin-bottom: 15px;
            }
            .button {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .footer {
                font-size: 12px;
                color: #aaa;
                margin-top: 30px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Hello ${fullName},</h2>
            ${isActive
            ? `<p class="message">Great news! Your account has been <strong>successfully activated</strong> by our admin team. 🎉</p>
                       <p class="message">You can now log in and start using all of our features.</p>
                       <p class="message">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                       <p class="message">Contact Number: 8506854624 </p>`
            : `<p class="message">We regret to inform you that your account has been <strong>deactivated</strong> by our admin team.</p>
                       <p class="message">If you believe this was a mistake or need assistance, please contact our support team.</p>
                       <p class="message">Contact Number: 8506854624 </p>`
        }
            <p class="footer">— The Anibhavi Creation</p>
        </div>
    </body>
    </html>`;

    await sendMail({ to: email, subject, html });
    return true;
};

exports.sendOrderNotification = async ({ email, name, phone }) => {
    const subject = "🛒 We Miss You! Come Back and Shop with Us";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
                text-align: center;
            }
            h2 {
                color: #ff6600;
                margin-bottom: 20px;
            }
            p {
                font-size: 16px;
                color: #444444;
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                padding: 12px 25px;
                background-color: #ff6600;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .footer {
                font-size: 12px;
                color: #888888;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Hey ${name}, We Miss You! 🧡</h2>
            <p>We noticed you haven’t placed an order in a while. It’s been some time since we’ve seen you, and we’d love to have you back!</p>
            <p>Explore our new products and exclusive deals crafted just for you.</p>
            <p class="footer">If you have any questions, feel free to contact us at ${process.env.SUPPORT_PHONE || "our support"}.<br>– YourWebsite Team</p>
        </div>
    </body>
    </html>`;

    await sendMail({ to: email, subject, html });
};

exports.sendThankYouEmail = async ({ email, name, phone }) => {
    const subject = "🙏 Thank You for Your Order!";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
                text-align: center;
            }
            h2 {
                color: #28a745;
                margin-bottom: 20px;
            }
            p {
                font-size: 16px;
                color: #555555;
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                padding: 12px 25px;
                background-color: #28a745;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .footer {
                font-size: 12px;
                color: #999999;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Thank You, ${name}! 🙌</h2>
            <p>We appreciate your order and the trust you’ve placed in us.</p>
            <p>We’re preparing your package and will notify you once it’s on the way. 🚚</p>
            <a href="https://yourwebsite.com/orders" class="btn">View Your Order</a>
            <p class="footer">Need help? Contact us at ${process.env.SUPPORT_PHONE || "our support team"}<br>– YourWebsite Team</p>
        </div>
    </body>
    </html>`;

    await sendMail({ to: email, subject, html });
};
exports.sendThankYouEmailAdmin = async ({ email, name, phone }) => {
    const subject = "🙏 Thank You for Your Order!";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
                text-align: center;
            }
            h2 {
                color: #28a745;
                margin-bottom: 20px;
            }
            p {
                font-size: 16px;
                color: #555555;
                margin-bottom: 20px;
            }
            .btn {
                display: inline-block;
                padding: 12px 25px;
                background-color: #28a745;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
            }
            .footer {
                font-size: 12px;
                color: #999999;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Thank You, ${name}! 🙌</h2>
            <p>We appreciate your order and the trust you’ve placed in us.</p>
            <p>We’re preparing your package and will notify you once it’s on the way. 🚚</p>
            <a href="https://yourwebsite.com/orders" class="btn">View Your Order</a>
            <p class="footer">Need help? Contact us at ${process.env.SUPPORT_PHONE || "our support team"}<br>– YourWebsite Team</p>
        </div>
    </body>
    </html>`;
    await sendMail({ to: process.env.MAIL_EMAIL_ID, subject, html });
};