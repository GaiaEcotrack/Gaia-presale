'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, LogOut, Save, RefreshCw, Calendar, Settings, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StageEditor } from '@/components/admin/stage-editor'
import { StagesTimeline } from '@/components/admin/stages-timeline'
import { useAdminStore } from '@/store/presale-store'
import { useToast } from '@/hooks/use-toast'

export default function AdminPage() {
  const {
    isAuthenticated,
    tokenPrice,
    stageName,
    stageEndDate,
    stageActive,
    login,
    logout,
    updateTokenPrice,
    updateStage,
  } = useAdminStore()

  const [password, setPassword] = useState('')
  const [price, setPrice] = useState(tokenPrice.toString())
  const [stage, setStageName] = useState(stageName)
  
  const [active, setActive] = useState(stageActive)
  const [showStageEditor, setShowStageEditor] = useState(false)
  const [editingStageId, setEditingStageId] = useState<number | null>(null)
  const { toast } = useToast()
const safeDate =
  stageEndDate instanceof Date
    ? stageEndDate
    : new Date(stageEndDate)

const [endDate, setEndDate] = useState(
  safeDate.toISOString().split('T')[0]
)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const success = login(password)
    if (!success) {
      toast({
        title: 'Login failed',
        description: 'Invalid password. Try "admin123"',
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Welcome back',
        description: 'Successfully logged in to admin panel.',
      })
    }
  }

  const handleSave = () => {
    updateTokenPrice(parseFloat(price))
    updateStage(stage, new Date(endDate), active)
    toast({
      title: 'Settings saved',
      description: 'Presale settings have been updated.',
    })
  }

  const handleEditStage = (stageId: number) => {
    setEditingStageId(stageId)
    setShowStageEditor(true)
  }

  const handleAddStage = () => {
    setEditingStageId(null)
    setShowStageEditor(true)
  }

  const handleCloseStageEditor = () => {
    setShowStageEditor(false)
    setEditingStageId(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 bg-card border border-border rounded-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-muted-foreground mt-2">
              Enter your password to access the admin dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Demo password: admin123
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage presale settings and configuration.</p>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Total Raised', value: '$2,847,592' },
            { label: 'Investors', value: '12,847' },
            { label: 'Tokens Sold', value: '284.7M' },
            { label: 'Current Stage', value: 'Stage 2' },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="settings" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="stages" className="gap-2">
            <List className="w-4 h-4" />
            Stages
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <Calendar className="w-4 h-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Configuración */}
        <TabsContent value="settings">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Configuración del Presale</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="price">Precio del Token (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="stage">Nombre del Stage</Label>
                <Input
                  id="stage"
                  type="text"
                  value={stage}
                  onChange={(e) => setStageName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endDate">Fecha de Fin del Stage</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Estado del Stage</Label>
                <div className="flex items-center gap-3 mt-3">
                  <Switch
                    checked={active}
                    onCheckedChange={setActive}
                  />
                  <span className="text-sm">{active ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                Guardar Cambios
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Sincronizar Datos
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Stages */}
        <TabsContent value="stages">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <StagesTimeline 
              onEditStage={handleEditStage}
              onAddStage={handleAddStage}
            />
          </motion.div>
        </TabsContent>

        {/* Estadísticas */}
        <TabsContent value="stats">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold mb-6">Actualización Manual de Estadísticas</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="totalRaised">Total Recaudado (USD)</Label>
                <Input
                  id="totalRaised"
                  type="number"
                  defaultValue="2847592"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="investors">Cantidad de Inversores</Label>
                <Input
                  id="investors"
                  type="number"
                  defaultValue="12847"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tokensSold">Tokens Vendidos</Label>
                <Input
                  id="tokensSold"
                  type="number"
                  defaultValue="284759200"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="countdown">Fecha del Countdown</Label>
                <Input
                  id="countdown"
                  type="datetime-local"
                  defaultValue="2025-01-31T23:59"
                  className="mt-1"
                />
              </div>
            </div>

            <Button className="mt-6 gap-2">
              <Save className="w-4 h-4" />
              Actualizar Estadísticas
            </Button>
          </motion.div>
        </TabsContent>
      </Tabs>



        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Recent Transactions</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Hash</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Address</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Amount</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Tokens</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { hash: '0x7a3b...f82c', address: '0x7a3b...f82c', amount: '1.5 ETH', tokens: '437,500', time: '2 min' },
                  { hash: '0x9d2e...a15b', address: '0x9d2e...a15b', amount: '0.8 ETH', tokens: '233,333', time: '5 min' },
                  { hash: '0x4c8f...d73a', address: '0x4c8f...d73a', amount: '3.2 ETH', tokens: '933,333', time: '8 min' },
                ].map((tx, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-3 font-mono text-sm">{tx.hash}</td>
                    <td className="p-3 font-mono text-sm">{tx.address}</td>
                    <td className="p-3 text-sm">{tx.amount}</td>
                    <td className="p-3 text-sm">{tx.tokens}</td>
                    <td className="p-3 text-sm text-muted-foreground">{tx.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      
      {/* Stage Editor Modal */}
      {showStageEditor && (
        <StageEditor
          stageId={editingStageId}
          onClose={handleCloseStageEditor}
        />
      )}
    </div>
  )
}
