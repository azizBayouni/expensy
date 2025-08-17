'use server';
/**
 * @fileOverview Generates financial insights based on transaction history.
 *
 * - generateInsights - A function that generates insights based on transaction history.
 * - InsightsInput - The input type for the generateInsights function.
 * - InsightsOutput - The return type for the generateInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InsightsInputSchema = z.object({
  transactionHistory: z.string().describe('A stringified JSON array containing the user transaction history. Each transaction object should have properties like type, amount, currency, date, wallet, and category.'),
  currentTransactions: z.string().describe('A stringified JSON array containing the user current transactions. Each transaction object should have properties like type, amount, currency, date, wallet, and category.'),
});
export type InsightsInput = z.infer<typeof InsightsInputSchema>;

const InsightsOutputSchema = z.object({
  spendingPatterns: z.string().describe('A summary of the user spending patterns, including areas where the user spends the most money.'),
  optimalCategorizationSuggestions: z.string().describe('Suggestions for optimal categorization of transactions to improve expense tracking.'),
  eventSuggestions: z.string().describe('Suggestions for events based on the user transactions.'),
});
export type InsightsOutput = z.infer<typeof InsightsOutputSchema>;

export async function generateInsights(input: InsightsInput): Promise<InsightsOutput> {
  return insightsGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'insightsGenerationPrompt',
  input: {schema: InsightsInputSchema},
  output: {schema: InsightsOutputSchema},
  prompt: `You are a financial advisor providing insights to users based on their transaction history.

  Analyze the following transaction history and current transactions to provide insights on spending patterns, suggest optimal categorization, and suggest events.

  Transaction History: {{{transactionHistory}}}
  Current Transactions: {{{currentTransactions}}}

  Spending Patterns: Provide a summary of the user spending patterns, including areas where the user spends the most money.
  Optimal Categorization Suggestions: Provide suggestions for optimal categorization of transactions to improve expense tracking.
  Event Suggestions: Provide suggestions for events based on the user transactions.
  `,
});

const insightsGenerationFlow = ai.defineFlow(
  {
    name: 'insightsGenerationFlow',
    inputSchema: InsightsInputSchema,
    outputSchema: InsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
