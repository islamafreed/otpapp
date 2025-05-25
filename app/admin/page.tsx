"use client"

import { AdminAuthProvider, useAdminAuth } from "@/contexts/admin-auth-context"
import AdminLogin from "@/components/admin-login"
import { Toaster } from "@/components/ui/toaster"
import { useState, useEffect } from "react"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Gift, Calendar } from "lucide-react"

interface Registration {
  id: string
  name: string
  age: string
  gender: string
  address: string
  mobile: string
  registrationNumber: string
  createdAt: any
  phoneVerified: boolean
}

function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const regs: Registration[] = []

        querySnapshot.forEach((doc) => {
          regs.push({ id: doc.id, ...doc.data() } as Registration)
        })

        setRegistrations(regs)
      } catch (error) {
        console.error("Error fetching registrations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading registrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brahmaputra Karate League - Admin Dashboard</h1>
          <p className="text-gray-600">Manage registrations and participants</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-2xl font-bold text-gray-900">{registrations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Gift className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Gift Eligible</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.min(registrations.length, 100)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Male Participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {registrations.filter((r) => r.gender === "male").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Female Participants</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {registrations.filter((r) => r.gender === "female").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Reg. No.</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Age</th>
                    <th className="text-left p-2">Gender</th>
                    <th className="text-left p-2">Mobile</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Gift Eligible</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, index) => (
                    <tr key={reg.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">{reg.registrationNumber}</td>
                      <td className="p-2 font-medium">{reg.name}</td>
                      <td className="p-2">{reg.age}</td>
                      <td className="p-2 capitalize">{reg.gender}</td>
                      <td className="p-2">{reg.mobile}</td>
                      <td className="p-2">
                        <Badge variant={reg.phoneVerified ? "default" : "secondary"}>
                          {reg.phoneVerified ? "Verified" : "Pending"}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant={index < 100 ? "default" : "outline"}>{index < 100 ? "Yes" : "No"}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AdminPageContent() {
  const { isAuthenticated, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />
}

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminPageContent />
      <Toaster />
    </AdminAuthProvider>
  )
}
