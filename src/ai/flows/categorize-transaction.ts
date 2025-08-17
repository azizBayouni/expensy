'use server';

/**
 * @fileOverview An AI agent that suggests categories for transactions.
 *
 * - categorizeTransaction - A function that suggests a category for a given transaction.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction.'),
  transactionAmount: z.number().describe('The amount of the transaction.'),
  transactionType: z.enum(['income', 'expense']).describe('The type of the transaction (income or expense).'),
  previousCategories: z.array(z.string()).optional().describe('A list of previously used categories.'),
});

export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  suggestedCategory: z.string().describe('The suggested category for the transaction.'),
  confidenceScore: z.number().describe('A score indicating the confidence level of the suggestion (0-1).'),
});

export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are a financial assistant helping users categorize their transactions.

  Based on the transaction description, amount, and type (income or expense), suggest the most appropriate category for the transaction.
  Consider the user's previously used categories to provide a relevant suggestion.

  Transaction Description: {{{transactionDescription}}}
  Transaction Amount: {{{transactionAmount}}}
  Transaction Type: {{{transactionType}}}
  Previous Categories: {{#if previousCategories}}{{#each previousCategories}}- {{{this}}}{{/each}}{{else}}None{{/if}}

  Provide the suggested category and a confidence score (0-1) indicating how confident you are in the suggestion.
  Ensure that the suggested category is from the list of previously used categories if available.
  `,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
