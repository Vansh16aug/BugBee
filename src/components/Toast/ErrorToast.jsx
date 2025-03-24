import { toast } from "react-hot-toast";

const ErrorToast = (message = "An error occurred") => {
  toast.error(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#fff", // White background color
      fontWeight: "normal",
      borderRadius: "8px",
      padding: "6px 10px", // Reduced padding for a smaller height
      fontSize: "14px", // Smaller font size for a compact look
      border: "1px solid #e53935", // Red border for error
    },
    iconTheme: {
      primary: "#e53935", // Red icon color
      secondary: "#fff", // White background for the icon circle
    },
  });
};

export default ErrorToast;
