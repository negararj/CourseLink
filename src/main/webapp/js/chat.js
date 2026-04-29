const params = new URLSearchParams(window.location.search);
const user = params.get("user") || "User";

document.getElementById("chatTitle").innerText = `Chat with ${user}`;

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("messageInput");

// Mock initial message
addMessage(`Hi, this is ${user}!`, "received");

function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.innerText = text;

    chatBox.appendChild(msg);

    // Auto scroll
    chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
    const text = input.value.trim();

    if (text === "") return;

    addMessage(text, "sent");

    input.value = "";
}

// ENTER to send
input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});