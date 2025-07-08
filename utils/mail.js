const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: "info@startupdocs.io",
        pass: "Happy@manjeet1amman#",
    },
});

const sendMail = ({ to, subject, html }) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: 'StartupDocs <info@startupdocs.io>',
            to,
            subject,
            html,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
console.log("error", error);
                return reject(error);
            }
            console.log("info", info);
            resolve(info);
        });
    });
};


exports.sendEmailUpdateOtp = async (data) => {
    const { name, otp, email } = data;

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
                <img src="https://nivishka.com/images/nivishka-logo.png" style="width: 180px;"
                    alt="Google Logo">
            </div>
            <div class="title">Verify your New Email</div>
            <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
            <div class="message">
                Nivishka Services received a request to <strong>Change email</strong>.
                <br><br>
                Use this code to safely verify your new email:
            </div>
            <div class="code">${otp}</div>
            <div class="note">
                If you find something suspicious, then you can ignore this email.
            </div>
           <p class="footer">All rights reserved © 2024 | Nivishka Services | No. 92 , 7th Cross, Basavanapura Main Road, 560036,
            Bangalore, Karnataka</p>
        </div>
    </div>
</body>

</html>
  `

    const subject = "Email Update Verification";
    return await sendMail({ to: email, subject, html: body });
};


exports.sendResetPasswordSuperAdmin = async (data) => {
    const { email, token } = data;
    const resetLink =
        process.env.BASE_URL + `/admin/reset-password/${token}`;

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
                  <img src="https://nivishka.com/images/nivishka-logo.png" style="width: 180px;"
                      alt="Nivishka Logo">
              </div>
              <div class="title">Reset Password</div>
              <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
              <div class="message">
                  Nivishka Services received a request to <strong>Change password</strong>.
                  <br><br>
                  Use this link to safely reset your password: ${resetLink}
              </div>
              <div class="note">
                  <br><br>
                  If you find something suspicious, then you can ignore this email.
              </div>
             <p class="footer">All rights reserved © 2024 | Nivishka Services | No. 92 , 7th Cross, Basavanapura Main Road, 560036,
              Bangalore, Karnataka</p>
          </div>
      </div>
  </body>
  
  </html>
    `

    const subject = "Reset Password";
    return await sendMail({ to: email, subject, html: body });
};


exports.sendOtpForUserSignup = async (data) => {
    const { otp, email } = data;

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
                <img src="https://i.ibb.co/qY514byy/logoo.png" style="width: 180px;"
                    alt="StartupDocs Logo">
            </div>
            <div class="title">Verify your Email</div>
            <hr style="opacity: 30%; margin-top: 3%; margin-bottom: 3%;" />
            <div class="message">
                Leegal has received a request to verify <strong>${email}</strong>.
                <br><br>
                Use this code to safely verify your email:
            </div>
            <div class="code">${otp}</div>
           <p class="footer">All rights reserved © 2025 | StartupDocs</p>
        </div>
    </div>
</body>

</html>
  `
    const subject = "Verify your Email";
    return await sendMail({ to: email, subject, html: body });
};


exports.newAccountCreated = async (data) => {
    const { first_name, last_name, email } = data;

    const body = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Letter - StartupDocs</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        rel="stylesheet">

    <style>
        body {
            font-family: "DM Sans", serif !important;
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .email-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            max-width: 600px;
            border-bottom: 20px solid #EA1F23;
            margin: 0 auto;
            padding: 20px;
            border-radius: 20px;
        }

        .app-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            padding-top: 20px;
            width: 640px;
            margin: 20px auto 0;
        }

        .header {
            text-align: center;
            margin-top: 20px;
        }

        .header img {
            max-width: 150px;
        }

        .content {
            margin: 30px;
        }

        .content p {
            line-height: 1.6;
            color: #202020;
            font-size: 15px;
        }

        .signature {
            margin: 30px;
            text-align: left;
        }

        .signature img {
            max-width: 100px;
        }

        .footer {
            margin: 40px;
            margin-bottom: 0;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }

        .waves {
            width: 100%;
            height: 50px;
            background: url('waves.png') no-repeat bottom center;
            background-size: cover;
        }

        .li {
            margin: 8px 0;
        }

        .heavy {
            font-weight: 600;
        }

        .get-started-button {
            background-color: #9E0050;
            color: #fff;
            border: none;
            text-transform: none;
            border-radius: 25px;
            padding: 15px 50px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            color: #fff;
            /* Add this line */
        }

        .get-started-button:hover {
            background-color: #850040;
            color: #fff !important;
            /* Add this line to ensure the text remains white on hover */
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/qY514byy/logoo.png" alt="StartupDocs">
            </div>
            <div class="content">
                <p class="heavy">Dear ${first_name} ${last_name}, Welcome to StartupDocs 🎉</p>
                
                <p>
                We’re thrilled to have you onboard and excited to be part of your journey toward establishing your U.S.-based LLC. Starting or expanding a business is a bold step, and we’re here to ensure it’s as smooth and seamless as possible.
                </p>
                
                <p>
                Our platform is designed to make forming and managing your U.S. LLC straightforward and hassle-free. From filing the necessary paperwork to managing compliance, taxes, and more, we’re here to handle the details so you can focus on growing your business.
                </p>

                <b>Here’s what you can do next:</b>
               
                 <ul>
                    <li class="li">Explore Your Dashboard – Access all the tools and resources you need in one place.</li>
                    <li class="li">Check Out Our Resources – Learn about compliance, taxes, and how to run your business effectively.</li>
                    <li class="li">Reach Out Anytime – Our support team is here to answer your questions and assist you at every step.</li>
                </ul>

                <p>
                Thank you for choosing StartupDocs to be your partner in success. Let’s build something amazing together!
                </p>

            </div>

            <div class="footer">
                <p class="footer">All rights reserved © 2025 | StartupDocs</p>
            </div>
        </div>

    </div>
</body>

</html>
`

    const subject = "Welcome to StartupDocs – Let’s Build Your Dream Business!"
    return await sendMail({ to: email, subject, html: body });
};


exports.orderReceived = async (data) => {
    const { first_name, last_name, email, company_name, designator, state, selected_plan, paid_amount } = data;

    const body = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Letter - StartupDocs</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        rel="stylesheet">

    <style>
        body {
            font-family: "DM Sans", serif !important;
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .email-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            max-width: 600px;
            border-bottom: 20px solid #EA1F23;
            margin: 0 auto;
            padding: 20px;
            border-radius: 20px;
        }

        .app-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            padding-top: 20px;
            width: 640px;
            margin: 20px auto 0;
        }

        .header {
            text-align: center;
            margin-top: 20px;
        }

        .header img {
            max-width: 150px;
        }

        .content {
            margin: 30px;
        }

        .content p {
            line-height: 1.6;
            color: #202020;
            font-size: 15px;
        }

        .signature {
            margin: 30px;
            text-align: left;
        }

        .signature img {
            max-width: 100px;
        }

        .footer {
            margin: 40px;
            margin-bottom: 0;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }

        .waves {
            width: 100%;
            height: 50px;
            background: url('waves.png') no-repeat bottom center;
            background-size: cover;
        }

        .li {
            margin: 8px 0;
        }

        .heavy {
            font-weight: 600;
        }

        .get-started-button {
            background-color: #9E0050;
            color: #fff;
            border: none;
            text-transform: none;
            border-radius: 25px;
            padding: 15px 50px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            color: #fff;
            /* Add this line */
        }

        .get-started-button:hover {
            background-color: #850040;
            color: #fff !important;
            /* Add this line to ensure the text remains white on hover */
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/qY514byy/logoo.png" alt="StartupDocs">
            </div>
            <div class="content">
                <p class="heavy">Dear ${first_name} ${last_name},</p>
                
                <p>
                Thank you for placing your trust in Leegal! We’ve received your order for forming your U.S. LLC, and our team is now processing it.
                </p>

                <b>Here is an overview of your recent order:</b>
                <p>Company Name: ${company_name}</p>
                <p>Entity: ${designator}</p>
                <p>State: ${state}</p>
                <p>Paid amount: $${paid_amount}</p>

                <b>What happens next?:</b>
               
                 <ul>
                    <li class="li">LLC Formation in Progress: We’re working on filing your LLC with the appropriate state authorities.</li>
                    <li class="li">Document Preparation: Once your LLC is approved, we’ll ensure that all essential documents (e.g., Certificate of Formation, EIN, and Operating Agreement) are ready and uploaded to your dashboard.</li>
                    <li class="li">Timeline: LLC formation times vary by state, but rest assured, we’ll keep you updated throughout the process.</li>
                </ul>

                <p>
                As soon as your LLC is officially formed, we’ll notify you and provide access to all relevant documents through your dashboard.
                </p>

                <p>
                If you have any questions in the meantime, don’t hesitate to reach out to our support team at info@leegal.co or directly through your dashboard.
                </p>

                <p>
                Thank you for choosing Leegal as your trusted partner. We’re excited to help you bring your business vision to life!
                </p>

            </div>

            <div class="footer">
                <p class="footer">All rights reserved © 2025 | Leegal</p>
            </div>
        </div>

    </div>
</body>

</html>
`

    const subject = "We have received your U.S. Company Formation request!"
    return await sendMail({ to: email, subject, html: body });
};


exports.sharedDocument = async (data) => {
    const { first_name, last_name, company_name, email, document_name } = data;

    const body = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Letter - Leegal</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        rel="stylesheet">

    <style>
        body {
            font-family: "DM Sans", serif !important;
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .email-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            max-width: 600px;
            border-bottom: 20px solid #EA1F23;
            margin: 0 auto;
            padding: 20px;
            border-radius: 20px;
        }

        .app-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            padding-top: 20px;
            width: 640px;
            margin: 20px auto 0;
        }

        .header {
            text-align: center;
            margin-top: 20px;
        }

        .header img {
            max-width: 150px;
        }

        .content {
            margin: 30px;
        }

        .content p {
            line-height: 1.6;
            color: #202020;
            font-size: 15px;
        }

        .signature {
            margin: 30px;
            text-align: left;
        }

        .signature img {
            max-width: 100px;
        }

        .footer {
            margin: 40px;
            margin-bottom: 0;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }

        .waves {
            width: 100%;
            height: 50px;
            background: url('waves.png') no-repeat bottom center;
            background-size: cover;
        }

        .li {
            margin: 8px 0;
        }

        .heavy {
            font-weight: 600;
        }

        .get-started-button {
            background-color: #9E0050;
            color: #fff;
            border: none;
            text-transform: none;
            border-radius: 25px;
            padding: 15px 50px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            color: #fff;
            /* Add this line */
        }

        .get-started-button:hover {
            background-color: #850040;
            color: #fff !important;
            /* Add this line to ensure the text remains white on hover */
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/qY514byy/logoo.png" alt="StartupDocs">
            </div>
            <div class="content">
                <p class="heavy">Dear ${first_name} ${last_name},</p>
                
                <p>
                We’re pleased to inform you that - ${document_name} for your company (${company_name}) have been shared in your dashboard:
                </p>

                <p>
               You can now log in to your account to view and download these documents at your convenience.
                </p>

                <p>
                If you have any questions or need assistance accessing your dashboard, please don’t hesitate to contact our support team at info@leegal.co.
                </p>

                <p>
                Thank you for choosing Leegal! We’re here to support you in every step of your business journey.
                </p>

            </div>

            <div class="footer">
                <p class="footer">All rights reserved © 2025 | Leegal</p>
            </div>
        </div>

    </div>
</body>

</html>
`

    const subject = `Your ${document_name} is Ready for Review`
    return await sendMail({ to: email, subject, html: body });
};


exports.sendResetPasswordUser = async (data) => {
    const { email, token, first_name, last_name } = data;
    const resetLink = process.env.BASE_URL + `/reset-password/${token}`;

    console.log(resetLink)
    console.log(email)

    const body = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Letter - Leegal</title>
    
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
            rel="stylesheet">
    
        <style>
            body {
                font-family: "DM Sans", serif !important;
                margin: 0 auto;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
            }
    
            .email-container {
                background-color: #f5f5f5;
                border-radius: 20px;
                max-width: 600px;
                border-bottom: 20px solid #EA1F23;
                margin: 0 auto;
                padding: 20px;
                border-radius: 20px;
            }
    
            .app-container {
                background-color: #f5f5f5;
                border-radius: 20px;
                padding-top: 20px;
                width: 640px;
                margin: 20px auto 0;
            }
    
            .header {
                text-align: center;
                margin-top: 20px;
            }
    
            .header img {
                max-width: 150px;
            }
    
            .content {
                margin: 30px;
            }
    
            .content p {
                line-height: 1.6;
                color: #202020;
                font-size: 15px;
            }
    
            .signature {
                margin: 30px;
                text-align: left;
            }
    
            .signature img {
                max-width: 100px;
            }
    
            .footer {
                margin: 40px;
                margin-bottom: 0;
                text-align: center;
                color: #666666;
                font-size: 12px;
            }
    
            .waves {
                width: 100%;
                height: 50px;
                background: url('waves.png') no-repeat bottom center;
                background-size: cover;
            }
    
            .li {
                margin: 8px 0;
            }
    
            .heavy {
                font-weight: 600;
            }
    
            .get-started-button {
                background-color: #9E0050;
                color: #fff;
                border: none;
                text-transform: none;
                border-radius: 25px;
                padding: 15px 50px;
                font-size: 16px;
                cursor: pointer;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                margin: 20px 0;
                color: #fff;
                /* Add this line */
            }
    
            .get-started-button:hover {
                background-color: #850040;
                color: #fff !important;
                /* Add this line to ensure the text remains white on hover */
            }
        </style>
    </head>
    
    <body>
        <div style="margin: 0 auto">
            <div class="email-container">
                <div class="header">
                    <img src="https://i.ibb.co/qY514byy/logoo.png" alt="StartupDocs">
                </div>
                <div class="content">
                    <p style="font-size: 18px; font-weight: bold;">Dear ${first_name} ${last_name},</p>

                    <p style="font-size: 16px;">
                        We received a request to reset the password for your account. If you made this request, please click the button below to reset your password:
                    </p>

                     <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetLink}" 
                        style="
                        display: inline-block;
                        background-color: black;
                        color: #fff;
                        text-decoration: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                        ">
                         Reset Password
                        </a>
                    </div>

                    <p style="font-size: 16px;">
                        If you did not request a password reset, please ignore this email or contact our support team (info@leegal.co) if you have any concerns.
                    </p>

                    <p style="font-size: 16px;">
                        Thank you for choosing Leegal! We’re here to support you every step of the way.
                    </p>
                </div>
    
                <div class="footer">
                    <p class="footer">All rights reserved © 2025 | Leegal</p>
                </div>
            </div>
    
        </div>
    </body>
    
    </html>
    `

    const subject = "Reset Password";
    return await sendMail({ to: email, subject, html: body });
};


exports.sendOrderToAdmin = async (data) => {
    const { first_name, last_name, email, company_name, designator, state, selected_plan, paid_amount } = data;

    const body = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Letter - Leegal</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        rel="stylesheet">

    <style>
        body {
            font-family: "DM Sans", serif !important;
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .email-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            max-width: 600px;
            border-bottom: 20px solid #EA1F23;
            margin: 0 auto;
            padding: 20px;
            border-radius: 20px;
        }

        .app-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            padding-top: 20px;
            width: 640px;
            margin: 20px auto 0;
        }

        .header {
            text-align: center;
            margin-top: 20px;
        }

        .header img {
            max-width: 150px;
        }

        .content {
            margin: 30px;
        }

        .content p {
            line-height: 1.6;
            color: #202020;
            font-size: 15px;
        }

        .signature {
            margin: 30px;
            text-align: left;
        }

        .signature img {
            max-width: 100px;
        }

        .footer {
            margin: 40px;
            margin-bottom: 0;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }

        .waves {
            width: 100%;
            height: 50px;
            background: url('waves.png') no-repeat bottom center;
            background-size: cover;
        }

        .li {
            margin: 8px 0;
        }

        .heavy {
            font-weight: 600;
        }

        .get-started-button {
            background-color: #9E0050;
            color: #fff;
            border: none;
            text-transform: none;
            border-radius: 25px;
            padding: 15px 50px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            color: #fff;
            /* Add this line */
        }

        .get-started-button:hover {
            background-color: #850040;
            color: #fff !important;
            /* Add this line to ensure the text remains white on hover */
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/qY514byy/logoo.png" alt="StartupDocs">
            </div>
            <div class="content">
                <p class="heavy">Dear Admin,</p>
                
                <p>
                We’ve received a new order for forming U.S. LLC
                </p>

                <b>Here is an overview of the order:</b>
                <p>User Name: ${first_name} ${last_name}</p>
                <p>Company Name: ${company_name}</p>
                <p>Entity: ${designator}</p>
                <p>State: ${state}</p>
                <p>Paid amount: $${paid_amount}</p>

                <p>
                To know more about the order, kindly login to the admin dashboard.
                </p>

            </div>

            <div class="footer">
                <p class="footer">All rights reserved © 2025 | Leegal</p>
            </div>
        </div>

    </div>
</body>

</html>
`

    const subject = "New Company Formation order received!"
    return await sendMail({ to: 'leegalorg@gmail.com', subject, html: body });
};


exports.sendCompanyFormedMail = async (data) => {
    const { name, designator, email, company_name } = data;

    const body = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Letter - Leegal</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        rel="stylesheet">

    <style>
        body {
            font-family: "DM Sans", serif !important;
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .email-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            max-width: 600px;
            border-bottom: 20px solid #EA1F23;
            margin: 0 auto;
            padding: 20px;
            border-radius: 20px;
        }

        .app-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            padding-top: 20px;
            width: 640px;
            margin: 20px auto 0;
        }

        .header {
            text-align: center;
            margin-top: 20px;
        }

        .header img {
            max-width: 150px;
        }

        .content {
            margin: 30px;
        }

        .content p {
            line-height: 1.6;
            color: #202020;
            font-size: 15px;
        }

        .signature {
            margin: 30px;
            text-align: left;
        }

        .signature img {
            max-width: 100px;
        }

        .footer {
            margin: 40px;
            margin-bottom: 0;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }

        .waves {
            width: 100%;
            height: 50px;
            background: url('waves.png') no-repeat bottom center;
            background-size: cover;
        }

        .li {
            margin: 8px 0;
        }

        .heavy {
            font-weight: 600;
        }

        .get-started-button {
            background-color: #9E0050;
            color: #fff;
            border: none;
            text-transform: none;
            border-radius: 25px;
            padding: 15px 50px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            color: #fff;
            /* Add this line */
        }

        .get-started-button:hover {
            background-color: #850040;
            color: #fff !important;
            /* Add this line to ensure the text remains white on hover */
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/qY514byy/logoo.png" alt="StartupDocs">
            </div>
            <div class="content">
                <p class="heavy">Dear ${name},</p>
                
                <p>
                We’re excited to inform you that your U.S. LLC, ${company_name} ${designator}, has been successfully formed! 🎉
                </p>

                <p>
                This marks an important milestone in your entrepreneurial journey, and we’re honored to have been a part of making it happen.
                </p>

               <b>What’s next?</b>
               
                 <ul>
                    <li class="li">All official documents related to your LLC formation have been shared in your dashboard. You can log in to access, download, or print them as needed.</li>
                    <li class="li">If you require assistance with a U.S. business bank account, bookkeeping, or tax filings, we’re here to help! Check out our range of services designed to support your business.</li>
                </ul>

                <p>
                If you have any questions or need guidance on the next steps for growing and managing your business, don’t hesitate to contact us at info@leegal.co or through your dashboard.
                </p>

                <p>
                Thank you for trusting Leegal as your partner in this journey. We’re excited to see your business flourish!
                </p>

            </div>

            <div class="footer">
                <p class="footer">All rights reserved © 2025 | Leegal</p>
            </div>
        </div>

    </div>
</body>

</html>
`

    const subject = "Congratulations! Your U.S. Company is Officially Formed 🎉"
    return await sendMail({ to: email, subject, html: body });
};





exports.sendContactMessage = async (data) => {
    const { first_name, last_name, email, phone, message } = data;

    const body = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Letter - Leegal</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        rel="stylesheet">

    <style>
        body {
            font-family: "DM Sans", serif !important;
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .email-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            max-width: 600px;
            border-bottom: 20px solid #EA1F23;
            margin: 0 auto;
            padding: 20px;
            border-radius: 20px;
        }

        .app-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            padding-top: 20px;
            width: 640px;
            margin: 20px auto 0;
        }

        .header {
            text-align: center;
            margin-top: 20px;
        }

        .header img {
            max-width: 150px;
        }

        .content {
            margin: 30px;
        }

        .content p {
            line-height: 1.6;
            color: #202020;
            font-size: 15px;
        }

        .signature {
            margin: 30px;
            text-align: left;
        }

        .signature img {
            max-width: 100px;
        }

        .footer {
            margin: 40px;
            margin-bottom: 0;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }

        .waves {
            width: 100%;
            height: 50px;
            background: url('waves.png') no-repeat bottom center;
            background-size: cover;
        }

        .li {
            margin: 8px 0;
        }

        .heavy {
            font-weight: 600;
        }

        .get-started-button {
            background-color: #9E0050;
            color: #fff;
            border: none;
            text-transform: none;
            border-radius: 25px;
            padding: 15px 50px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            color: #fff;
            /* Add this line */
        }

        .get-started-button:hover {
            background-color: #850040;
            color: #fff !important;
            /* Add this line to ensure the text remains white on hover */
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/qY514byy/logoo.png" alt="StartupDocs">
            </div>
            <div class="content">
                <p class="heavy">Dear Admin,</p>
                
                <p>
                We’ve received a new message via contact form
                </p>

                <b>Here is an overview of the order:</b>
                <p>First Name: ${first_name}</p>
                <p>Last Name: ${last_name}</p>
                <p>Email: ${email}</p>
                <p>Phone: ${phone}</p>
                <p>Message: ${message}</p>

            </div>

            <div class="footer">
                <p class="footer">All rights reserved © 2025 | Leegal</p>
            </div>
        </div>

    </div>
</body>

</html>
`

    const subject = "New Contact Message Received!"
    return await sendMail({ to: 'leegalorg@gmail.com', subject, html: body });
};


exports.sendEinMail = async (data) => {
    const { first_name, last_name, email, company_name, designator } = data;

    const body = `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Letter - Leegal</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
        rel="stylesheet">

    <style>
        body {
            font-family: "DM Sans", serif !important;
            margin: 0 auto;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .email-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            max-width: 600px;
            border-bottom: 20px solid #EA1F23;
            margin: 0 auto;
            padding: 20px;
            border-radius: 20px;
        }

        .app-container {
            background-color: #f5f5f5;
            border-radius: 20px;
            padding-top: 20px;
            width: 640px;
            margin: 20px auto 0;
        }

        .header {
            text-align: center;
            margin-top: 20px;
        }

        .header img {
            max-width: 150px;
        }

        .content {
            margin: 30px;
        }

        .content p {
            line-height: 1.6;
            color: #202020;
            font-size: 15px;
        }

        .signature {
            margin: 30px;
            text-align: left;
        }

        .signature img {
            max-width: 100px;
        }

        .footer {
            margin: 40px;
            margin-bottom: 0;
            text-align: center;
            color: #666666;
            font-size: 12px;
        }

        .waves {
            width: 100%;
            height: 50px;
            background: url('waves.png') no-repeat bottom center;
            background-size: cover;
        }

        .li {
            margin: 8px 0;
        }

        .heavy {
            font-weight: 600;
        }

        .get-started-button {
            background-color: #9E0050;
            color: #fff;
            border: none;
            text-transform: none;
            border-radius: 25px;
            padding: 15px 50px;
            font-size: 16px;
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            color: #fff;
            /* Add this line */
        }

        .get-started-button:hover {
            background-color: #850040;
            color: #fff !important;
            /* Add this line to ensure the text remains white on hover */
        }
    </style>
</head>

<body>
    <div style="margin: 0 auto">
        <div class="email-container">
            <div class="header">
                <img src="https://i.ibb.co/qY514byy/logoo.png" alt="StartupDocs">
            </div>
            <div class="content">
                <p class="heavy">Dear ${first_name} ${last_name},</p>
                
    <b>
    Great News! Your EIN Application is Submitted ✅
    </b>

    <p>
    We're excited to inform you that your EIN application has been successfully submitted to the IRS for your ${company_name} ${designator}.
    </p>

    <p>
    <b>Important Update: </b>
    The normal processing time for EINs for non-U.S. residents is typically <b>4 to 7 working days.</b> Please be aware that, with Quarter 4 and the upcoming tax season, the IRS is currently processing EIN applications around <b>4 - 8 weeks</b>
    </p>

    <p>
    Thank you for your patience during this time.
    </p>

    <p>
      If you have any questions or need assistance, please don’t hesitate to contact us. We're here to help!
    </p>

    <p>
     Congratulations on taking this significant step for your business!
    </p>

            </div>

            <div class="footer">
                <p class="footer">All rights reserved © 2025 | Leegal</p>
            </div>
        </div>

    </div>
</body>

</html>
`

    const subject = "Your EIN Application is Submitted ✅"
    return await sendMail({ to: email, subject, html: body });
};
