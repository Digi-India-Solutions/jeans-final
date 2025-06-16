// const fetch = require('node-fetch'); 
// const { Headers } = fetch;

// const msg91AuthKey = "431139AqSI3v7wQJWi66fd8388P1";
// const ADMIN_WHATSAPP_NUMBER = "919131734930";

// const sendWhatsappByUserForRequastActiveAccount = async ({ phone, fullName }) => {
//     try {
//       const myHeaders = new Headers();
//       myHeaders.append("Content-Type", "application/json");
//       myHeaders.append("authkey", msg91AuthKey);
  
//       const body = {
//         integrated_number: "9131734930",
//         content_type: "template",
//         payload: {
//           messaging_product: "whatsapp",
//           type: "template",
//           template: {
//             name: "account_activation_request",
//             language: {
//               code: "en_US",
//               policy: "deterministic"
//             },
//             namespace: null,
//             to_and_components: [
//               {
//                 to: [ADMIN_WHATSAPP_NUMBER],
//                 components: {
//                   body_1: { type: "text", value: fullName },
//                   body_2: { type: "text", value: phone }
//                 }
//               }
//             ]
//           }
//         }
//       };
  
//       const response = await fetch(
//         "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
//         {
//           method: "POST",
//           headers: myHeaders,
//           body: JSON.stringify(body)
//         }
//       );
  
//       const result = await response.text();
//       console.log("✅ Admin WhatsApp notified:", result);
//     } catch (error) {
//       console.error("❌ Error sending WhatsApp message:", error);
//     }
//   };
  
//   module.exports = sendWhatsappByUserForRequastActiveAccount;

// const sendOrderNotificationByAdminOnWhatsapp = async ({ email, name, mobile }) => {
//     const myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     myHeaders.append("authkey", msg91AuthKey);

//     const raw = JSON.stringify({
//         "integrated_number": "919177500520", // MSG91-approved sender number
//         "content_type": "template",
//         "payload": {
//             "messaging_product": "whatsapp",
//             "type": "template",
//             "template": {
//                 "name": "order_notification", // your approved template name
//                 "language": {
//                     "code": "en_US",
//                     "policy": "deterministic"
//                 },
//                 "namespace": null,
//                 "to_and_components": [
//                     {
//                         "to": [ADMIN_WHATSAPP_NUMBER], // WhatsApp number of admin
//                         "components": {
//                             "body_1": {
//                                 "type": "text",
//                                 "value": name
//                             },
//                             "body_2": {
//                                 "type": "text",
//                                 "value": mobile
//                             },
//                             "body_3": {
//                                 "type": "text",
//                                 "value": email
//                             }
//                         }
//                     }
//                 ]
//             }
//         }
//     });

//     const requestOptions = { method: 'POST', headers: myHeaders, body: raw, redirect: 'follow' };

//     fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", requestOptions)
//         .then(response => response.text())
//         .then(result => console.log("Admin WhatsApp notified:", result))
//         .catch(error => console.error("Error sending WhatsApp message:", error));
// };

// module.exports = sendOrderNotificationByAdminOnWhatsapp


const fetch = require("node-fetch");

const MSG91_API_URL = "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/";
const MSG91_AUTH_KEY = "431139AqSI3v7wQJWi66fd8388P1";
const ADMIN_WHATSAPP_NUMBER = "919131734930";
const INTEGRATED_NUMBER = "919177500520"; // your MSG91 sender number

// Reusable function to send WhatsApp message
const sendWhatsAppMessage = async (templateName, components) => {
  try {
    const response = await fetch(MSG91_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: MSG91_AUTH_KEY,
      },
      body: JSON.stringify({
        integrated_number: INTEGRATED_NUMBER,
        content_type: "template",
        payload: {
          messaging_product: "whatsapp",
          type: "template",
          template: {
            name: templateName,
            language: {
              code: "en_US",
              policy: "deterministic",
            },
            to_and_components: [
              {
                to: [ADMIN_WHATSAPP_NUMBER],
                components,
              },
            ],
          },
        },
      }),
    });

    const result = await response.text();
    console.log(`✅ WhatsApp message sent (${templateName}):`, result);
  } catch (error) {
    console.error(`❌ Error sending WhatsApp message (${templateName}):`, error);
  }
};

// 1. Account Activation Request Notification
const sendWhatsappByUserForRequestActiveAccount = async ({ phone, fullName }) => {
  const components = {
    body_1: { type: "text", value: fullName },
    body_2: { type: "text", value: phone },
  };

  await sendWhatsAppMessage("account_activation_request", components);
};

// 2. Order Notification by Admin
const sendOrderNotificationByAdminOnWhatsapp = async ({ name, mobile, email }) => {
  const components = {
    body_1: { type: "text", value: name },
    body_2: { type: "text", value: mobile },
    body_3: { type: "text", value: email },
  };

  await sendWhatsAppMessage("order_notification", components);
};

module.exports = {
  sendWhatsappByUserForRequestActiveAccount,
  sendOrderNotificationByAdminOnWhatsapp,
};
