import { useState } from "react";
import { useNavigate } from "react-router-dom";

const followers = [
  { id: 2, name: "Maya Chen", username: "@mayalifts" },
  { id: 3, name: "Jordan Lee", username: "@jordangains" },
  { id: 4, name: "Chris Walker", username: "@chrismoves" },
];

const following = [
  { id: 5, name: "Ava Patel", username: "@avatrains" },
  { id: 6, name: "Noah Brooks", username: "@noahstrength" },
  { id: 7, name: "Lena Scott", username: "@lenafit" },
  { id: 8, name: "Maya Chen", username: "@mayalifts" },
];

const initialFeedPosts = [
  {
    id: 1,
    userId: 5,
    userName: "Ava Patel",
    username: "@avatrains",
    workoutTitle: "Leg Day",
    workoutSummary: "Back Squat, Romanian Deadlift, Leg Press",
    gymName: "Iron Forge Fitness",
    timeAgo: "1h ago",
    likes: 12,
    liked: false,
    comments: [
      { id: 1, user: "Maya Chen", text: "Huge session 🔥" },
      { id: 2, user: "Jordan Lee", text: "Leg press numbers are crazy" },
    ],
  },
  {
    id: 2,
    userId: 6,
    userName: "Noah Brooks",
    username: "@noahstrength",
    workoutTitle: "Push Day",
    workoutSummary: "Bench Press, Incline DB Press, Tricep Pushdown",
    gymName: "Northside Barbell Club",
    timeAgo: "3h ago",
    likes: 8,
    liked: true,
    comments: [{ id: 1, user: "Ava Patel", text: "Strong bench day" }],
  },
  {
    id: 3,
    userId: 7,
    userName: "Lena Scott",
    username: "@lenafit",
    workoutTitle: "Pull Day",
    workoutSummary: "Lat Pulldown, Seated Row, Hammer Curl",
    gymName: "Flex Factory",
    timeAgo: "Yesterday",
    likes: 15,
    liked: false,
    comments: [],
  },
];

function FriendsPage() {
  const navigate = useNavigate();

  const [activeList, setActiveList] = useState("");
  const [feedPosts, setFeedPosts] = useState(initialFeedPosts);
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const displayedUsers = activeList === "followers" ? followers : following;

  const openUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const toggleLike = (postId) => {
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        const nextLiked = !post.liked;

        return {
          ...post,
          liked: nextLiked,
          likes: nextLiked ? post.likes + 1 : post.likes - 1,
        };
      })
    );
  };

  const toggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };

  const addComment = (postId) => {
    const newCommentText = (commentInputs[postId] || "").trim();

    if (!newCommentText) return;

    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;

        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Date.now(),
              user: "You",
              text: newCommentText,
            },
          ],
        };
      })
    );

    setCommentInputs((prev) => ({
      ...prev,
      [postId]: "",
    }));

    setOpenComments((prev) => ({
      ...prev,
      [postId]: true,
    }));
  };

  return (
    <div className="friends-page">
      <div className="friends-shell">
        <div className="friends-header-row">
          <div>
            <h1 className="friends-title">Friends</h1>
            <p className="friends-subtitle">
              See activity from the people you follow
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/home")}
          >
            Back
          </button>
        </div>

        <div className="friends-stats-row">
          <button
            className={`friends-stat-card ${
              activeList === "following" ? "selected" : ""
            }`}
            onClick={() => setActiveList("following")}
          >
            <span className="friends-stat-number">{following.length}</span>
            <span className="friends-stat-label">Following</span>
          </button>

          <button
            className={`friends-stat-card ${
              activeList === "followers" ? "selected" : ""
            }`}
            onClick={() => setActiveList("followers")}
          >
            <span className="friends-stat-number">{followers.length}</span>
            <span className="friends-stat-label">Followers</span>
          </button>
        </div>

        {activeList && (
          <div className="friends-list-card">
            <div className="friends-list-header">
              <h2>{activeList === "followers" ? "Followers" : "Following"}</h2>
              <button
                className="text-button"
                onClick={() => setActiveList("")}
              >
                Close
              </button>
            </div>

            <div className="friends-user-list">
              {displayedUsers.map((user) => (
                <button
                  key={`${activeList}-${user.id}`}
                  className="friends-user-row"
                  onClick={() => openUserProfile(user.id)}
                >
                  <div className="friends-user-avatar">
                    {user.name.charAt(0)}
                  </div>

                  <div className="friends-user-info">
                    <strong>{user.name}</strong>
                    <span>{user.username}</span>
                  </div>

                  <span className="friends-user-link">View Profile</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="friends-feed">
          {feedPosts.map((post) => (
            <div key={post.id} className="feed-post-card">
              <div className="feed-post-header">
                <button
                  className="feed-user-button"
                  onClick={() => openUserProfile(post.userId)}
                >
                  <div className="feed-user-avatar">
                    {post.userName.charAt(0)}
                  </div>

                  <div className="feed-user-text">
                    <strong>{post.userName}</strong>
                    <span>{post.username}</span>
                  </div>
                </button>

                <span className="feed-post-time">{post.timeAgo}</span>
              </div>

              <div className="feed-post-body">
                <h2>{post.workoutTitle}</h2>
                <p>{post.workoutSummary}</p>
                <span className="feed-post-gym">{post.gymName}</span>
              </div>

              <div className="feed-post-actions">
                <button
                  className={`feed-action-button ${post.liked ? "liked" : ""}`}
                  onClick={() => toggleLike(post.id)}
                >
                  {post.liked ? "Liked" : "Like"} ({post.likes})
                </button>

                <button
                  className="feed-action-button"
                  onClick={() => toggleComments(post.id)}
                >
                  Comment ({post.comments.length})
                </button>
              </div>

              {openComments[post.id] && (
                <div className="feed-comments-section">
                  <div className="feed-comments-list">
                    {post.comments.length > 0 ? (
                      post.comments.map((comment) => (
                        <div key={comment.id} className="feed-comment">
                          <strong>{comment.user}</strong>
                          <span>{comment.text}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-comments-text">No comments yet.</p>
                    )}
                  </div>

                  <div className="feed-comment-input-row">
                    <input
                      type="text"
                      placeholder="Add a comment"
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        handleCommentInputChange(post.id, e.target.value)
                      }
                    />
                    <button onClick={() => addComment(post.id)}>Post</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FriendsPage;