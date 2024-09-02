import nodemailer from 'nodemailer';
import config from '../config/config.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      auth: {
        user: `${config.mail_user}`,
        pass: `${config.mail_pass}`,
      },
    });
  }

  async sendNewBuyEmail(email, first_name, ticket) {
    try {
      const mailOptions = {
        from: `Shop <${config.mail_user}>`,
        to: email,
        subject: 'Confirmación de compra',
        html: `
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de Compra</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                text-align: center;
                padding: 10px 0;
                border-bottom: 1px solid #ddd;
              }
              .content {
                padding: 20px;
              }
              .content p {
                margin: 0 0 10px;
              }
              .content a {
                display: inline-block;
                padding: 10px 20px;
                color: #fff;
                background-color: #007bff;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
              }
              .footer {
                text-align: center;
                padding: 10px 0;
                border-top: 1px solid #ddd;
                margin-top: 20px;
                font-size: 12px;
                color: #777;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Confirmación de compra</h1>
              </div>
              <div class="content">
                <p>Hola ${first_name},</p>
                <p>Gracias por tu compra. Nos complace informarte que tu pedido ha sido confirmado.</p>
                <p>El número de tu orden es: <strong>${ticket}</strong></p>
                <p>Le enviaremos otro correo cuando su pedido esté en camino.</p>
              </div>
              <div class="footer">
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <p>© 2024 Shop. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log('Error al enviar el correo de confirmación de compra', error);
    }
  }

  async sendEmailToResetPassword(email, first_name, token) {
    try {
      const mailOptions = {
        from: `Shop <${config.mail_user}>`,
        to: email,
        subject: 'Restablecimiento de contraseña',
        html: `
              <!DOCTYPE html>
              <html lang="es">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Restablecimiento de Contraseña</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 0;
                  }
                  .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  .header {
                    text-align: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #ddd;
                  }
                  .content {
                    padding: 20px;
                  }
                  .content p {
                    margin: 0 0 10px;
                  }
                  .content a {
                    display: inline-block;
                    padding: 10px 20px;
                    color: #fff;
                    background-color: #007bff;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 10px;
                  }
                  .footer {
                    text-align: center;
                    padding: 10px 0;
                    border-top: 1px solid #ddd;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #777;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Restablecimiento de contraseña</h1>
                  </div>
                  <div class="content">
                    <p>Hola ${first_name},</p>
                    <p>Solicitaste restablecer tu contraseña. Por favor, usa el siguiente código para completar el proceso:</p>
                    <p><strong>${token}</strong></p>
                    <p>Este código expira en una hora.</p>
                  </div>
                  <div class="footer">
                    <p>Si no solicitaste este correo, por favor ignóralo.</p>
                    <p>© 2024 Shop. Todos los derechos reservados.</p>
                  </div>
                </div>
              </body>
              </html>
            `,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log('Error al enviar el correo de restablecimiento');
    }
  }
}

export default EmailService;
