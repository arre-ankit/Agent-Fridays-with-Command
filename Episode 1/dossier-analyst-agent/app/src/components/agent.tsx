"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, User, Shield, AlertTriangle, CheckCircle, Clock, Globe, Building, GraduationCap, Award, MessageSquare, ExternalLink } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export function Agent() {
  const [input, setInput] = useState("");
  const [dossier, setDossier] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      toast.error("Please enter a person's name", {
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
        body: JSON.stringify({ input: input.trim() })
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

      // ONLY for successful responses, update the dossier
      if (typeof data === 'string') {
        setDossier(data);
      } else if (data && typeof data === 'object') {
        const dossierText = data.output || data.message || JSON.stringify(data);
        setDossier(dossierText);
      } else {
        setDossier(String(data));
      }

      // ONLY for successful responses, show success toast
      toast.success("Intelligence dossier generated successfully", {
        description: "Comprehensive analysis complete",
        closeButton: true,
        duration: 3000
      });

    } catch (error) {
      console.error("Error generating dossier:", error);

      // Show error toast with specific message
      toast.error(error.message || "An error occurred while generating the dossier", {
        closeButton: true,
        duration: Infinity
      });

      // DON'T clear existing dossier on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setDossier("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Intelligence Dossier Agent
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced intelligence gathering and analysis. Enter a person's name to generate a comprehensive, 
            professional dossier with deep research and critical analysis.
          </p>
        </div>

        {/* Search Form */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Target Investigation
            </CardTitle>
            <CardDescription>
              Enter the full name of the person you want to investigate. The agent will perform comprehensive research across multiple sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter person's full name (e.g., John Smith, CEO of TechCorp)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 text-lg"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  className="px-6"
                >
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Investigating...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Generate Dossier
                    </>
                  )}
                </Button>
              </div>
              {dossier && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClear}
                  className="w-full"
                >
                  Clear Results
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 animate-spin" />
                <CardTitle>Intelligence Gathering in Progress</CardTitle>
              </div>
              <CardDescription>
                Performing comprehensive research across multiple sources...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Globe, label: "Web Search", desc: "Professional profiles & news" },
                  { icon: Building, label: "Corporate Data", desc: "Company affiliations" },
                  { icon: GraduationCap, label: "Academic Records", desc: "Education & achievements" },
                  { icon: MessageSquare, label: "Social Media", desc: "Online presence analysis" },
                  { icon: Award, label: "Recognition", desc: "Awards & accomplishments" },
                  { icon: AlertTriangle, label: "Risk Assessment", desc: "Controversies & issues" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <item.icon className="h-5 w-5 text-primary animate-pulse" />
                    <div>
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {dossier && !isLoading && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <CardTitle>Intelligence Dossier</CardTitle>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Classified
                </Badge>
              </div>
              <CardDescription>
                Comprehensive intelligence analysis and assessment report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-auto max-h-[800px] w-full">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-primary border-b border-border pb-2 mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold text-foreground mt-6 mb-3 flex items-center gap-2">
                          <div className="w-1 h-6 bg-primary rounded-full"></div>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-foreground leading-relaxed mb-3">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside space-y-1 mb-4 text-foreground">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside space-y-1 mb-4 text-foreground">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-foreground">
                          {children}
                        </li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-primary">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-muted-foreground">
                          {children}
                        </em>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ),
                      a: ({ href, children }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1"
                        >
                          {children}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )
                    }}
                  >
                    {dossier}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            Professional intelligence gathering for legitimate research purposes only
          </p>
        </div>
      </div>
    </div>
  );
}