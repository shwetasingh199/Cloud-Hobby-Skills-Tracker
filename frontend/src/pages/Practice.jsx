import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
    apiGet,
    apiPost,
    apiDelete
} from "../services/api";

import { useAuth } from "../context/AuthContext";

export default function Practice() {

    const { user } =
        useAuth();

    const [skills, setSkills] =
        useState([]);

    const [sessions, setSessions] =
        useState([]);

    const [form, setForm] =
        useState({
            skillId: "",
            durationMinutes: "",
            activity: "",
            notes: "",
            practicedAt:
                new Date()
                    .toISOString()
                    .slice(0, 10)
        });

    const [error, setError] =
        useState("");

    const loadData =
        async () => {

            try {

                const [
                    skillsData,
                    practiceData
                ] = await Promise.all([
                    apiGet(
                        "/skills",
                        user
                    ),
                    apiGet(
                        "/practice",
                        user
                    )
                ]);

                setSkills(
                    skillsData.skills
                );

                setSessions(
                    practiceData.sessions
                );

                if (
                    !form.skillId &&
                    skillsData.skills.length
                ) {
                    setForm((old) => ({
                        ...old,
                        skillId:
                            skillsData
                                .skills[0]
                                .id
                    }));
                }

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    useEffect(() => {

        if (user) {
            loadData();
        }

    }, [user]);

    const handleChange =
        (e) => {

            setForm({
                ...form,
                [e.target.name]:
                    e.target.value
            });

        };

    const handleSubmit =
        async (e) => {

            e.preventDefault();

            try {

                await apiPost(
                    "/practice",
                    form,
                    user
                );

                setForm({
                    skillId:
                        skills[0]?.id || "",
                    durationMinutes: "",
                    activity: "",
                    notes: "",
                    practicedAt:
                        new Date()
                            .toISOString()
                            .slice(0, 10)
                });

                await loadData();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const deleteSession =
        async (id) => {

            try {

                await apiDelete(
                    `/practice/${id}`,
                    user
                );

                await loadData();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    return (
        <>
            <Navbar />

            <main className="page">

                <div className="page-header">
                    <div>
                        <h1>
                            Practice Sessions
                        </h1>

                        <p>
                            Record your daily
                            practice.
                        </p>
                    </div>
                </div>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <div className="panel">

                    <h2>
                        Log Practice
                    </h2>

                    {skills.length === 0 ? (
                        <p>
                            Create a skill first
                            before logging practice.
                        </p>
                    ) : (
                        <form
                            className="form-grid"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <select
                                name="skillId"
                                value={
                                    form.skillId
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            >
                                {skills.map(
                                    (skill) => (
                                        <option
                                            key={
                                                skill.id
                                            }
                                            value={
                                                skill.id
                                            }
                                        >
                                            {
                                                skill.skillName
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <input
                                type="number"
                                min="1"
                                name="durationMinutes"
                                placeholder="Duration in minutes"
                                value={
                                    form.durationMinutes
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <input
                                name="activity"
                                placeholder="Activity"
                                value={
                                    form.activity
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <input
                                type="date"
                                name="practicedAt"
                                value={
                                    form.practicedAt
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <textarea
                                name="notes"
                                placeholder="Notes"
                                value={
                                    form.notes
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <button
                                type="submit"
                            >
                                Save Practice
                            </button>

                        </form>
                    )}

                </div>

                <div className="panel">

                    <h2>
                        Practice History
                    </h2>

                    {sessions.length === 0 ? (
                        <p>
                            No practice sessions yet.
                        </p>
                    ) : (
                        sessions.map(
                            (session) => {

                                const skill =
                                    skills.find(
                                        (item) =>
                                            item.id ===
                                            session.skillId
                                    );

                                return (
                                    <div
                                        className="activity-item"
                                        key={
                                            session.id
                                        }
                                    >

                                        <strong>
                                            {
                                                skill?.skillName ||
                                                "Skill"
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
                                                session.activity
                                            }
                                        </p>

                                        <small>
                                            {
                                                session.practicedAt
                                            }
                                        </small>

                                        <button
                                            className="danger-btn"
                                            onClick={() =>
                                                deleteSession(
                                                    session.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>
                                );
                            }
                        )
                    )}

                </div>

            </main>
        </>
    );
}