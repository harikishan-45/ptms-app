import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Dashboard = () => {
  const roleName = localStorage.getItem("roleName");
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard");
        // console.log(res)
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] text-gray-400">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-gray-200 p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400">
            Logged in as{" "}
            <span className="capitalize text-indigo-400 font-semibold">
              {roleName}
            </span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600/80 hover:bg-red-600 text-white px-5 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <h3 className="col-span-full text-3xl font-bold tracking-tight text-white-900 sm:text-4xl">
          Welcome to PTMS
        </h3>
      </div>
      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {roleName === "admin" && (
            <StatCard title="Total Users" value={stats.totalUsers} />
          )}
          {
            roleName === "admin" && roleName === "manager" && (
              <StatCard title="Total Projects" value={stats.totalProjects} />
            )
          }
          <StatCard title="Total Tasks" value={stats.totalTasks} />
          <StatCard title="To-Do Tasks" value={stats.todoTasks} />
          <StatCard title="In Progress Tasks" value={stats.inProgressTasks} />
          <StatCard title="Done Tasks" value={stats.doneTasks} />
          <StatCard title="Review Tasks" value={stats.reviewTasks} />
          <StatCard title="Blocked Tasks" value={stats.blockedTasks} />
        </div>
      )}

      {/* QUICK NAVIGATION */}
      <div className="bg-[#121826] border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">
          Quick Navigation
        </h3>

        <ul className="space-y-3">
          {(roleName === "admin" || roleName === "manager") && (
            <NavItem
              to="/dashboard/users"
              label={roleName === "admin" ? "Users" : "Employees"}
            />
          )}

          {(roleName === "admin" || roleName === "manager") && (
            <NavItem to="/dashboard/projects" label="Projects" />
          )}

          <NavItem to="/dashboard/tasks" label="Tasks" />

          {roleName === "admin" && (
            <NavItem
              to="/dashboard/roles"
              label="Roles & Permissions"
            />
          )}
        </ul>
      </div>
    </div>
  );
};

/* ================== COMPONENTS ================== */

const StatCard = ({ title, value }) => (
  <div className="bg-[#121826] border border-white/10 rounded-xl p-6 hover:border-indigo-500/40 transition">
    <p className="text-sm text-gray-400 mb-1">{title}</p>
    <p className="text-3xl font-bold text-white">{value ?? 0}</p>
  </div>
);

const NavItem = ({ to, label }) => (
  <li>
    <Link
      to={to}
      className="block px-4 py-3 rounded-lg bg-[#0f172a] border border-white/5 text-gray-300 hover:text-white hover:border-indigo-500/50 hover:bg-indigo-500/10 transition"
    >
      {label}
    </Link>
  </li>
);

export default Dashboard;
