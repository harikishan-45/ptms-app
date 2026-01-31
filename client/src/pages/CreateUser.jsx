// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../api/axios";

// const CreateUser = () => {
//   const roleName = localStorage.getItem("roleName");
//   const navigate = useNavigate();

//   const [roles, setRoles] = useState([]);
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: ""
//   });

//   useEffect(() => {
//     const fetchRoles = async () => {
//       try {
//         const res = await api.get("/roles");

//         // manager can assign only employee
//         const filtered =
//           roleName === "manager"
//             ? res.data.filter(r => r.name === "employee")
//             : res.data;

//         setRoles(filtered);

//         if (filtered.length) {
//           setForm(f => ({ ...f, role: filtered[0]._id }));
//         }
//       } catch (err) {
//         console.error("Fetch roles error:", err);
//       }
//     };

//     fetchRoles();
//   }, [roleName]);

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await api.post("/users", form);
//       navigate("/dashboard/users");
//     } catch (err) {
//       alert(err.response?.data?.message || "User creation failed");
//     }
//   };

//   return (
//     <div className="max-w-md bg-[#121826] p-6 rounded-xl border border-white/10">
//       <h2 className="text-xl font-bold text-white mb-4">
//         {roleName === "manager" ? "Create Employee" : "Create User"}
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           name="name"
//           placeholder="Name"
//           onChange={handleChange}
//           className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
//           required
//         />

//         <input
//           name="email"
//           placeholder="Email"
//           onChange={handleChange}
//           className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
//           required
//         />

//         <input
//           name="password"
//           type="password"
//           placeholder="Password"
//           onChange={handleChange}
//           className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
//           required
//         />

//         <select
//           name="role"
//           value={form.role}
//           onChange={handleChange}
//           className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
//         >
//           {roles.map(r => (
//             <option key={r._id} value={r._id}>
//               {r.name}
//             </option>
//           ))}
//         </select>

//         <button
//           type="submit"
//           className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded"
//         >
//           Create
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateUser;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateUser = () => {
  const roleName = localStorage.getItem("roleName");
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/roles");

        // 🔥 Admin → all roles
        if (roleName === "admin") {
          setRoles(res.data);
          setForm(f => ({ ...f, role: res.data[0]?.name || "" }));
        }

        // 🔥 Manager → only employee (auto)
        if (roleName === "manager") {
          setRoles([{ name: "employee" }]);
          setForm(f => ({ ...f, role: "employee" }));
        }

      } catch (err) {
        console.error("Fetch roles error:", err);
      }
    };

    fetchRoles();
  }, [roleName]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role // ✅ role NAME
      });

      navigate("/dashboard/users");
    } catch (err) {
      alert(err.response?.data?.message || "User creation failed");
    }
  };

  return (
    <div className="max-w-md bg-[#121826] p-6 rounded-xl border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4">
        {roleName === "manager" ? "Create Employee" : "Create User"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
          required
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
          required
        />

        {/* ROLE */}
        {roleName === "admin" && (
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
          >
            {roles.map(r => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        )}

        {roleName === "manager" && (
          <select
            value="employee"
            disabled
            className="w-full px-3 py-2 rounded bg-[#0f172a] text-white opacity-70"
          >
            <option value="employee">employee</option>
          </select>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateUser;
