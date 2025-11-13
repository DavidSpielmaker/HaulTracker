import BookingTable from '../BookingTable'

export default function BookingTableExample() {
  // TODO: remove mock functionality
  const mockBookings = [
    {
      id: "1",
      bookingNumber: "BK-2024-001",
      customerName: "John Smith",
      dumpsterType: "20 Yard",
      deliveryDate: "2024-01-15",
      pickupDate: "2024-01-22",
      status: "confirmed",
      total: 425.00
    },
    {
      id: "2",
      bookingNumber: "BK-2024-002",
      customerName: "Sarah Johnson",
      dumpsterType: "10 Yard",
      deliveryDate: "2024-01-16",
      pickupDate: "2024-01-23",
      status: "delivered",
      total: 299.00
    },
    {
      id: "3",
      bookingNumber: "BK-2024-003",
      customerName: "Mike Wilson",
      dumpsterType: "30 Yard",
      deliveryDate: "2024-01-18",
      pickupDate: "2024-01-25",
      status: "pending",
      total: 575.00
    }
  ];

  return (
    <div className="p-8">
      <BookingTable 
        bookings={mockBookings}
        onView={(id) => console.log('View booking:', id)}
      />
    </div>
  )
}
