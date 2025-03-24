import { Link, useLocation } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { setTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="bg-background text-foreground">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <div className="text-lg font-bold">Bug Bee</div>
        <ul className="flex space-x-4">
          <li>
            <Link
              to="/"
              className={`hover:text-primary transition-colors duration-300 p-2 ${
                location.pathname === "/" ? "bg-secondary rounded-lg" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              className={`hover:text-primary transition-colors duration-300 p-2 ${
                location.pathname === "/about" ? "bg-secondary rounded-lg" : ""
              }`}
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              className={`hover:text-primary transition-colors duration-300 p-2 ${
                location.pathname === "/contact"
                  ? "bg-secondary rounded-lg"
                  : ""
              }`}
            >
              Contact
            </Link>
          </li>
        </ul>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <hr className="border-t border-primary" />
    </header>
  );
}
