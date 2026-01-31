import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateRole = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/roles", { name });
    navigate("/dashboard/roles");
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-white mb-6">
        Create New Role
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[#121826] border border-white/10 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="text-sm text-gray-400">Role Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-[#0f172a] border border-white/10 text-white"
            placeholder="e.g. QA, HR"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
        >
          Create Role
        </button>
      </form>
    </div>
  );
};

export default CreateRole;
