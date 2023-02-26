const express = require("express");
const router = express.Router();
const multer = require("multer");
const S3 = require("aws-sdk/clients/s3");
const sharp = require("sharp");
const localStorage = require("electron-json-storage");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const codes = require("./codes");

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  }
});

// const upload = multer({ storage: storage }).single("file");
const upload = multer({ dest: "uploads/" }).single("file");

const awsBucket = "mg-show-assets";
const s3bucket = new S3({
  accessKeyId: codes.aws.accessKeyId,
  secretAccessKey: codes.aws.secretAccessKey,
  Bucket: awsBucket
});

const directory = {
  topic: "images/user-images/",
  logo: "images/user-images/",
  sponsor: "images/user-images/"
};

router.post("/", upload, async (req, res) => {
  const uploadedFile = path.resolve(req.file.path);
  const tempThumb = path.resolve("uploads/" + uuid.v4());

  try {
    await sharp(uploadedFile)
      .resize(Number(req.body.width), Number(req.body.height))
      .toFormat(path.extname(req.file.originalname).split(".")[1], {
        quality: 100
      })
      .toFile(tempThumb, (err, info) => {
        if (err) {
          console.log(38, err);
        } else {
          const fileStream = fs.createReadStream(tempThumb);
          const imgParamsA = {
            Bucket: awsBucket,
            Key: `${directory[req.body.imageType]}${req.body.fileName}`,
            ContentType: req.file.mimetype.split("/")[1],
            Body: fileStream,
            ACL: "public-read"
          };

          s3bucket.upload(imgParamsA, function (err, data) {
            if (err) {
              res.json({ err });
            } else {
              res.json({
                success: 1,
                location: data.location,
                fileName: req.body.fileName
              });
              try {
                fs.unlinkSync(uploadedFile);
                fs.unlinkSync(tempThumb);
              } catch (error) {
                res.send(error);
              }
            }
          });
        }
      });
  } catch (error) {
    console.log("111 error", error);
    res.send(error);
  }
});

module.exports = router;
