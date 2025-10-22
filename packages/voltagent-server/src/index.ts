import { VoltAgent, VoltAgentObservability } from "@voltagent/core";
import { honoServer } from "@voltagent/server-hono";
import { researchAgent, streamResearchCompany } from "./agents/research/index.js";
import { projectGeneratorAgent, streamProjectIdeas } from "./agents/project-generator/index.js";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";

const port = process.env.VOLTAGENT_PORT ? Number(process.env.VOLTAGENT_PORT) : 3141;

// Initialize Supabase client for fetching company data
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Company data enrichment will be unavailable.");
}

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null;

new VoltAgent({
  agents: {
    research: researchAgent,
    "project-generator": projectGeneratorAgent,
  },
  server: honoServer({
    port,
    enableSwaggerUI: true,
    configureApp: (app) => {
      // Add CORS for browser requests
      app.use('/research/*', cors({
        origin: ['http://localhost:8080', 'http://localhost:5173'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
      }));
      
      app.use('/agents/project-generator/*', cors({
        origin: ['http://localhost:8080', 'http://localhost:5173'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
      }));
      
      app.use('/project-generator/*', cors({
        origin: ['http://localhost:8080', 'http://localhost:5173'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
      }));

      // Custom research streaming endpoint
      app.post('/research/stream', async (c) => {
        try {
          // Accept both shapes: { input: {...}, userId: "...", options: {...} } and direct {...}
          const raw = await c.req.json();
          
          // Extract userId and options from top level if they exist
          const userId = raw.userId;
          const options = raw.options;
          
          // Extract the actual body (either from raw.input or raw directly)
          const body = (raw && typeof raw === 'object' && 'input' in raw ? raw.input : raw) as {
            companyId: string;
            companyName: string;
            githubUrl?: string;
          };

          if (!body?.companyId || !body?.companyName) {
            return c.json({ error: 'Missing required fields: companyId, companyName' }, 400);
          }

          // Fetch complete company data from Supabase
          type GitHubRepo = { full_name?: string; stargazers_count?: number; stars?: number; description?: string; name?: string };
          type CompanyRecord = {
            id?: string; name?: string; website?: string; one_liner?: string; long_description?: string;
            batch?: string; stage?: string; team_size?: number; industries?: string[];
            tags?: string[];
            github?: { repositories?: GitHubRepo[] } | null;
            huggingface?: unknown;
            app_answers?: { github?: { repositories?: GitHubRepo[] } } | null;
          };
          let companyData: CompanyRecord | null = null;
          let githubRepositories: GitHubRepo[] = [];
          
          if (supabase) {
            try {
              const { data, error } = await supabase
                .from('companies')
                .select('id, name, website, one_liner, long_description, batch, stage, team_size, industries, tags, github, huggingface, app_answers')
                .eq('id', body.companyId)
                .single();
              
              if (!error && data) {
                companyData = data;
                console.log('✅ Fetched company data from Supabase:', {
                  name: data.name,
                  industries: data.industries,
                  batch: data.batch,
                  one_liner: data.one_liner?.substring(0, 50) + '...',
                  has_github: !!data.github,
                  has_app_answers_github: !!data.app_answers?.github,
                });
                
                // Extract GitHub repositories
                const githubData = data.github || data.app_answers?.github;
                if (githubData && Array.isArray(githubData.repositories)) {
                  githubRepositories = githubData.repositories as GitHubRepo[];
                  console.log(`📦 Found ${githubRepositories.length} GitHub repositories`);
                }
              } else if (error) {
                console.error('❌ Error fetching company data:', error);
              }
            } catch (err) {
              console.error('Failed to fetch company data from Supabase:', err);
            }
          }

          // Start streaming with enriched company data
          console.log('🔍 Starting research with:', {
            companyId: body.companyId,
            companyName: companyData?.name || body.companyName,
            userId: userId,
            hasCompanyData: !!companyData,
            githubRepoCount: githubRepositories.length,
          });
          
          const stream = await streamResearchCompany({
            companyId: body.companyId,
            companyName: companyData?.name || body.companyName,
            userId: userId, // Pass Clerk user ID for memory
            githubUrl: body.githubUrl, // Keep the client-provided URL as fallback
            githubRepositories, // Pass all repositories
            companyData, // Pass full company object
            options: options,
          });

          // Create SSE stream
          const encoder = new TextEncoder();
          const resourceId = `company-research:${body.companyId}`;
          
          const readable = new ReadableStream({
            async start(controller) {
              try {
                // Send progress updates
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'progress', message: 'Starting research...' }) + '\n\n'));

                // Stream partial objects
                for await (const partial of stream.partialObjectStream) {
                  controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'chunk', data: partial }) + '\n\n'));
                }

                // Get final result
                const finalResult = await stream.object;
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'chunk', data: finalResult }) + '\n\n'));
                
                // Send conversation metadata with the done event
                // The conversation_id will be auto-generated by VoltAgent Memory
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
                  type: 'done',
                  metadata: {
                    resourceId,
                    userId: userId,
                    companyId: body.companyId,
                  }
                }) + '\n\n'));
                controller.close();
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ type: 'error', message: errorMsg }) + '\n\n'));
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          return c.json({ error: errorMsg }, 500);
        }
      });

      // Custom project generator streaming endpoint (avoid /agents/* to bypass VoltAgent routing)
      app.post('/project-generator/stream', async (c) => {
        try {
          // Accept both shapes: { input: {...}, userId: "...", options: {...} } and direct {...}
          const raw = await c.req.json();
          
          // Extract userId and options from top level if they exist
          const userId = raw.userId;
          const options = raw.options;
          
          // Extract the actual body (either from raw.input or raw directly)
          const body = (raw && typeof raw === 'object' && 'input' in (raw as Record<string, unknown>) ? (raw as Record<string, unknown>).input : raw) as {
            companyId: string;
            companyName: string;
            companyResearch: Record<string, unknown>;
            userProfile: {
              skills: string[];
              careerInterests?: string[];
              targetRoles?: string[];
            };
            githubUrl?: string;
          };

          if (!body?.companyId || !body?.companyName || !body?.userProfile) {
            return c.json({ 
              error: 'Missing required fields: companyId, companyName, userProfile' 
            }, 400);
          }

          if (!body?.companyResearch || !body.companyResearch.pain_points_summary) {
            return c.json({ 
              error: 'Missing company research data. Please run company research first.' 
            }, 400);
          }

          // Start streaming project ideas
          console.log('💡 Starting project generation with:', {
            companyId: body.companyId,
            companyName: body.companyName,
            userId: userId,
            userSkills: body.userProfile.skills?.length || 0,
            painPoints: body.companyResearch.pain_points_summary?.length || 0,
          });
          
          const stream = await streamProjectIdeas({
            company_id: body.companyId,
            company_name: body.companyName,
            user_profile: {
              user_id: userId || 'anonymous',
              skills: body.userProfile.skills || [],
              career_interests: body.userProfile.careerInterests,
              target_roles: body.userProfile.targetRoles,
            },
            company_research: body.companyResearch,
            github_url: body.githubUrl,
            options: options,
          });

          // Create SSE stream
          const encoder = new TextEncoder();
          const resourceId = `project-ideas:${body.companyId}:${userId || 'anonymous'}`;
          
          const readable = new ReadableStream({
            async start(controller) {
              try {
                // Send progress updates
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
                  type: 'progress', 
                  message: 'Analyzing company research...' 
                }) + '\n\n'));

                // Stream partial objects
                for await (const partial of stream.partialObjectStream) {
                  controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
                    type: 'chunk', 
                    data: partial 
                  }) + '\n\n'));
                }

                // Get final result
                const finalResult = await stream.object;
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
                  type: 'chunk', 
                  data: finalResult 
                }) + '\n\n'));
                
                // Send conversation metadata with the done event
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
                  type: 'done',
                  metadata: {
                    resourceId,
                    userId: userId,
                    companyId: body.companyId,
                  }
                }) + '\n\n'));
                controller.close();
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error('❌ Project generation error:', errorMsg);
                
                // Log the full error for debugging schema issues
                if (error instanceof Error && error.message.includes('schema')) {
                  console.error('Full error object:', JSON.stringify(error, null, 2));
                  console.error('Error stack:', error.stack);
                }
                
                controller.enqueue(encoder.encode('data: ' + JSON.stringify({ 
                  type: 'error', 
                  message: errorMsg 
                }) + '\n\n'));
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error('❌ Project generator endpoint error:', errorMsg);
          return c.json({ error: errorMsg }, 500);
        }
      });
    },
  }),
  observability: new VoltAgentObservability(),
});

console.log(`VoltAgent server started on http://localhost:${port}`);
console.log(`Research agent available at:`);
console.log(`  - /agents/research/* (VoltAgent native endpoints)`);
console.log(`  - /research/stream (Custom SSE endpoint)`);
console.log(`Project Generator agent available at:`);
console.log(`  - /agents/project-generator/* (VoltAgent native endpoints)`);
console.log(`  - /project-generator/stream (Custom SSE endpoint)`);
