'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Calendar, DollarSign, Percent, Package, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { usePresaleConfig } from '@/hooks/use-presale-config'
import { useAdminStore } from '@/store/presale-store'
import { PresaleStageConfig, validateStageDates, formatStageDate } from '@/config/presale-config'
import { useToast } from '@/hooks/use-toast'

interface StageEditorProps {
  stageId: number | null // null para crear nuevo stage
  onClose: () => void
}

export function StageEditor({ stageId, onClose }: StageEditorProps) {
  const { config, getStageById, updateStage, addStage } = usePresaleConfig()
  const { cancelEditing } = useAdminStore()
  const { toast } = useToast()
  
  const existingStage = stageId ? getStageById(stageId) : null
  
  const [formData, setFormData] = useState<Omit<PresaleStageConfig, 'id'>>({
    name: existingStage?.name || '',
    price: existingStage?.price || 0.01,
    bonus: existingStage?.bonus || 0,
    minPurchase: existingStage?.minPurchase || 0.1,
    startDate: existingStage?.startDate || new Date(),
    endDate: existingStage?.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
    supply: existingStage?.supply || 1_000_000,
    sold: existingStage?.sold || 0,
  })
  
  const [errors, setErrors] = useState<string[]>([])
  
  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const validateForm = (): boolean => {
    const stageToValidate: PresaleStageConfig = {
      ...formData,
      id: stageId || 0
    }
    
    const validationErrors = validateStageDates(stageToValidate)
    setErrors(validationErrors)
    
    if (validationErrors.length > 0) {
      toast({
        title: 'Errores de validación',
        description: validationErrors.join(', '),
        variant: 'destructive'
      })
      return false
    }
    
    return true
  }
  
  const handleSave = () => {
    if (!validateForm()) return
    
    try {
      if (stageId) {
        // Actualizar stage existente
        updateStage(stageId, formData)
        toast({
          title: 'Stage actualizado',
          description: `El stage "${formData.name}" ha sido actualizado exitosamente.`,
        })
      } else {
        // Crear nuevo stage
        addStage(formData)
        toast({
          title: 'Stage creado',
          description: `El stage "${formData.name}" ha sido creado exitosamente.`,
        })
      }
      
      onClose()
      cancelEditing()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el stage. Intenta nuevamente.',
        variant: 'destructive'
      })
    }
  }
  
  const handleCancel = () => {
    onClose()
    cancelEditing()
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {stageId ? `Editar Stage: ${existingStage?.name}` : 'Crear Nuevo Stage'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configura los detalles del stage del presale
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Form */}
        <div className="p-6 space-y-6">
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive mb-2">Errores de validación:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Nombre del Stage */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Nombre del Stage *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Seed Sale, Private Sale, Public Sale"
                className="mt-1"
              />
            </div>
            
            {/* Precio y Bonus */}
            <div>
              <Label htmlFor="price">Precio por Token (USD) *</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="bonus">Bonus (%) *</Label>
              <div className="relative mt-1">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="bonus"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.bonus}
                  onChange={(e) => handleChange('bonus', parseInt(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Compra mínima */}
            <div>
              <Label htmlFor="minPurchase">Compra Mínima (ETH) *</Label>
              <Input
                id="minPurchase"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.minPurchase}
                onChange={(e) => handleChange('minPurchase', parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            
            {/* Supply y Sold */}
            <div>
              <Label htmlFor="supply">Total de Tokens *</Label>
              <div className="relative mt-1">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="supply"
                  type="number"
                  min="1"
                  value={formData.supply}
                  onChange={(e) => handleChange('supply', parseInt(e.target.value) || 0)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sold">Tokens Vendidos</Label>
              <Input
                id="sold"
                type="number"
                min="0"
                value={formData.sold}
                onChange={(e) => handleChange('sold', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            
            {/* Fechas */}
            <div>
              <Label htmlFor="startDate">Fecha de Inicio *</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate.toISOString().slice(0, 16)}
                  onChange={(e) => handleChange('startDate', new Date(e.target.value))}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatStageDate(formData.startDate)}
              </p>
            </div>
            
            <div>
              <Label htmlFor="endDate">Fecha de Fin *</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate.toISOString().slice(0, 16)}
                  onChange={(e) => handleChange('endDate', new Date(e.target.value))}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatStageDate(formData.endDate)}
              </p>
            </div>
          </div>
          
          {/* Preview */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="font-medium mb-2">Vista Previa</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Nombre:</span>
                <p className="font-medium">{formData.name || 'Sin nombre'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Precio:</span>
                <p className="font-medium">${formData.price.toFixed(3)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Bonus:</span>
                <p className="font-medium">{formData.bonus}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Duración:</span>
                <p className="font-medium">
                  {Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))} días
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            {stageId ? 'Actualizar Stage' : 'Crear Stage'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}