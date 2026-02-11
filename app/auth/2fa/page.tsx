"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Shield, Loader2 } from "lucide-react"

export default function TwoFactorAuthPage() {
    const router = useRouter()
    const [token, setToken] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const res = await fetch('/api/auth/2fa/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })

            const data = await res.json()

            if (data.success) {
                // Redirect based on role or default to dashboard
                if (data.user.role === 'admin') router.push('/admin')
                else if (data.user.role === 'mentor') router.push('/mentor')
                else router.push('/dashboard')
            } else {
                setError(data.error || "Invalid code")
            }
        } catch (err) {
            setError("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <Card className="w-full max-w-md relative border-border/50 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 ring-1 ring-primary/20">
                        <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Two-Factor Authentication</CardTitle>
                    <CardDescription>
                        Enter the code from your authenticator app
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token" className="sr-only">Authentication Code</Label>
                            <Input
                                id="token"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                placeholder="000000"
                                className="text-center text-2xl tracking-widest"
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                required
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive text-center font-medium animate-in fade-in-0">
                                {error}
                            </p>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading || token.length !== 6}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t border-border/50 pt-6">
                    <Button variant="link" className="text-xs text-muted-foreground" onClick={() => router.push('/')}>
                        Back to Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
