import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const roleName = localStorage.getItem("roleName");

  /* UNAUTHORIZED */
  if (roleName === "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
        <div className="bg-[#121826] border border-red-500/30 text-red-400 px-6 py-4 rounded-xl">
          You are not authorized to view projects.
        </div>
      </div>
    );
  }


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data.projects);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center text-gray-400">
        Loading projects...
      </div>
    );
  }

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
        <h2 className="text-3xl font-bold text-white">Projects</h2>

        {(roleName === "admin" || roleName === "manager") && (
          <Link to="/dashboard/projects/create">
            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition">
              + Create Project
            </button>
          </Link>
        )}

      </div>

      {/* PROJECT LIST */}
      {projects.length === 0 ? (
        <div className="bg-[#121826] border border-white/10 rounded-xl p-6 text-gray-400">
          No projects found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};

/* PROJECT CARD */
const ProjectCard = ({ project }) => {
  return (
    <Link to={`${project._id}/tasks`}>
      <div className="bg-[#121826] border border-white/10 rounded-xl p-6 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition cursor-pointer">
        <h3 className="text-xl font-semibold text-white mb-2">
          {project.name}
        </h3>

        <div className="text-sm text-gray-400 space-y-1">
          <p>
            Status:{" "}
            <span className="text-indigo-400 font-medium capitalize">
              {project.status}
            </span>
          </p>
          <p>
            Manager:{" "}
            <span className="text-gray-300">
              {project.manager?.name || "N/A"}
            </span>
          </p>
          <p>
            Created By:{" "}
            <span className="text-gray-300">
              {project.createdBy?.name || "N/A"}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
};

export default Projects;
