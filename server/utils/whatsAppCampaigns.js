const fetch = require("node-fetch");
const FormData = require("form-data");

const API_URL_11za = "https://app.11za.in/apis/template/sendTemplate";
const authToken_11za = "U2FsdGVkX1/R3Dvznq1e0S+QRvIfFac3XfAMYcjsuBSONCNWnNTGblIyFjTKJkR89w1lYYf1TCWSluX/y2O2bVLKa16qP7LzS3gtHOOlF5M2QyxQcleJ2AsFD4JwZektEKSz3MpUXLagDXkyKj0ZmZkLgHlK8VeMLb1IEH9MAMR2wwTFgXjRJy6O6p+k9SBB";
const ORIGIN_WEBSITE = "http://www.swagside.in/";


const sendWhatsAppMessage = async ({ sendTo, templateName = "", data, language = "en", buttonValue = "", isTinyURL = "yes", }) => {
  try {
    if (!sendTo || typeof sendTo !== "string") {
      throw new Error("Invalid 'sendTo' value; expected string.");
    }

    if (!templateName || typeof templateName !== "string") {
      throw new Error("Invalid 'templateName' value; expected string.");
    }

    const form = new FormData();
    form.append("authToken", authToken_11za);
    form.append("sendto", sendTo);
    form.append("originWebsite", ORIGIN_WEBSITE);
    form.append("templateName", templateName);
    form.append("data", data.name);
    form.append("language", language);
    if (buttonValue) form.append("buttonValue", buttonValue);
    form.append("isTinyURL", isTinyURL);
    const response = await fetch(API_URL_11za, { method: "POST", body: form, });

    const result = await response.text();
    console.log(`✅ WhatsApp message sent (${templateName}):`, result);
  } catch (error) {
    console.error(`❌ Error sending WhatsApp message (${templateName}):`, error.message);
  }
};


const sendOrderNotificationByAdminOnWhatsapp = async ({ name, mobile, email }) => {
  const data = { name, mobile, email, };
  await sendWhatsAppMessage({ sendTo: mobile, templateName: "customare_order_notification_copy_1", data, });
};

module.exports = {
  sendOrderNotificationByAdminOnWhatsapp,
};
