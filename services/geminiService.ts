
import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = ai.models;

// Utility to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const streamChat = async ({
    prompt,
    image,
    language,
    useSearch,
    history,
}: {
    prompt: string;
    image: File | null;
    language: string;
    useSearch: boolean;
    history: Content[];
}) => {
    
    const contents: Content[] = [...history];
    const imageParts = image ? [await fileToGenerativePart(image)] : [];
    
    contents.push({
        role: 'user',
        parts: [...imageParts, { text: `Respond in ${language}. ${prompt}` }],
    });

    const stream = await model.generateContentStream({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            tools: useSearch ? [{ googleSearch: {} }] : [],
        },
    });

    return stream;
};
