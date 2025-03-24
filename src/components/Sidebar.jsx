import { Separator } from "@/components/ui/separator";
import { AccountSwitcher } from "./Ques/account-switcher";
import { Nav } from "./Ques/nav";

const Sidebar = ({ isOpen, toggleSidebar, navLinks, navLinkClick }) => {
  return (
    <div className="relative sidebar">
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-background text-foreground transform transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[56px] items-center justify-start px-2">
          <AccountSwitcher isCollapsed={false} />
        </div>
        <Separator />
        <Nav links={navLinks} navLinkClick={navLinkClick} />
        <Separator />
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 backdrop-blur-sm"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
