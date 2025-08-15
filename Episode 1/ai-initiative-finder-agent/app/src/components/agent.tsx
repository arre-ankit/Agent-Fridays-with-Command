"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, Building2, Calendar, ExternalLink, TrendingUp, AlertCircle } from "lucide-react";

interface Initiative {
  title: string;
  description: string;
  date: string;
  source_link: string;
  key_phrases: string[];
}

interface CompetitiveIntelligence {
  company: string;
  last_updated: string;
  updates_found: boolean;
  confidence_score: number;
  initiatives: Initiative[];
}

export function Agent() {
  const [company, setCompany] = useState("");
  const [intelligence, setIntelligence] = useState<CompetitiveIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!company.trim()) {
      toast.error("Please enter a company name", {
        closeButton: true,
        duration: 3000
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3101/api/langbase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: company.trim() })
      });

      // Parse the response (with fallback for non-JSON)
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Check for ANY error condition
      if (!response.ok || (data && typeof data === 'object' && (data.success === false || data.error))) {
        // Extract the most specific error message
        const errorMessage = data.error || (data.message || `Error: ${response.status}`);
        throw new Error(errorMessage);
      }

      // ONLY for successful responses, update the intelligence
      if (typeof data === 'object' && data !== null) {
        setIntelligence(data);
      } else {
        throw new Error("Invalid response format");
      }

      // ONLY for successful responses, show success toast
      toast.success("Competitive intelligence analysis completed", {
        closeButton: true,
        duration: 3000
      });

    } catch (error) {
      console.error("Error analyzing company:", error);

      // Show error toast with specific message
      toast.error(error.message || "An error occurred while analyzing the company", {
        closeButton: true,
        duration: Infinity
      });

      // DON'T clear existing intelligence on error
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Company's AI Initiative Finder
          </h1>
          <p className="text-muted-foreground text-lg">
            Track and analyze corporate AI initiatives to deliver actionable insights
          </p>
        </div>

        {/* Search Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Company Analysis
            </CardTitle>
            <CardDescription>
              Enter a company name to analyze their AI-related activities from the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter company name (e.g., Microsoft, Google, OpenAI)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleAnalyze} 
                disabled={isLoading || !company.trim()}
                className="px-6"
              >
                {isLoading ? "Analyzing..." : "Analyze"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {intelligence && !isLoading && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {intelligence.company} - AI Intelligence Summary
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Last Updated: {formatDate(intelligence.last_updated)}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${getConfidenceColor(intelligence.confidence_score)} text-white`}
                  >
                    {getConfidenceLabel(intelligence.confidence_score)} Confidence ({Math.round(intelligence.confidence_score * 100)}%)
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {intelligence.updates_found ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">
                      {intelligence.initiatives.length} AI initiative{intelligence.initiatives.length !== 1 ? 's' : ''} found
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>No recent AI initiatives found for this company</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Initiatives Grid */}
            {intelligence.updates_found && intelligence.initiatives.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">AI Initiatives & Activities</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {intelligence.initiatives.map((initiative, index) => (
                    <Card key={index} className="h-auto">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg leading-tight">
                          {initiative.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(initiative.date)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {initiative.description}
                        </p>
                        
                        {initiative.key_phrases.length > 0 && (
                          <div className="space-y-2">
                            <Separator />
                            <div className="flex flex-wrap gap-1">
                              {initiative.key_phrases.map((phrase, phraseIndex) => (
                                <Badge key={phraseIndex} variant="secondary" className="text-xs">
                                  {phrase}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {initiative.source_link && (
                          <div className="pt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              className="w-full"
                            >
                              <a 
                                href={initiative.source_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                View Source
                              </a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}