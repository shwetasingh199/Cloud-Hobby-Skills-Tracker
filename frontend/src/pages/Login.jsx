import { useState } from "react";
import {
    signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../services/firebase";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        try {
            setLoading(true);

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            window.location.href = "/dashboard";

        } catch (error) {

            console.error(error);

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/user-not-found"
            ) {
                setError("Invalid email or password.");
            } else if (error.code === "auth/invalid-email") {
                setError("Please enter a valid email.");
            } else {
                setError(error.message);
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Login</h1>

                <p>
                    Login to your Cloud Hobby & Skills Tracker account.
                </p>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <form onSubmit={handleLogin}>

                    <label>Email</label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>

                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>

                <div className="auth-link">

                    Don't have an account?{" "}

                    <a href="/register">
                        Create Account
                    </a>

                </div>

            </div>

        </div>
    );
}