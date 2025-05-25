"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trophy, Gift } from "lucide-react"

interface RegistrationSuccessProps {
  registrationNumber: string
  onNewRegistration: () => void
}

export default function RegistrationSuccess({ registrationNumber, onNewRegistration }: RegistrationSuccessProps) {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/karate-bg.jpeg)" }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6 space-y-6 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>

            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">Registration Successful! 🥋</h1>
              <p className="text-gray-600">Welcome to the Brahmaputra Karate League</p>
            </div>

            {/* Registration Number */}
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Your Registration Number</p>
              <p className="text-xl font-bold text-blue-600">{registrationNumber}</p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-left">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-700">Eligible for league competitions</span>
              </div>
              <div className="flex items-center space-x-3 text-left">
                <Gift className="h-5 w-5 text-red-500" />
                <span className="text-sm text-gray-700">Attractive gifts for first 100 registrants</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please save your registration number. You will need it for future
                communications and events.
              </p>
            </div>

            {/* Action Button */}
            <Button onClick={onNewRegistration} className="w-full h-12 bg-blue-600 hover:bg-blue-700">
              Register Another Participant
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
