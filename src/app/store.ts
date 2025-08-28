import { configureStore } from "@reduxjs/toolkit";

// No RTK Query reducers/middleware now.
// If you still have other slices, add them here.
export const store = configureStore({
  reducer: {},
  middleware: (getDefault) => getDefault(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;