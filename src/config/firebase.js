const admin = require("firebase-admin");
require("dotenv").config();

// Check if serviceAccountKey.json exists or if we should use environment variables directly
// For now, assuming serviceAccountKey.json is in the root
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
