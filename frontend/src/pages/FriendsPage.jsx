import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function FriendsPage() {
  const navigate = useNavigate();

  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [activeList, setActiveList] = useState("");
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [openComments, setOpenComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!storedUser) {
      navigate("/");
      return;
    }

    fetchSocialCounts();
    fetchPosts();
  }, []);

  const fetchSocialCounts = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${storedUser.user_id}/social-counts`,
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not load social counts.");
        return;
      }

      setFollowingCount(data.following_count);
      setFollowersCount(data.followers_count);
    } catch (err) {
      setError("Could not load social counts.");
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: storedUser.user_id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not like post.");
        return;
      }

      setFeedPosts((prev) =>
        prev.map((post) =>
          post.post_id === postId
            ? {
                ...post,
                like_count: data.like_count,
                liked_by_me: data.liked,
              }
            : post,
        ),
      );
    } catch (err) {
      setError("Could not like post.");
    }
  };

  const fetchUserList = async (type) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${storedUser.user_id}/${type}`,
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not load users.");
        return;
      }

      setActiveList(type);
      setDisplayedUsers(data);
    } catch (err) {
      setError("Could not load users.");
    }
  };
  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts?user_id=${storedUser.user_id}`,
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not load posts.");
        return;
      }

      setFeedPosts(data);
    } catch (err) {
      setError("Could not load posts.");
    }
  };

  const formatPostedAt = (dateValue) => {
    if (!dateValue) return "Unknown time";
    return new Date(dateValue).toLocaleString();
  };

  const summarizeSets = (exercise) => {
    const groups = {};

    exercise.sets.forEach((set) => {
      const reps = set.reps ?? "-";
      const weight = set.weight ?? "-";
      const key = `${reps}-${weight}`;

      if (!groups[key]) {
        groups[key] = {
          reps,
          weight,
          count: 0,
        };
      }

      groups[key].count += 1;
    });

    return Object.values(groups).map(
      (group) =>
        `${exercise.name} ${group.count} sets ${group.reps} reps ${group.weight} lbs`,
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

  const addComment = async (postId) => {
    const comment = (commentInputs[postId] || "").trim();

    if (!comment) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: storedUser.user_id,
            content: comment,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Could not add comment.");
        return;
      }

      setCommentInputs((prev) => ({
        ...prev,
        [postId]: "",
      }));

      fetchPosts();
    } catch (err) {
      setError("Could not add comment.");
    }
  };

  return (
    <div className="friends-page">
      <div className="friends-shell">
        <div className="friends-header-row">
          <div>
            <h1 className="friends-title">Friends</h1>
            <p className="friends-subtitle">
              See workout posts from the community
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() => navigate("/home")}
          >
            Back
          </button>
        </div>

        {error && <p className="login-error">{error}</p>}
        {error && <p className="login-error">{error}</p>}

        <div className="friends-stats-row">
          <button
            className={`friends-stat-card ${
              activeList === "following" ? "selected" : ""
            }`}
            onClick={() => fetchUserList("following")}
          >
            <span className="friends-stat-number">{followingCount}</span>
            <span className="friends-stat-label">Following</span>
          </button>

          <button
            className={`friends-stat-card ${
              activeList === "followers" ? "selected" : ""
            }`}
            onClick={() => fetchUserList("followers")}
          >
            <span className="friends-stat-number">{followersCount}</span>
            <span className="friends-stat-label">Followers</span>
          </button>
        </div>

        {activeList && (
          <div className="friends-list-card">
            <div className="friends-list-header">
              <h2>{activeList === "followers" ? "Followers" : "Following"}</h2>
              <button className="text-button" onClick={() => setActiveList("")}>
                Close
              </button>
            </div>

            <div className="friends-user-list">
              {displayedUsers.map((user) => (
                <button
                  key={user.user_id}
                  className="friends-user-row"
                  onClick={() => navigate(`/profile/${user.user_id}`)}
                >
                  <div className="friends-user-avatar">
                    {user.profile_picture_url ? (
                      <img src={user.profile_picture_url} alt={user.name} />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>

                  <div className="friends-user-info">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>

                  <span className="friends-user-link">View Profile</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="friends-feed">
          {feedPosts.length === 0 && !error && (
            <div className="empty-state-card">
              <p>No workout posts yet.</p>
            </div>
          )}

          {feedPosts.map((post) => (
            <div key={post.post_id} className="feed-post-card">
              <div className="feed-post-header">
                <button
                  className="feed-user-button"
                  onClick={() => navigate(`/profile/${post.user_id}`)}
                >
                  <div className="feed-user-avatar">
                    {post.user_name?.charAt(0) || "?"}
                  </div>

                  <div className="feed-user-text">
                    <strong>{post.user_name}</strong>
                    <span>{formatPostedAt(post.posted_at)}</span>
                  </div>
                </button>
              </div>

              <div className="feed-post-body">
                <h2>{post.title}</h2>

                {post.caption && <p>{post.caption}</p>}

                <div className="feed-workout-summary">
                  {post.exercises.flatMap((exercise) =>
                    summarizeSets(exercise).map((line, index) => (
                      <p key={`${exercise.workout_exercise_id}-${index}`}>
                        {line}
                      </p>
                    )),
                  )}
                </div>
              </div>

              <div className="feed-post-actions">
                <button
                  className={`feed-action-button ${post.liked_by_me ? "liked" : ""}`}
                  onClick={() => handleLike(post.post_id)}
                >
                  {post.liked_by_me ? "Liked" : "Like"} ({post.like_count || 0})
                </button>

                <button
                  className="feed-action-button"
                  onClick={() => toggleComments(post.post_id)}
                >
                  Comment
                </button>
              </div>

              {openComments[post.post_id] && (
                <div className="feed-comments-section">
                  {post.comments.length === 0 ? (
                    <p className="no-comments-text">No comments yet.</p>
                  ) : (
                    post.comments.map((c) => (
                      <p key={c.comment_id}>
                        <strong>{c.name}:</strong> {c.content}
                      </p>
                    ))
                  )}

                  <div className="feed-comment-input-row">
                    <input
                      type="text"
                      placeholder="Add a comment"
                      value={commentInputs[post.post_id] || ""}
                      onChange={(e) =>
                        handleCommentInputChange(post.post_id, e.target.value)
                      }
                    />

                    <button onClick={() => addComment(post.post_id)}>
                      Post
                    </button>
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
