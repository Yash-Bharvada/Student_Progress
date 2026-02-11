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
