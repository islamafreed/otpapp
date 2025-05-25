"use client"

import type React from "react"

import { useState } from "react"
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { User, Calendar, MapPin, Phone, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { saveRegistration, type RegistrationData } from "@/lib/registration-service"

interface FormData {
  name: string
  age: string
  gender: string
  address: string
  mobile: string
}

export default function RegistrationForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    gender: "",
    address: "",
    mobile: "",
  })
  const [otp, setOtp] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const { toast } = useToast()

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
      })
    }
  }

  const sendOTP = async () => {
    if (!formData.mobile || formData.mobile.length !== 10) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.age || !formData.gender || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields before sending OTP",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      setupRecaptcha()
      const phoneNumber = `+91${formData.mobile}`
      const appVerifier = window.recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      setConfirmationResult(confirmation)
      setIsOtpSent(true)
      toast({
        title: "OTP Sent! 📱",
        description: "Please check your phone for the verification code",
      })
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast({
        title: "Error",
        description: "Failed to send OTP. Please check your mobile number and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async () => {
    if (!otp || !confirmationResult) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive",
      })
      return
    }

    // Validate all required fields
    if (!formData.name || !formData.age || !formData.gender || !formData.address) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      await confirmationResult.confirm(otp)

      // Save registration data to Firestore
      const registrationData: RegistrationData = {
        ...formData,
        phoneVerified: true,
      }

      const result = await saveRegistration(registrationData)

      if (result.success) {
        toast({
          title: "Registration Successful! 🥋",
          description: `Welcome to Brahmaputra Karate League! Your registration number is: ${result.registrationNumber}`,
          duration: 10000,
        })

        // Reset form
        setFormData({
          name: "",
          age: "",
          gender: "",
          address: "",
          mobile: "",
        })
        setOtp("")
        setIsOtpSent(false)
        setConfirmationResult(null)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast({
        title: "Error",
        description: "Invalid OTP or registration failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
    handleInputChange("mobile", value)
  }

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
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                THE BRAHMAPUTRA
                <br />
                KARATE LEAGUE
              </h1>

              {/* Organization Logos */}
              <div className="flex justify-center items-center space-x-4 py-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AKF</span>
                </div>
                <div className="text-red-600 font-bold text-lg">AKF</div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">WAF</span>
                </div>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CKF</span>
                </div>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">SAKT</span>
                </div>
              </div>

              {/* Promotional Banner */}
              <div className="bg-red-600 text-white p-3 rounded-lg">
                <p className="font-bold text-sm">
                  ATTRACTIVE GIFTS FOR THE FIRST
                  <br />
                  100 PEOPLE WHO REGISTER!
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                />
              </div>

              {/* Age and Gender */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-gray-200"
                  />
                </div>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                />
              </div>

              {/* Mobile Number */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Mobile No."
                  type="tel"
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                  maxLength={10}
                />
              </div>

              {/* OTP Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-gray-200"
                    disabled={!isOtpSent}
                    maxLength={6}
                  />
                </div>
                <Button
                  onClick={sendOTP}
                  disabled={isLoading || !formData.mobile}
                  className="h-12 bg-gray-600 hover:bg-gray-700"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </div>

              {/* Submit Button */}
              <Button
                onClick={verifyOTP}
                disabled={!isOtpSent || !otp || isVerifying}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isVerifying ? "Verifying..." : "Register Now"}
              </Button>
            </div>

            {/* reCAPTCHA container */}
            <div id="recaptcha-container"></div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
