import { db } from "../config/firebase.js";
import {
  successResponse,
  createdResponse,
  errorResponse
} from "../utils/response.js";

export async function createPost(req, res) {
  try {
    const { content, skillId, mediaUrl } = req.body;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, "Post content is required.");
    }

    const post = {
      userId: req.user.uid,
      content: content.trim(),
      skillId: skillId || null,
      mediaUrl: mediaUrl || null,
      likeCount: 0,
      commentCount: 0,
      createdAt: new Date()
    };

    const ref = await db.collection("posts").add(post);

    return createdResponse(
      res,
      {
        id: ref.id,
        ...post
      },
      "Post created successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function getFeed(req, res) {
  try {
    const snapshot = await db
      .collection("posts")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const posts = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const userDoc = await db
        .collection("users")
        .doc(data.userId)
        .get();

      const user = userDoc.exists ? userDoc.data() : {};

      const likeDoc = await db
        .collection("likes")
        .where("postId", "==", doc.id)
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();

      posts.push({
        id: doc.id,
        ...data,
        author: {
          id: data.userId,
          name: user.name || "User",
          username: user.username || ""
        },
        likedByMe: !likeDoc.empty
      });
    }

    return successResponse(res, posts);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function deletePost(req, res) {
  try {
    const ref = db.collection("posts").doc(req.params.id);

    const doc = await ref.get();

    if (!doc.exists) {
      return errorResponse(res, "Post not found.", 404);
    }

    if (doc.data().userId !== req.user.uid) {
      return errorResponse(res, "You can only delete your own post.", 403);
    }

    await ref.delete();

    return successResponse(
      res,
      null,
      "Post deleted successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function likePost(req, res) {
  try {
    const postRef = db.collection("posts").doc(req.params.id);
    const post = await postRef.get();

    if (!post.exists) {
      return errorResponse(res, "Post not found.", 404);
    }

    const existing = await db
      .collection("likes")
      .where("postId", "==", req.params.id)
      .where("userId", "==", req.user.uid)
      .limit(1)
      .get();

    if (!existing.empty) {
      return errorResponse(res, "Post already liked.");
    }

    await db.collection("likes").add({
      postId: req.params.id,
      userId: req.user.uid,
      createdAt: new Date()
    });

    await postRef.update({
      likeCount: (post.data().likeCount || 0) + 1
    });

    return successResponse(res, null, "Post liked.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function unlikePost(req, res) {
  try {
    const postRef = db.collection("posts").doc(req.params.id);

    const post = await postRef.get();

    if (!post.exists) {
      return errorResponse(res, "Post not found.", 404);
    }

    const existing = await db
      .collection("likes")
      .where("postId", "==", req.params.id)
      .where("userId", "==", req.user.uid)
      .limit(1)
      .get();

    if (existing.empty) {
      return errorResponse(res, "Post is not liked.");
    }

    await existing.docs[0].ref.delete();

    await postRef.update({
      likeCount: Math.max(
        0,
        (post.data().likeCount || 0) - 1
      )
    });

    return successResponse(res, null, "Post unliked.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function addComment(req, res) {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return errorResponse(res, "Comment cannot be empty.");
    }

    const postRef = db.collection("posts").doc(req.params.id);
    const post = await postRef.get();

    if (!post.exists) {
      return errorResponse(res, "Post not found.", 404);
    }

    const comment = {
      postId: req.params.id,
      userId: req.user.uid,
      content: content.trim(),
      createdAt: new Date()
    };

    const ref = await db
      .collection("comments")
      .add(comment);

    await postRef.update({
      commentCount: (post.data().commentCount || 0) + 1
    });

    return createdResponse(
      res,
      {
        id: ref.id,
        ...comment
      },
      "Comment added."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function getComments(req, res) {
  try {
    const snapshot = await db
      .collection("comments")
      .where("postId", "==", req.params.id)
      .get();

    const comments = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const user = await db
        .collection("users")
        .doc(data.userId)
        .get();

      comments.push({
        id: doc.id,
        ...data,
        author: user.exists
          ? {
              name: user.data().name,
              username: user.data().username
            }
          : {
              name: "User",
              username: ""
            }
      });
    }

    return successResponse(res, comments);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}

export async function deleteComment(req, res) {
  try {
    const ref = db
      .collection("comments")
      .doc(req.params.commentId);

    const comment = await ref.get();

    if (!comment.exists) {
      return errorResponse(res, "Comment not found.", 404);
    }

    if (comment.data().userId !== req.user.uid) {
      return errorResponse(
        res,
        "You can only delete your own comment.",
        403
      );
    }

    await ref.delete();

    return successResponse(
      res,
      null,
      "Comment deleted successfully."
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
}