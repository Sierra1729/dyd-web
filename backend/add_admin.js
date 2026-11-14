require("dotenv").config({ path: __dirname + "/.env" });
const { admin, db } = require("./config/firebase");

async function main() {
  const args = process.argv.slice(2);

  // If no arguments, list all existing admins
  if (args.length === 0) {
    console.log(`\n==============================================`);
    console.log(`📋 CURRENT ADMINISTRATORS IN DATABASE`);
    console.log(`==============================================`);
    const snap = await db.collection("admins").get();
    if (snap.empty) {
      console.log("No administrators found in 'admins' collection.");
    } else {
      let count = 1;
      snap.forEach((doc) => {
        const d = doc.data();
        console.log(`${count}. Name:  ${d.fullName || d.name || "N/A"}`);
        console.log(`   Email: ${d.email}`);
        console.log(`   UID:   ${doc.id}`);
        console.log(`   Role:  ${d.role}`);
        console.log(`   ------------------------------------------`);
        count++;
      });
      console.log(`Total: ${snap.size} admin(s) authorized.\n`);
    }
    console.log(`To add an admin, run:`);
    console.log(`node backend/add_admin.js <email> [fullName] [password]\n`);
    process.exit(0);
  }

  const email = args[0].trim().toLowerCase();
  const fullName = args[1] ? args[1].trim() : "Administrator";
  const password = args[2] ? args[2].trim() : `Admin@DYD${Math.floor(1000 + Math.random() * 9000)}!`;

  console.log(`\n==============================================`);
  console.log(`🔐 PROVISIONING ADMINISTRATOR IN BACKEND`);
  console.log(`==============================================`);
  console.log(`Email:    ${email}`);
  console.log(`Name:     ${fullName}`);

  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
    console.log(`ℹ️ Existing Firebase Auth user found (UID: ${userRecord.uid}).`);
    if (args[2]) {
      await admin.auth().updateUser(userRecord.uid, { password, emailVerified: true });
      console.log(`✅ Password updated.`);
    }
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.log(`Creating new Firebase Auth user...`);
      userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: fullName,
        emailVerified: true,
      });
      console.log(`✅ Created Firebase Auth user (UID: ${userRecord.uid})`);
    } else {
      throw err;
    }
  }

  const uid = userRecord.uid;
  const now = new Date().toISOString();

  const adminData = {
    uid: uid,
    email: email,
    fullName: fullName,
    role: "admin",
    isApproved: true,
    status: "approved",
    approvedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  // Save to 'admins' collection
  await db.collection("admins").doc(uid).set(adminData, { merge: true });
  console.log(`✅ Admin profile saved to 'admins' Firestore collection.`);

  // Save fallback in 'users' collection
  await db.collection("users").doc(uid).set(adminData, { merge: true });

  console.log(`\n==============================================`);
  console.log(`🎉 ADMINISTRATOR AUTHORIZED SUCCESSFULLY!`);
  console.log(`==============================================`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log(`UID:      ${uid}`);
  console.log(`Role:     admin (Full Access Granted)`);
  console.log(`==============================================\n`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Failed to provision admin:", err);
    process.exit(1);
  });
