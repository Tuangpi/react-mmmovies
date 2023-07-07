import { S3 } from "aws-sdk";
import awsConfig, { myBucket } from "../../../wasabi";
import moment from "moment";

export const SearchObjects = (searchPattern) => {
  const s3 = new S3(awsConfig);
  const param = {
    Bucket: myBucket,
  };
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(param, async (err, data) => {
      if (err) {
        console.error("Wasabi Error:", err);
        reject(err);
      } else {
        const filteredObjects = data.Contents.filter((object) => {
          // Perform wildcard search by checking if the object key matches the pattern
          const regex = new RegExp(searchPattern.replace(/%/g, ".*"), "i");
          return regex.test(object.Key);
        });
        console.log("Filtered Objects:", filteredObjects);
        try {
          const result = await prepareDisplay(s3, filteredObjects);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

export const ListObjects = async (abortSignal) => {
  const s3 = new S3(awsConfig);
  const objects = [];
  let continuationToken;
  // do {
  const params1 = {
    Bucket: myBucket,
    MaxKeys: 500,
    // ContinuationToken: continuationToken,
  };

  try {
    const response = await s3
      .listObjectsV2(params1)
      .promise({ signal: abortSignal });
    objects.push(...response.Contents);
    // continuationToken = response.NextContinuationToken;
  } catch (error) {
    console.error(error, "Error");
    // Handle the error
  }
  // } while (continuationToken && objects.length < 10);
  return await prepareDisplay(s3, objects, abortSignal);
};
const prepareDisplay = async (s3, objects, abortSignal) => {
  let resultObj = [];
  objects.map(async (obj) => {
    const params2 = {
      Bucket: myBucket,
      Key: obj.Key,
    };
    const metaData = await s3.headObject(params2);
    if (obj.Key) {
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
    }
  });
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
