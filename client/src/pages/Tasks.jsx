import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const roleName = localStorage.getItem("roleName");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-gray-400">
        Loading tasks...
      </div>
    );
  }

  /* ERROR */
  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-gray-200 p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white">Tasks</h2>

        {(roleName === "admin" || roleName === "manager") && (
          <Link to="/dashboard/tasks/create">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition">
              + Create Task
            </button>
          </Link>
        )}
      </div>

      {/* TASK LIST */}
      {tasks.length === 0 ? (
        <div className="bg-[#121826] border border-white/10 rounded-xl p-6 text-gray-400">
          No tasks found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              role={roleName}
              updateStatus={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* TASK CARD */
const TaskCard = ({ task, role, updateStatus }) => {
  return (
    <div className="bg-[#121826] border border-white/10 rounded-xl p-6 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition">
      <Link to={`/dashboard/tasks/${task._id}`}>
        <h3 className="text-xl font-semibold text-white mb-2 hover:text-indigo-400 transition">
          {task.title}
        </h3>
      </Link>

      <div className="text-sm text-gray-400 space-y-1 mb-4">
        <p>
          Project:{" "}
          <span className="text-gray-300">
            {task.project?.name || "N/A"}
          </span>
        </p>
        <p>
          Assigned To:{" "}
          <span className="text-gray-300">
            {task.assignedTo?.name || "Unassigned"}
          </span>
        </p>
      </div>

      {/* STATUS BADGE */}
      <StatusBadge status={task.status} />

      {/* STATUS UPDATE (Admin/Manager)
      {(role === "admin" || role === "manager") && (
        <div className="mt-4">
          <select
            value={task.status}
            onChange={(e) => updateStatus(task._id, e.target.value)}
            className="w-full bg-[#0f172a] border border-white/10 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      )} */}
    </div>
  );
};

/* STATUS BADGE */
const StatusBadge = ({ status }) => {
  const colors = {
    todo: "bg-gray-600/20 text-gray-300",
    "in-progress": "bg-blue-500/20 text-blue-400",
    review: "bg-yellow-500/20 text-yellow-400",
    done: "bg-green-500/20 text-green-400",
    blocked: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status] || "bg-gray-500/20 text-gray-300"
      }`}
    >
      {status}
    </span>
  );
};

export default Tasks;
