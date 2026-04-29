import { Router } from "express";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { requireAuth } from "../middleware/auth";
import { awardPoints, checkAndAwardBadge, getOrCreateProfile } from "../services/rewardEngine";

const router = Router();

/* -------- LIST POSTS -------- */
router.get("/", async (req, res) => {
  try {
    const {
      type,
      tag,
      sort = "new",
      page = "1",
      limit = "20",
      author,
    } = req.query;

    const filter: any = {};
    if (type && type !== "all") filter.type = type;
    if (tag) filter.tags = tag;
    if (author) filter.authorId = author;

    let sortObj: any = { createdAt: -1 };
    if (sort === "top") sortObj = { upvotes: -1, createdAt: -1 };
    if (sort === "hot") sortObj = { viewCount: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sortObj)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate("authorId", "displayName email")
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Transform for frontend
    const transformed = posts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      author: p.authorId
        ? { _id: p.authorId._id?.toString(), displayName: p.authorId.displayName, email: p.authorId.email }
        : null,
      score: (p.upvotes?.length || 0) - (p.downvotes?.length || 0),
      upvoteCount: p.upvotes?.length || 0,
      downvoteCount: p.downvotes?.length || 0,
    }));

    res.json({ success: true, posts: transformed, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

/* -------- GET SINGLE POST -------- */
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate("authorId", "displayName email")
      .lean();

    if (!post) return res.status(404).json({ error: "Post not found" });

    const comments = await Comment.find({ postId: post._id })
      .populate("authorId", "displayName email")
      .sort({ createdAt: 1 })
      .lean();

    const p: any = post;
    const transformed = {
      ...p,
      _id: p._id.toString(),
      author: p.authorId
        ? { _id: p.authorId._id?.toString(), displayName: p.authorId.displayName, email: p.authorId.email }
        : null,
      score: (p.upvotes?.length || 0) - (p.downvotes?.length || 0),
      upvoteCount: p.upvotes?.length || 0,
      downvoteCount: p.downvotes?.length || 0,
    };

    const transformedComments = comments.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      postId: c.postId.toString(),
      parentId: c.parentId?.toString() || null,
      author: c.authorId
        ? { _id: c.authorId._id?.toString(), displayName: c.authorId.displayName, email: c.authorId.email }
        : null,
      score: (c.upvotes?.length || 0) - (c.downvotes?.length || 0),
    }));

    res.json({ success: true, post: transformed, comments: transformedComments });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

/* -------- CREATE POST -------- */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { type, title, content, hackathonId, hackathonName, teamSize, rolesNeeded, tags } = req.body;

    if (!title || !content || !type) {
      return res.status(400).json({ error: "Title, content, and type are required" });
    }

    const post = await Post.create({
      authorId: userId,
      type,
      title: title.trim(),
      content,
      hackathonId,
      hackathonName,
      teamSize,
      rolesNeeded,
      tags: tags || [],
    });

    // Award points
    await getOrCreateProfile(userId);
    const postCount = await Post.countDocuments({ authorId: userId });
    if (postCount === 1) {
      await awardPoints(userId, 50, "first_post", "Created your first post!");
      await checkAndAwardBadge(userId, "First Post", "Created your first community post", "first_post");
    } else {
      await awardPoints(userId, 10, "create_post", "Created a new post");
    }

    const populated = await Post.findById(post._id).populate("authorId", "displayName email").lean();

    res.json({ success: true, post: populated });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

/* -------- EDIT POST -------- */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId.toString() !== userId) return res.status(403).json({ error: "Not authorized" });

    const { title, content, tags, rolesNeeded, teamSize } = req.body;
    if (title) post.title = title.trim();
    if (content) post.content = content;
    if (tags) post.tags = tags;
    if (rolesNeeded) post.rolesNeeded = rolesNeeded;
    if (teamSize !== undefined) post.teamSize = teamSize;

    await post.save();
    res.json({ success: true, post });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

/* -------- DELETE POST -------- */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.authorId.toString() !== userId) return res.status(403).json({ error: "Not authorized" });

    await Comment.deleteMany({ postId: post._id });
    await post.deleteOne();

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

/* -------- VOTE ON POST -------- */
router.post("/:id/vote", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { vote } = req.body; // "up" | "down" | "none"
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Remove existing votes
    post.upvotes = post.upvotes.filter((id) => id.toString() !== userId) as any;
    post.downvotes = post.downvotes.filter((id) => id.toString() !== userId) as any;

    if (vote === "up") {
      post.upvotes.push(userId);
    } else if (vote === "down") {
      post.downvotes.push(userId);
    }

    await post.save();

    // Check milestones for post author
    const upvoteCount = post.upvotes.length;
    const authorId = post.authorId.toString();
    if (upvoteCount === 10) {
      await awardPoints(authorId, 20, "post_10_upvotes", "Post reached 10 upvotes");
    } else if (upvoteCount === 50) {
      await awardPoints(authorId, 100, "post_50_upvotes", "Post reached 50 upvotes");
      await checkAndAwardBadge(authorId, "Popular Post", "One of your posts reached 50 upvotes", "post_50_upvotes");
    }

    res.json({
      success: true,
      score: post.upvotes.length - post.downvotes.length,
      upvoteCount: post.upvotes.length,
      downvoteCount: post.downvotes.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to vote" });
  }
});

/* -------- ADD COMMENT -------- */
router.post("/:postId/comments", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { content, parentId } = req.body;

    if (!content) return res.status(400).json({ error: "Content is required" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.isLocked) return res.status(403).json({ error: "Post is locked" });

    const comment = await Comment.create({
      postId: post._id,
      authorId: userId,
      parentId: parentId || null,
      content,
    });

    post.commentCount += 1;
    await post.save();

    // Award points
    await getOrCreateProfile(userId);
    await awardPoints(userId, 5, "comment", "Commented on a post");

    const populated = await Comment.findById(comment._id).populate("authorId", "displayName email").lean();
    const c: any = populated;

    res.json({
      success: true,
      comment: {
        ...c,
        _id: c._id.toString(),
        postId: c.postId.toString(),
        parentId: c.parentId?.toString() || null,
        author: c.authorId
          ? { _id: c.authorId._id?.toString(), displayName: c.authorId.displayName, email: c.authorId.email }
          : null,
        score: 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

/* -------- VOTE ON COMMENT -------- */
router.post("/comments/:id/vote", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { vote } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.upvotes = comment.upvotes.filter((id) => id.toString() !== userId) as any;
    comment.downvotes = comment.downvotes.filter((id) => id.toString() !== userId) as any;

    if (vote === "up") comment.upvotes.push(userId);
    else if (vote === "down") comment.downvotes.push(userId);

    await comment.save();

    if (comment.upvotes.length === 5) {
      await awardPoints(comment.authorId.toString(), 10, "comment_5_upvotes", "Comment reached 5 upvotes");
    }

    res.json({
      success: true,
      score: comment.upvotes.length - comment.downvotes.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to vote" });
  }
});

/* -------- DELETE COMMENT -------- */
router.delete("/comments/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    if (comment.authorId.toString() !== userId) return res.status(403).json({ error: "Not authorized" });

    comment.isDeleted = true;
    comment.content = "[deleted]";
    await comment.save();

    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
