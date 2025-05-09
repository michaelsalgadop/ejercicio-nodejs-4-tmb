import dotenv from "dotenv";
dotenv.config(); // Primera línea de código
import fs from "fs";
import path from "path";
import chalk from "chalk";
import pkg from "debug";
import nodemailer from "nodemailer";
const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}

const debug = createDebug("MAIL-DELIVERY");

const convertirToStringListadoParadas = (arrayParadas) =>
  arrayParadas.reduce(
    (acumulador, parada, i) => (acumulador += (i > 0 ? `\n` : "") + parada),
    ""
  );

const crearArchivoParadas = (stringParadas) =>
  new Promise((resolve, reject) =>
    fs.writeFile(`temp/paradas.txt`, stringParadas, (error) => {
      if (error) reject(false);
      resolve(true);
    })
  );

const enviarCorreo = async (correoDestino) => {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const message = {
      from: process.env.MAIL_USER,
      to: correoDestino,
      subject: "Líneas de metro",
      text: "Te adjunto el archivo de texto sobre las líneas de metro.",
      attachments: [
        {
          filename: "paradas.txt",
          path: path.resolve("./temp/paradas.txt"), // Ruta absoluta al archivo
        },
      ],
    };

    const info = await transport.sendMail(message);
    return info.response.includes("OK");
  } catch (error) {
    if (global.mostrarErrores) debug(error.message);
    return false;
  }
};

const gestionarEnvioCorreoListadoParadas = async (
  correoDestino,
  arrayParadas
) => {
  try {
    debug(chalk.bold.greenBright("Validado! Creando archivo de paradas..."));
    const stringParadas = convertirToStringListadoParadas(arrayParadas);
    const creadoModificado = await crearArchivoParadas(stringParadas);
    if (!creadoModificado && global.mostrarErrores)
      throw new Error(
        "No se ha podido crear o modificar el archivo especificado."
      );
    debug(
      chalk.bold.green(
        "Archivo creado/modificado, enviando al correo de destino..."
      )
    );
    const enviado = await enviarCorreo(correoDestino);
    if (!enviado && global.mostrarErrores)
      throw new Error("Error al intentar enviar el correo.");
    return enviado;
  } catch (error) {
    if (global.mostrarErrores) debug(chalk.bold.red(error.message));
    return false;
  }
};
export { gestionarEnvioCorreoListadoParadas };
