import "./App.css";

import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PrivacyPage from "./pages/PrivacyPage";

import { ThemeProvider } from "./components/theme-provider";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-center"
        duration={3000}
        style={
          {
            "--normal-bg": "var(--card)",
            "--normal-border": "var(--border)",
            "--normal-text": "var(--card-foreground)",
          } as React.CSSProperties
        }
        toastOptions={{
          classNames: {
            success: "!border-l-4 !border-l-green-500",
            error: "!border-l-4 !border-l-destructive",
          },
        }}
      />
    </ThemeProvider>
  );
}

export default App;
