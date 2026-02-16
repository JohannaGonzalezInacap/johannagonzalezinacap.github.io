/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Registro básico: guarda datos mínimos y token FCM
exports.register = onRequest(async (req, res) => {
	if (req.method !== "POST") {
		return res.status(405).send("Method not allowed");
	}

	const { nombre, apellido, edad, country, phone, token } = req.body || {};

	if (!nombre || !apellido || !phone) {
		return res.status(400).send("Missing fields");
	}

	// TODO: guarda en tu base de datos (Firestore/Realtime/SQL)
	// Ejemplo Firestore:
	// const admin = require("firebase-admin");
	// admin.initializeApp();
	// await admin.firestore().collection("users").add({ nombre, apellido, edad, country, phone, token, createdAt: Date.now() });

	logger.info("Registration received", { phone, nombre, hasToken: Boolean(token) });
	return res.status(200).send("OK");
});
