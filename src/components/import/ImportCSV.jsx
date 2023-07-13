import { uploadData } from "./uploadData";
import Papa from "papaparse";

const ImportCSV = ({ docName, isLoading }) => {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    try {
      reader.onload = async (event) => {
        isLoading(true);
        const csvFileContent = event.target.result;
        const parsedData = Papa.parse(csvFileContent, { header: true });
        parsedData.data.pop();
        await uploadData(parsedData.data, docName);
        isLoading(false);
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

export default ImportCSV;
