"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar, TopBar } from "@/components/app-sidebar"
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { TwoFactorSetup } from "@/components/two-factor-setup"

interface UserSettings {
    publicProfile: boolean
    showEmail: boolean
    emailNotifications: boolean
    pushNotifications: boolean
    twoFactorEnabled: boolean
    activityTracking: boolean
    darkMode: boolean
    theme: string
}

export default function SettingsPage() {
    const { setTheme } = useTheme()
    const [twoFactorOpen, setTwoFactorOpen] = useState(false)
    const [settings, setSettings] = useState<UserSettings>({
        publicProfile: true,
        showEmail: false,
        emailNotifications: true,
        pushNotifications: false,
        twoFactorEnabled: false,
        activityTracking: true,
        darkMode: true,
        theme: 'default'
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Fetch current settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings')
                const data = await response.json()

                if (data.success) {
                    setSettings(data.settings)
                    // Sync theme with fetched settings
                    setTheme(data.settings.darkMode ? 'dark' : 'light')
                }
            } catch (error) {
                console.error('Error fetching settings:', error)
                toast.error("Failed to load settings")
            } finally {
                setIsLoading(false)
            }
        }

        fetchSettings()
    }, [toast])

    // Update a single setting
    const updateSetting = async (key: keyof UserSettings, value: boolean | string) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        setHasChanges(true)

        // Apply theme change immediately
        if (key === 'darkMode') {
            setTheme(value ? 'dark' : 'light')
        }

        // Auto-save individual toggle changes
        try {
            const response = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            })

            const data = await response.json()

            if (data.success) {
                toast.success("Setting updated successfully")
                setHasChanges(false)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            console.error('Error updating setting:', error)
            toast.error("Failed to save setting")
            // Revert on error
            setSettings(settings)
        }
    }

    // Save all changes
    const saveAllChanges = async () => {
        setIsSaving(true)
        try {
            const response = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            const data = await response.json()

            if (data.success) {
                toast.success("All settings saved successfully")
                setHasChanges(false)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error("Failed to save settings")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="bg-background">
                    <TopBar />
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                </SidebarInset>
            </SidebarProvider>
        )
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
                <TopBar />
                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <div className="relative border-b border-border/50">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 via-transparent to-slate-500/5 pointer-events-none" />

                        <div className="relative px-6 py-8">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10 border border-gray-500/20">
                                    <SettingsIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        Settings
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your account and preferences
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Profile Settings */}
                        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold text-foreground">Profile Settings</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Public Profile</Label>
                                        <p className="text-xs text-muted-foreground">Make your profile visible to others</p>
                                    </div>
                                    <Switch
                                        checked={settings.publicProfile}
                                        onCheckedChange={(checked) => updateSetting('publicProfile', checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Show Email</Label>
                                        <p className="text-xs text-muted-foreground">Display email on your profile</p>
                                    </div>
                                    <Switch
                                        checked={settings.showEmail}
                                        onCheckedChange={(checked) => updateSetting('showEmail', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Email Notifications</Label>
                                        <p className="text-xs text-muted-foreground">Receive updates via email</p>
                                    </div>
                                    <Switch
                                        checked={settings.emailNotifications}
                                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Push Notifications</Label>
                                        <p className="text-xs text-muted-foreground">Receive push notifications</p>
                                    </div>
                                    <Switch
                                        checked={settings.pushNotifications}
                                        onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Privacy & Security */}
                        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                                    </div>
                                    <Button
                                        variant={settings.twoFactorEnabled ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => setTwoFactorOpen(true)}
                                        disabled={settings.twoFactorEnabled}
                                    >
                                        {settings.twoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Activity Tracking</Label>
                                        <p className="text-xs text-muted-foreground">Track your coding activity</p>
                                    </div>
                                    <Switch
                                        checked={settings.activityTracking}
                                        onCheckedChange={(checked) => updateSetting('activityTracking', checked)}
                                    />
                                </div>
                                <TwoFactorSetup
                                    open={twoFactorOpen}
                                    onOpenChange={setTwoFactorOpen}
                                    onSuccess={() => updateSetting('twoFactorEnabled', true)}
                                />
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Palette className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold text-foreground">Appearance</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label className="text-sm font-medium">Dark Mode</Label>
                                        <p className="text-xs text-muted-foreground">Use dark theme</p>
                                    </div>
                                    <Switch
                                        checked={settings.darkMode}
                                        onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Data Management */}
                        <div className="relative overflow-hidden rounded-xl border border-border/50 bg-card p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Database className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => toast.success("Your data export will be ready shortly")}
                                >
                                    Export Data
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-destructive hover:text-destructive"
                                    onClick={() => toast.error("Please contact support to delete your account")}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </div>

                        {/* Save Button */}
                        {hasChanges && (
                            <div className="flex justify-end">
                                <Button
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                                    onClick={saveAllChanges}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
