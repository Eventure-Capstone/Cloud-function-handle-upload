import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";

const storage = new Storage();
const bucketName = "";

export const uploadImage = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const chunks = [];
  req
    .on("data", (chunk) => {
      chunks.push(chunk);
    })
    .on("end", async () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers["content-type"];

      if (!contentType.startsWith("image/")) {
        return res.status(400).send("File is not an image");
      }

      const newFilename = `${uuidv4()}`;
      const blob = storage.bucket(bucketName).file(newFilename);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: contentType,
      });

      blobStream.on("error", (err) => {
        console.error(err);
        return res.status(500).send("Error uploading file");
      });

      blobStream.on("finish", () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${newFilename}`;
        return res.status(200).send({ image_url: publicUrl });
      });

      blobStream.end(buffer);
    });
};
