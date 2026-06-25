import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/oswald/400.css";
import "@fontsource/oswald/700.css";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
