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
  
    // ---- START: New code for Read Receipt ----
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
    const readReceipt = document.createElement('div');
    readReceipt.className = 'read-receipt';
    readReceipt.textContent = `Read ${currentTime}`;
    chatBox.appendChild(readReceipt);
    // ---- END: New code for Read Receipt ----
  
    // Create an empty assistant message bubble
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
      aiMessage.textContent = `Mistral: ${data.response || "Sorry, I didn’t get that."}`;
    } catch (err) {
      aiMessage.classList.remove("is-typing"); 
      aiMessage.textContent = "Mistral: Error communicating with the AI.";
    }
  
    chatBox.scrollTop = chatBox.scrollHeight;
    isSending = false;
    sendButton.disabled = false;
  }

function appendMessage(sender, text, className) {
  const message = document.createElement("div");
  message.className = `message ${className}`;
  // Only add the sender and text if text is provided
  if (text) {
    message.textContent = `${sender}: ${text}`;
  }
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}

// Enter key support with prevention of double submit
input.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

// Button click handler
sendButton.addEventListener("click", sendMessage);
