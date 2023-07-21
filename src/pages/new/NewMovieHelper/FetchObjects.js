import { S3 } from "aws-sdk";
import awsConfig, { myBucket } from "../../../configs/wasabi";
import moment from "moment";

export const SearchObjects = async (searchPattern) => {
  const s3 = new S3(awsConfig);
  const param = {
    Bucket: myBucket,
    Prefix: "movies_upload_wasabi/" + searchPattern,
    MaxKeys: 50,
  };
  const data = await s3.listObjectsV2(param).promise();
  console.log("Filtered Objects:", data);
  return await prepareDisplay(s3, data, true);
};

export const ListObjects = async () => {
  const s3 = new S3(awsConfig);
  const objects = [];
  let continuationToken;
  // do {
  const params1 = {
    Bucket: myBucket,
    MaxKeys: 50,
    // ContinuationToken: continuationToken,
  };

  try {
    const response = await s3.listObjectsV2(params1).promise();
    objects.push(...response.Contents);
    // continuationToken = response.NextContinuationToken;
  } catch (error) {
    console.error(error, "Error");
    // Handle the error
  }
  // } while (continuationToken && objects.length < 10);
  return await prepareDisplay(s3, objects, false);
};

const prepareDisplay = async (s3, objects, fromSearch) => {
  let resultObj = [];
  fromSearch ? (objects = objects.Contents) : (objects = objects);
  if (objects && objects.length > 0) {
    objects.map(async (obj) => {
      const params2 = {
        Bucket: myBucket,
        Key: obj.Key,
      };

      const metaData = await s3.headObject(params2).promise();
      if (metaData.ContentLength > 0) {
        if (metaData.ContentType.includes("video/")) {
          const newObj = {
            fileTime: moment(metaData.LastModified).calendar(null, {
              sameDay: "[Today]",
              nextDay: "[Tomorrow]",
              nextWeek: "dddd",
              lastDay: "[Yesterday]",
              lastWeek: "[Last] dddd",
              sameElse: "DD/MM/YYYY",
            }),
            size: formatBytes(metaData.ContentLength),
            name: obj.Key.replace(/^movies_upload_wasabi\//, ""),
            extension: metaData.ContentType.replace(/^video\//, ""),
            path: obj.Key,
          };
          resultObj.push(newObj);
        }
      }
    });
  }
  return resultObj;
};
const formatBytes = (bytes) => {
  if (bytes < 1024) {
    return bytes + " bytes";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + " kB";
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }
};
