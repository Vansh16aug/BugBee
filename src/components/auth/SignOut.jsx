import { useDispatch, useSelector } from "react-redux";
import { signOutUser } from "@/redux/auth/authSlice";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LogOut } from "lucide-react";
import axios from "axios";
import { BACKEND_API_URL } from "@/constant";
import { useNavigate } from "react-router-dom";
import SuccessToast from "../Toast/SuccessToast";
import ErrorToast from "../Toast/ErrorToast";

const SignOut = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isSidebarCollapsed = useSelector(
    (store) => store.app.isSidebarCollapsed
  );
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        BACKEND_API_URL + "/signout",
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      dispatch(signOutUser());
      navigate("/");
      SuccessToast("Signed out! ");
    } catch (error) {
      console.error("Error signing out:", error);
      ErrorToast("Failed to sign out. Please try again.");
      setError("An error occurred while signing out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size={isSidebarCollapsed ? "icon" : "default"}
      className="w-full justify-start pl-3 pr-3 bg-[#8B0000] hover:bg-[#8B1A1A] text-white"
      onClick={handleSignOut}
    >
      <LogOut className="h-4 w-4" strokeWidth={3} />

      {!isSidebarCollapsed && <span className="ml-2"> Sign Out</span>}

      <span className="sr-only"> Sign out</span>
    </Button>
  );
};

export default SignOut;
