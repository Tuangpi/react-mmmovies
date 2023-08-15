import { S3 } from "aws-sdk";
import awsConfig, { myBucket } from "../configs/wasabi";
import moment from "moment";

export const getObjects = async (path) => {
  const s3 = new S3(awsConfig);
  const param = {
    Bucket: myBucket,
    Prefix: path,
  };
  const data = await s3.listObjectsV2(param).promise();
  console.log("Filtered Objects:", data);
  return await prepareDisplay(s3, data, true);
};

export const SearchObjects = (searchPattern, key) => {
  const s3 = new S3(awsConfig);
  const param = {
    Bucket: myBucket,
    Prefix: key,
  };
  return new Promise((resolve, reject) => {
    s3.listObjectsV2(param, async (err, data) => {
      if (err) {
        console.error("Wasabi Error:", err);
        reject(err);
      } else {
        const filteredObjects = data.Contents.filter((object) => {
          const regex = new RegExp(searchPattern.replace(/%/g, ".*"), "i");
          return regex.test(object.Key);
        });
        console.log("Filtered Objects:", filteredObjects);
        try {
          const result = await prepareDisplay(s3, filteredObjects, false);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }
    });
  });
};

export const ListObjects = async (continuationToken = null, key) => {
  const params = {
    Bucket: myBucket,
    MaxKeys: 30,
    Prefix: key,
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
              name: obj.Key.replace(/^(movies|tvshow)_upload_wasabi\/(url_[0-9]+\/)?/, ""),
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
