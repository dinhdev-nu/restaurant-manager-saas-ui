import React from "react";
import Routes from "./Routes";
import { Toaster } from "components/ui/Toaster";
import { SSEProvider } from "./contexts/SSEContext";

function App() {
  return (
    <SSEProvider>
      <Routes />
      <Toaster />
    </SSEProvider>
  );
}

export default App;
