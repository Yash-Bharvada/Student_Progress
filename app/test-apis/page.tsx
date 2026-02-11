"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TestTube,
  Send,
  Copy,
  Check,
  Clock,
  Loader2,
  ChevronDown,
  Terminal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const sampleEndpoints = [
  { method: "GET", path: "/api/user", description: "Get authenticated user info" },
  { method: "GET", path: "/api/repositories", description: "Get all repositories" },
  { method: "GET", path: "/api/dashboard", description: "Get dashboard data" },
  { method: "GET", path: "/api/analytics", description: "Get analytics data" },
  { method: "GET", path: "/api/auth/check", description: "Check authentication status" },
  { method: "POST", path: "/api/ai/analyze", description: "Analyze code quality" },
]

const methodColors: Record<string, string> = {
  GET: "bg-green-500/10 text-green-400 border-green-500/30",
  POST: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/30",
}

export default function TestApisPage() {
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("/api/user")
  const [body, setBody] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSend = async () => {
    setIsLoading(true)
    setResponse(null)
    setStatusCode(null)

    const startTime = Date.now()

    try {
      const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
      }

      if ((method === 'POST' || method === 'PUT') && body) {
        options.body = body
      }

      const res = await fetch(url, options)
      const data = await res.json()

      setResponseTime(Date.now() - startTime)
      setStatusCode(res.status)
      setResponse(JSON.stringify(data, null, 2))
    } catch (error: any) {
      setResponseTime(Date.now() - startTime)
      setStatusCode(500)
      setResponse(JSON.stringify({
        error: error.message || 'Request failed'
      }, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <TopBar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="relative border-b border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

            <div className="relative px-6 py-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20">
                  <TestTube className="h-5 w-5 text-teal-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Test APIs
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Test and debug API endpoints
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Request Builder */}
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Request Builder</h3>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger className="w-[100px] bg-secondary/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter URL"
                    className="flex-1 bg-secondary/50 border-border/50 font-mono text-sm"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send
                  </Button>
                </div>

                {(method === "POST" || method === "PUT") && (
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
                        Request Body
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="min-h-[120px] bg-secondary/50 border-border/50 font-mono text-sm"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>

            {/* Quick Endpoints */}
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Endpoints</h3>
              <div className="grid gap-2">
                {sampleEndpoints.map((endpoint, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setMethod(endpoint.method)
                      setUrl(endpoint.path)
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-secondary/30",
                      "hover:bg-secondary/50 hover:border-border transition-colors text-left group"
                    )}
                  >
                    <Badge variant="outline" className={cn("font-mono text-xs", methodColors[endpoint.method])}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-foreground flex-1">
                      {endpoint.path}
                    </code>
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {endpoint.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Response */}
            {response && (
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card animate-slide-up">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Response</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        statusCode && statusCode >= 200 && statusCode < 300
                          ? "border-green-500/30 text-green-400 bg-green-500/10"
                          : "border-red-500/30 text-red-400 bg-red-500/10"
                      )}
                    >
                      {statusCode || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    {responseTime && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {responseTime}ms
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 px-2"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <pre className="p-4 overflow-auto max-h-[400px] text-sm font-mono text-foreground/90">
                  <code>{response}</code>
                </pre>
              </div>
            )}

            {isLoading && (
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-400 mb-4" />
                  <p className="text-sm text-muted-foreground">Sending request...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
