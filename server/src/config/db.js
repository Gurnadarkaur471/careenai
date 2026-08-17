const mongoose = require("mongoose");

async function connectDB() {
  const defaultUri = "mongodb://127.0.0.1:27017/careerai";
  const uri = process.env.MONGO_URI || defaultUri;

  try {
    await mongoose.connect(uri);
    console.log(`[db] connected -> ${uri}`);
    return;
  } catch (err) {
    console.error(`[db] connection failed for ${uri}:`, err.message);

    if (uri !== defaultUri) {
      console.warn("[db] falling back to local MongoDB at", defaultUri);
      try {
        await mongoose.connect(defaultUri);
        console.log(`[db] connected -> ${defaultUri}`);
        return;
      } catch (localErr) {
        console.error("[db] local fallback failed:", localErr.message);
      }
    }

    process.exit(1);
  }
}

module.exports = connectDB;
