import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
    apiGet,
    apiPut
} from "../services/api";

import { useAuth } from "../context/AuthContext";

export default function Profile() {

    const { user } =
        useAuth();

    const [form, setForm] =
        useState({
            name: "",
            bio: "",
            location: ""
        });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");

    useEffect(() => {

        const loadProfile =
            async () => {

                try {

                    const data =
                        await apiGet(
                            "/profile",
                            user
                        );

                    setForm({
                        name:
                            data.profile.name ||
                            "",
                        bio:
                            data.profile.bio ||
                            "",
                        location:
                            data.profile.location ||
                            ""
                    });

                } catch (error) {

                    setError(
                        error.message
                    );

                } finally {

                    setLoading(false);

                }
            };

        if (user) {
            loadProfile();
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

            setSaving(true);
            setError("");
            setMessage("");

            try {

                await apiPut(
                    "/profile",
                    form,
                    user
                );

                setMessage(
                    "Profile updated successfully."
                );

            } catch (error) {

                setError(
                    error.message
                );

            } finally {

                setSaving(false);

            }
        };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="loading">
                    Loading profile...
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
                            My Profile
                        </h1>

                        <p>
                            Manage your
                            personal information.
                        </p>
                    </div>
                </div>

                <div className="panel profile-form">

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="success">
                            {message}
                        </p>
                    )}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <label>
                            Name
                        </label>

                        <input
                            name="name"
                            value={form.name}
                            onChange={
                                handleChange
                            }
                            required
                        />

                        <label>
                            Email
                        </label>

                        <input
                            value={
                                user?.email ||
                                ""
                            }
                            disabled
                        />

                        <label>
                            Location
                        </label>

                        <input
                            name="location"
                            placeholder="e.g. India"
                            value={
                                form.location
                            }
                            onChange={
                                handleChange
                            }
                        />

                        <label>
                            Bio
                        </label>

                        <textarea
                            name="bio"
                            placeholder="Tell the community about yourself..."
                            value={
                                form.bio
                            }
                            onChange={
                                handleChange
                            }
                        />

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Profile"}
                        </button>

                    </form>

                </div>

            </main>
        </>
    );
}