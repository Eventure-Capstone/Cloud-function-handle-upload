const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");
const storage = new Storage();

const bucketName = "";

exports.upload_image = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const file = req.file;
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `user-profile-images/${uuidv4()}.${fileExtension}`;

    const bucket = storage.bucket(bucketName);
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on("error", (err) => {
      console.error("Error uploading file:", err);
      res.status(500).json({ error: "Failed to upload image" });
    });

    stream.on("finish", async () => {
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      res.status(200).json({ image_url: publicUrl, error: null });
    });

    stream.end(file.buffer);
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ image_url: null, error: "Failed to upload image" });
  }
};
