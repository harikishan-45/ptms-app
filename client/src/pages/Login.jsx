import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // const res = await api.post("/auth/login", { email, password });

      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("role", res.data.user.role);

      // navigate("/dashboard");
      const res = await api.post("/auth/login", {
        email,
        password
      });
      console.log(res.data);
//       const res = await api.post("/auth/login", formData);
// console.log("LOGIN RESPONSE 👉", res.data);


      // 🔐 SAVE DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("roleName", res.data.user.roleName);
      localStorage.setItem(
        "permissions",
        JSON.stringify(res.data.user.permissions)
      );
      localStorage.setItem("userId", res.data.user.id);
       
      // 🚀 REDIRECT
      navigate("/dashboard/home");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] px-4">
      <div className="w-full max-w-md bg-[#121826] border border-white/10 rounded-2xl p-8 shadow-lg">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          PTMS Login
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Project & Task Management System
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold transition"
          >
            Login
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Secure access for Admin & Managers
        </p>
      </div>
    </div>
  );
};

export default Login;
