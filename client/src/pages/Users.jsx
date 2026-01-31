import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const Users = () => {
  const roleName = localStorage.getItem("roleName");

  const permissions = JSON.parse(
    localStorage.getItem("permissions") || "[]"
  );
  const loggedInUserId = localStorage.getItem("userId");


  const canUpdate = permissions.includes("user:update");
  const canDelete = permissions.includes("user:delete");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");

        const allUsers = res.data.users;

        const visibleUsers =
          roleName === "manager"
            ? allUsers.filter(
              (u) => u.role?.name === "employee"
            )
            : allUsers;

        setUsers(visibleUsers);
      } catch (err) {
        console.error("Fetch users error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleName]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">
          {roleName === "manager" ? "Employees" : "Users"}
        </h2>

        {(roleName === "admin" || roleName === "manager") && (
          <Link
            to="/dashboard/users/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            {roleName === "manager" ? "Create Employee" : "Create User"}
          </Link>
        )}
      </div>

      <table className="w-full text-left text-gray-300">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-t border-white/10">
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td className="capitalize">
                {u.role?.name || "employee"}
              </td>
              <td>
                <div className="flex gap-2">
                  {canUpdate && u._id !== loggedInUserId && (
                    <Link
                      to={`/dashboard/users/${u._id}/edit`}
                      className="px-3 py-1 bg-blue-600 rounded text-white text-sm"
                    >
                      Edit
                    </Link>
                  )}


                  {canDelete && u._id !== loggedInUserId && (
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="px-3 py-1 bg-red-600 rounded text-white text-sm"
                    >
                      Delete
                    </button>
                  )}

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
