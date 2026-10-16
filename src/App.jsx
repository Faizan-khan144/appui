import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Chat from "./pages/Chat";
import Studio from "./pages/Studio";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/studio" element={<Studio />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
