import KPICard from '../KPICard'
import { Truck, Calendar, Package, DollarSign } from 'lucide-react'

export default function KPICardExample() {
  return (
    <div className="p-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Today's Deliveries"
        value={8}
        icon={Truck}
        description="Scheduled for delivery"
      />
      <KPICard
        title="Today's Pickups"
        value={5}
        icon={Calendar}
        description="Scheduled for pickup"
      />
      <KPICard
        title="Available Units"
        value={24}
        icon={Package}
        description="Ready to rent"
      />
      <KPICard
        title="Monthly Revenue"
        value="$12,450"
        icon={DollarSign}
        trend={{ value: 12, isPositive: true }}
      />
    </div>
  )
}
