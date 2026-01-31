import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

const TaskDetail = () => {
  const { id } = useParams();

  const role = localStorage.getItem("roleName");
  const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
  const canAssign = permissions.includes("task:assign");

  const [task, setTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showAssign, setShowAssign] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // block states
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [dependencyType, setDependencyType] = useState("external");
  const [dependencyDescription, setDependencyDescription] = useState("");

  // comments
  const [commentText, setCommentText] = useState("");

  /* ================= FETCH TASK ================= */
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load task");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  /* ================= FETCH USERS (ASSIGN) ================= */
  useEffect(() => {
    if (!canAssign) return;

    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        const allUsers = res.data.users || [];

        let filteredUsers = [];

        if (role === "manager") {
          filteredUsers = allUsers.filter(
            (u) => u.role?.name === "employee"
          );
        } else if (role === "admin") {
          filteredUsers = allUsers.filter(
            (u) => u.role?.name !== "admin"
          );
        }

        setUsers(filteredUsers);
      } catch (err) {
        console.error("Fetch users error:", err);
        setUsers([]);
      }
    };

    fetchUsers();
  }, [canAssign, role]);

  /* ================= STATUS CHANGE ================= */
  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/tasks/${id}/status`, { status: newStatus });
      setTask(res.data.task);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= ASSIGN TASK ================= */
  const handleAssignTask = async () => {
    if (!selectedUser) return alert("Select user");

    try {
      setActionLoading(true);
      const res = await api.put(`/tasks/${id}/assign`, {
        assignedTo: selectedUser
      });
      setTask(res.data.task);
      setShowAssign(false);
      setSelectedUser("");
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Assign failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= BLOCK TASK ================= */
  const handleBlockTask = async () => {
    if (!dependencyDescription) {
      return alert("Please provide reason");
    }

    try {
      setActionLoading(true);
      const res = await api.patch(`/tasks/${id}/block`, {
        dependencyType,
        dependencyDescription
      });
      setTask(res.data.task);
      setShowBlockForm(false);
      setDependencyDescription("");
      alert(res.data.message);
    } catch (err) {
      alert("Failed to block task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockTask = async () => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/tasks/${id}/unblock`);
      setTask(res.data.task);
      alert(res.data.message);
    } catch (err) {
      alert("Failed to unblock task");
    } finally {
      setActionLoading(false);
    }
  };

  /* ================= COMMENTS ================= */
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/tasks/${id}/comments`, {
        text: commentText
      });
      setTask(prev => ({
        ...prev,
        comments: res.data.comments
      }));
      setCommentText("");
    } catch {
      alert("Failed to add comment");
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-gray-200 p-8">
      <Link className="mt-2 bg-indigo-600 px-4 py-2 rounded"
       to="/dashboard/tasks">⬅ Back to Tasks</Link>

      <div className="bg-[#121826] border border-white/10 rounded-2xl p-8 mt-6 max-w-4xl">
        <h2 className="text-3xl font-bold mb-4">{task.title}</h2>

        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
          <p><b>Description:</b> {task.description || "N/A"}</p>
          <p><b>Status:</b> <StatusBadge status={task.status} /></p>
          <p><b>Priority:</b> {task.priority}</p>
          <p><b>Project:</b> {task.project?.name}</p>
          <p><b>Assigned To:</b> {task.assignedTo?.name || "Not assigned"}</p>
          <p><b>Created By:</b> {task.createdBy?.name}</p>
        </div>

        {/* ================= STATUS ACTIONS ================= */}
        <div className="mt-6 flex gap-3">
          {role === "employee" && task.status === "todo" && (
            <ActionBtn onClick={() => handleStatusChange("in-progress")} loading={actionLoading}>
              Start Task
            </ActionBtn>
          )}

          {role === "employee" && task.status === "in-progress" && (
            <ActionBtn onClick={() => handleStatusChange("review")} loading={actionLoading}>
              Send for Review
            </ActionBtn>
          )}

          {(role === "manager" || role === "admin") && task.status === "review" && (
            <ActionBtn onClick={() => handleStatusChange("done")} loading={actionLoading}>
              Mark as Done
            </ActionBtn>
          )}
        </div>

        {/* ================= ASSIGN TASK ================= */}
        {canAssign && task.status !== "done" && (
          <div className="mt-8">

            {!showAssign ? (
              <button
                onClick={() => setShowAssign(true)}
                 className="mt-2 bg-indigo-600 px-4 py-2 rounded"
              >
                👤 Reassign
              </button>
            ) : (
              <div className="mt-4 space-y-4 max-w-sm">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2"
                >
                  <option value="">Select user</option>
                  {Array.isArray(users) && users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role?.name})
                    </option>
                  ))}
                </select>

                <ActionBtn onClick={handleAssignTask} loading={actionLoading}>
                  Assign
                </ActionBtn>
              </div>
            )}
          </div>
        )}

        {/* ================= BLOCK / UNBLOCK ================= */}
        {(role === "admin" || role === "manager") && task.status !== "done" && (
          <div className="mt-8">
            {task.status !== "blocked" ? (
              <>
                <button
                  onClick={() => setShowBlockForm(!showBlockForm)}
                   className="mt-2 bg-indigo-600 px-4 py-2 rounded"
                >
                  🚫Block Task
                </button>

                {showBlockForm && (
                  <div className="mt-4 space-y-4">
                    <select
                      value={dependencyType}
                      onChange={(e) => setDependencyType(e.target.value)}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2"
                    >
                      <option value="external">External</option>
                      <option value="approval">Approval</option>
                      <option value="internal">Internal</option>
                    </select>

                    <textarea
                      placeholder="Why is this task blocked?"
                      value={dependencyDescription}
                      onChange={(e) => setDependencyDescription(e.target.value)}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-lg px-4 py-2 resize-none"
                      rows="3"
                    />

                    <ActionBtn onClick={handleBlockTask} loading={actionLoading} danger>
                      Confirm Block
                    </ActionBtn>
                  </div>
                )}
              </>
            ) : (
              <ActionBtn onClick={handleUnblockTask} loading={actionLoading}>
                Unblock Task
              </ActionBtn>
            )}
          </div>
        )}

        {/* ================= COMMENTS ================= */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">💬 Comments</h3>

          {task.comments?.map((c, i) => (
            <div key={i} className="bg-[#0f172a] border border-white/10 rounded p-4 mb-3">
              <div className="flex justify-between text-sm text-gray-400">
                <span>{c.commentedBy?.name} ({c.roleName})</span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1">{c.text}</p>
            </div>
          ))}

          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-[#0f172a] border border-white/10 rounded p-3 mt-3"
            rows="3"
            placeholder="Write a comment..."
          />

          <button
            onClick={handleAddComment}
            className="mt-2 bg-indigo-600 px-4 py-2 rounded"
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= COMPONENTS ================= */

const StatusBadge = ({ status }) => {
  const colors = {
    todo: "text-gray-300",
    "in-progress": "text-blue-400",
    review: "text-yellow-400",
    done: "text-green-400",
    blocked: "text-red-400"
  };
  return <span className={`ml-2 font-semibold ${colors[status]}`}>{status}</span>;
};

const ActionBtn = ({ children, onClick, loading, danger }) => (
  <button
    disabled={loading}
    onClick={onClick}
    className={`px-5 py-2 rounded font-semibold transition ${
      danger
        ? "bg-red-600 hover:bg-red-500"
        : "bg-indigo-600 hover:bg-indigo-500"
    } disabled:opacity-50`}
  >
    {children}
  </button>
);

export default TaskDetail;
