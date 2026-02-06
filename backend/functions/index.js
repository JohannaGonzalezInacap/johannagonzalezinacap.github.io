const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");

const fetch = require("node-fetch");

setGlobalOptions({ maxInstances: 10 });

// Secret para la REST API Key de OneSignal (configurada en Firebase Secret Manager)
const ONESIGNAL_REST_API_KEY = defineSecret("ONESIGNAL_REST_API_KEY");

// Endpoint para enviar notificaciones push usando OneSignal
exports.sendPush = onRequest({ secrets: [ONESIGNAL_REST_API_KEY] }, async (req, res) => {

  // CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {

    const { oneSignalUserId, title, body } = req.body;

    if (!oneSignalUserId) {
      return res.status(400).json({ error: "Falta oneSignalUserId" });
    }

    const ONESIGNAL_APP_ID = "ffe2c521-45f5-4e2e-b8c7-41c14b149f1b";

    const restApiKey = ONESIGNAL_REST_API_KEY.value();

    if (!restApiKey) {
      return res.status(500).json({
        error: "No está configurada la REST API KEY de OneSignal"
      });
    }

    const payload = {
      app_id: ONESIGNAL_APP_ID,
      include_aliases: {
        onesignal_id: [oneSignalUserId]
      },
      headings: {
        es: title || "Recordatorio"
      },
      contents: {
        es: body || "Es hora de tu medicamento"
      },
      url: "https://johannagonzalezinacap.github.io/med-reminder/"
    };

    const response = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${restApiKey}`
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    return res.json({
      success: true,
      data
    });

  } catch (error) {

    logger.error(error);

    return res.status(500).json({
      error: error.message
    });
  }

});
