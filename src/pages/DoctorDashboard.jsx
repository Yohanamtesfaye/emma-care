"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Heart,
  Activity,
  Thermometer,
  Bell,
  Stethoscope,
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  X,
  Save,
  MessageCircle,
} from "lucide-react"
import VitalCard from "../components/VitalCard"

const API_BASE_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:8080"

const DoctorDashboard = ({ doctorId, onLogout }) => {
  const navigate = useNavigate()
  const [selectedPatient, setSelectedPatient] = useState("patient123")
  const [vitals, setVitals] = useState({
    heart_rate: null,
    spo2: null,
    temperature: null,
    systolic: null,
    diastolic: null,
  })
  const [alerts, setAlerts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [wsStatus, setWsStatus] = useState("Connecting...")
  const [retryCount, setRetryCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [patients, setPatients] = useState([
    {
      id: "patient123",
      name: "Priya Sharma",
      age: 28,
      weeks: 32,
      status: "normal",
      phone: "+91 9876543210",
      email: "priya@email.com",
      conceivedDate: "2024-05-15",
      deliveryDate: "2025-02-19",
      address: "Mumbai, Maharashtra",
    },
    {
      id: "patient456",
      name: "Anita Patel",
      age: 25,
      weeks: 28,
      status: "normal",
      phone: "+91 9876543211",
      email: "anita@email.com",
      conceivedDate: "2024-06-01",
      deliveryDate: "2025-03-08",
      address: "Delhi, NCR",
    },
  ])

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    conceivedDate: "",
    address: "",
  })

  useEffect(() => {
    let ws
    let reconnectTimeout

    const connectWebSocket = () => {
      try {
        ws = new WebSocket(WS_URL)
        setWsStatus("Connecting...")

        ws.onopen = () => {
          console.log("WebSocket connected")
          setWsStatus("Connected")
          setRetryCount(0)
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            setVitals({
              heart_rate: data.heart_rate ?? null,
              spo2: data.spo2 ?? null,
              temperature: data.temperature ?? null,
              systolic: data.systolic ?? null,
              diastolic: data.diastolic ?? null,
            })
            setLastUpdated(new Date())
            checkAlerts(data)
          } catch (err) {
            console.error("WebSocket message error:", err)
          }
        }

        ws.onclose = () => {
          console.log("WebSocket disconnected")
          setWsStatus("Disconnected")
          if (retryCount < 3) {
            reconnectTimeout = setTimeout(() => {
              setRetryCount((prev) => prev + 1)
            }, 2000)
          }
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          setWsStatus("Error")
        }
      } catch (err) {
        console.error("WebSocket connection error:", err)
        setWsStatus("Error")
      }
    }

    const fetchVitals = async () => {
      try {
        setIsRefreshing(true)
        const response = await fetch(`${API_BASE_URL}/api/data`)
        if (!response.ok) throw new Error("Failed to fetch vital signs")
        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          const latestReading = data[0]
          const vitalsData = {
            heart_rate: latestReading.heart_rate ?? null,
            spo2: latestReading.spo2 ?? null,
            temperature: latestReading.temperature ?? null,
            systolic: latestReading.blood_pressure ?? null,
            diastolic: null,
          }
          setVitals(vitalsData)
          setLastUpdated(new Date(latestReading.timestamp || new Date()))
          checkAlerts(vitalsData)
        } else {
          throw new Error("Invalid data format")
        }
      } catch (err) {
        console.error("Fetch vitals error:", err.message)
      } finally {
        setIsRefreshing(false)
      }
    }

    fetchVitals()
    const pollInterval = setInterval(fetchVitals, 3000)
    connectWebSocket()

    return () => {
      clearInterval(pollInterval)
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close()
      }
      clearTimeout(reconnectTimeout)
    }
  }, [retryCount])

  const checkAlerts = (data) => {
    const newAlerts = []
    if (data.heart_rate > 100) {
      newAlerts.push({
        message: `Heart Rate: ${data.heart_rate.toFixed(1)} BPM (Elevated)`,
        timestamp: new Date().toISOString(),
        severity: "critical",
      })
    }
    if (data.spo2 < 95) {
      newAlerts.push({
        message: `SpO2: ${data.spo2.toFixed(1)} % (Low)`,
        timestamp: new Date().toISOString(),
        severity: "critical",
      })
    }
    if (data.temperature > 37.5 || data.temperature === -127) {
      newAlerts.push({
        message: `Temperature: ${data.temperature.toFixed(1)} °C (${data.temperature === -127 ? "Disconnected" : "High"})`,
        timestamp: new Date().toISOString(),
        severity: "critical",
      })
    }
    if (data.systolic && (data.systolic > 140 || data.systolic < 90)) {
      newAlerts.push({
        message: `Blood Pressure: ${data.systolic.toFixed(0)} mmHg (${data.systolic > 140 ? "High" : "Low"})`,
        timestamp: new Date().toISOString(),
        severity: data.systolic > 160 || data.systolic < 70 ? "critical" : "warning",
      })
    }
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 5))
    }
  }

  const calculateDeliveryDate = (conceivedDate) => {
    const conceived = new Date(conceivedDate)
    const delivery = new Date(conceived)
    delivery.setDate(conceived.getDate() + 280)
    return delivery.toISOString().split("T")[0]
  }

  const calculateWeeksPregnant = (conceivedDate) => {
    const conceived = new Date(conceivedDate)
    const now = new Date()
    const diffTime = Math.abs(now - conceived)
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.min(diffWeeks, 40)
  }

  const calculateDaysUntilDelivery = (deliveryDate) => {
    const delivery = new Date(deliveryDate)
    const now = new Date()
    const diffTime = delivery - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPatient = () => {
    if (newPatient.name && newPatient.conceivedDate) {
      const deliveryDate = calculateDeliveryDate(newPatient.conceivedDate)
      const weeks = calculateWeeksPregnant(newPatient.conceivedDate)
      const patient = {
        id: `patient${Date.now()}`,
        ...newPatient,
        age: Number.parseInt(newPatient.age),
        weeks,
        deliveryDate,
        status: "normal",
      }
      setPatients([...patients, patient])
      setNewPatient({ name: "", age: "", phone: "", email: "", conceivedDate: "", address: "" })
      setShowAddPatient(false)
    }
  }

  const handleDeletePatient = (patientId) => {
    setPatients(patients.filter((p) => p.id !== patientId))
    if (selectedPatient === patientId) {
      setSelectedPatient(patients[0]?.id || "")
    }
  }

  const handleUpdatePatient = (updatedPatient) => {
    const deliveryDate = calculateDeliveryDate(updatedPatient.conceivedDate)
    const weeks = calculateWeeksPregnant(updatedPatient.conceivedDate)
    setPatients(
      patients.map((p) =>
        p.id === updatedPatient.id
          ? { ...updatedPatient, deliveryDate, weeks, age: Number.parseInt(updatedPatient.age) }
          : p,
      ),
    )
    setEditingPatient(null)
  }

  const getVitalStatus = (type, value) => {
    if (value === null || value === 0 || value === -127) return "critical"
    switch (type) {
      case "temperature":
        if (value < 20 || value > 42) return "critical"
        return value > 37.5 ? "critical" : value > 37 ? "warning" : "normal"
      case "heart_rate":
        if (value < 10) return "critical"
        return value > 100 ? "critical" : value > 90 ? "warning" : "normal"
      case "spo2":
        if (value < 50) return "critical"
        return value < 95 ? "critical" : value < 97 ? "warning" : "normal"
      case "blood_pressure":
        if (value < 60 || value > 180) return "critical"
        return value > 140 || value < 90 ? "warning" : "normal"
      default:
        return "normal"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-1.5 rounded-lg mr-2">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Doctor Portal</h1>
                <p className="text-xs text-gray-600">Dr. {doctorId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/chat")}
                className="bg-blue-100 hover:bg-blue-200 p-2 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => navigate("/notifications")}
                className="relative bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4 text-red-600" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alerts.length}
                  </span>
                )}
              </button>
              <div className="flex items-center text-green-600">
                <div
                  className={`w-2 h-2 rounded-full mr-1 animate-pulse ${
                    wsStatus === "Connected" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs font-medium">{wsStatus}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Patient Management</h2>
            <button
              onClick={() => setShowAddPatient(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm flex items-center transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Patient
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPatients.map((patient) => {
              const daysLeft = calculateDaysUntilDelivery(patient.deliveryDate)
              return (
                <div
                  key={patient.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPatient === patient.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPatient(patient.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm text-gray-800">{patient.name}</div>
                      <div className="text-xs text-gray-600">
                        {patient.age}y • {patient.weeks}w pregnant
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPatient(patient)
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePatient(patient.id)
                        }}
                        className="p-1 hover:bg-red-200 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          patient.status === "normal" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">📞 {patient.phone}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-blue-600 font-medium">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {daysLeft} days to delivery
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Live Vitals - {patients.find((p) => p.id === selectedPatient)?.name}
            </h2>
            <div className="flex items-center text-green-600">
              <div
                className={`w-2 h-2 rounded-full mr-1 animate-pulse ${
                  wsStatus === "Connected" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs font-medium">{wsStatus}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <VitalCard
              icon={Heart}
              title="Heart Rate"
              value={vitals.heart_rate ? Math.round(vitals.heart_rate) : "N/A"}
              unit="BPM"
              status={getVitalStatus("heart_rate", vitals.heart_rate)}
              color="bg-gradient-to-r from-red-500 to-pink-500"
            />
            <VitalCard
              icon={Activity}
              title="Oxygen"
              value={vitals.spo2 ? vitals.spo2.toFixed(1) : "N/A"}
              unit="%"
              status={getVitalStatus("spo2", vitals.spo2)}
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
            <VitalCard
              icon={Thermometer}
              title="Temperature"
              value={vitals.temperature ? vitals.temperature.toFixed(1) : "N/A"}
              unit="°C"
              status={getVitalStatus("temperature", vitals.temperature)}
              color="bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <VitalCard
            icon={Activity}
            title="Blood Pressure"
            value={
              vitals.systolic
                ? `${vitals.systolic.toFixed(0)}/${vitals.diastolic ? vitals.diastolic.toFixed(0) : "--"}`
                : "N/A"
            }
            unit="mmHg"
            status={getVitalStatus("blood_pressure", vitals.systolic)}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
          />
          <div className="bg-white rounded-lg p-4 border-2 border-gray-200 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : "N/A"}
              </div>
              <div className="text-xs text-gray-500">{lastUpdated ? "Last Updated" : "No Data"}</div>
            </div>
            <h3 className="text-sm font-medium text-gray-700 mt-1">Data Status</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">24h Trends</h3>
            <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <p className="text-xs text-gray-500">📈 Chart Integration (Future)</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <Bell className="w-4 h-4 text-red-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">Recent Alerts</h3>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 2).map((alert, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-xs ${
                    alert.severity === "critical" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700"
                  }`}
                >
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-xs opacity-75">{new Date(alert.timestamp).toLocaleString()}</div>
                </div>
              ))}
              {alerts.length === 0 && <p className="text-xs text-gray-600">No recent alerts</p>}
            </div>
          </div>
        </div>
      </main>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New Patient</h3>
              <button onClick={() => setShowAddPatient(false)} className="p-1 hover:bg-gray-200 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="number"
                placeholder="Age"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conception Date</label>
                <input
                  type="date"
                  value={newPatient.conceivedDate}
                  onChange={(e) => setNewPatient({ ...newPatient, conceivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <textarea
                placeholder="Address"
                value={newPatient.address}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                rows="2"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddPatient(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Patient</h3>
              <button onClick={() => setEditingPatient(null)} className="p-1 hover:bg-gray-200 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={editingPatient.name}
                onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="number"
                placeholder="Age"
                value={editingPatient.age}
                onChange={(e) => setEditingPatient({ ...editingPatient, age: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={editingPatient.phone}
                onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={editingPatient.email}
                onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conception Date</label>
                <input
                  type="date"
                  value={editingPatient.conceivedDate}
                  onChange={(e) => setEditingPatient({ ...editingPatient, conceivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <textarea
                placeholder="Address"
                value={editingPatient.address || ""}
                onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                rows="2"
              />
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingPatient(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdatePatient(editingPatient)}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
