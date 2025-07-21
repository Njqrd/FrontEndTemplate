import { Link } from "react-router-dom";
import { Gem, Flame, Star, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGame } from "@/contexts/GameContext";

const Header = () => {
  // Use optional chaining and provide fallback values
  const gameContext = useGame();
  const playerStats = gameContext?.playerStats || {
    chips: 1000,
    streak: 0,
    correctAnswers: 0,
    totalAnswered: 0
  };

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center space-x-2">
          <Gem className="h-8 w-8 text-blue-400" />
          <span className="text-2xl font-bold">Poker Trainer</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
          <Link to="/training" className="hover:text-blue-400 transition-colors">Training</Link>
          <Link to="/sandbox" className="hover:text-blue-400 transition-colors">Sandbox</Link>
          <Link to="/profile" className="hover:text-blue-400 transition-colors">Profile</Link>
        </nav>

        <div className="flex items-center space-x-4">
          {/* Player Stats */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Gem className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium">{playerStats.chips}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium">{playerStats.streak}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">
                {playerStats.totalAnswered > 0 ? Math.round((playerStats.correctAnswers / playerStats.totalAnswered) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Player</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {playerStats.chips} chips
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
