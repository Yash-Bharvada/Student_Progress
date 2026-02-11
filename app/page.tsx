"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Github, Shield, GraduationCap, Loader2, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("student")

  // Admin/Mentor Login State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleGithubLogin = () => {
    setIsLoading(true)
    // Redirect to GitHub OAuth
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}&scope=repo,user&prompt=select_account`
  }

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (data.success) {
        if (data.twoFactorRequired) {
          router.push('/auth/2fa')
          return
        }
        // Redirect based on role
        if (data.user.role === 'admin') router.push('/admin')
        else if (data.user.role === 'mentor') router.push('/mentor')
        else router.push('/dashboard') // Fallback
      } else {
        alert(data.error)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <Card className="w-full max-w-md relative border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 ring-1 ring-primary/20">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="grid w-full grid-cols-2 mb-6 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setActiveTab("student")}
                className={cn(
                  "flex items-center justify-center text-sm font-medium py-2 rounded-md transition-all duration-200",
                  activeTab === "student"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                Student
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                className={cn(
                  "flex items-center justify-center text-sm font-medium py-2 rounded-md transition-all duration-200",
                  activeTab === "staff"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                Staff (Admin/Mentor)
              </button>
            </div>

            {activeTab === "student" && (
              <div className="space-y-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-center text-sm text-muted-foreground mb-4">
                  Students must use GitHub to sign in. Ensure your email matches the one enrolled by your mentor.
                </div>
                <Button
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                  className="w-full h-11 bg-[#24292F] hover:bg-[#24292F]/90 text-white"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="mr-2 h-4 w-4" />
                  )}
                  Continue with GitHub
                </Button>
              </div>
            )}

            {activeTab === "staff" && (
              <form onSubmit={handleCredentialLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border/50 pt-6">
          <p className="text-xs text-muted-foreground text-center">
            Secure Access • Role Based Control
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
