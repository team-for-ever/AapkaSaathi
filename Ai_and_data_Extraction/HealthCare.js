        const chat = document.getElementById('chat');
        const input = document.getElementById('input');
        const sendBttn = document.getElementById('send');
        const typeDiv = document.getElementById('typing');

        const sysPrompt = `You are a friendly and knowledgeable AI Healthcare Expert. Your goal is to provide helpful, safe, and general health-related information. 
        You are NOT a substitute for a real doctor. 
        ALWAYS include a clear disclaimer in your responses: "This is for informational purposes only. Please consult a professional doctor for any medical diagnosis or treatment."
        Keep your answers concise and easy to understand. Do not generate overly long responses.`;
        
        // send message
        async function sendMsg() {
            const msg = input.value.trim();
            if (msg === '') return;

            addMsg('user', msg);
            input.value = '';
            
            typeDiv.classList.remove('hidden');
            chat.scrollTop = chat.scrollHeight;

            try {
                // Gemini API
                const apiKey = "AIzaSyD4DHiM4F8sdrrtUMZXtgzeYJ5dtT3zFIY"; // API key here
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

                const payload = {
                    contents: [{ parts: [{ text: msg }] }],
                    systemInstruction: { parts: [{ text: sysPrompt }] }
                };
                
                let responseText = '';
                // Retry logic
                for (let i = 0; i < 3; i++) {
                    const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) {
                        const data = await res.json();
                        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                        if(responseText) break;
                    }
                    if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Wait 1s, then 2s
                }

                if (responseText) {
                    addMsg('bot', responseText);
                } else {
                    addMsg('bot', 'Sorry, I couldn\'t get a response. Please try again.');
                }

            } catch (err) {
                // case of error
                addMsg('bot', 'Error occurred. Please check connection');
                console.error("API Call Error:", err);
            } finally {
                typeDiv.classList.add('hidden');
                chat.scrollTop = chat.scrollHeight;
            }
        }

        //display
        function addMsg(sender, text) {
            const msgDiv = document.createElement('div');
            const bubble = document.createElement('div');
            
            msgDiv.className = `flex mb-4 ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
            bubble.className = `chat-bubble ${sender === 'user' ? 'user-bubble' : 'bot-bubble'}`;
            
            // Text formatting
            bubble.innerHTML = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');

            msgDiv.appendChild(bubble);
            chat.appendChild(msgDiv);
            chat.scrollTop = chat.scrollHeight;
        }

        // Events...
        sendBttn.addEventListener('click', sendMsg);
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            sendMsg();
          }
        });