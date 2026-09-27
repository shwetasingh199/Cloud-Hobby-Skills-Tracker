import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
    apiGet,
    apiPost,
    apiPut,
    apiDelete
} from "../services/api";

import { useAuth } from "../context/AuthContext";

export default function Goals() {

    const { user } =
        useAuth();

    const [skills, setSkills] =
        useState([]);

    const [goals, setGoals] =
        useState([]);

    const [form, setForm] =
        useState({
            skillId: "",
            title: "",
            targetValue: "",
            currentValue: 0,
            unit: "",
            deadline: "",
            status: "ACTIVE"
        });

    const [error, setError] =
        useState("");

    const loadData =
        async () => {

            try {

                const [
                    skillsData,
                    goalsData
                ] = await Promise.all([
                    apiGet(
                        "/skills",
                        user
                    ),
                    apiGet(
                        "/goals",
                        user
                    )
                ]);

                setSkills(
                    skillsData.skills
                );

                setGoals(
                    goalsData.goals
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
                    "/goals",
                    form,
                    user
                );

                setForm({
                    skillId:
                        skills[0]?.id || "",
                    title: "",
                    targetValue: "",
                    currentValue: 0,
                    unit: "",
                    deadline: "",
                    status: "ACTIVE"
                });

                await loadData();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const updateGoal =
        async (goal) => {

            const value =
                window.prompt(
                    "Enter current value:",
                    goal.currentValue
                );

            if (value === null) {
                return;
            }

            try {

                const current =
                    Number(value);

                const status =
                    current >=
                    Number(goal.targetValue)
                        ? "COMPLETED"
                        : "ACTIVE";

                await apiPut(
                    `/goals/${goal.id}`,
                    {
                        currentValue:
                            current,
                        status
                    },
                    user
                );

                await loadData();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const deleteGoal =
        async (id) => {

            if (
                !window.confirm(
                    "Delete this goal?"
                )
            ) {
                return;
            }

            try {

                await apiDelete(
                    `/goals/${id}`,
                    user
                );

                await loadData();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const progress =
        (goal) => {

            const target =
                Number(
                    goal.targetValue
                );

            const current =
                Number(
                    goal.currentValue
                );

            if (!target) {
                return 0;
            }

            return Math.min(
                100,
                Math.round(
                    (current / target) *
                    100
                )
            );
        };

    return (
        <>
            <Navbar />

            <main className="page">

                <div className="page-header">
                    <div>
                        <h1>
                            Goals
                        </h1>

                        <p>
                            Set measurable
                            learning goals.
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
                        Create Goal
                    </h2>

                    {skills.length === 0 ? (
                        <p>
                            Create a skill first.
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
                                name="title"
                                placeholder="Goal title"
                                value={
                                    form.title
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <input
                                type="number"
                                min="1"
                                name="targetValue"
                                placeholder="Target"
                                value={
                                    form.targetValue
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <input
                                name="unit"
                                placeholder="Unit e.g. problems, hours"
                                value={
                                    form.unit
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <input
                                type="date"
                                name="deadline"
                                value={
                                    form.deadline
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <button
                                type="submit"
                            >
                                Create Goal
                            </button>

                        </form>
                    )}

                </div>

                <div className="cards-grid">

                    {goals.map(
                        (goal) => {

                            const percentage =
                                progress(goal);

                            const skill =
                                skills.find(
                                    (item) =>
                                        item.id ===
                                        goal.skillId
                                );

                            return (
                                <div
                                    className="skill-card"
                                    key={
                                        goal.id
                                    }
                                >

                                    <h3>
                                        {
                                            goal.title
                                        }
                                    </h3>

                                    <span className="badge">
                                        {
                                            skill?.skillName ||
                                            "Skill"
                                        }
                                    </span>

                                    <p>
                                        {
                                            goal.currentValue
                                        }
                                        {" / "}
                                        {
                                            goal.targetValue
                                        }
                                        {" "}
                                        {
                                            goal.unit
                                        }
                                    </p>

                                    <div className="progress">
                                        <div
                                            style={{
                                                width:
                                                    `${percentage}%`
                                            }}
                                        />
                                    </div>

                                    <p>
                                        {
                                            percentage
                                        }%
                                    </p>

                                    <p>
                                        Status:
                                        {" "}
                                        {
                                            goal.status
                                        }
                                    </p>

                                    <button
                                        onClick={() =>
                                            updateGoal(
                                                goal
                                            )
                                        }
                                    >
                                        Update Progress
                                    </button>

                                    <button
                                        className="danger-btn"
                                        onClick={() =>
                                            deleteGoal(
                                                goal.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>
                            );
                        }
                    )}

                </div>

            </main>
        </>
    );
}