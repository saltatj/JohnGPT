const input = document.getElementById("userInput");
const chatBox = document.getElementById("chat");
const sendButton = document.getElementById("sendBtn");

let isSending = false;

async function sendMessage() {
    if (isSending) return; // prevent double send
    const userText = input.value.trim();
    if (!userText) return;
  
    isSending = true;
    sendButton.disabled = true;
  
    appendMessage("You", userText, "user");
    input.value = "";
  
    // Read Reciept function
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    const readReceipt = document.createElement('div');
    readReceipt.className = 'read-receipt';
    readReceipt.textContent = `Read ${currentTime}`;
    chatBox.appendChild(readReceipt);

  
    // imsg ... 
    const aiMessage = appendMessage("", "", "assistant");
    aiMessage.classList.add("is-typing"); 
  
    aiMessage.innerHTML = `
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;
  
    try {
      const res = await fetch(`/chat?prompt=${encodeURIComponent(userText)}`, {
        method: "POST",
      });
      const data = await res.json();
      
      aiMessage.classList.remove("is-typing"); 
      aiMessage.textContent = `JohnGPT: ${data.response || "Sorry, I didn’t get that."}`;
    } catch (err) {
      aiMessage.classList.remove("is-typing"); 
      aiMessage.textContent = "JohnGPT: Error communicating with the AI.";
    }
  
    chatBox.scrollTop = chatBox.scrollHeight;
    isSending = false;
    sendButton.disabled = false;
  }

function appendMessage(sender, text, className) {
  const message = document.createElement("div");
  message.className = `message ${className}`;
  if (text) {
    message.textContent = `${sender}: ${text}`;
  }
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}

// prevents double submission 
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

sendButton.addEventListener("click", sendMessage);
