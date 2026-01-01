import { addDoc, collection } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

async function likePost(postId, postOwnerEmail){
  // Add like to "likes" subcollection or array
  await addDoc(collection(db, "posts", postId, "likes"), {
    user: currentUser.email,
    timestamp: new Date()
  });

  // Add notification
  if(postOwnerEmail !== currentUser.email){
    await addDoc(collection(db, "notifications"), {
      to: postOwnerEmail,
      from: currentUser.displayName || currentUser.email,
      type: "like",
      message: `${currentUser.displayName || currentUser.email} liked your post`,
      timestamp: new Date()
    });
  }
}

async function commentPost(postId, postOwnerEmail, commentText){
  // Add comment to "comments" subcollection
  await addDoc(collection(db, "posts", postId, "comments"), {
    user: currentUser.email,
    text: commentText,
    timestamp: new Date()
  });

  // Add notification
  if(postOwnerEmail !== currentUser.email){
    await addDoc(collection(db, "notifications"), {
      to: postOwnerEmail,
      from: currentUser.displayName || currentUser.email,
      type: "comment",
      message: `${currentUser.displayName || currentUser.email} commented: "${commentText}"`,
      timestamp: new Date()
    });
  }
}