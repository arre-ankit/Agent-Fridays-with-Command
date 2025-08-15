import dotenv from "dotenv";
dotenv.config();
import { Langbase } from "langbase";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define the schema for competitive intelligence output
const competitiveIntelligenceSchema = z.object({
  company: z.string(),
  last_updated: z.string(),
  updates_found: z.boolean(),
  confidence_score: z.number(),
  initiatives: z.array(z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    source_link: z.string(),
    key_phrases: z.array(z.string())
  }))
});

const jsonSchema = zodToJsonSchema(competitiveIntelligenceSchema, { target: 'openAi' });

async function competitiveIntelligenceWorkflow({ input, env }) {
  const langbase = new Langbase({
    apiKey: process.env.LANGBASE_API_KEY!,
  });

  const workflow = langbase.workflow({ debug: true });
  const { step } = workflow;

  try {
    // Step 1: Search for AI-related company activities
    const searchResults = await step({
      id: "search_ai_activities",
      run: async () => {
        return await langbase.tools.webSearch({
          service: 'exa',
          query: `${input} artificial intelligence machine learning generative AI research team investment partnership acquisition site:techcrunch.com OR site:venturebeat.com OR site:reuters.com OR site:bloomberg.com OR site:prnewswire.com`,
          totalResults: 10,
          apiKey: process.env.EXA_API_KEY!
        });
      },
    });

    // Step 2: Search for recent job postings and leadership changes
    const jobSearchResults = await step({
      id: "search_job_postings",
      run: async () => {
        return await langbase.tools.webSearch({
          service: 'exa',
          query: `${input} "AI engineer" "machine learning" "head of AI" "AI research" "artificial intelligence" hiring jobs site:linkedin.com OR site:glassdoor.com OR site:indeed.com`,
          totalResults: 5,
          apiKey: process.env.EXA_API_KEY!
        });
      },
    });

    // Step 3: Search for product launches and announcements
    const productSearchResults = await step({
      id: "search_product_launches",
      run: async () => {
        return await langbase.tools.webSearch({
          service: 'exa',
          query: `${input} "AI product" "AI feature" "generative AI" "machine learning model" launch announcement 2024`,
          totalResults: 8,
          apiKey: process.env.EXA_API_KEY!
        });
      },
    });

    // Step 4: Retrieve relevant intelligence from memory
    const memoryContext = await step({
      id: "retrieve_intelligence_context",
      run: async () => {
        return await langbase.memories.retrieve({
          query: `${input} AI competitive intelligence analysis trends patterns`,
          memory: [{ name: "ai-intelligence-reports-1755091594925" }],
        });
      },
    });

    // Step 5: Analyze and structure the findings
    const analysis = await step({
      id: "analyze_findings",
      run: async () => {
        const allResults = [
          ...searchResults,
          ...jobSearchResults,
          ...productSearchResults
        ];

        const contextText = memoryContext.map(m => m.text).join('\n');
        
        const { output } = await langbase.agent.run({
          model: "openai:gpt-5-mini-2025-08-07",
          apiKey: process.env.OPENAI_API_KEY!,
          instructions: `You are a Competitive Intelligence Analyst AI specializing in tracking corporate AI initiatives.

ANALYSIS REQUIREMENTS:
1. Focus ONLY on developments from the last 6 months (prioritize last month)
2. Identify AI signals: product launches, hires, partnerships, acquisitions, investments, research teams, strategic announcements
3. Assign confidence scores (0-1) based on source credibility and evidence clarity
4. Filter out irrelevant or outdated information
5. Validate findings against the provided context

FILTERING CRITERIA:
- Only include AI-related activities (artificial intelligence, machine learning, generative AI, AI research, etc.)
- Exclude general tech news not specifically about AI
- Prioritize official announcements, press releases, and credible news sources
- Verify dates are within the last 6 months

CONFIDENCE SCORING:
- 0.9-1.0: Official press releases, company announcements
- 0.7-0.8: Reputable news sources with direct quotes
- 0.5-0.6: Industry reports, analyst coverage
- 0.3-0.4: Social media, unverified sources
- 0.1-0.2: Speculation, rumors

Context from previous intelligence reports:
${contextText}

Current date: ${new Date().toISOString().split('T')[0]}`,
          input: [
            { role: "user", content: `Analyze these search results for ${input} and extract AI-related competitive intelligence. Search results: ${JSON.stringify(allResults, null, 2)}` },
          ],
          stream: false,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "CompetitiveIntelligence",
              schema: jsonSchema,
              strict: true,
            },
          },
        });

        return competitiveIntelligenceSchema.parse(JSON.parse(output));
      },
    });

    return analysis;

  } catch (err) {
    console.error("Competitive Intelligence Workflow error:", err);
    throw err;
  } finally {
    await workflow.end();
  }
}

async function main(event, env) {
  const { input } = await event.json();
  const result = await competitiveIntelligenceWorkflow({ input, env });
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