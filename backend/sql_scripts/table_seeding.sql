USE gym_app;

INSERT IGNORE INTO follows (follower_user_id, followed_user_id)
VALUES
(4, 1),
(4, 2),
(4, 3),
(1, 4),
(2, 4),
(3, 4),
(1, 2),
(2, 3),
(3, 1);