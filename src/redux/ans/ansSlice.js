import { createSlice } from "@reduxjs/toolkit";

const ansSlice = createSlice({
  name: "answers",
  initialState: {
    answers: [],
    loading: false,
    error: null,
  },
  reducers: {
    fetchAnsSuccess: (state, action) => {
      state.answers = action.payload;
    },
    addAnswer: (state, action) => {
      state.answers.push(action.payload);
    },
    updateAnswer: (state, action) => {
      const index = state.answers.findIndex(
        (ans) => ans.id === action.payload.id
      );
      if (index !== -1) {
        state.answers[index] = action.payload;
      }
    },
    deleteAnswer: (state, action) => {
      state.answers = state.answers.filter((ans) => ans.id !== action.payload);
    },
    updateVotes: (state, action) => {
      const { id, votes } = action.payload;
      const answer = state.answers.find((ans) => ans.id === id);
      if (answer) {
        answer.votes = votes;
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  fetchAnsSuccess,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  updateVotes,
  setLoading,
  setError,
} = ansSlice.actions;

export default ansSlice.reducer;
