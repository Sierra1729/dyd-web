const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let serviceAccount = null;

// 1. Check if a direct file path is configured in ENV
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
  const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
  if (fs.existsSync(filePath)) {
    serviceAccount = JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
}

// 2. Check local fallback files (serviceAccountKey.json in config/ or backend root)
if (!serviceAccount) {
  const localConfigPath = path.join(__dirname, "serviceAccountKey.json");
  const localRootPath = path.join(__dirname, "..", "serviceAccountKey.json");

  if (fs.existsSync(localConfigPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(localConfigPath, "utf8"));
  } else if (fs.existsSync(localRootPath)) {
    serviceAccount = JSON.parse(fs.readFileSync(localRootPath, "utf8"));
  }
}

// 3. Check JSON string in environment variable
if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === "string"
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;
  } catch (err) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is provided but could not be parsed as valid JSON: " + err.message);
  }
}

if (!serviceAccount) {
  throw new Error(
    "Missing Firebase Service Account credentials.\n" +
    "Please provide one of the following:\n" +
    "  1. Save your Firebase service account JSON file as 'backend/serviceAccountKey.json' (or 'backend/config/serviceAccountKey.json')\n" +
    "  2. Or set FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/serviceAccountKey.json in backend/.env\n" +
    "  3. Or set FIREBASE_SERVICE_ACCOUNT={...json string...} in backend/.env"
  );
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };