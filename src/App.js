import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/Register";
import Home from "./components/Home";
import Input from "./components/Input";
import HomeAdmin from "./components/HomeAdmin";
import RekapanLaporan from "./components/rekap";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/home" element={<Home/>} />
        <Route path="/input" element={<Input/>} />
        <Route path="/HomeAdmin" element={<HomeAdmin/>} />
        <Route path="/rekapan" element={<RekapanLaporan/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
