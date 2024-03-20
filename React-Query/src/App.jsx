
import "./App.css";
import { Route, Routes } from "react-router-dom";
import RqSuperHero from "./Screen/RqSuperHero";
import Home from "./Screen/Home";
import NavBar from "./Component/NavBar";
import RqSuperHeroDetails from "./Screen/RqSuperHeroDetails";
import ParallelQueryPage from "./Screen/ParallelQuery.page";

function App() {

  return (
    <Routes>
      <Route Component={NavBar}>
        <Route path="/" Component={Home}></Route>
        <Route path="/rq-superhero" Component={RqSuperHero}></Route>
        <Route path="/rq-superhero/:id" Component={RqSuperHeroDetails}></Route>
        <Route path="/parallelQuery" Component={ParallelQueryPage}></Route>
      </Route>
    </Routes>
  );
}

export default App;
