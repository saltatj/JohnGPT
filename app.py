from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
import requests
import os
import json

app = FastAPI()

#Service frontend files 
app.mount("/static", StaticFiles(directory="static"), name="static")

# Ollama settings 
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "deepseek-r1:8b"

@app.get("/")
def serve_homepage():
    """ Serve the index.html file  when accessing the root URL """
    return FileResponse(os.path.join("static", "index.html"))

@app.post("/chat") 
def chat (prompt: str = Query( ..., description="User prompt for the chatbot")):
    headers = {"Content-Type": "application/json"}

    try:
        #Send request to Ollama
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL_NAME, "prompt": prompt, "stream": False},
            headers=headers
        )
        #Log the response for debugging
        print("Ollama response:", response.text)

        #Ensure valid JSON response
        response_data = response.text.strip()
        try:
            json_response = json.loads(response_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail=f"Invalid JSON response from Ollama")
        
        #Extract AI-generated response
        ai_response = json_response.get("response")
        if not ai_response:
            raise HTTPException(status_code=500, detail="No response from Ollama")
        
        return{"response": ai_response}
    
    except requests.exceptions.RequestsException as e:
        raise HTTPException(status_code=500, detail=f"REquest to Ollama failed:{str(e)}")

# Run the API server
if __name__ == "__main__":
    import uvicorn 
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
