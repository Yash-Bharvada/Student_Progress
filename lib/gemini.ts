import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'qwen-2.5-32b';

if (!GROQ_API_KEY) {
    console.warn('Groq API key not configured. AI features will not work.');
}

const groq = new Groq({
    apiKey: GROQ_API_KEY,
});

export interface CodeAnalysisResult {
    score: number;
    strengths: string[];
    issues: string[];
    suggestions: string[];
}

export async function analyzeCode(
    code: string,
    language: string
): Promise<CodeAnalysisResult> {
    try {
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not configured');
        }

        if (!code || code.trim().length === 0) {
            throw new Error('Code content is empty');
        }

        // Limit input code size to ~15k characters (approx 3k-4k tokens) to stay within TPM limits
        const truncatedCode = code.length > 15000 ? code.substring(0, 15000) + "\n\n[... Code truncated for size limits ...]" : code;

        const prompt = `Analyze the following ${language} code for style, quality, security, and performance.

Code:
\`\`\`${language.toLowerCase()}
${truncatedCode}
\`\`\`

Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "score": <number between 0-10>,
  "strengths": ["strength1", "strength2", "strength3"],
  "issues": ["issue1", "issue2", "issue3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Scoring criteria:
- 9-10: Excellent code quality, best practices, well-structured
- 7-8: Good code with minor issues
- 5-6: Average code with some problems
- 3-4: Poor code with significant issues
- 0-2: Very poor code with critical problems

Focus on:
1. Code quality and readability
2. Best practices for ${language}
3. Security vulnerabilities
4. Performance concerns
5. Error handling
6. Code structure and organization

Provide specific, actionable feedback. Return ONLY the JSON object.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a senior software engineer providing expert code reviews. Return only valid JSON.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: GROQ_MODEL,
            temperature: 0.3,
            max_tokens: 1024, // Reduced from 4096 to stay within TPM limits
            response_format: { type: "json_object" },
        });

        const text = chatCompletion.choices[0]?.message?.content || "{}";

        // Parse JSON response
        let analysis: CodeAnalysisResult;

        try {
            analysis = JSON.parse(text);

            // Validate structure...
            if (
                typeof analysis.score !== 'number' ||
                !Array.isArray(analysis.strengths) ||
                !Array.isArray(analysis.issues) ||
                !Array.isArray(analysis.suggestions)
            ) {
                console.warn("Invalid structure received, using fallback/defaults", analysis);
                if (!analysis.strengths) analysis.strengths = [];
                if (!analysis.issues) analysis.issues = [];
                if (!analysis.suggestions) analysis.suggestions = [];
                if (typeof analysis.score !== 'number') analysis.score = 5;
            }

            // Ensure score is within bounds
            analysis.score = Math.max(0, Math.min(10, analysis.score));

        } catch (parseError) {
            console.error('Failed to parse Groq response:', text);
            return {
                score: 0,
                strengths: [],
                issues: ["Failed to parse AI response. The model might be overloaded or returned invalid JSON."],
                suggestions: ["Try again later.", "Check API key quotas."]
            };
        }

        return analysis;

    } catch (error: any) {
        if (error.status === 413 || error.message?.includes('TPM') || error.message?.includes('rate_limit_exceeded')) {
            console.error('Groq Rate Limit/Quota Reached:', error.message);
            return {
                score: 0,
                strengths: [],
                issues: ["AI Model rate limit exceeded (TPM Limit)."],
                suggestions: [
                    "Reduce the size of the repository/files being analyzed.",
                    "Wait a few minutes before trying again.",
                    "Consider upgrading your Groq tier for higher limits."
                ]
            };
        }
        console.error('Error analyzing code with Groq:', error);
        throw error;
    }
}

export async function generateCodeSummary(code: string, language: string): Promise<string> {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Provide a brief, 2-3 sentence summary of what this ${language} code does:\n\n\`\`\`${language}\n${code}\n\`\`\``,
                },
            ],
            model: GROQ_MODEL,
            temperature: 0.3,
            max_tokens: 1024,
        });

        return chatCompletion.choices[0]?.message?.content || "No summary available.";
    } catch (error) {
        console.error('Error generating code summary:', error);
        throw error;
    }
}

export async function generateProjectReport(projectData: any, githubDetails: any = null): Promise<string> {
    try {
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY is not configured');
        }

        const prompt = `Act as an academic reviewer and senior technical lead. Generate a comprehensive project report for the software engineering project described below. 
The report MUST be formatted in standard Markdown but adhere strictly to the IEEE academic paper structure. Ensure the Markdown is visually stunning and highly readable, perfectly suited for a presentation or professional document.

You MUST heavily utilize these Markdown features to make the report appealing:
- **Bold** key terms and technologies.
- Use > Blockquotes for important highlights or summary statements.
- Create Markdown Tables to structure structured data like the Tech Stack or Project Specs.
- Use horizontal rules (---) to separate major sections.
- Use appropriate heading levels (##, ###) for clear hierarchy.

Use the following data as the source of truth for your report:
--- PROJECT DATA ---
Name: ${projectData.name}
Description: ${projectData.description}
Status: ${projectData.status}
Progress: ${projectData.progress}%
Start Date: ${projectData.startDate}
End Date: ${projectData.endDate}

Objectives:
${projectData.objectives?.map((o: string) => "- " + o).join('\n') || "Not specified."}

Tech Stack:
${projectData.techStack?.map((t: string) => "- " + t).join('\n') || "Not specified."}

--- GITHUB ANALYSIS (If available) ---
${githubDetails ? JSON.stringify(githubDetails, null, 2) : "No GitHub analysis provided."}

--- REQUIRED IEEE SECTIONS ---
1. Title and Abstract
2. I. Introduction (Background and Objectives)
3. II. System Architecture & Methodology (Tech Stack utilization)
4. III. Implementation & Progress Analysis (Current status, GitHub commit cadence if available)
5. IV. Conclusion and Future Work
6. References (If applicable, simply list the GitHub repository URL)

Ensure the language is highly professional, academic, and analytical. Do not wrap the entire response in a markdown code block (\`\`\`). Simply return the Markdown text itself.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert academic software reviewer writing technical project reports in strictly structured IEEE Professional format. DO NOT include any conversational filler, opening remarks, or <think> processes. Return ONLY the final, beautifully formatted Markdown.",
                },
                {
                    role: "user",
                    content: prompt,
                }
            ],
            model: GROQ_MODEL,
            temperature: 0.5,
            max_tokens: 3000,
        });

        let content = chatCompletion.choices[0]?.message?.content || "# AI Report Generation Failed";

        // Manually strip <think>...</think> tags which some Groq models dynamically inject
        content = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

        return content;
    } catch (error: any) {
        console.error('Error generating Project Report with Groq:', error);
        throw error;
    }
}
