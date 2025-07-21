import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TrainingPage from "./pages/TrainingPage";
import ProfilePage from "./pages/ProfilePage";
import SandboxPage from "./pages/SandboxPage";
import RootLayout from "./components/layout/RootLayout";
import { GameProvider } from "./contexts/GameContext";

function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="sandbox" element={<SandboxPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </GameProvider>
  );
}

export default App;
