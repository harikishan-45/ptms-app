import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
    const roleName = localStorage.getItem("roleName");
    const location = useLocation();

    const isActive = (path) =>
        location.pathname.startsWith(path)
            ? "bg-indigo-500/10 border-indigo-500/50 text-white"
            : "border-transparent text-gray-400";

    return (
        <div className="w-64 bg-[#121826] border-r border-white/10 p-6">
            {/* LOGO */}
            <h1 className="text-2xl font-bold text-white mb-10">
                PTMS
            </h1>

            {/* NAV */}
            <ul className="space-y-2">
                <NavItem to="/dashboard/home" label="Dashboard" active={isActive("/dashboard/home")} />

                {(roleName=== "admin" || roleName === "manager") && (
                    <NavItem
                        to="/dashboard/users"
                        label={roleName === "admin" ? "Users" : "Employees"}
                        active={isActive("/dashboard/users")}
                    />
                )}

                {(roleName === "admin" || roleName === "manager") && (
                    <NavItem
                        to="/dashboard/projects"
                        label="Projects"
                        active={isActive("/dashboard/projects")}
                    />
                )}
                {roleName === "admin" && (
                    <NavItem
                        to="/dashboard/roles"
                        label="Roles & Permissions"
                        active={isActive("/dashboard/roles")}
                    />
                )}


                <NavItem
                    to="/dashboard/tasks"
                    label="Tasks"
                    active={isActive("/dashboard/tasks")}
                />
            </ul>
        </div>
    );
};

const NavItem = ({ to, label, active }) => {
    return (
        <li>
            <Link
                to={to}
                className={`block px-4 py-3 rounded-lg border transition ${active}`}
            >
                {label}
            </Link>
        </li>
    );
};

export default Sidebar;
