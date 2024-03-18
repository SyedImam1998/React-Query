import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import RqSuperHero from "./Screen/RqSuperHero";
import Home from "./Screen/Home";
import NavBar from "./Component/NavBar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Routes>
      <Route Component={NavBar}>
        <Route path="/" Component={Home}></Route>
        <Route path="/rq-superhero" Component={RqSuperHero}></Route>
      </Route>
    </Routes>
  );
}

export default App;
