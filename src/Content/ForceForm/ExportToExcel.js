// https://dev.to/jasurkurbanovinit/how-to-export-data-to-excel-from-api-using-react-25go
import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export const ExportToExcel = ({ allData, fileName }) => {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const exportToCSV = (allData, fileName) => {
    const allKeys = Object.keys(allData);
    const allValues = Object.values(allData);
    const allWS = {};
    allKeys.forEach((sheetName, index) => {
      const wsData = XLSX.utils.json_to_sheet(allValues[index]);
      allWS[sheetName] = wsData;
    });
    const wb = { Sheets: allWS, SheetNames: allKeys };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  return (
    <button onClick={(e) => exportToCSV(allData, fileName)}>Export</button>
  );
};
