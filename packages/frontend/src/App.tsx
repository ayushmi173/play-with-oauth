import React, { useState } from "react";
import Cookies from "js-cookie";

import { api } from "./api";

const App: React.FC = () => {
  const [initialData, setInitialData] = useState({
    spreadSheetId: "",
    newSpreadSheet: "",
    name: "",
    email: "",
    task: "",
  });

  const isLoggedInUser = Cookies.get("auth_tokens") || undefined;
  console.log(isLoggedInUser);

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
    alert(
      `copy this spread sheet id for adding the content over it ${JSON.stringify(
        newSheet
      )}`
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const addRow = await api(`/add-data`, "POST", {
      name: initialData.name,
      email: initialData.email,
      task: initialData.task,
      spreadsheetId: initialData.spreadSheetId,
    });

    alert(`Submitted Result ${JSON.stringify(addRow)}`);
  };

  return (
    <div className="App">
      <h1>Play With Google Sheet</h1>
      {!isLoggedInUser ? (
        <button onClick={handleLoginClick}>Login</button>
      ) : (
        "Logged In user"
      )}
      <hr />
      <div>
        <h1>Create new sheet</h1>

        <label>New SpreadSheet Name</label>
        <input
          name="New SpreadSheet"
          value={initialData.newSpreadSheet}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleFieldChange("newSpreadSheet", e.target.value)
          }
        />
        <button onClick={handleNewSheetClick}>Create New Sheet</button>
      </div>
      <hr />
      <h1>Add data inside the specified spread sheet</h1>

      <form id="contact-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <div>
            <label>SpreadSheet Id</label>
            <input
              name="SpreadSheet Id"
              value={initialData.spreadSheetId}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFieldChange("spreadSheetId", e.target.value)
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="form-control"
            value={initialData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input
            type="email"
            className="form-control"
            value={initialData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="task">Task</label>
          <textarea
            className="form-control"
            rows={5}
            value={initialData.task}
            onChange={(e) => handleFieldChange("task", e.target.value)}
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default App;
