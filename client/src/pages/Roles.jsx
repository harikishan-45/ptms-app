import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const Roles = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await api.get("/roles");
      setRoles(res.data);
    };
    fetchRoles();
  }, []);

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Roles</h2>

        <Link
          to="/dashboard/roles/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
        >
          Create Role
        </Link>
      </div>

      {/* ROLES LIST */}
      <div className="bg-[#121826] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#0f172a] text-gray-400 text-sm">
            <tr>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Permissions</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role) => (
              <tr
                key={role._id}
                className="border-t border-white/5 hover:bg-indigo-500/5"
              >
                <td className="px-6 py-4 capitalize font-semibold">
                  {role.name}
                </td>

                <td className="px-6 py-4 text-gray-400">
                  {role.permissions.length}
                </td>

                <td className="px-6 py-4">
                  {role.name === "admin" ? (
                    <span className="text-gray-500">Locked</span>
                  ) : (
                    <Link
                      to={`/dashboard/roles/${role._id}`}
                      className="text-indigo-400 hover:underline"
                    >
                      Edit Permissions
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Roles;
