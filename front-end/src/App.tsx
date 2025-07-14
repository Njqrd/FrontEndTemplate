import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TrainingPage from "./pages/TrainingPage";
import ProfilePage from "./pages/ProfilePage";
import PracticePage from "./pages/PracticePage";
import RootLayout from "./components/layout/RootLayout";
import { GameProvider } from "./contexts/GameContext";

function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </GameProvider>
  );
}

export default App;
