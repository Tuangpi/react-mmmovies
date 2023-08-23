import { toast } from "react-toastify";
import { ChangeCSVtoJson } from "../../helper/Helpers";
import { MakeTableRelation } from "../../helper/MakeTableRelation";
import { uploadData } from "../../helper/uploadData";

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
    toast("Import Finished. Refresh Page!");
  };

  return (
    <>
      <label htmlFor="file-input">Import {docName}</label>
      <input
        type="file"
        id="file-input"
        className="tw-cursor-pointer tw-block tw-w-full tw-border tw-border-none tw-shadow-sm tw-rounded-md tw-text-sm focus:tw-z-10 focus:tw-border-blue-500
    file:tw-bg-transparent file:tw-border-0
    file:tw-bg-slate-300 file:tw-mr-2
    file:tw-py-1 file:tw-px-2"
        onChange={handleFileUpload}
        accept=".csv"
      ></input>
    </>
  );
};

export default ImportCSV;
