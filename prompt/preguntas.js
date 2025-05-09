import dotenv from "dotenv";
dotenv.config(); // Primera línea de código
import chalk from "chalk";
import pkg from "debug";
import inquirer from "inquirer";

const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}

const debug = createDebug("TMB-Preguntas");
const recogerInformacionUsuario = () =>
  new Promise((resolve, reject) =>
    inquirer
      .prompt([
        {
          type: "list",
          name: "tipo",
          message: "¿Qué tipo de transporte quiere consultar?",
          choices: [
            { name: "Bus", value: "bus" },
            { name: "Metro", value: "metro" },
          ],
        },
      ])
      .then((respuesta) => {
        if (respuesta.tipo === "bus") {
          debug(
            chalk.yellow(
              `No tenemos información disponible sobre los buses ${process.env.URL_TMB}.`
            )
          );
          process.exit(1);
        } else if (respuesta.tipo === "metro") {
          return inquirer
            .prompt([
              {
                type: "checkbox",
                name: "informacionExtra",
                message:
                  "¿Qué información extra quiere obtener de cada parada?",
                choices: [
                  { name: "Coordenadas", value: "coordenadas" },
                  { name: "Fecha de inauguración", value: "fechaInauguracion" },
                ],
              },
              {
                type: "list",
                name: "errores",
                message: "¿Quiere que le informemos de los errores?",
                choices: ["si", "no"],
              },
              {
                type: "input",
                name: "linea",
                message: "¿Qué línea quiere consultar?",
              },
            ])
            .then((respuesta) => resolve(respuesta));
        }
      })
  );
const recibirResultadoPorEmail = () =>
  new Promise((resolve, reject) =>
    inquirer
      .prompt([
        {
          type: "list",
          name: "recibirResultados",
          message: "Quieres recibir los resultados por email?",
          choices: ["si", "no"],
        },
      ])
      .then((respuesta) => {
        if (respuesta.recibirResultados === "si") {
          return inquirer
            .prompt([
              {
                type: "input",
                name: "correo",
                message: "Dirección de correo válida:",
                validate: (email) => {
                  // Regex mail check (return true if valid mail)
                  const valid =
                    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(
                      email
                    );
                  if (valid) {
                    return true;
                  } else if (global.mostrarErrores) {
                    // NO DEVOLVEMOS DEBUG!!, DEBUG ES VOID, ENTONCES RESUELVE A UNDEFINED, CHALK DEVUELVE STRING, ENTONCES INQUIRER SI LO ACEPTA!!
                    return chalk.bold.red(
                      "Incorrecto! Introduce un correo electrónico válido!"
                    );
                  } else {
                    return "";
                  }
                },
              },
            ])
            .then((respuesta) => resolve(respuesta))
            .catch((error) => reject(error.message));
        } else {
          process.exit();
        }
      })
      .catch((error) => reject(error.message))
  );

export { recogerInformacionUsuario, recibirResultadoPorEmail };
