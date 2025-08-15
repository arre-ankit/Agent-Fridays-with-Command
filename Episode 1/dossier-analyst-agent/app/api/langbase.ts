import { Context, Hono } from "hono";
import dotenv from "dotenv";
dotenv.config();

// Basic API endpoint
export const registerLangbaseEndpoint = (app: Hono) => {
  app.post("/api/langbase", async (c: Context) => {
    const request = new Request(c.req.url, {
      method: c.req.method,
      headers: {
        "Content-Type": c.req.header("Content-Type") || "application/json",
        Authorization: c.req.header("Authorization") || "",
      },
      body: JSON.stringify(await c.req.json()),
    });
    return handleAgentRequest(request);
  });
};

// Server-side only: Do NOT include it in any client-side code, that ends up in the browsers.

async function handleAgentRequest(request: Request) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string' || !input.trim()) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Please provide a valid person's name" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch("https://api.langbase.com/arre-ankit76795/dossier-analyst-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LANGBASE_API_KEY!}`
      },
      body: JSON.stringify({
        input: input.trim()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return new Response(JSON.stringify(errorData || { 
        success: false, 
        error: `API request failed with status ${response.status}` 
      }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    
    if (data.success === false || data.error) {
      return new Response(JSON.stringify(data), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(data.output || data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Error in handleAgentRequest:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}