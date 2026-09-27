import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import { apiGet } from "../services/api";

import { useAuth } from "../context/AuthContext";

export default function Dashboard() {

    const { user } =
        useAuth();

    const [data, setData] =
        useState(null);

    const [error, setError] =
        useState("");

    useEffect(() => {

        const load =
            async () => {

                try {

                    const result =
                        await apiGet(
                            "/dashboard",
                            user
                        );

                    setData(
                        result.analytics
                    );

                } catch (error) {

                    setError(
                        error.message
                    );
                }
            };

        if (user) {
            load();
        }

    }, [user]);

    if (!data && !error) {
        return (
            <>
                <Navbar />

                <div className="loading">
                    Loading dashboard...
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="page">

                <div className="page-header">

                    <div>
                        <h1>
                            Welcome,{" "}
                            {
                                user?.displayName ||
                                "User"
                            } 👋
                        </h1>

                        <p>
                            Track your learning
                            journey from one place.
                        </p>
                    </div>

                </div>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                {data && (
                    <>
                        <div className="stats-grid">

                            <div className="stat-card">
                                <div className="stat-icon">
                                    🎯
                                </div>

                                <div>
                                    <p>
                                        Active Skills
                                    </p>

                                    <h2>
                                        {
                                            data.activeSkills
                                        }
                                    </h2>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    ⏱️
                                </div>

                                <div>
                                    <p>
                                        Practice Hours
                                    </p>

                                    <h2>
                                        {
                                            data.totalPracticeHours
                                        }
                                    </h2>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    🏆
                                </div>

                                <div>
                                    <p>
                                        Completed Goals
                                    </p>

                                    <h2>
                                        {
                                            data.completedGoals
                                        }
                                    </h2>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    🔥
                                </div>

                                <div>
                                    <p>
                                        Current Streak
                                    </p>

                                    <h2>
                                        {
                                            data.currentStreak
                                        } days
                                    </h2>
                                </div>
                            </div>

                        </div>

                        <div className="dashboard-grid">

                            <div className="panel">

                                <h2>
                                    Recent Practice
                                </h2>

                                {data.recentPractice
                                    .length === 0 ? (
                                    <p>
                                        No practice
                                        recorded yet.
                                    </p>
                                ) : (
                                    data.recentPractice.map(
                                        (session) => (
                                            <div
                                                className="activity-item"
                                                key={
                                                    session.id
                                                }
                                            >

                                                <strong>
                                                    {
                                                        session.activity ||
                                                        "Practice Session"
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        session.durationMinutes
                                                    }{" "}
                                                    min
                                                </span>

                                                <p>
                                                    {
                                                        session.practicedAt
                                                    }
                                                </p>

                                            </div>
                                        )
                                    )
                                )}

                            </div>

                            <div className="panel">

                                <h2>
                                    Community
                                </h2>

                                <p>
                                    Your Posts
                                </p>

                                <h2>
                                    {
                                        data.totalPosts
                                    }
                                </h2>

                                <p>
                                    Share your
                                    learning journey
                                    with the community.
                                </p>

                            </div>

                        </div>
                    </>
                )}

            </main>
        </>
    );
}