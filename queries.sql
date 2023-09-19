-- 1. What is the percentage of posts that have at least one answer? --------->>>
SELECT ( COUNT( 
	CASE WHEN answerCount >=1 THEN  1 
	ELSE null end
	   )*100/ COUNT(*)) AS Percentage 
FROM posts
where posts.posttypeid=1;


-- 2. List the top 10 users who have the most reputation --------->>>
SELECT id, displayname, reputation
FROM users
ORDER BY reputation DESC
LIMIT 10;

-- 3. Which day of the week has most questions answered within an hour? --------->>>

WITH AnsweredWithinHour AS (
    SELECT
        EXTRACT(DOW FROM p1.creationdate) AS day_of_week,
        COUNT(*) AS answered_count
    FROM
        posts p1
    JOIN
        posts p2 ON p1.id = p2.parentid
    WHERE
        p2.posttypeid = 2
        AND DATE_PART('hour', p2.creationdate - p1.creationdate) <= 1
    GROUP BY
        day_of_week
)
SELECT
    CASE
        WHEN day_of_week = 0 THEN 'Sunday'
        WHEN day_of_week = 1 THEN 'Monday'
        WHEN day_of_week = 2 THEN 'Tuesday'
        WHEN day_of_week = 3 THEN 'Wednesday'
        WHEN day_of_week = 4 THEN 'Thursday'
        WHEN day_of_week = 5 THEN 'Friday'
        WHEN day_of_week = 6 THEN 'Saturday'
    END AS day_of_week,
    answered_count
FROM
    AnsweredWithinHour
ORDER BY
    answered_count DESC
LIMIT 1;


-- 4. Find the top 10 posts with the most upvotes in 2015? --------->>>

SELECT  posts.id AS postid, COUNT(votes.VoteTypeId) AS upvotes
FROM posts
 JOIN votes ON posts.id = votes.postid
WHERE EXTRACT(year from posts.creationdate) = 2015 AND (votes.VoteTypeId = 2)
GROUP BY  posts.id
ORDER BY upvotes DESC
LIMIT 10;


-- 5.Find the top 5 tags associated with the most number of posts . --------->>>

SELECT tagname, count FROM tags
ORDER BY count DESC
LIMIT 5;

-- 6.Find the number of questions asked every year . --------->>>

SELECT 
EXTRACT(YEAR FROM posts.creationdate) AS year ,
COUNT(posttypeid) FROM posts
WHERE posttypeid=1
GROUP BY  EXTRACT(YEAR FROM posts.creationdate) 
ORDER BY EXTRACT (YEAR FROM posts.creationdate);


-- 7. For the questions asked in 2014, find any 3 "rare" questions that are associated with the least used tags ----->

-- WE will create subquery and find leastUsedTags firstly 

WITH LeastUsedTags AS (
    SELECT tagname
    FROM tags
    ORDER BY count ASC
    LIMIT 10
)


SELECT posts.Id, posts.Title, posts.Tags
FROM posts 
JOIN tags  ON posts.Tags LIKE CONCAT('%', tags.tagname, '%')
WHERE tags.tagname IN (SELECT tagname FROM LeastUsedTags) 
AND posttypeid =1
AND EXTRACT(YEAR FROM posts.CreationDate) = 2014;


-- 8.When did arduino.stackexchange.com have the most usage? Has it declined in usage now? (somewhat open-ended 
-- question. Use your own interpretation of the question) 

select extract(year from posts.creationdate) as year , count (*) as PostCount from posts
group by year
order by postcount desc ;


-- Find the top 5 users who have performed the most number of actions in terms of creating posts, comments, votes. Calculate the score in the following way:
-- Each post carries 10 points
-- Each upvote / downvote carries 1 point
-- Each comment carries 3 points

WITH UserActions AS (
    SELECT
        u.id AS user_id,
        (
            COALESCE(SUM(CASE WHEN p.posttypeid = 1 THEN 10 ELSE 0 END), 0) +
            COALESCE(SUM(CASE WHEN v.votetypeid IN (2, 3) THEN 1 ELSE 0 END), 0) +
            COALESCE(SUM(CASE WHEN p.posttypeid = 2 THEN 3 ELSE 0 END), 0) +
            COALESCE(SUM(CASE WHEN c.id IS NOT NULL THEN 3 ELSE 0 END), 0)
        ) AS Score
    FROM users u
    LEFT JOIN posts p ON u.id = p.owneruserid
    LEFT JOIN votes v ON p.id = v.postid
    LEFT JOIN comments c ON u.id = c.userid
    GROUP BY u.id
)

SELECT user_id, Score
FROM UserActions
ORDER BY Score DESC
LIMIT 5;
