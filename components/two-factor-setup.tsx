import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import Image from "next/image"

interface TwoFactorSetupProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function TwoFactorSetup({ open, onOpenChange, onSuccess }: TwoFactorSetupProps) {
    const [step, setStep] = useState<'start' | 'qr' | 'verify'>('start')
    const [qrCode, setQrCode] = useState<string>('')
    const [secret, setSecret] = useState<string>('')
    const [token, setToken] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    const startSetup = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/2fa/setup', { method: 'POST' })
            const data = await response.json()

            if (data.success) {
                setQrCode(data.qrCode)
                setSecret(data.secret)
                setStep('qr')
            } else {
                toast.error('Failed to start 2FA setup')
            }
        } catch (error) {
            toast.error('Error starting 2FA setup')
        } finally {
            setIsLoading(false)
        }
    }

    const verifyToken = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, secret })
            })
            const data = await response.json()

            if (data.success) {
                toast.success('2FA Enabled Successfully')
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error(data.error || 'Invalid Token')
            }
        } catch (error) {
            toast.error('Verification failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Two-Factor Authentication Setup</DialogTitle>
                    <DialogDescription>
                        Secure your account with 2FA.
                    </DialogDescription>
                </DialogHeader>

                {step === 'start' && (
                    <div className="flex flex-col gap-4 py-4">
                        <p>Click below to generate a QR code for your authenticator app.</p>
                        <Button onClick={startSetup} disabled={isLoading}>
                            {isLoading ? 'Generating...' : 'Start Setup'}
                        </Button>
                    </div>
                )}

                {step === 'qr' && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="bg-white p-2 rounded-lg">
                            {qrCode && <img src={qrCode} alt="QR Code" width={200} height={200} />}
                        </div>
                        <p className="text-sm text-center text-muted-foreground">
                            Scan this QR code with Google Authenticator or Authy.
                        </p>
                        <div className="grid w-full gap-2">
                            <Label htmlFor="token">Enter 6-digit code</Label>
                            <Input
                                id="token"
                                placeholder="000000"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <Button onClick={verifyToken} disabled={isLoading || token.length !== 6}>
                            {isLoading ? 'Verifying...' : 'Verify & Enable'}
                        </Button>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    )
}
