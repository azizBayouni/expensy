'use server';

/**
 * @fileOverview An AI agent that analyzes transaction history and suggests relevant events.
 *
 * - suggestEvents - A function that analyzes transaction history and suggests relevant events.
 * - SuggestEventsInput - The input type for the suggestEvents function.
 * - SuggestEventsOutput - The return type for the suggestEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestEventsInputSchema = z.object({
  transactionHistory: z
    .string()
    .describe(
      'A string containing the user transaction history, with each transaction including type, amount, currency, date, wallet, and category.'
    ),
});
export type SuggestEventsInput = z.infer<typeof SuggestEventsInputSchema>;

const SuggestEventsOutputSchema = z.object({
  suggestedEvents: z
    .string()
    .describe('A list of suggested events based on the transaction history.'),
});
export type SuggestEventsOutput = z.infer<typeof SuggestEventsOutputSchema>;

export async function suggestEvents(input: SuggestEventsInput): Promise<SuggestEventsOutput> {
  return suggestEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestEventsPrompt',
  input: {schema: SuggestEventsInputSchema},
  output: {schema: SuggestEventsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's transaction history and suggest relevant events to group expenses and incomes.

Transaction History:
{{{transactionHistory}}}

Suggested Events:`,
});

const suggestEventsFlow = ai.defineFlow(
  {
    name: 'suggestEventsFlow',
    inputSchema: SuggestEventsInputSchema,
    outputSchema: SuggestEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
