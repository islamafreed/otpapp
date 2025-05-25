"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, orderBy, query, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { useToast } from "@/hooks/use-toast"
import { Users, Trophy, Gift, Calendar, LogOut, Search, Download, Trash2, Phone, MapPin, User } from "lucide-react"

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
  status: string
}

export default function AdminDashboard() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { logout } = useAdminAuth()
  const { toast } = useToast()

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    // Filter registrations based on search term
    const filtered = registrations.filter(
      (reg) =>
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.mobile.includes(searchTerm) ||
        reg.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.address.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRegistrations(filtered)
  }, [registrations, searchTerm])

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
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteRegistration = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete registration for ${name}?`)) {
      return
    }

    try {
      await deleteDoc(doc(db, "registrations", id))
      setRegistrations((prev) => prev.filter((reg) => reg.id !== id))
      toast({
        title: "Registration Deleted",
        description: `Registration for ${name} has been deleted`,
      })
    } catch (error) {
      console.error("Error deleting registration:", error)
      toast({
        title: "Error",
        description: "Failed to delete registration",
        variant: "destructive",
      })
    }
  }

  const updateRegistrationStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "registrations", id), { status: newStatus })
      setRegistrations((prev) => prev.map((reg) => (reg.id === id ? { ...reg, status: newStatus } : reg)))
      toast({
        title: "Status Updated",
        description: `Registration status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Registration Number",
      "Name",
      "Age",
      "Gender",
      "Mobile",
      "Address",
      "Status",
      "Phone Verified",
      "Registration Date",
    ]
    const csvData = filteredRegistrations.map((reg) => [
      reg.registrationNumber,
      reg.name,
      reg.age,
      reg.gender,
      reg.mobile,
      reg.address,
      reg.status,
      reg.phoneVerified ? "Yes" : "No",
      reg.createdAt?.toDate?.()?.toLocaleDateString() || "N/A",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `karate_registrations_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: "Registration data has been exported to CSV",
    })
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Brahmaputra Karate League</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
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

        {/* Search and Export */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, mobile, registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={exportToCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Registrations ({filteredRegistrations.length})</span>
              <Badge variant="outline">{searchTerm ? "Filtered" : "All Records"}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-semibold">Reg. No.</th>
                    <th className="text-left p-3 font-semibold">Participant Details</th>
                    <th className="text-left p-3 font-semibold">Contact Info</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-left p-3 font-semibold">Gift</th>
                    <th className="text-left p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((reg, index) => (
                    <tr key={reg.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-mono text-xs bg-blue-50 px-2 py-1 rounded">{reg.registrationNumber}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {reg.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{reg.name}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Age: {reg.age} • {reg.gender}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="font-mono">{reg.mobile}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate max-w-32">{reg.address}</span>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="space-y-1">
                          <Badge variant={reg.phoneVerified ? "default" : "secondary"}>
                            {reg.phoneVerified ? "Verified" : "Pending"}
                          </Badge>
                          <select
                            value={reg.status}
                            onChange={(e) => updateRegistrationStatus(reg.id, e.target.value)}
                            className="text-xs border rounded px-2 py-1 w-full"
                          >
                            <option value="registered">Registered</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>

                      <td className="p-3">
                        <Badge variant={index < 100 ? "default" : "outline"}>
                          {index < 100 ? `#${index + 1}` : "No"}
                        </Badge>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteRegistration(reg.id, reg.name)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredRegistrations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? "No registrations found matching your search." : "No registrations yet."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
