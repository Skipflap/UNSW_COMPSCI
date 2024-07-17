/**
 * Note: Throwing HTTPErrors will be explored in future weeks.
 * The solution currently uses a middleware to convert the error into an object.
 * (see errorHandler.ts)
 */

import HTTPError from 'http-errors';

// ========================================================================== //

interface Post {
  postId: number;
  sender: string;
  title: string;
  content: string;
  timeSent: number;
}

interface Comment {
  commentId: number;
  postId: number;
  sender: string;
  comment: string;
  timeSent: number;
}

interface Data {
  posts: Post[];
  comments: Comment[];
}

const data: Data = {
  posts: [],
  comments: [],
};

// ========================================================================== //
/**
 * HELPER FUNCTIONS

 * If there are multiple files that uses these functions, rather than redefining
 * them in each new file, it is better to move these helper functions into a
 * file of its own such as src/helper.ts, then export and import into other files.
 */

const getPost = (postId: number) => {
  const post = data.posts.find((p: Post) => p.postId === postId);
  if (!post) {
    throw HTTPError(400, `No such post with postId: '${postId}'!`);
  }
  return post;
};

const getTimeStamp = () => Math.floor(Date.now() / 1000);

const checkLength = (label: string, inputString: string, minLength: number, maxLength: number) => {
  if (!inputString || inputString.length < minLength || inputString.length > maxLength) {
    throw HTTPError(400,
      `For our reference solution, we have restricted the length of '${label}'` +
      ` to be between '${minLength}' and '${maxLength}' characters. However, you` +
      ' do not need to do this and should instead follow the specification!'
    );
  }
};

const checkValidPostDetails = (sender: string, title: string, content: string) => {
  checkLength('sender', sender, 1, 20);
  checkLength('title', title, 1, 20);
  checkLength('content', content, 1, 250);
};

// ========================================================================== //

export function postCreate(sender: string, title: string, content: string) {
  checkValidPostDetails(sender, title, content);
  const postId = data.posts.length * 2 + 2041;
  data.posts.push({ postId, sender, title, content, timeSent: getTimeStamp() });
  return { postId };
}

export function postComment(postId: number, sender: string, comment: string) {
  // For error checking only
  getPost(postId);
  checkLength('sender', sender, 1, 20);
  checkLength('comment', comment, 1, 150);
  const commentId = data.comments.length * 3 + 2511;
  data.comments.push({ commentId, postId, sender, comment, timeSent: getTimeStamp() });
  return { commentId };
}

export function postView(postId: number) {
  const post = getPost(postId);
  const comments = data.comments
    .filter(c => c.postId === postId)
    .sort((c1, c2) => c2.commentId - c1.commentId)
    .map(({ postId, ...c }) => c);
  return { post: { ...post, comments } };
}

export function postEdit(postId: number, sender: string, title: string, content: string) {
  const post = getPost(postId);
  checkValidPostDetails(sender, title, content);
  post.sender = sender;
  post.title = title;
  post.content = content;
  return {};
}

export function postsList() {
  const posts = data.posts
    .map(p => ({
      postId: p.postId,
      sender: p.sender,
      title: p.title,
      timeSent: p.timeSent,
    }))
    .sort((p1, p2) => p2.postId - p1.postId);
  return { posts };
}

export function clear() {
  data.posts = [];
  data.comments = [];
  return {};
}
