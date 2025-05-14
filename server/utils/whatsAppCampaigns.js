const fetch = require('node-fetch'); 
const { Headers } = fetch;

const msg91AuthKey = "431139AqSI3v7wQJWi66fd8388P1";
const ADMIN_WHATSAPP_NUMBER = "919131734930";

const sendWhatsappByUserForRequastActiveAccount = async ({ phone, fullName }) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      myHeaders.append("authkey", msg91AuthKey);
  
      const body = {
        integrated_number: "9131734930",
        content_type: "template",
        payload: {
          messaging_product: "whatsapp",
          type: "template",
          template: {
            name: "account_activation_request",
            language: {
              code: "en_US",
              policy: "deterministic"
            },
            namespace: null,
            to_and_components: [
              {
                to: [ADMIN_WHATSAPP_NUMBER],
                components: {
                  body_1: { type: "text", value: fullName },
                  body_2: { type: "text", value: phone }
                }
              }
            ]
          }
        }
      };
  
      const response = await fetch(
        "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify(body)
        }
      );
  
      const result = await response.text();
      console.log("✅ Admin WhatsApp notified:", result);
    } catch (error) {
      console.error("❌ Error sending WhatsApp message:", error);
    }
  };
  
  module.exports = sendWhatsappByUserForRequastActiveAccount;


// exports.sendRequestFormToAdmin = ({
//     requestId,
//     companyName,
//     companyContactNo,
//     companyResContactNo,
//     companyAddress,
//     // siteStreet,
//     // siteLandmark,
//     // siteZipcode,
//     // siteCity,
//     // siteState,
//     vendorName,
//     // network,
//     // withRelay,
//     // withNetwork,
//     // withServer,
//     // withInstallation,
//     // panicButton,
//     driverName,
//     driverFatherName,
//     driverContactNo,
//     driverResidentialContactNo,
//     driverAadharNo,
//     driverPanNo,
//     driverBadge,
//     driverShift,
//     driverAddress,
//     vehicleBrand,
//     vehicleModel,
//     vehicleRegnNo,
//     vehiclePlate,
//     vehicleType,
//     vehicleClass,
//     vehicleChassisNo,
//     ownerName,
//     ownerContactNo,
//     // installerName,
//     // installerContactNo
// }) => {

//     var myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     myHeaders.append("authkey", msg91AuthKey);

//     var raw = JSON.stringify({
//         "integrated_number": "919177500520",
//         "content_type": "template",
//         "payload": {
//             "messaging_product": "whatsapp",
//             "type": "template",
//             "template": {
//                 "name": "request_form_for_admin",
//                 "language": {
//                     "code": "en_GB",
//                     "policy": "deterministic"
//                 },
//                 "namespace": null,
//                 "to_and_components": [
//                     {
//                         "to": [
//                             "<list_of_phone_numbers>"
//                         ],
//                         "components": {
//                             "header_1": {
//                                 "type": "text",
//                                 "value": requestId
//                             },
//                             "body_1": {
//                                 "type": "text",
//                                 "value": companyName
//                             },
//                             "body_2": {
//                                 "type": "text",
//                                 "value": companyContactNo
//                             },
//                             "body_3": {
//                                 "type": "text",
//                                 "value": companyResContactNo
//                             },
//                             "body_4": {
//                                 "type": "text",
//                                 "value": companyAddress
//                             },
//                             "body_5": {
//                                 "type": "text",
//                                 "value": vendorName
//                             },
//                             "body_6": {
//                                 "type": "text",
//                                 "value": driverName
//                             },
//                             "body_7": {
//                                 "type": "text",
//                                 "value": driverFatherName
//                             },
//                             "body_8": {
//                                 "type": "text",
//                                 "value": driverContactNo
//                             },
//                             "body_9": {
//                                 "type": "text",
//                                 "value": driverResidentialContactNo
//                             },
//                             "body_10": {
//                                 "type": "text",
//                                 "value": driverAadharNo
//                             },
//                             "body_11": {
//                                 "type": "text",
//                                 "value": driverPanNo
//                             },
//                             "body_12": {
//                                 "type": "text",
//                                 "value": driverBadge
//                             },
//                             "body_13": {
//                                 "type": "text",
//                                 "value": driverShift
//                             },
//                             "body_14": {
//                                 "type": "text",
//                                 "value": driverAddress
//                             },
//                             "body_15": {
//                                 "type": "text",
//                                 "value": vehicleRegnNo
//                             },
//                             "body_16": {
//                                 "type": "text",
//                                 "value": vehiclePlate
//                             },
//                             "body_17": {
//                                 "type": "text",
//                                 "value": vehicleChassisNo
//                             },
//                             "body_18": {
//                                 "type": "text",
//                                 "value": ownerName
//                             },
//                             "body_19": {
//                                 "type": "text",
//                                 "value": ownerContactNo
//                             },
//                         }
//                     }
//                 ]
//             }
//         }
//     });

//     var requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: raw,
//         redirect: 'follow'
//     };

//     fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", requestOptions)
//         .then(response => response.text())
//         .then(result => console.log(result))
//         .catch(error => console.log('error', error));
// }


// const sendLoginOtpToUser = ({ otp, phoneNumber }) => {

//     var myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/json");
//     myHeaders.append("authkey", msg91AuthKey);

//     var raw = JSON.stringify({
//         "integrated_number": "919177500520",
//         "content_type": "template",
//         "payload": {
//             "messaging_product": "whatsapp",
//             "type": "template",
//             "template": {
//                 "name": "authentication",
//                 "language": {
//                     "code": "en_US",
//                     "policy": "deterministic"
//                 },
//                 "namespace": null,
//                 "to_and_components": [
//                     {
//                         "to": [phoneNumber],
//                         "components": {
//                             "body_1": {
//                                 "type": "text",
//                                 "value": otp
//                             },
//                             "button_1": {
//                                 "subtype": "url",
//                                 "type": otp,
//                                 "value": otp
//                             }
//                         }
//                     }
//                 ]
//             }
//         }
//     });

//     var requestOptions = {
//         method: 'POST',
//         headers: myHeaders,
//         body: raw,
//         redirect: 'follow'
//     };

//     fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", requestOptions)
//         .then(response => response.text())
//         .then(result => console.log(result))
//         .catch(error => console.log('error', error));

// }

// exports.sendWhatsappByUserForRequastActiveAccount = ({ phone, fullName }) => {
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
//                 "name": "account_activation_request", // your approved template name
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
//                                 "value": fullName
//                             },
//                             "body_2": {
//                                 "type": "text",
//                                 "value": phone
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


// *Company name-* {{1}}
// *Contact no.-* {{2}}
// *Res Contact no.-* {{3}}
// *Address-* {{4}}

// =============================

// *Site  Details:*
// *Street-* {{21}}
// *Landmark-* {{22}}
// *Zipcode-* {{23}}
// *City-* {{24}}
// *State-* {{25}}

// =============================

// *Vendor name-* {{5}}
// *Network-* {{6}}
// *With Relay-* {{7}}
// *With Network-* {{8}}
// *With Server-* {{9}}
// *With Installation-* {{10}}
// *Panic Button-* {{11}}

// =============================

// *Driver Details:*
// *Name-* {{12}}
// *Father's name-* {{13}}
// *Contact no.-* {{14}}
// *Residential Contact no.-* {{15}}
// *Aadhar no.-* {{16}}
// *Pan no.-* {{17}}
// *Badge-* {{18}}
// *Shift-* {{19}}
// *Address-* {{20}}

// =============================

// *Vehicle Details:*
// *Brand-* {{26}}
// *Model-* {{27}}
// *Regn. no-* {{28}}
// *Plate-* {{29}}
// *Type of vehicle-* {{30}}
// *Vehicle class-* {{31}}
// *Chassis no.-* {{32}}
// *Owner name-* {{33}}
// *Owner contact no.-* {{34}}

// =============================




