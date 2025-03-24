import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth/authSlice";
import appSlice from "./app/appSlice";
import questionSlice from "./ques/quesSlice";
import ansSlice from "./ans/ansSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    app: appSlice,
    questions: questionSlice,
    answers: ansSlice,
  },
});

export default store;
