
import { GoogleGenAI, Chat, GenerateContentResponse, GenerateContentParameters, Part } from "@google/genai";
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION, API_KEY_ERROR_MESSAGE, SUMMARIZATION_PROMPT_SYSTEM_MESSAGE, INITIAL_BOT_MESSAGE } from '../constants';
import { ChatMessage, MessageSender } from "../types";
import type { UserInfo } from "../components/LandingPage"; // Import UserInfo type

let ai: GoogleGenAI | null = null;

try {
  let apiKeyToUse: string;
  let envApiKey: string | undefined = undefined;

  // Safely check for process and process.env
  if (typeof process !== 'undefined' && typeof process.env === 'object' && process.env !== null) {
    envApiKey = process.env.API_KEY;
  }

  if (!envApiKey) {
    // This warning aligns with the original code's implicit behavior if API_KEY wasn't set.
    console.warn("API_KEY environment variable is not set or accessible via process.env. Using a placeholder key which will likely fail for actual API calls. Ensure the API key is configured in the environment if this is unexpected.");
    apiKeyToUse = "MISSING_API_KEY_PLACEHOLDER"; // Fallback placeholder
  } else {
    apiKeyToUse = envApiKey;
  }
  
  ai = new GoogleGenAI({ apiKey: apiKeyToUse });

} catch (error) {
  // This catch block is primarily for errors from new GoogleGenAI() itself,
  // though the safe access above should prevent ReferenceErrors.
  console.error("Failed to initialize GoogleGenAI:", error);
  // We might want to throw or set ai to null more explicitly here if init fails.
  // For now, if `new GoogleGenAI` throws, `ai` remains null and `getGenAIInstance` will throw.
}


export const getGenAIInstance = (): GoogleGenAI => {
  if (!ai) {
    // This error message will be shown if `ai` is null, either due to `new GoogleGenAI` throwing
    // or if the API key logic somehow leads to `ai` not being set (though unlikely with current setup).
    throw new Error(API_KEY_ERROR_MESSAGE + " (AI instance is null)");
  }
  return ai;
}

export const createChatSession = async (userInfo: UserInfo | null): Promise<Chat> => {
  const genAI = getGenAIInstance();
  let dynamicSystemInstruction = SYSTEM_INSTRUCTION;

  if (userInfo) {
    let userContext = "\n\n--- User Context (Optional Information Provided by User) ---";
    if (userInfo.name) {
      userContext += `\nThe user's name is ${userInfo.name}. Please address them by their name. For example, instead of "How can I help you?", say "How can I help you, ${userInfo.name}?".`;
    }
    if (userInfo.age) {
      userContext += `\nThe user's age is: ${userInfo.age}.`;
    }
    if (userInfo.sex && userInfo.sex !== 'prefer_not_to_say') {
      userContext += `\nThe user's sex is: ${userInfo.sex}.`;
    }
    if (userInfo.conditions) {
      userContext += `\nThe user has mentioned these chronic conditions: "${userInfo.conditions}". Remember, you cannot give medical advice based on this, but be aware of this context for empathetic conversation.`;
    }
    userContext += "\n--- End of User Context ---";
    dynamicSystemInstruction += userContext;
  }


  try {
    const chat = genAI.chats.create({
      model: GEMINI_MODEL_NAME,
      config: {
        systemInstruction: dynamicSystemInstruction,
      },
    });
    return chat;
  } catch (error) {
    console.error("Error creating chat session:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
         throw new Error("Invalid API Key. Please check your API key configuration.");
    }
    throw new Error("Could not create chat session. Please try again later.");
  }
};

export async function* sendMessageToGeminiStream(
  chat: Chat,
  message: string
): AsyncGenerator<string, void, undefined> {
  try {
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      if (chunk && typeof chunk.text === 'string') {
        yield chunk.text;
      } else {
        yield ""; 
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
         throw new Error("Streaming failed due to invalid API Key. Please check your API key configuration.");
    }
    throw new Error("Sorry, I couldn't get a response. Please try again.");
  }
}

export const generateChatSummary = async (chatHistory: ChatMessage[]): Promise<string> => {
  const genAI = getGenAIInstance();
  
  let initialMessageTextToFilter = INITIAL_BOT_MESSAGE;
  // If there's a user name, the initial message might be personalized, so we construct what it might have been.
  // This is a simplified check. A more robust way would be to tag the initial message differently.
  const firstUserMessage = chatHistory.find(msg => msg.sender === MessageSender.USER);
  const potentialPersonalizedInitialMessage = chatHistory.find(
    msg => msg.sender === MessageSender.BOT && msg.timestamp.getTime() < (firstUserMessage?.timestamp.getTime() || Infinity)
  );

  if (potentialPersonalizedInitialMessage && potentialPersonalizedInitialMessage.text.startsWith("Hi ")) {
    initialMessageTextToFilter = potentialPersonalizedInitialMessage.text;
  }


  const relevantHistory = chatHistory.filter(msg => !(msg.isStreaming && msg.text === "") && msg.text !== initialMessageTextToFilter);

  if (relevantHistory.length === 0) {
    return "There isn't enough conversation to summarize effectively.";
  }

  let transcript = "Conversation Transcript:\n\n";
  relevantHistory.forEach(msg => {
    const prefix = msg.sender === MessageSender.USER ? "User:" : "TrackWise:";
    transcript += `${prefix} ${msg.text}\n`;
  });

  const requestParams: GenerateContentParameters = {
    model: GEMINI_MODEL_NAME,
    contents: { parts: [{ text: transcript }] },
    config: {
      systemInstruction: SUMMARIZATION_PROMPT_SYSTEM_MESSAGE,
    },
  };

  try {
    const response: GenerateContentResponse = await genAI.models.generateContent(requestParams);
    
    if (response && response.text) {
      return response.text;
    } else {
      console.error("Empty response from summary generation:", response);
      throw new Error("Failed to generate a valid summary from the AI.");
    }
  } catch (error)
 {
    console.error("Error generating chat summary:", error);
     if (error instanceof Error && error.message.includes("API key not valid")) {
         throw new Error("Summary generation failed due to invalid API Key.");
    }
    throw new Error("Sorry, I couldn't generate a summary for the conversation. Please try again.");
  }
};
