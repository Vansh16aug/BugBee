import { toast } from "react-hot-toast";

const SuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#fff",
      fontWeight: "normal",
      borderRadius: "8px",
      padding: "6px 10px",
      fontSize: "14px",
      border: "1px solid #4caf50",
    },
    iconTheme: {
      primary: "#4caf50",
      secondary: "#fff",
    },
  });
};

export default SuccessToast;
