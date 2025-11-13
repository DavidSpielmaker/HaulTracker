import { useState } from 'react'
import BookingProgress from '../BookingProgress'
import { Button } from '@/components/ui/button'

export default function BookingProgressExample() {
  const [step, setStep] = useState(2)

  return (
    <div className="p-8">
      <BookingProgress currentStep={step} />
      <div className="flex justify-center gap-2 mt-8">
        <Button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
          Previous
        </Button>
        <Button onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4}>
          Next
        </Button>
      </div>
    </div>
  )
}
