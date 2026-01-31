import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const ProjectTasks = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjectTasks = async () => {
      try {
        const res = await api.get(`/projects/${id}/tasks`);
        setTasks(res.data.tasks);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectTasks();
  }, [id]);

  /* LOADING */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-gray-400">
        Loading project tasks...
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
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Project Tasks</h2>

        <Link
          to="/dashboard/projects"
          className="text-indigo-400 hover:text-indigo-300 transition"
        >
          ⬅ Back to Projects
        </Link>
      </div>

      {/* TASKS */}
      {tasks.length === 0 ? (
        <div className="bg-[#121826] border border-white/10 rounded-xl p-6 text-gray-400">
          No tasks found for this project
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <ProjectTaskCard key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

/* TASK CARD */
const ProjectTaskCard = ({ task }) => {
  return (
    <div className="bg-[#121826] border border-white/10 rounded-xl p-6 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition">
      <h3 className="text-xl font-semibold text-white mb-2">
        {task.title}
      </h3>

      <div className="text-sm text-gray-400 space-y-1 mb-3">
        <p>
          Status: <StatusBadge status={task.status} />
        </p>
        <p>
          Priority:{" "}
          <span className="text-gray-300 capitalize">
            {task.priority || "Normal"}
          </span>
        </p>
        <p>
          Assigned To:{" "}
          <span className="text-gray-300">
            {task.assignedTo?.name || "Unassigned"}
          </span>
        </p>
      </div>
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
      className={`inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status] || "bg-gray-500/20 text-gray-300"
      }`}
    >
      {status}
    </span>
  );
};

export default ProjectTasks;
