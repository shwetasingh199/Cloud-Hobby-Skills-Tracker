import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";

import {
    apiGet,
    apiPost,
    apiDelete
} from "../services/api";

import { useAuth } from "../context/AuthContext";

export default function Community() {

    const { user } =
        useAuth();

    const [posts, setPosts] =
        useState([]);

    const [content, setContent] =
        useState("");

    const [comments, setComments] =
        useState({});

    const [commentText, setCommentText] =
        useState({});

    const [error, setError] =
        useState("");

    const loadPosts =
        async () => {

            try {

                const data =
                    await apiGet(
                        "/community",
                        user
                    );

                setPosts(
                    data.posts
                );

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    useEffect(() => {

        if (user) {
            loadPosts();
        }

    }, [user]);

    const createPost =
        async (e) => {

            e.preventDefault();

            if (!content.trim()) {
                return;
            }

            try {

                await apiPost(
                    "/community",
                    {
                        content
                    },
                    user
                );

                setContent("");

                await loadPosts();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const toggleLike =
        async (postId) => {

            try {

                await apiPost(
                    `/community/${postId}/like`,
                    {},
                    user
                );

                await loadPosts();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const deletePost =
        async (postId) => {

            if (
                !window.confirm(
                    "Delete this post?"
                )
            ) {
                return;
            }

            try {

                await apiDelete(
                    `/community/${postId}`,
                    user
                );

                await loadPosts();

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const loadComments =
        async (postId) => {

            try {

                const data =
                    await apiGet(
                        `/community/${postId}/comments`,
                        user
                    );

                setComments(
                    (old) => ({
                        ...old,
                        [postId]:
                            data.comments
                    })
                );

            } catch (error) {

                setError(
                    error.message
                );
            }
        };

    const addComment =
        async (postId) => {

            const text =
                commentText[postId];

            if (!text?.trim()) {
                return;
            }

            try {

                await apiPost(
                    `/community/${postId}/comments`,
                    {
                        content: text
                    },
                    user
                );

                setCommentText(
                    (old) => ({
                        ...old,
                        [postId]: ""
                    })
                );

                await loadComments(
                    postId
                );

                await loadPosts();

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
                            Community
                        </h1>

                        <p>
                            Share your progress
                            and learn from others.
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
                        Create a Post
                    </h2>

                    <form
                        onSubmit={
                            createPost
                        }
                    >

                        <textarea
                            placeholder="Share something about your learning journey..."
                            value={
                                content
                            }
                            onChange={
                                (e) =>
                                    setContent(
                                        e.target.value
                                    )
                            }
                        />

                        <button
                            type="submit"
                        >
                            Publish
                        </button>

                    </form>

                </div>

                {posts.map(
                    (post) => (
                        <div
                            className="post-card"
                            key={post.id}
                        >

                            <div className="post-author">

                                <strong>
                                    {
                                        post.author
                                    }
                                </strong>

                                <span>
                                    {
                                        post.createdAt
                                            ? new Date(
                                                post.createdAt
                                            ).toLocaleString()
                                            : ""
                                    }
                                </span>

                            </div>

                            <p>
                                {
                                    post.content
                                }
                            </p>

                            <div className="post-actions">

                                <button
                                    onClick={() =>
                                        toggleLike(
                                            post.id
                                        )
                                    }
                                >
                                    {post.likedByUser
                                        ? "❤️ Liked"
                                        : "♡ Like"}
                                    {" "}
                                    (
                                    {
                                        post.likeCount
                                    }
                                    )
                                </button>

                                <button
                                    onClick={() =>
                                        loadComments(
                                            post.id
                                        )
                                    }
                                >
                                    💬 Comments (
                                    {
                                        post.commentCount
                                    }
                                    )
                                </button>

                                {post.userId ===
                                    user?.uid && (
                                    <button
                                        className="danger-btn"
                                        onClick={() =>
                                            deletePost(
                                                post.id
                                            )
                                        }
                                    >
                                        Delete
                                    </button>
                                )}

                            </div>

                            {comments[
                                post.id
                            ] && (
                                <div
                                    className="panel"
                                >

                                    {comments[
                                        post.id
                                    ].map(
                                        (
                                            comment
                                        ) => (
                                            <div
                                                className="activity-item"
                                                key={
                                                    comment.id
                                                }
                                            >

                                                <strong>
                                                    {
                                                        comment.author
                                                    }
                                                </strong>

                                                <p>
                                                    {
                                                        comment.content
                                                    }
                                                </p>

                                            </div>
                                        )
                                    )}

                                    <input
                                        placeholder="Write a comment..."
                                        value={
                                            commentText[
                                                post.id
                                            ] ||
                                            ""
                                        }
                                        onChange={
                                            (e) =>
                                                setCommentText(
                                                    (old) => ({
                                                        ...old,
                                                        [post.id]:
                                                            e.target
                                                                .value
                                                    })
                                                )
                                        }
                                    />

                                    <button
                                        onClick={() =>
                                            addComment(
                                                post.id
                                            )
                                        }
                                    >
                                        Comment
                                    </button>

                                </div>
                            )}

                        </div>
                    )
                )}

                {posts.length === 0 && (
                    <div className="panel">
                        <h3>
                            No posts yet
                        </h3>

                        <p>
                            Be the first person
                            to share something.
                        </p>
                    </div>
                )}

            </main>
        </>
    );
}