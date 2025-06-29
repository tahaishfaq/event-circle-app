"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Users, Calendar, TrendingUp, Eye, Trash2 } from "lucide-react"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({})
  const [events, setEvents] = useState([])
  const [users, setUsers] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "admin") {
      router.push("/")
      return
    }
    fetchDashboardData()
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, eventsRes, usersRes, paymentsRes] = await Promise.all([
        axios.get("/api/admin/stats"),
        axios.get("/api/admin/events"),
        axios.get("/api/admin/users"),
        axios.get("/api/admin/payments"),
      ])

      setStats(statsRes.data)
      setEvents(eventsRes.data)
      setUsers(usersRes.data)
      setPayments(paymentsRes.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`/api/admin/events/${eventId}`)
        setEvents(events.filter((event) => event._id !== eventId))
      } catch (error) {
        console.error("Error deleting event:", error)
        alert("Failed to delete event")
      }
    }
  }

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/admin/users/${userId}`)
        setUsers(users.filter((user) => user._id !== userId))
      } catch (error) {
        console.error("Error deleting user:", error)
        alert("Failed to delete user")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Event Circle platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvents || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Admin Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.adminEarnings || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={event.videoThumbnail || "/placeholder.svg"}
                          alt={event.eventName}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">{event.eventName}</h3>
                          <p className="text-sm text-gray-600">{event.eventLocation}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{event.category}</Badge>
                            <span className="text-sm text-gray-500">
                              {event.attendees?.length || 0}/{event.capacity} attendees
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteEvent(event._id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={user.profilePicture || "/placeholder.svg?height=40&width=40"}
                          alt={user.fullName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">{user.fullName}</h3>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={user.role === "admin"}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{payment.eventName}</h3>
                        <p className="text-sm text-gray-600">Purchased by {payment.buyerName}</p>
                        <p className="text-sm text-gray-500">{new Date(payment.purchaseDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount}</p>
                        <p className="text-sm text-gray-600">Admin: ${payment.adminCut}</p>
                        <Badge variant="outline" className="mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
