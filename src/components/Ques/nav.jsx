import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SignOut from "../auth/SignOut";
import { useSelector } from "react-redux";
import { Newspaper } from "lucide-react";

export function Nav({ links, navLinkClick }) {
  const isSidebarCollapsed = useSelector(
    (store) => store.app.isSidebarCollapsed
  );
  const loggedin = useSelector((state) => state.auth.user);
  const location = useLocation();

  return (
    <div
      data-collapsed={isSidebarCollapsed}
      className="group flex flex-col h-[92vh]  py-2 data-[collapsed=true]:py-2 justify-between"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links?.map((link, index) => {
          const isActive = location.pathname === link.href;
          return (
            <TooltipProvider key={index}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={link.href}
                    onClick={navLinkClick}
                    className={cn(
                      buttonVariants({
                        variant: isActive ? "default" : link.variant,
                        size: isSidebarCollapsed ? "icon" : "sm",
                      }),
                      isSidebarCollapsed ? "h-9 w-9" : "justify-start",
                      isActive &&
                        "dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white",
                      link.variant === "default" &&
                        "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    )}
                  >
                    <link.icon
                      className={cn(
                        "h-4 w-4",
                        isSidebarCollapsed ? "" : "mr-2"
                      )}
                    />
                    {!isSidebarCollapsed && <span>{link.title}</span>}
                    {!isSidebarCollapsed && link.label && (
                      <span
                        className={cn(
                          "ml-auto",
                          link.variant === "default" &&
                            "text-background dark:text-white"
                        )}
                      >
                        {link.label}
                      </span>
                    )}
                    {isSidebarCollapsed && (
                      <span className="sr-only">{link.title}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="flex items-center gap-4"
                >
                  {link.title}
                  {link.label && (
                    <span className="ml-auto text-muted-foreground">
                      {link.label}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>
      <div className="mt-auto">
        <div className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          <Link to="/aboutus">
            <Button
              variant="ghost"
              size={isSidebarCollapsed ? "icon" : "default"}
              className="w-full justify-start pl-3 pr-3"
            >
              <Newspaper className="h-4 w-4" strokeWidth={3} />
              {!isSidebarCollapsed && <span className="ml-2">About Us</span>}
              <span className="sr-only">About Us</span>
            </Button>
          </Link>
        </div>
        {loggedin && (
          <div className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2 mt-[5px]">
            <SignOut />
          </div>
        )}
      </div>
    </div>
  );
}
