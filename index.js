import dotenv from "dotenv";
dotenv.config(); // Primera línea de código
import chalk from "chalk";
import pkg from "debug";
import { program } from "commander";
import {
  recogerInformacionUsuario,
  recibirResultadoPorEmail,
} from "./prompt/preguntas.js";
import { gestionarEnvioCorreoListadoParadas } from "./mail/correo.js";

const { default: createDebug, enable } = pkg;
if (process.env.DEBUG) {
  enable(process.env.DEBUG);
}

const debug = createDebug("TMB-Inicio");

program.option("--color <color>");
program.option("--abrev");
program.parse(process.argv);
const opciones = program.opts();

const getLineasMetro = async (linea) => {
  const response = await fetch(
    `${process.env.URL_TMB_METRO}${linea}/estacions?app_id=${process.env.TMB_APP_ID}&app_key=${process.env.TMB_APP_KEY}`
  );
  const datosAPI = await response.json();
  return datosAPI;
};
const getListadoParadas = (datosAPI, respuestas) => {
  if (!datosAPI || datosAPI.totalFeatures === 0) {
    if (global.mostrarErrores) throw new Error("No existe la línea.");
    process.exit(1);
  }
  const { features } = datosAPI;
  if (
    global.mostrarErrores &&
    (!features || features.length === 0 || !features[0].properties)
  )
    throw new Error("Error buscando la línea.");
  const arrayParadas = [];
  features.forEach((infoParada) => {
    const {
      properties: { NOM_ESTACIO: nombreEstacion },
    } = infoParada;
    let mostrarInfoExtra = { coordenadas: null, fechaInauguración: null };
    if (respuestas.informacionExtra.length > 0) {
      for (const info of respuestas.informacionExtra) {
        if (info === "coordenadas") {
          mostrarInfoExtra.coordenadas = [...infoParada.geometry.coordinates];
        } else if (info === "fechaInauguracion") {
          mostrarInfoExtra.fechaInauguración =
            infoParada.properties.DATA_INAUGURACIO;
        }
      }
    }
    let infoEstacion = opciones.abrev
      ? nombreEstacion.slice(0, 3) + "."
      : nombreEstacion;
    if (mostrarInfoExtra.coordenadas) {
      infoEstacion += `\t${mostrarInfoExtra.coordenadas}`;
    }
    if (mostrarInfoExtra.fechaInauguración) {
      infoEstacion += `\t${mostrarInfoExtra.fechaInauguración}`;
    }
    arrayParadas.push(infoEstacion);
  });
  return arrayParadas;
};
const pintarResultado = (datosAPI, arrayParadas) => {
  const { features } = datosAPI;
  const {
    NOM_LINIA: nombreLinea,
    DESC_SERVEI: descripcionLinea,
    COLOR_LINIA: colorLinea,
  } = features[0].properties;
  const colorCodigo = opciones.color || colorLinea;
  const comentarioColor = opciones.color
    ? ""
    : " (el usuario no eligió código de color)";
  debug(`Nombre de la línea: ${nombreLinea}`);
  debug(`Descripción de la línea: ${descripcionLinea}`);
  debug(
    `El código de color para mostrar la línea será ${colorCodigo} ${comentarioColor}.`
  );
  const colorHex =
    colorCodigo.slice(0, 1) === "#" ? colorCodigo : `#${colorCodigo}`;
  for (const parada of arrayParadas) {
    debug(chalk.hex(colorHex)(parada));
  }
};
const controladorTMB = async () => {
  try {
    const respuestas = await recogerInformacionUsuario();
    if (!respuestas.linea) respuestas.linea = "0";
    global.mostrarErrores = respuestas.errores === "si";
    const datosAPI = await getLineasMetro(respuestas.linea);
    const arrayParadas = getListadoParadas(datosAPI, respuestas);
    pintarResultado(datosAPI, arrayParadas);
    const { correo: correoEnviarInformacion } =
      await recibirResultadoPorEmail();
    if (!correoEnviarInformacion && global.mostrarErrores)
      throw new Error("Error al recibir el correo validado.");
    const enviado = await gestionarEnvioCorreoListadoParadas(
      correoEnviarInformacion,
      arrayParadas
    );
    if (enviado) {
      debug(
        chalk.bold.green(
          "Enviado! En breves recibirás un correo con la información. Hasta pronto!"
        )
      );
      process.exit();
    } else if (global.mostrarErrores) {
      throw new Error(
        "Error en el envío, ponte en contacto con el servicio técnico."
      );
    }
  } catch (error) {
    if (global.mostrarErrores) debug(chalk.bold.red(error.message));
    process.exit(1);
  }
};
controladorTMB();
