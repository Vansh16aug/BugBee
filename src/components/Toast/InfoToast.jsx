import { toast } from "react-hot-toast";

const InfoToast = (message) => {
  toast(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#fff8e1",
      color: "#8a6d3b",
      fontWeight: "normal",
      borderRadius: "8px",
      padding: "6px 10px",
      fontSize: "14px",
      border: "1px solid #ffc107",
    },
    icon: (
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "#ffc107",
          color: "white",
          fontWeight: "bold",
          marginRight: "8px",
        }}
      >
        !
      </span>
    ),
    iconTheme: {
      primary: "#ffc107",
      secondary: "#fff",
    },
  });
};

export default InfoToast;
