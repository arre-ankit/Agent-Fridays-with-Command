import dotenv from "dotenv";
dotenv.config();
import { Langbase } from "langbase";

async function dossierWorkflow({ input, env }) {
  const langbase = new Langbase({
    apiKey: process.env.LANGBASE_API_KEY!,
  });

  const workflow = langbase.workflow({debug: true});
  const { step } = workflow;

  try {
    // Step 1: Retrieve intelligence gathering guidelines
    const guidelines = await step({
      id: "retrieve_guidelines",
      run: async () => {
        return await langbase.memories.retrieve({
          query: "intelligence gathering guidelines dossier structure",
          memory: [{ name: "intelligence-sources-1755005301639" }],
        });
      },
    });

    // Step 2: Perform comprehensive web search
    const searchResults = await step({
      id: "comprehensive_search",
      run: async () => {
        const searches = await Promise.all([
          // Professional information search
          langbase.tools.webSearch({
            service: 'exa',
            query: `${input} LinkedIn professional profile career`,
            totalResults: 5,
            apiKey: process.env.EXA_API_KEY!
          }),
          
          // News and media mentions
          langbase.tools.webSearch({
            service: 'exa',
            query: `${input} news articles press releases media mentions`,
            totalResults: 5,
            apiKey: process.env.EXA_API_KEY!
          }),
          
          // Social media and online presence
          langbase.tools.webSearch({
            service: 'exa',
            query: `${input} Twitter X social media online presence`,
            totalResults: 3,
            apiKey: process.env.EXA_API_KEY!
          }),
          
          // Academic and professional achievements
          langbase.tools.webSearch({
            service: 'exa',
            query: `${input} education university degree achievements awards`,
            totalResults: 3,
            apiKey: process.env.EXA_API_KEY!
          }),
          
          // Company and organizational affiliations
          langbase.tools.webSearch({
            service: 'exa',
            query: `${input} company organization board member executive`,
            totalResults: 4,
            apiKey: process.env.EXA_API_KEY!
          }),
          
          // Speaking engagements and conferences
          langbase.tools.webSearch({
            service: 'exa',
            query: `${input} speaker conference presentation interview podcast`,
            totalResults: 3,
            apiKey: process.env.EXA_API_KEY!
          })
        ]);

        return {
          professional: searches[0],
          news: searches[1],
          social: searches[2],
          academic: searches[3],
          affiliations: searches[4],
          speaking: searches[5]
        };
      },
    });

    // Step 3: Analyze and verify information
    const analysis = await step({
      id: "analyze_information",
      run: async () => {
        const { output } = await langbase.agent.run({
          model: "openai:gpt-4.1",
          apiKey: process.env.OPENAI_API_KEY!,
          instructions: `You are an intelligence analyst tasked with analyzing and verifying information about individuals. 

Guidelines: ${guidelines.map(g => g.text).join('\n')}

Your task is to:
1. Analyze all search results for accuracy and credibility
2. Cross-reference information between sources
3. Identify potential inconsistencies or red flags
4. Categorize information by reliability (verified, likely, unverified)
5. Note any gaps in information that need further investigation
6. Identify the most credible sources for each piece of information

Be thorough, objective, and critical in your analysis.`,
          input: [
            { 
              role: "user", 
              content: `Analyze the following search results for ${input}:

PROFESSIONAL INFORMATION:
${searchResults.professional.map(r => `Source: ${r.url}\nContent: ${r.content}`).join('\n\n')}

NEWS AND MEDIA:
${searchResults.news.map(r => `Source: ${r.url}\nContent: ${r.content}`).join('\n\n')}

SOCIAL MEDIA:
${searchResults.social.map(r => `Source: ${r.url}\nContent: ${r.content}`).join('\n\n')}

ACADEMIC/ACHIEVEMENTS:
${searchResults.academic.map(r => `Source: ${r.url}\nContent: ${r.content}`).join('\n\n')}

AFFILIATIONS:
${searchResults.affiliations.map(r => `Source: ${r.url}\nContent: ${r.content}`).join('\n\n')}

SPEAKING/INTERVIEWS:
${searchResults.speaking.map(r => `Source: ${r.url}\nContent: ${r.content}`).join('\n\n')}

Provide a detailed analysis of this information.`
            },
          ],
          stream: false,
        });
        return output;
      },
    });

    // Step 4: Generate comprehensive dossier
    const dossier = await step({
      id: "generate_dossier",
      run: async () => {
        const { output } = await langbase.agent.run({
          model: "openai:gpt-4.1",
          apiKey: process.env.OPENAI_API_KEY!,
          instructions: `You are an expert intelligence analyst creating a comprehensive dossier. Create a professional, detailed, and well-structured intelligence report.

Structure your dossier as follows:
1. EXECUTIVE SUMMARY (key findings and assessment)
2. PERSONAL INFORMATION (name, age, location, contact info if available)
3. PROFESSIONAL BACKGROUND (current role, career history, key positions)
4. EDUCATION AND QUALIFICATIONS (degrees, certifications, institutions)
5. DIGITAL FOOTPRINT (social media, online presence, websites)
6. AFFILIATIONS AND NETWORKS (organizations, boards, professional associations)
7. ACHIEVEMENTS AND RECOGNITION (awards, publications, notable accomplishments)
8. PUBLIC STATEMENTS AND POSITIONS (interviews, speeches, public opinions)
9. CONTROVERSIES AND ISSUES (if any, with context and sources)
10. FINANCIAL INFORMATION (if publicly available - company valuations, investments)
11. ASSESSMENT AND ANALYSIS (credibility, influence, potential risks/opportunities)
12. INFORMATION GAPS (areas needing further investigation)
13. SOURCES AND VERIFICATION (credibility assessment of sources used)

Requirements:
- Be thorough and professional
- Distinguish between verified facts and unverified claims
- Include source URLs where possible
- Note information reliability levels
- Maintain objectivity and avoid speculation
- Use clear, professional language
- Include dates and context for all information`,
          input: [
            { 
              role: "user", 
              content: `Create a comprehensive dossier for ${input} based on this analysis:

${analysis}

Original search results for reference:
${JSON.stringify(searchResults, null, 2)}`
            },
          ],
          stream: false,
        });
        return output;
      },
    });

    return dossier;

  } catch (err) {
    console.error("Dossier workflow error:", err);
    throw err;
  } finally {
    await workflow.end();
  }
}

async function main(event, env) {
  const { input } = await event.json();
  const result = await dossierWorkflow({ input, env });
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