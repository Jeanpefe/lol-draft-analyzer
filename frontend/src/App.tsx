import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import MetaPage from "./pages/MetaPage";
import TeamPage from "./pages/TeamPage";
import MatchPage from "./pages/MatchPage";
import SimulatorPage from "./pages/SimulatorPage";
import TeamsListPage from "./pages/TeamsListPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MetaPage />} />
          <Route path="teams" element={<TeamsListPage />} />
          <Route path="team/:teamname" element={<TeamPage />} />
          <Route path="match/:gameid" element={<MatchPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
