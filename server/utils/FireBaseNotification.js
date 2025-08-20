app.post("/send-notification", async (req, res) => {
  const { title, body, token } = req.body;

  const response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Authorization": "key=YOUR_SERVER_KEY",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: token,  // device FCM token
      notification: {
        title,
        body,
        icon: "https://yourdomain.com/icon.png",
      },
    }),
  });

  const data = await response.json();
  res.json(data);
});