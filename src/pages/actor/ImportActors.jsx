import React from "react";

const ImportActors = () => {
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileContent = event.target.result;
      const parsedData = JSON.parse(fileContent);
      console.log(parsedData);
      setJsonData(parsedData);
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
};

export default ImportActors;
