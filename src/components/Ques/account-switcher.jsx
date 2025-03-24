import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export function AccountSwitcher() {
  const isSidebarCollapsed = useSelector(
    (store) => store.app.isSidebarCollapsed
  );
  const { user } = useSelector((store) => store.auth);

  const displayName = user?.name || "User";
  const displayEmail = user?.email
    ? user.email?.length > 18
      ? `${user?.email.slice(0, 20)}...`
      : user?.email
    : "No email available";
  const avatarUrl =
    user?.picture ||
    "https://res.cloudinary.com/vanshstorage/image/upload/v1728808566/user_avatar_vk8wrh.png";

  return (
    <Link to="/profile" aria-label="View or edit your profile">
      <Button
        variant="ghost"
        className={cn(
          isSidebarCollapsed
            ? " h-full justify-start gap-3 px-2"
            : "w-60 h-full justify-start gap-3 px-2",
          "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Avatar className="h-8 w-8">
          <img
            src={avatarUrl}
            className={cn("object-cover", isSidebarCollapsed && "items-center")}
            alt={`Profile picture of ${displayName}`}
          />
          <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            isSidebarCollapsed ? "hidden" : "flex flex-col items-start"
          )}
        >
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">{displayEmail}</span>
        </div>
      </Button>
    </Link>
  );
}
