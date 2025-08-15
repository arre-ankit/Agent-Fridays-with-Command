import dotenv from "dotenv";
dotenv.config();
import { Langbase } from "langbase";

async function pdfChatWorkflow({ input, env }) {
  const langbase = new Langbase({
    apiKey: process.env.LANGBASE_API_KEY!,
  });

  const workflow = langbase.workflow({debug: true});
  const { step } = workflow;

  try {
    // Step 1: Retrieve relevant content from PDF memory
    const relevantContent = await step({
      id: "retrieve_pdf_content",
      run: async () => {
        return await langbase.memories.retrieve({
          query: input,
          memory: [{ name: "pdf-chat-memory-1755112417420" }],
        });
      },
    });

    // Step 2: Generate response based on PDF content
    const response = await step({
      id: "generate_pdf_response",
      run: async () => {
        const context = relevantContent.map((content) => content.text).join("\n\n");
        
        const { output } = await langbase.agent.run({
          model: "openai:gpt-5-mini-2025-08-07",
          apiKey: process.env.OPENAI_API_KEY!,
          instructions: `You are a helpful assistant that answers questions based on PDF document content. 
          
          Use the following context from the PDF to answer the user's question:
          
          ${context}
          
          Guidelines:
          - Answer based only on the provided PDF content
          - If the information is not in the PDF, clearly state that
          - Provide specific references to sections or pages when possible
          - Be concise but comprehensive in your responses`,
          input: [
            { role: "user", content: input },
          ],
          stream: false,
        });
        
        return output;
      },
    });

    return response;
  } catch (err) {
    console.error("PDF chat workflow error:", err);
    throw err;
  } finally {
    await workflow.end();
  }
}

async function main(event, env) {
  const { input } = await event.json();
  const result = await pdfChatWorkflow({ input, env });
  return result;
}

export default main;

(async () => {
  const event = {
    json: async () => ({
      input: 'Your input goes here.',
    }),
  };
  const result = await main(event, {});
  console.log(result);
})();