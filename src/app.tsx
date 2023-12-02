// @refresh reload
import { Router } from "@solidjs/router";
// @ts-expect-error missing types
import { FileRoutes } from "@solidjs/start";
import { Suspense } from "solid-js";

import '@fontsource-variable/rubik';
import './global.css';

export default function App() {
  return (
    <Router
      root={props => (
        <>
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}