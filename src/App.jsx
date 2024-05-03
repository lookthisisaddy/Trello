import Main from "./components/Main";
import Navbar from "./components/Navbar";
import "./App.css";
import { BoardContext } from "./context/BoardContext";
import { useEffect, useState } from "react";
import { boardData } from "./data/Constants";

const App = () => {

  const [allBoard, setAllBoard] = useState(() => {
    const savedBoard = localStorage.getItem('boardData');
    return savedBoard ? JSON.parse(savedBoard) : boardData;
  });

  useEffect(() => {
    localStorage.setItem('boardData', JSON.stringify(allBoard));
  }, [allBoard]);

  return (
    <>
      <Navbar />
      <BoardContext.Provider value={{ allBoard, setAllBoard }}>
        <div className="d-flex flex-row">
          <Main />
        </div>
      </BoardContext.Provider>
    </>
  );
};

export default App;
