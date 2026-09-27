const express = require("express");

const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const {
    serializeDoc,
    serializeSnapshot
} = require("../utils/firestore");

const router = express.Router();

/* GET FEED */

router.get("/", verifyToken, async (req, res) => {
    try {
        const snapshot = await db
            .collection("posts")
            .get();

        const posts =
            serializeSnapshot(snapshot);

        posts.sort((a, b) =>
            String(b.createdAt || "")
                .localeCompare(
                    String(a.createdAt || "")
                )
        );

        const limitedPosts =
            posts.slice(0, 30);

        const result = [];

        for (const post of limitedPosts) {

            const [
                userSnapshot,
                likesSnapshot,
                commentsSnapshot
            ] = await Promise.all([
                db.collection("users")
                    .doc(post.userId)
                    .get(),

                db.collection("likes")
                    .where("postId", "==", post.id)
                    .get(),

                db.collection("comments")
                    .where("postId", "==", post.id)
                    .get()
            ]);

            const likedByUser =
                likesSnapshot.docs.some(
                    (doc) =>
                        doc.data().userId ===
                        req.user.uid
                );

            result.push({
                ...post,
                author:
                    userSnapshot.exists
                        ? userSnapshot.data().name
                        : "User",
                likeCount:
                    likesSnapshot.size,
                commentCount:
                    commentsSnapshot.size,
                likedByUser
            });
        }

        res.json({
            success: true,
            posts: result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to load community feed"
        });
    }
});

/* CREATE POST */

router.post("/", verifyToken, async (req, res) => {
    try {
        const {
            content,
            skillId
        } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: "Post content is required"
            });
        }

        const ref =
            db.collection("posts").doc();

        await ref.set({
            userId: req.user.uid,
            skillId: skillId || "",
            content: content.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const created = await ref.get();

        res.status(201).json({
            success: true,
            message: "Post created",
            post: serializeDoc(created)
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create post"
        });
    }
});

/* DELETE POST */

router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const ref =
            db.collection("posts").doc(req.params.id);

        const snapshot = await ref.get();

        if (!snapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        if (
            snapshot.data().userId !==
            req.user.uid
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You can only delete your own posts"
            });
        }

        await ref.delete();

        res.json({
            success: true,
            message: "Post deleted"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete post"
        });
    }
});

/* LIKE */

router.post("/:id/like", verifyToken, async (req, res) => {
    try {
        const postRef =
            db.collection("posts").doc(req.params.id);

        const postSnapshot =
            await postRef.get();

        if (!postSnapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const likeId =
            `${req.params.id}_${req.user.uid}`;

        const likeRef =
            db.collection("likes").doc(likeId);

        const existing =
            await likeRef.get();

        if (existing.exists) {
            await likeRef.delete();

            return res.json({
                success: true,
                liked: false
            });
        }

        await likeRef.set({
            postId: req.params.id,
            userId: req.user.uid,
            createdAt: new Date()
        });

        res.json({
            success: true,
            liked: true
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update like"
        });
    }
});

/* COMMENTS */

router.get(
    "/:id/comments",
    verifyToken,
    async (req, res) => {
        try {
            const snapshot =
                await db
                    .collection("comments")
                    .where(
                        "postId",
                        "==",
                        req.params.id
                    )
                    .get();

            const comments =
                serializeSnapshot(snapshot);

            comments.sort((a, b) =>
                String(a.createdAt || "")
                    .localeCompare(
                        String(b.createdAt || "")
                    )
            );

            const result = [];

            for (const comment of comments) {

                const userSnapshot =
                    await db
                        .collection("users")
                        .doc(comment.userId)
                        .get();

                result.push({
                    ...comment,
                    author:
                        userSnapshot.exists
                            ? userSnapshot.data().name
                            : "User"
                });
            }

            res.json({
                success: true,
                comments: result
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to load comments"
            });
        }
    }
);

router.post(
    "/:id/comments",
    verifyToken,
    async (req, res) => {
        try {
            const {
                content
            } = req.body;

            if (
                !content ||
                !content.trim()
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Comment cannot be empty"
                });
            }

            const postSnapshot =
                await db
                    .collection("posts")
                    .doc(req.params.id)
                    .get();

            if (!postSnapshot.exists) {
                return res.status(404).json({
                    success: false,
                    message: "Post not found"
                });
            }

            const ref =
                db.collection("comments").doc();

            await ref.set({
                postId: req.params.id,
                userId: req.user.uid,
                content: content.trim(),
                createdAt: new Date()
            });

            const created =
                await ref.get();

            res.status(201).json({
                success: true,
                comment:
                    serializeDoc(created)
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                success: false,
                message:
                    "Failed to add comment"
            });
        }
    }
);

module.exports = router;