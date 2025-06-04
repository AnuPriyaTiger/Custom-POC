import requests
import json
import os

from dotenv import load_dotenv

load_dotenv()

api_key=os.getenv("api_key")
provider=os.getenv("provider")
db_name=os.getenv("db_name")

class LLMConnector(object):
    def __init__(self, api_key, provider):
        self.api_key = api_key
        self.provider = provider
        
    def get_response(self, prompt):
        """
            this method connects to the llm api and gets the response from there"""
        if self.provider == "claude":
            return self.get_claude_response(prompt)
        elif self.provider == "openai":
            return self.get_openai_response(prompt)
        else:
            raise ValueError("Unsupported provider: {}".format(self.provider))

    def get_openai_response(self, prompt):
        """
        this method connects to openai llm api and gets the response from there

        Args:
            prompt (string): prompt to be sent to llm 

        Returns:
            json: returns the json response from the LLM
        """
        api_url = "https://api.openai.com/v1/chat/completions"
        headers = { "Authorization": f"Bearer {self.api_key}" ,
                    "Content-Type": "application/json" }
        data = {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {"role": "user", "content": prompt}
                            ]
                }
        response = requests.post(api_url, headers = headers, data = json.dumps(data))
        return response

    def get_claude_response(self, prompt):
        """this method connects to calude llm api and gets the response from there

        Args:
            prompt (string): prompt to be sent to llm 

        Returns:
            json: returns the json response from the LLM
        """
        api_url = "https://api.anthropic.com/v1/messages"
        headers = { "x-api-key": api_key,
                    "anthropic-version": "2023-06-01" ,
                    "content-type": "application/json" 
                    }
        data = {
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 1024,
                "messages": [
                    {"role": "user", "content": prompt}
                            ]
                }
        response = requests.post(api_url, headers = headers, data = json.dumps(data))
        return response
        