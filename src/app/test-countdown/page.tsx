import { TestCountdown } from '@/components/test/test-countdown'

export default function TestCountdownPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TestCountdown />
        
        <div className="mt-12 p-6 bg-card rounded-xl border">
          <h2 className="text-xl font-bold mb-4">Resumen de Implementación</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2">Componentes Creados:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>ParticleExplosion</code> - Animación de explosión de partículas</li>
                <li><code>PresaleEndedContent</code> - Contenido después del presale</li>
                <li><code>TestCountdown</code> - Componente de prueba (este)</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-2">Componentes Modificados:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><code>CountdownTimer</code> - Agregado callback <code>onCountdownEnd</code></li>
                <li><code>HeroSection</code> - Integración de animación y cambio de contenido</li>
                <li><code>presale-store.ts</code> - Actualizada fecha a 28 febrero 2025</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="font-medium">Para ver la implementación en la página principal:</p>
            <p className="text-sm text-muted-foreground mt-1">
              Visita <a href="/" className="text-blue-600 hover:underline">la página de inicio</a> 
              y observa el contador en la sección Hero. Si la fecha actual es posterior al 28 de febrero 2025, 
              verás el contenido de "Presale Finalizado" directamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}