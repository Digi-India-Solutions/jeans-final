import { postData } from "../../services/FetchNodeServices"

export default function WhatsApps() {
    const handleSubmit = async (e) => {
        const message = await postData("api/user/send-message-whatsapp", { "message": "hi", "phone": 9131734930 })
        console.log("messagemessagemessage", message);
        if (message?.success === true) {
            setTimeout(() => {
                window.open(message?.whatsappLink, '_blank');
            }, 1000);
        }
    }
    return (
        <div><button className="btn btn-primary" onClick={handleSubmit}>whatsapp</button></div>
    )
}