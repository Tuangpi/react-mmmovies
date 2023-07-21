import { S3 } from "aws-sdk";
import awsConfig, { myBucket } from "../../../configs/wasabi";
import moment from "moment";

export const SearchObjects = async (searchPattern) => {
  const s3 = new S3(awsConfig);
  const param = {
    Bucket: myBucket,
    Prefix: searchPattern,
    MaxKeys: 50,
  };
  const data = await s3.listObjectsV2(param).promise();
  console.log("Filtered Objects:", data);
  return await prepareDisplay(s3, data, true);
};

export const ListObjects = async (continuationToken = null) => {
  const params = {
    Bucket: myBucket,
    MaxKeys: 30,
    ContinuationToken: continuationToken,
  };

  try {
    const s3 = new S3(awsConfig);
    const response = await s3.listObjectsV2(params).promise();
    return {
      objects: await prepareDisplay(s3, response.Contents, false),
      continuationToken: response.NextContinuationToken,
    };
  } catch (error) {
    console.error("Error fetching objects:", error);
    throw error;
  }
};

const prepareDisplay = async (s3, objects, fromSearch) => {
  let resultObj = [];
  objects = fromSearch ? objects.Contents : objects;
  if (objects && objects.length > 0) {
    await Promise.all(
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
      })
    );
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
