"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github, Loader2, BookOpen, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { TextRotate } from "@/components/ui/text-rotate"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { motion } from "motion/react"
import Image from "next/image"

export default function LandingPage() {
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Flanking Stickers - left and right sides, vertically centered */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Left top sticker */}
        <motion.div
          initial={{ opacity: 0, x: -80, rotate: -15 }}
          animate={{ opacity: 1, x: 0, rotate: -8 }}
          transition={{ duration: 1.2, delay: 0.2, type: "spring" }}
          className="absolute left-25 top-[20%] w-60 group"
        >
          <div className="relative overflow-hidden rounded-r-2xl border-r border-t border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            <Image
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"
              alt="Code"
              width={300}
              height={400}
              className="w-full h-auto object-cover opacity-75 scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            <div className="absolute bottom-2 left-0 right-0 px-3">
              <p className="text-white text-[10px] font-mono tracking-widest uppercase opacity-80">› Code Studio</p>
            </div>
          </div>
        </motion.div>

        {/* Left bottom sticker */}
        <motion.div
          initial={{ opacity: 0, x: -80, rotate: 12 }}
          animate={{ opacity: 1, x: 0, rotate: 6 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring" }}
          className="absolute left-25 top-[56%] w-64 group"
        >
          <div className="relative overflow-hidden rounded-r-2xl border-r border-t border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop"
              alt="Collaboration"
              width={400}
              height={300}
              className="w-full h-auto object-cover opacity-75 scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            <div className="absolute bottom-2 left-0 right-0 px-3">
              <p className="text-white text-[10px] font-mono tracking-widest uppercase opacity-80">› Team Sync</p>
            </div>
          </div>
        </motion.div>

        {/* Right top sticker */}
        <motion.div
          initial={{ opacity: 0, x: 80, rotate: 15 }}
          animate={{ opacity: 1, x: 0, rotate: 10 }}
          transition={{ duration: 1.2, delay: 0.35, type: "spring" }}
          className="absolute right-25 top-[18%] w-60 group"
        >
          <div className="relative overflow-hidden rounded-l-2xl border-l border-t border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <Image
              src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop"
              alt="Matrix"
              width={300}
              height={400}
              className="w-full h-auto object-cover opacity-75 scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            <div className="absolute bottom-2 left-0 right-0 px-3">
              <p className="text-white text-[10px] font-mono tracking-widest uppercase opacity-80">› Data Matrix</p>
            </div>
          </div>
        </motion.div>

        {/* Right bottom sticker */}
        <motion.div
          initial={{ opacity: 0, x: 80, rotate: -12 }}
          animate={{ opacity: 1, x: 0, rotate: -7 }}
          transition={{ duration: 1.2, delay: 0.65, type: "spring" }}
          className="absolute right-25 top-[54%] w-64 group"
        >
          <div className="relative overflow-hidden rounded-l-2xl border-l border-t border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <Image
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop"
              alt="Blueprint"
              width={300}
              height={400}
              className="w-full h-auto object-cover opacity-75 scale-105 group-hover:scale-100 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
            <div className="absolute bottom-2 left-0 right-0 px-3">
              <p className="text-white text-[10px] font-mono tracking-widest uppercase opacity-80">› Architecture</p>
            </div>
          </div>
        </motion.div>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto h-screen">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 ring-1 ring-primary/20 backdrop-blur-sm">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6">
          Flux Intelligent Tracker
        </h1>

        <div className="text-2xl md:text-4xl font-medium text-muted-foreground mb-8 h-20 md:h-12 flex flex-col md:flex-row items-center justify-center">
          Empowering your team with
          <TextRotate
            texts={[
              "AI-Powered Feedback",
              "Real-time Progress",
              "Seamless Integration",
              "Smart Code Reviews",
              "Mentor Connectivity"
            ]}
            mainClassName="text-primary font-bold overflow-hidden md:ml-3 px-2 mt-2 md:mt-0 py-1"
            rotationInterval={3000}
            staggerDuration={0.03}
            splitBy="characters"
          />
        </div>

        <p className="max-w-xl text-base md:text-xl text-muted-foreground mb-12">
          The ultimate development studio for students and mentors permanently tuned for managing objectives and accelerating learning.
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl hover:shadow-primary/20 transition-all border-border group overflow-hidden relative">
              <span className="relative z-10 flex items-center">
                Access Workspace
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
            <DialogHeader className="text-center sm:text-center space-y-2 pt-4">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 ring-1 ring-primary/20">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">Access Your Workspace</DialogTitle>
              <DialogDescription className="text-center">
                Sign in to manage your progress with Flux
              </DialogDescription>
            </DialogHeader>

            <div className="w-full mt-4">
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
            <div className="flex justify-center border-t border-border/50 pt-6 mt-6">
              <p className="text-xs text-muted-foreground text-center flex gap-1 items-center">
                <span>Secure Access</span>
                <span>•</span>
                <span>Role Based Control</span>
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
