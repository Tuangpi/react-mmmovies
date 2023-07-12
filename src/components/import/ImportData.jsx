import { uploadData } from "./uploadData";
import Papa from "papaparse";
const ImportData = ({ docName }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    try {
      reader.onload = (event) => {
        const csvFileContent = event.target.result;
        const parsedData = Papa.parse(csvFileContent, { header: true });
        parsedData.data.pop();
        uploadData(parsedData.data, docName);
      };

      reader.readAsText(file);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      Import From CSV
      <input type="file" onChange={handleFileUpload} accept=".csv" />
    </>
  );
};

export default ImportData;
