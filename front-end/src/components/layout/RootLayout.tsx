import { Outlet } from "react-router-dom";
import Header from "./Header";

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto p-4 flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; 2025 Poker Trainer</p>
      </footer>
    </div>
  );
};

export default RootLayout;
