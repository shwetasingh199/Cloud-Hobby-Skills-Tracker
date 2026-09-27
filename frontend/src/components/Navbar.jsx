import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {

    const { user, logout } =
        useAuth();

    const handleLogout =
        async () => {
            await logout();
            window.location.href =
                "/login";
        };

    return (
        <nav className="navbar">

            <div className="logo">
                Hobby & Skills Tracker
            </div>

            <div className="nav-links">

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/profile">
                    Profile
                </Link>

                <Link to="/skills">
                    Skills
                </Link>

                <Link to="/practice">
                    Practice
                </Link>

                <Link to="/goals">
                    Goals
                </Link>

                <Link to="/community">
                    Community
                </Link>

                <span>
                    {user?.displayName ||
                        user?.email}
                </span>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}