"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { restoreSession } from "./thunks/authThunks";

/** Restores the session once per app load (thunk `condition` dedupes StrictMode re-runs). */
const SessionBootstrap = () => {
  useEffect(() => {
    store.dispatch(restoreSession());
  }, []);
  return null;
};

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionBootstrap />
      {children}
    </Provider>
  );
}
