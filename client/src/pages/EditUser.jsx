import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const roleName = localStorage.getItem("roleName");
  const loggedInUserId = localStorage.getItem("userId");

  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 🔹 Fetch user
        const userRes = await api.get(`/users/${id}`);
        const user = userRes.data;

        // 🔒 Admin self-edit block
        if (roleName === "admin" && user._id === loggedInUserId) {
          alert("Admin cannot edit himself");
          return navigate("/dashboard/users");
        }

        setForm({
          name: user.name,
          email: user.email,
          role: user.role?.name || "employee"
        });

        // 🔹 Fetch roles
        const roleRes = await api.get("/roles");
        setRoles(roleRes.data);

      } catch (err) {
        alert(err.response?.data?.message || "Failed to load user");
        navigate("/dashboard/users");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, roleName, loggedInUserId, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${id}`, form);
      navigate("/dashboard/users");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading user...</p>;
  }

  return (
    <div className="max-w-md bg-[#121826] p-6 rounded-xl border border-white/10">
      <h2 className="text-xl font-bold text-white mb-4">
        Edit User
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
          required
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
          required
        />

        {/* ROLE DROPDOWN */}
        {roleName === "admin" && (
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-[#0f172a] text-white"
          >
            {roles.map((r) => (
              <option key={r._id} value={r.name}>
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
          Update User
        </button>
      </form>
    </div>
  );
};

export default EditUser;
