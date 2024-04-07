import { NextResponse } from "next/server";
import OpenAI from "openai";


const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

export async function POST(req: Request, res: NextResponse) {
  const body = await req.json();

  const lastMessage = body.messages[body.messages.length - 1];
  let response;

  if (lastMessage.content.toLowerCase() === 'generate a check-in message') {
    // Generate the check-in message with GPT-3
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [{ role: "user", content: "Create a friendly and encouraging check-in message." }], 
      max_tokens: 50, // Adjust token limit as needed
    });
    response = completion.choices[0].message; 
} else {
    // Regular Message Handling
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: body.messages,
    });
    response = completion.choices[0].message;
  }

  return NextResponse.json({ output: response }, { status: 200 });

}
