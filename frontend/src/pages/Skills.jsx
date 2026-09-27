import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
    apiGet,
    apiPost,
    apiDelete
} from "../services/api";

import { useAuth } from "../context/AuthContext";

export default function Skills() {

    const { user } =
        useAuth();

    const [skills, setSkills] =
        useState([]);

    const [form, setForm] =
        useState({
            skillName: "",
            category: "",
            currentLevel: "BEGINNER",
            targetLevel: "INTERMEDIATE",
            startDate: "",
            targetDate: "",
            status: "ACTIVE",
            description: ""
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadSkills =
        async () => {

            try {

                const data =
                    await apiGet(
                        "/skills",
                        user
                    );

                setSkills(
                    data.skills
                );

            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setLoading(false);

            }
        };

    useEffect(() => {

        if (user) {
            loadSkills();
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

            setError("");

            try {

                await apiPost(
                    "/skills",
                    form,
                    user
                );

                setForm({
                    skillName: "",
                    category: "",
                    currentLevel:
                        "BEGINNER",
                    targetLevel:
                        "INTERMEDIATE",
                    startDate: "",
                    targetDate: "",
                    status: "ACTIVE",
                    description: ""
                });

                await loadSkills();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const deleteSkill =
        async (id) => {

            if (
                !window.confirm(
                    "Delete this skill?"
                )
            ) {
                return;
            }

            try {

                await apiDelete(
                    `/skills/${id}`,
                    user
                );

                await loadSkills();

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
                            My Skills
                        </h1>

                        <p>
                            Track the skills
                            you are learning.
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
                        Add New Skill
                    </h2>

                    <form
                        className="form-grid"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <input
                            name="skillName"
                            placeholder="Skill name"
                            value={
                                form.skillName
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                        <input
                            name="category"
                            placeholder="Category"
                            value={
                                form.category
                            }
                            onChange={
                                handleChange
                            }
                            required
                        />

                        <select
                            name="currentLevel"
                            value={
                                form.currentLevel
                            }
                            onChange={
                                handleChange
                            }
                        >
                            <option>
                                BEGINNER
                            </option>
                            <option>
                                INTERMEDIATE
                            </option>
                            <option>
                                ADVANCED
                            </option>
                        </select>

                        <select
                            name="targetLevel"
                            value={
                                form.targetLevel
                            }
                            onChange={
                                handleChange
                            }
                        >
                            <option>
                                BEGINNER
                            </option>
                            <option>
                                INTERMEDIATE
                            </option>
                            <option>
                                ADVANCED
                            </option>
                        </select>

                        <input
                            type="date"
                            name="startDate"
                            value={
                                form.startDate
                            }
                            onChange={
                                handleChange
                            }
                        />

                        <input
                            type="date"
                            name="targetDate"
                            value={
                                form.targetDate
                            }
                            onChange={
                                handleChange
                            }
                        />

                        <select
                            name="status"
                            value={
                                form.status
                            }
                            onChange={
                                handleChange
                            }
                        >
                            <option>
                                ACTIVE
                            </option>
                            <option>
                                PAUSED
                            </option>
                            <option>
                                COMPLETED
                            </option>
                        </select>

                        <textarea
                            name="description"
                            placeholder="Description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                        />

                        <button
                            type="submit"
                        >
                            Add Skill
                        </button>

                    </form>

                </div>

                <div className="cards-grid">

                    {loading ? (
                        <div className="loading">
                            Loading skills...
                        </div>
                    ) : skills.length === 0 ? (
                        <div className="panel">
                            <h3>
                                No skills yet
                            </h3>
                            <p>
                                Add your first
                                skill above.
                            </p>
                        </div>
                    ) : (
                        skills.map(
                            (skill) => (
                                <div
                                    className="skill-card"
                                    key={skill.id}
                                >

                                    <h3>
                                        {
                                            skill.skillName
                                        }
                                    </h3>

                                    <span className="badge">
                                        {
                                            skill.category
                                        }
                                    </span>

                                    <p>
                                        Current:
                                        {" "}
                                        {
                                            skill.currentLevel
                                        }
                                    </p>

                                    <p>
                                        Target:
                                        {" "}
                                        {
                                            skill.targetLevel
                                        }
                                    </p>

                                    <p>
                                        Status:
                                        {" "}
                                        {
                                            skill.status
                                        }
                                    </p>

                                    <p>
                                        {
                                            skill.description
                                        }
                                    </p>

                                    <button
                                        className="danger-btn"
                                        onClick={() =>
                                            deleteSkill(
                                                skill.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>
                            )
                        )
                    )}

                </div>

            </main>
        </>
    );
}