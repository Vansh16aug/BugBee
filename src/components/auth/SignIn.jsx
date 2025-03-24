import { useDispatch } from "react-redux";
import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { signInUser } from "@/redux/auth/authSlice";
import { BACKEND_API_URL } from "@/constant";
import SuccessToast from "../Toast/SuccessToast";
import ErrorToast from "../Toast/ErrorToast";

const SignIn = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signInfunc = async (credential) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(
        BACKEND_API_URL + "/signin",
        {
          token: credential,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      dispatch(signInUser(response.data.data));
      SuccessToast("Successfully signed in! ");
    } catch (error) {
      console.error("Error signing in:", error);
      setError("An error occurred while signing in. Please try again.");
      ErrorToast("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          signInfunc(credentialResponse.credential);
        }}
        onError={(error) => {
          console.log("Signin Failure", error);
          setError("Failed to sign in. Please try again.");
        }}
      />
    </div>
  );
};

export default SignIn;
