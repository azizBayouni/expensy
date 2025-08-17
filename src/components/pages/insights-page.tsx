"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { generateInsights } from '@/ai/flows/insights-generation';
import type { InsightsOutput } from '@/ai/flows/insights-generation';
import { transactions } from '@/lib/data';

export function InsightsPage() {
  const [insights, setInsights] = useState<InsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    setInsights(null);
    try {
      const result = await generateInsights({
        // Using all transactions as history for this demo
        transactionHistory: JSON.stringify(transactions),
        // Using recent 5 transactions as current
        currentTransactions: JSON.stringify(transactions.slice(0, 5)),
      });
      setInsights(result);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      // Here you would show a toast to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <Lightbulb className="w-16 h-16 text-primary" />
        <h2 className="text-3xl font-bold">Unlock AI-Powered Insights</h2>
        <p className="max-w-md text-muted-foreground">
          Let our AI analyze your transactions to uncover spending patterns,
          suggest better categories, and help you plan for events.
        </p>
      </div>

      <Button
        onClick={handleGenerateInsights}
        disabled={isLoading}
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate My Insights'
        )}
      </Button>

      {insights && (
        <div className="grid w-full max-w-4xl gap-4 mt-8 text-left md:grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Spending Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{insights.spendingPatterns}</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Categorization Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{insights.optimalCategorizationSuggestions}</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Event Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{insights.eventSuggestions}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
