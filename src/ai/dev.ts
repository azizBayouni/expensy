import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-events.ts';
import '@/ai/flows/insights-generation.ts';
import '@/ai/flows/categorize-transaction.ts';