import DumpsterCard from '../DumpsterCard'
import dumpster10 from '@assets/generated_images/10_yard_dumpster_product_223909e0.png'

export default function DumpsterCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <DumpsterCard
        id="10-yard"
        name="10 Yard Dumpster"
        sizeYards={10}
        description="Perfect for small projects like garage cleanouts or minor renovations"
        weeklyRate={299}
        dailyRate={45}
        weightLimit={2}
        imageUrl={dumpster10}
        popular={true}
        onSelect={(id) => console.log('Selected:', id)}
      />
    </div>
  )
}
