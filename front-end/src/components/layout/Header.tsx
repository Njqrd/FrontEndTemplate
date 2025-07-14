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
  const { playerStats } = useGame();

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
          <Link to="/practice" className="hover:text-blue-400 transition-colors">Practice</Link>
          <Link to="/profile" className="hover:text-blue-400 transition-colors">Profile</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Gem className="h-6 w-6 text-yellow-400" />
            <span className="font-semibold">{playerStats.chips.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-red-500" />
            <span className="font-semibold">{playerStats.streak}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-6 w-6 text-green-400" />
            <span className="font-semibold">Level 1</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Player</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    player@example.com
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
