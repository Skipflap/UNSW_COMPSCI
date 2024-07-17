/**
 * This solution uses if/else conditions to check for the key 'error' in the
 * helper functions' returned object, then continue to pass the error along
 *
 * This can be done much more concisely by throwing exceptions, rather than
 * returning objects and having to check for if/else each time.
 *
 * To see an example of how the code below can be improved, see src.alternate
 */

// ========================================================================== //

interface ErrorObject {
  error: string;
}

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

type EmptyObject = Record<string, string>;

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
    return { error: `No such post with postId: '${postId}'!` };
  }
  return post;
};

const getTimeStamp = () => Math.floor(Date.now() / 1000);

const checkLength = (label: string, inputString: string, minLength: number, maxLength: number) => {
  if (!inputString || inputString.length < minLength || inputString.length > maxLength) {
    return {
      error: `For our reference solution, we have restricted the length of '${label}'` +
        ` to be between '${minLength}' and '${maxLength}' characters. However, you` +
        ' do not need to do this and should instead follow the specification!'
    };
  }
  return {};
};

const checkValidPostDetails = (sender: string, title: string, content: string) => {
  let err: ErrorObject | EmptyObject = checkLength('sender', sender, 1, 20);
  if ('error' in err) {
    return err;
  }
  err = checkLength('title', title, 1, 20);
  if ('error' in err) {
    return err;
  }
  err = checkLength('content', content, 1, 250);
  if ('error' in err) {
    return err;
  }
  return err;
};

// ========================================================================== //

export function postCreate(sender: string, title: string, content: string) {
  const err = checkValidPostDetails(sender, title, content);
  if ('error' in err) {
    return err;
  }
  const postId = data.posts.length * 2 + 2041;
  data.posts.push({ postId, sender, title, content, timeSent: getTimeStamp() });
  return { postId };
}

export function postComment(postId: number, sender: string, comment: string) {
  let err: Post | ErrorObject | EmptyObject = getPost(postId);
  if ('error' in err) {
    return err;
  }
  err = checkLength('sender', sender, 1, 20);
  if ('error' in err) {
    return err;
  }
  err = checkLength('comment', comment, 1, 150);
  if ('error' in err) {
    return err;
  }
  const commentId = data.comments.length * 3 + 2511;
  data.comments.push({ commentId, postId, sender, comment, timeSent: getTimeStamp() });
  return { commentId };
}

export function postView(postId: number) {
  const post = getPost(postId);
  if ('error' in post) {
    return post;
  }
  const comments = data.comments
    .filter(c => c.postId === postId)
    .sort((c1, c2) => c2.commentId - c1.commentId)
    .map(({ postId, ...c }) => c);
  return { post: { ...post, comments } };
}

export function postEdit(postId: number, sender: string, title: string, content: string) {
  const post = getPost(postId);
  if ('error' in post) {
    return post;
  }
  const err = checkValidPostDetails(sender, title, content);
  if ('error' in err) {
    return err;
  }
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
