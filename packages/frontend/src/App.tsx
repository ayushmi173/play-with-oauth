import React, { useState } from "react";
import { api } from "./api";

const App: React.FC = () => {
  const [initialData, setInitialData] = useState({
    spreadSheetId: "",
    newSpreadSheet: "",
  });

  const handleLoginClick = async () => {
    const loginUrl: string = await api("/", "GET");
    if (loginUrl) {
      let top = window.screen.height - 550;
      top = top > 0 ? top / 2 : 0;
      let left = window.screen.width - 450;
      left = left > 0 ? left / 2 : 0;
      window.open(
        loginUrl,
        "Play with google sheet",
        "width=450,height=550" + ",top=" + top + ",left=" + left
      );
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    return setInitialData({
      ...initialData,
      [key]: value,
    });
  };

  const handleNewSheetClick = async () => {
    const newSheet = await api(
      `/create-sheet?title=${initialData.newSpreadSheet}`,
      "GET"
    );
    alert(JSON.stringify(newSheet));
  };

  return (
    <div className="App">
      <h1>Play With Google Sheet</h1>
      <button onClick={handleLoginClick}>Login</button>
      <div>
        <label>New SpreadSheet</label>
        <input
          name="New SpreadSheet"
          value={initialData.newSpreadSheet}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleFieldChange("newSpreadSheet", e.target.value)
          }
        />
        <button onClick={handleNewSheetClick}>Create New Sheet</button>
      </div>

      <div>
        <label>SpreadSheet Id</label>
        <input
          name="SpreadSheet Id"
          value={initialData.spreadSheetId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleFieldChange("spreadSheetId", e.target.value)
          }
        />
        <button onClick={handleNewSheetClick}>Create New Sheet</button>
      </div>
    </div>
  );
};

export default App;
