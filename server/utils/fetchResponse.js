import OpenAI from "openai";
import dotenv from "dotenv";
import Product from "../models/products.js";
import { addNewConversationToHistory } from "../utils/cacheConversations.js";
import { formatData } from "./formatData.js";

dotenv.config();

const openai = new OpenAI({
    apiKey: "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"
});

let catelog = ``;

const productCatelog = async () => {
    if (!catelog) {
        const products = await Product.find({});
        catelog = formatData(products);
    }
    return catelog;
};

const getSystemMessage = data => {
    if (data && typeof data === 'string' && data.trim() !== "") {
        return {
            role: "system",
            content: `
You are a fashion recommender, providing personalized outfit suggestions based on user preferences. Your domain should be restricted to fashion, don't respond to any other questions not related to fashion domains. Take into account the user's gender, favorite colors, preferred styles, and any specific clothing items they mention. You have access to the following catalog of fashion products. Your task is to recommend outfits using these items. Make sure to only provide suggestions from the catelog.
Headers - 
id,name,brand,category,description,price,color,size,gender,season,tags
${data}

You will have to provide the response strictly in JSON format which will have the following properties - 
response: "your response wrapped in HTML (adding styling wherever required) ",
product_ids: [This will contain the ids of the products that you will recommend]

ok will me give the out put as if for generating prompt for text to image
`
        };
    } else {
        return {
            role: "system",
            content: "Error: No product data available."
        };
    }
};

export const conversationsHistory = new Map();

export const fetchResponse = async (question, id) => {
    try {
        addNewConversationToHistory(conversationsHistory, question, id);

        const catelog = await productCatelog();
        const systemPrompt = getSystemMessage(catelog);
        const conversationHistoryForId = conversationsHistory.get(id);

        if (!systemPrompt || !conversationHistoryForId || !Array.isArray(conversationHistoryForId)) {
            throw new Error("Invalid system prompt or conversation history.");
        }

        const message = [systemPrompt, ...conversationHistoryForId];

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: message
        });

        const answer = completion.choices[0].message;
        addNewConversationToHistory(conversationsHistory, answer, id);

        return answer;
    } catch (err) {
        console.log(err.message);
        return {
            role: "assistant",
            content: "Sorry! Something went wrong... Try after sometime or terminate the session."
        };
    }
};
