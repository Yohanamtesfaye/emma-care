"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Heart,
  Activity,
  Thermometer,
  Baby,
  Phone,
  Clock,
  Bell,
  Sun,
  AlertTriangle,
  MessageCircle,
  Users,
  Menu,
} from "lucide-react"
import VitalCard from "../components/VitalCard"

const API_BASE_URL = "http://159.89.52.163:3000"
const PatientDashboard = ({ patientId, onLogout }) => {
  const navigate = useNavigate()
  const [vitals, setVitals] = useState({
    heart_rate: null,
    spo2: null,
    temperature: null,
    systolic: null,
    diastolic: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wsStatus, setWsStatus] = useState("Connected")
  const [retryCount, setRetryCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Generate health tips based on current vital signs
  const generateHealthTips = () => {
    const tips = []

    // Temperature-based tips
    if (vitals.temperature !== null && vitals.temperature !== -127) {
      if (vitals.temperature > 38.0) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "High Temperature Alert",
          message: `Your temperature is ${vitals.temperature.toFixed(1)}°C. Rest, stay hydrated, and contact your doctor.`,
        })
      } else if (vitals.temperature > 37.5) {
        tips.push({
          icon: Thermometer,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Elevated Temperature",
          message: `Temperature reading of ${vitals.temperature.toFixed(1)}°C detected. Monitor closely.`,
        })
      }
    }

    // Heart rate-based tips
    if (vitals.heart_rate !== null && vitals.heart_rate > 0) {
      if (vitals.heart_rate > 120) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "High Heart Rate Alert",
          message: `Heart rate elevated to ${Math.round(vitals.heart_rate)} BPM. Try deep breathing exercises.`,
        })
      } else if (vitals.heart_rate > 100) {
        tips.push({
          icon: Heart,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Elevated Heart Rate",
          message: `Heart rate reading of ${Math.round(vitals.heart_rate)} BPM. Practice relaxation techniques.`,
        })
      }
    }

    // Oxygen saturation-based tips
    if (vitals.spo2 !== null && vitals.spo2 > 0) {
      if (vitals.spo2 < 90) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Low Oxygen Alert",
          message: `Oxygen level dropped to ${vitals.spo2.toFixed(1)}%. Sit upright and take deep breaths.`,
        })
      } else if (vitals.spo2 < 95) {
        tips.push({
          icon: Activity,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Low Oxygen Level",
          message: `Oxygen reading of ${vitals.spo2.toFixed(1)}% detected. Practice deep breathing.`,
        })
      }
    }

    // Default wellness tip if no alerts
    if (tips.length === 0) {
      tips.push({
        icon: Sun,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        title: "All Good!",
        message: "Your vital signs are within normal range. Keep up the great work!",
      })
    }

    return tips.slice(0, 2) // Show max 2 tips
  }

  useEffect(() => {

    const fetchVitals = async () => {
      try {
        setIsRefreshing(true)
        const response = await fetch(`${API_BASE_URL}/api/data`)
        if (!response.ok) throw new Error("Failed to fetch vital signs")
        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          const latestReading = data[0]
          setVitals({
            heart_rate: latestReading.heart_rate ?? null,
            spo2: latestReading.spo2 ?? null,
            temperature: latestReading.temperature ?? null,
            systolic: latestReading.blood_pressure ?? null,
            diastolic: null,
          })
          setLastUpdated(new Date(latestReading.timestamp || new Date()))
        } else {
          throw new Error("Invalid data format")
        }
        setError(null)
      } catch (err) {
        console.error("Fetch vitals error:", err.message)
        setError("Failed to fetch vital signs")
      } finally {
        setLoading(false)
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

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading your health data...</p>
        </div>
      </div>
    )

  const healthTips = generateHealthTips()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-lg shadow-sm">
                <Baby className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-800">Health Monitor</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Welcome back, {patientId.split("_")[1]}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => navigate("/chat")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-2 rounded-lg transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => navigate("/notifications")}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 p-2 rounded-lg transition-all shadow-sm"
              >
                <Bell className="w-4 h-4 text-white" />
              </button>
              <div className="flex items-center bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    wsStatus === "Connected" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs font-medium text-gray-700">{wsStatus}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 transition-colors text-xs font-medium"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    navigate("/chat")
                    setShowMobileMenu(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">AI Assistant</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/notifications")
                    setShowMobileMenu(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Bell className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">Notifications</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-sm text-gray-700">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-3 shadow-sm">
            <div className="flex">
              <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Pregnancy Progress Card */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">Pregnancy Journey</h2>
              <p className="text-pink-100 text-sm mb-3">Week 32 of 40 • You're doing great!</p>
              <div className="bg-white/20 rounded-full h-2 mb-1">
                <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: "80%" }}></div>
              </div>
              <p className="text-xs text-pink-100">80% Complete</p>
            </div>
            <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">56</div>
              <div className="text-xs opacity-90">Days to go</div>
            </div>
          </div>
        </div>

        {/* Vital Signs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
          <VitalCard
            icon={Activity}
            title="Blood Pressure"
            value={vitals.systolic ? `${vitals.systolic.toFixed(0)}/--` : "N/A"}
            unit="mmHg"
            status={getVitalStatus("blood_pressure", vitals.systolic)}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
          />
        </div>

        {/* Last Updated Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Data Status</h3>
                <p className="text-xs text-gray-600">
                  {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : "No recent data"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
              </div>
              <div className="text-xs text-gray-500">Last Reading</div>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20">
          <div className="flex items-center mb-3">
            <Phone className="w-4 h-4 text-red-600 mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">Emergency Contacts</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Call Doctor</span>
            </button>
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Contact Family</span>
            </button>
          </div>
        </div>

        {/* Dynamic Health Tips */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-800">Health Insights</h3>
          {healthTips.map((tip, index) => {
            const IconComponent = tip.icon
            return (
              <div
                key={index}
                className={`${tip.bgColor} border-l-4 ${tip.borderColor} rounded-lg p-4 shadow-sm backdrop-blur-sm`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${tip.bgColor.replace("50", "100")} shadow-sm`}>
                    <IconComponent className={`w-4 h-4 ${tip.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${tip.color} mb-1`}>{tip.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{tip.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default PatientDashboard
