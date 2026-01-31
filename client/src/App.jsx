import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import CreateUser from "./pages/CreateUser";
import Roles from "./pages/Roles";
import CreateRole from "./pages/CreateRole";
import EditRolePermissions from "./pages/EditRolePermissions";
import CreateProject from "./pages/CreateProject";
import ProjectTasks from "./pages/ProjectTasks"
import CreateTask from "./pages/CreateTask";
import TaskDetail from "./pages/TaskDetail";
import DashboardLayout from "./layouts/DashboardLayout";
import EditUser from "./pages/EditUser";


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* DASHBOARD LAYOUT */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="home" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/:id/edit" element={<EditUser />} />


          <Route path="projects" element={<Projects />} />
          <Route path="projects/create" element={<CreateProject />} /> 
          <Route path="projects/:id/tasks" element={<ProjectTasks />} />

          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/create" element={<CreateTask />} /> 
          <Route path="tasks/:id" element={<TaskDetail />} />


          <Route path="roles" element={<Roles />} />
          <Route path="roles/create" element={<CreateRole />} />
          <Route path="roles/:id" element={<EditRolePermissions />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
