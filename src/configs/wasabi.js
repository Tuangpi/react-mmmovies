const awsConfig = {
  accessKeyId: process.env.REACT_APP_WASABI_ACCESS_KEY,
  secretAccessKey: process.env.REACT_APP_SECRET_KEY,
  endpoint: process.env.REACT_APP_ENDPOINT,
  s3ForcePathStyle: true, // Required for Wasabi
};
export const myBucket = process.env.REACT_APP_BUCKET_NAME;

export default awsConfig;
