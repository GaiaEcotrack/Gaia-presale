'use client'

import { motion } from 'framer-motion'
import { Calendar, DollarSign, Percent, Package, CheckCircle, Clock, Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePresaleConfig } from '@/hooks/use-presale-config'
import { useAdminStore } from '@/store/presale-store'
import { formatShortDate, formatStageDate } from '@/config/presale-config'
import { useToast } from '@/hooks/use-toast'

interface StagesTimelineProps {
  onEditStage: (stageId: number) => void
  onAddStage: () => void
}

export function StagesTimeline({ onEditStage, onAddStage }: StagesTimelineProps) {
  const { config, activeStage, removeStage, resetToDefault } = usePresaleConfig()
  const { startEditingStage } = useAdminStore()
  const { toast } = useToast()
  
  const now = new Date()
  
  const handleEdit = (stageId: number) => {
    startEditingStage(stageId)
    onEditStage(stageId)
  }
  
  const handleDelete = (stageId: number, stageName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el stage "${stageName}"?`)) {
      try {
        removeStage(stageId)
        toast({
          title: 'Stage eliminado',
          description: `El stage "${stageName}" ha sido eliminado.`,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el stage.',
          variant: 'destructive'
        })
      }
    }
  }
  
  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración a los valores por defecto?')) {
      resetToDefault()
      toast({
        title: 'Configuración reseteada',
        description: 'Todos los stages han sido restaurados a los valores por defecto.',
      })
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Timeline de Stages</h3>
          <p className="text-sm text-muted-foreground">
            {config.stages.length} stages configurados • {activeStage ? 'Presale activo' : 'Presale inactivo'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Resetear a Default
          </Button>
          <Button size="sm" onClick={onAddStage} className="gap-2">
            <Plus className="w-4 h-4" />
            Agregar Stage
          </Button>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="relative">
        {/* Línea de tiempo */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* Stages */}
        <div className="space-y-8">
          {config.stages.map((stage, index) => {
            const isActive = now >= stage.startDate && now <= stage.endDate
            const isPast = now > stage.endDate
            const isFuture = now < stage.startDate
            
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Punto en la línea */}
                <div className="absolute left-6 -translate-x-1/2">
                  <div className={`
                    w-4 h-4 rounded-full border-4
                    ${isActive ? 'bg-green-500 border-green-500' : 
                      isPast ? 'bg-gray-400 border-gray-400' : 
                      'bg-blue-500 border-blue-500'}
                  `} />
                </div>
                
                {/* Card del stage */}
                <div className="ml-12 bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{stage.name}</h4>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Activo
                          </span>
                        )}
                        {isPast && (
                          <span className="inline-flex items-center gap-1 bg-gray-500/10 text-gray-600 dark:text-gray-400 text-xs font-medium px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            Finalizado
                          </span>
                        )}
                        {isFuture && (
                          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" />
                            Próximo
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatShortDate(stage.startDate)}</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatShortDate(stage.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(stage.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(stage.id, stage.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Precio</span>
                      </div>
                      <p className="font-bold">${stage.price.toFixed(3)}</p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Percent className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Bonus</span>
                      </div>
                      <p className="font-bold">{stage.bonus}%</p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Supply</span>
                      </div>
                      <p className="font-bold">{(stage.supply / 1_000_000).toFixed(1)}M</p>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Vendido</span>
                      </div>
                      <p className="font-bold">{((stage.sold / stage.supply) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-medium">{((stage.sold / stage.supply) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${Math.min((stage.sold / stage.supply) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Detalles adicionales */}
                  <div className="text-sm text-muted-foreground">
                    <p>Compra mínima: {stage.minPurchase} ETH</p>
                    <p>Tokens disponibles: {(stage.supply - stage.sold).toLocaleString()}</p>
                    <p>Duración: {Math.ceil((stage.endDate.getTime() - stage.startDate.getTime()) / (1000 * 60 * 60 * 24))} días</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
      
      {/* Resumen */}
      <div className="bg-muted/30 rounded-xl p-5">
        <h4 className="font-semibold mb-3">Resumen de Configuración</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Stages Totales</p>
            <p className="text-2xl font-bold">{config.stages.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stage Activo</p>
            <p className="text-2xl font-bold">{activeStage?.name || 'Ninguno'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Próximo Stage</p>
            <p className="text-2xl font-bold">
              {config.stages.find(s => now < s.startDate)?.name || 'Ninguno'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}