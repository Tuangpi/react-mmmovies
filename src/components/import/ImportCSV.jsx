import { MakeMovieTableRelation } from "../../utils/MakeMovieTableRelation";
import { uploadData } from "./uploadData";
import Papa from "papaparse";

const ImportCSV = ({ docName, isLoading }) => {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    try {
      reader.onload = async (event) => {
        isLoading(true);
        const csvFileContent = event.target.result;
        const parsedData = Papa.parse(csvFileContent, { header: true });
        parsedData.data.pop();
        await uploadData(parsedData.data, docName);
      };

      reader.readAsText(file);
    } catch (err) {
      console.log(err);
    }

    try {
      const a = await MakeMovieTableRelation(docName);
      isLoading(false);
      console.log(a);
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
