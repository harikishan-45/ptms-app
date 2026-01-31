import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateProject = () => {
  const roleName = localStorage.getItem("roleName");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [manager, setManager] = useState("");
  const [managers, setManagers] = useState([]);

  /* FETCH MANAGERS (ADMIN ONLY) */
  useEffect(() => {
    if (roleName === "admin") {
      api.get("/users").then((res) => {
        const mgrs = res.data.users.filter(
          (u) => u.role?.name === "manager"
        );
        setManagers(mgrs);
      });
    }
  }, [roleName]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/projects", {
        name,
        description,
        manager: roleName === "admin" ? manager : undefined
      });

      alert("Project created successfully");
      navigate("/dashboard/projects");
    } catch (err) {
      alert(err.response?.data?.message || "Project creation failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[#121826] border border-white/10 rounded-2xl p-8 shadow-lg">
        {/* TITLE */}
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Create Project
        </h2>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PROJECT NAME */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Project Name
            </label>
            <input
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description
            </label>
            <textarea
              placeholder="Describe the project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              required
            />
          </div>

          {/* MANAGER SELECT (ADMIN ONLY) */}
          {roleName === "admin" && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Assign Manager
              </label>
              <select
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-white/10 text-gray-200 focus:outline-none focus:border-indigo-500 transition"
                required
              >
                <option value="">Select Manager</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold transition"
          >
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
