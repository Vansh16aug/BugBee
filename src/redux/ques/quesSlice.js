import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  questions: [],
  loading: false,
  error: null,
  questionCreatedByMe: [],
};

const questionSlice = createSlice({
  name: "questions",
  initialState,
  reducers: {
    fetchQuesSuccess: (state, action) => {
      state.questions = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    questionCreatedByMe: (state, action) => {
      state.questionCreatedByMe = action.payload;
    },
    updateQuesVotes: (state, action) => {
      const { id, votes } = action.payload;
      state.questions = state.questions.map((question) =>
        question.id === id
          ? {
              ...question,
              votes: {
                upvotes: votes.upvotes,
                downvotes: votes.downvotes,
              },
            }
          : question
      );
    },
  },
});

export const {
  fetchQuesSuccess,
  setLoading,
  setError,
  questionCreatedByMe,
  updateQuesVotes,
} = questionSlice.actions;

export default questionSlice.reducer;
