import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateTask = () => {
  const navigate = useNavigate();
  const roleName = localStorage.getItem("roleName");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [project, setProject] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const projRes = await api.get("/projects");
  //       setProjects(projRes.data.projects);

  //       const userRes = await api.get("/users");

  //       const emps = userRes.data.users.filter(
  //         (u) => u.role?.name === "employee"
  //       );
  //       setEmployees(emps);
  //     } catch (err) {
  //       console.error("Create task load error:", err);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Projects
        const projRes = await api.get("/projects");
        setProjects(projRes.data.projects || []);

        // Users
        const userRes = await api.get("/users");
        const allUsers = userRes.data.users || [];

        const loggedInUserId = localStorage.getItem("userId");
        // or from auth context if you have one

        const filteredUsers = allUsers.filter(
          (u) =>
            u.role?.name !== "admin" &&        // ❌ exclude admin
            u._id !== loggedInUserId            // ❌ exclude self
        );

        setEmployees(filteredUsers);

      } catch (err) {
        console.error("Create task load error:", err);
      }
    };

    fetchData();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/tasks", {
        title,
        description,
        project,
        assignedTo
      });

      alert("Task created successfully");
      navigate("/dashboard/tasks"); // ✅ FIX
    } catch (err) {
      alert(err.response?.data?.message || "Task creation failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[#121826] border border-white/10 rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Create Task
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TITLE */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] text-white"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] text-white"
              required
            />
          </div>

          {/* PROJECT */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] text-white"
              required
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* ASSIGN EMPLOYEE */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Assign Employee
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f172a] text-white"
              required
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-semibold"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;
