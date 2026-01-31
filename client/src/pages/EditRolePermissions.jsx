import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const EditRolePermissions = () => {
  const { id } = useParams();

  const [role, setRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const roleRes = await api.get("/roles");
      const roleData = roleRes.data.find((r) => r._id === id);

      const permRes = await api.get("/permissions");

      setRole(roleData);
      setAllPermissions(permRes.data);

      // store KEYS
      setSelected(roleData.permissions.map((p) => p.key));
    };

    fetchData();
  }, [id]);

  const togglePermission = (key) => {
    setSelected((prev) =>
      prev.includes(key)
        ? prev.filter((p) => p !== key)
        : [...prev, key]
    );
  };

  const savePermissions = async () => {
    await api.put(`/roles/${id}`, {
      permissions: selected // ✅ KEYS
    });
    alert("Permissions updated");
  };

  if (!role) return null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 capitalize">
        Edit Permissions – {role.name}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {allPermissions.map((perm) => (
          <label
            key={perm._id}
            className="flex items-center gap-3 bg-[#121826] border border-white/10 p-4 rounded-lg cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(perm.key)}
              onChange={() => togglePermission(perm.key)}
            />
            <span className="text-gray-300">{perm.key}</span>
          </label>
        ))}
      </div>

      <button
        onClick={savePermissions}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
      >
        Save Changes
      </button>
    </div>
  );
};

export default EditRolePermissions;
