import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Skills from "./pages/Skills";
import Practice from "./pages/Practice";
import Goals from "./pages/Goals";
import Community from "./pages/Community";

import ProtectedRoute from "./components/ProtectedRoute";

function Protected({ children }) {
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}

export default function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <Protected>
                            <Dashboard />
                        </Protected>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <Protected>
                            <Profile />
                        </Protected>
                    }
                />

                <Route
                    path="/skills"
                    element={
                        <Protected>
                            <Skills />
                        </Protected>
                    }
                />

                <Route
                    path="/practice"
                    element={
                        <Protected>
                            <Practice />
                        </Protected>
                    }
                />

                <Route
                    path="/goals"
                    element={
                        <Protected>
                            <Goals />
                        </Protected>
                    }
                />

                <Route
                    path="/community"
                    element={
                        <Protected>
                            <Community />
                        </Protected>
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}