// src/firebaseAdmin.js
var admin = require("firebase-admin");

var serviceAccount = require("./../../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://real-time-chat-applicati-88679-default-rtdb.europe-west1.firebasedatabase.app"
});

const messaging = admin.messaging();

export { messaging, admin };
