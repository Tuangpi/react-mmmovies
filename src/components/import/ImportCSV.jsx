import { ChangeCSVtoJson } from "../../helper/Helpers";
import { MakeTableRelation } from "../../utils/MakeTableRelation";
import { uploadData } from "./uploadData";

const ImportCSV = ({ docName, isLoading }) => {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    try {
      reader.onload = async (event) => {
        isLoading(true);
        const JSONData = ChangeCSVtoJson(event.target.result);
        await uploadData(JSONData, docName);
        const a = await MakeTableRelation(docName);
        console.log(a);
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
