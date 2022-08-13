import { store } from "redux/store";
import { GenerateImport } from "./generateReactImportMatlab";
import { GenerateImportTable } from "./generateReactImportTable";

export function update() {
  var generate_import_antd = GenerateImportTable();
  var gia = GenerateImportTable() ? `${generate_import_antd}` : "";
  var generate_import = GenerateImport();
  console.log(generate_import);
  var gen_rea_mat = store.getState().StateReducer.stateNode.d();
  const code = `import React from "react";
import {${generate_import}} from 'antd'
${gia}
  export default function App() {
    return (
      <div className="App">
      ${gen_rea_mat}
      </div>
    );
}`;
  return function () {
    return code;
  };
}
