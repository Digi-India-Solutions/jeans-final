// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyCciF3oIlk48em_wbNmYvajQLzcYYYVH8c",
  authDomain: "jeans-aac27.firebaseapp.com",
  projectId: "jeans-aac27",
  storageBucket: "jeans-aac27.firebasestorage.app",
  messagingSenderId: "14228697422",
  appId: "1:14228697422:web:8e3ce178939330b5efee1f",
  measurementId: "G-6740V96F8X",
});

// Retrieve Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: payload.notification?.image || "/logo192.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
