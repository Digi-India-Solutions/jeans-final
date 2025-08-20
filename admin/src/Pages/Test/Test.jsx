// import React, { useEffect, useState, useCallback } from "react";
// import {
//     requestNotificationPermission,
//     onMessageListener,
// } from "../Notification/firebase";

// function Test() {
//     const [notification, setNotification] = useState(null);

//     // Request token once when component mounts
//     useEffect(() => {
//         requestNotificationPermission();

//         // Listen for foreground FCM messages
//         const unsubscribe = onMessageListener().then((payload) => {
//             if (payload?.notification) {
//                 setNotification(payload.notification);

//                 // Also show system notification
//                 showSystemNotification(payload.notification);
//             }
//         });

//         return () => {
//             // cleanup (if needed later)
//         };
//     }, []);

//     // Utility to show a system notification
//     const showSystemNotification = useCallback((notif) => {
//         if (Notification.permission === "granted") {
//             const notification = new Notification(notif.title || "🔔 Notification", {
//                 body: notif.body || "",
//                 icon: notif.image || "/logo192.png",
//                 data: { url: notif.click_action || "https://example.com" }, // fallback link
//             });

//             // Handle notification click
//             notification.onclick = (event) => {
//                 event.preventDefault();
//                 window.open(notification.data.url, "_blank");
//             };
//         }
//     }, []);

//     // Button handler (local notification)
//     const handleClick = async () => {
//         if (Notification.permission === "granted") {
//             showSystemNotification({
//                 title: "🚀 Button Clicked!",
//                 body: "This is a local notification from your app.",
//                 image: "/logo192.png",
//                 click_action: "https://example.com",
//                 click_action: "tel:+9131734930",
//             });
//         } else {
//             await requestNotificationPermission();
//         }
//     };

//     return (
//         <div style={{ padding: 20 }}>
//             <h1>🔔 Firebase Push Notification Test</h1>
//             <button onClick={handleClick}>Show Local Notification</button>

//             {notification && (
//                 <div
//                     style={{
//                         marginTop: 20,
//                         padding: 15,
//                         border: "1px solid #ddd",
//                         borderRadius: 8,
//                         background: "#f9f9f9",
//                     }}
//                 >
//                     <h3>{notification.title}</h3>
//                     <p>{notification.body}</p>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Test;


import React, { useEffect, useState, useCallback } from "react";
import {
    requestNotificationPermission,
    onMessageListener,
} from "../Notification/firebase";

function Test() {
    const [notification, setNotification] = useState(null);

    // Request token once when component mounts
    useEffect(() => {
        requestNotificationPermission();

        // Listen for foreground FCM messages
        onMessageListener().then((payload) => {
            if (payload?.notification) {
                setNotification(payload.notification);
                showSystemNotification(payload.notification);
            }
        });
    }, []);

    // Utility to show a system notification
    const showSystemNotification = useCallback((notif) => {
        if (Notification.permission === "granted") {
            const notification = new Notification(notif.title || "🔔 Notification", {
                body: notif.body || "",
                icon: notif.image || "/logo192.png",
                data: { url: notif.click_action || "https://example.com" },
            });

            // Handle notification click (open URL or dial number)
            notification.onclick = (event) => {
                event.preventDefault();
                if (notification.data.url.startsWith("tel:")) {
                    window.location.href = notification.data.url; // open dialer
                } else {
                    window.open(notification.data.url, "_blank");
                }
            };
        }
    }, []);

    // Button handler (local test notification)
    const handleClick = async () => {
        if (Notification.permission === "granted") {
            showSystemNotification({
                title: "📞 Contact Us",
                body: "Tap to call support at +91 31734 930",
                image: "/logo192.png",
                click_action: "tel:+9131734930", // only keep one
            });
        } else {
            await requestNotificationPermission();
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>🔔 Firebase Push Notification Test</h1>
            <button onClick={handleClick}>Show Local Notification</button>

            {notification && (
                <div style={{ marginTop: 20, padding: 15, border: "1px solid #ddd", borderRadius: 8, background: "#f9f9f9", }}                >
                    <h3>{notification.title}</h3>
                    <p>{notification.body}</p>
                </div>
            )}
        </div>
    );
}

export default Test;
