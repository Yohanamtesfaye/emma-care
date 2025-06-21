"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Heart, Activity, Thermometer, Baby, Phone, Clock, Bell, Droplets, Sun, AlertTriangle } from "lucide-react"
import VitalCard from "../components/VitalCard"

const API_BASE_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:8080"

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
          message: `Your temperature is ${vitals.temperature.toFixed(1)}°C. This may indicate fever. Rest, stay hydrated, and contact your doctor.`
        })
      } else if (vitals.temperature > 37.5) {
        tips.push({
          icon: Thermometer,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Elevated Temperature",
          message: `Temperature reading of ${vitals.temperature.toFixed(1)}°C detected. Monitor closely and stay hydrated.`
        })
      } else if (vitals.temperature < 36.0) {
        tips.push({
          icon: Thermometer,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          title: "Low Temperature",
          message: `Temperature reading of ${vitals.temperature.toFixed(1)}°C detected. Warm up gradually and seek medical help if needed.`
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
          message: `Heart rate elevated to ${Math.round(vitals.heart_rate)} BPM. Try deep breathing exercises and contact your doctor.`
        })
      } else if (vitals.heart_rate > 100) {
        tips.push({
          icon: Heart,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Elevated Heart Rate",
          message: `Heart rate reading of ${Math.round(vitals.heart_rate)} BPM. Practice relaxation techniques and stay hydrated.`
        })
      } else if (vitals.heart_rate < 50) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Low Heart Rate Alert",
          message: `Heart rate decreased to ${Math.round(vitals.heart_rate)} BPM. Contact your doctor immediately.`
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
          message: `Oxygen level dropped to ${vitals.spo2.toFixed(1)}%. Sit upright, take deep breaths, and contact your doctor immediately.`
        })
      } else if (vitals.spo2 < 95) {
        tips.push({
          icon: Activity,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Low Oxygen Level",
          message: `Oxygen reading of ${vitals.spo2.toFixed(1)}% detected. Practice deep breathing exercises.`
        })
      }
    }

    // Blood pressure-based tips
    if (vitals.systolic !== null && vitals.systolic > 0) {
      if (vitals.systolic > 160) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "High Blood Pressure Alert",
          message: `Blood pressure elevated to ${vitals.systolic.toFixed(0)} mmHg. This may indicate preeclampsia. Contact your doctor immediately.`
        })
      } else if (vitals.systolic > 140) {
        tips.push({
          icon: Activity,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Elevated Blood Pressure",
          message: `Blood pressure reading of ${vitals.systolic.toFixed(0)} mmHg. Monitor closely and contact your doctor.`
        })
      } else if (vitals.systolic < 90) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Low Blood Pressure Alert",
          message: `Blood pressure decreased to ${vitals.systolic.toFixed(0)} mmHg. Sit or lie down and contact your doctor.`
        })
      }
    }

    // Multiple critical conditions
    const criticalConditions = tips.filter(tip => tip.title.includes("Alert"))
    if (criticalConditions.length >= 2) {
      tips.unshift({
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        title: "Multiple Critical Alerts",
        message: "Multiple vital signs showing abnormal readings. Immediate medical attention required. Contact your doctor immediately."
      })
    }

    // Default wellness tip if no alerts
    if (tips.length === 0) {
      tips.push({
        icon: Sun,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        title: "Wellness Tip",
        message: "Your vital signs are within normal range. Continue staying hydrated, resting well, and taking gentle walks."
      })
    }

    return tips.slice(0, 3) // Show max 3 tips
  }

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
            console.log("WebSocket data received:", data) // Debug log
            
            setVitals({
              heart_rate: data.heart_rate ?? null,
              spo2: data.spo2 ?? null,
              temperature: data.temperature ?? null,
              systolic: data.blood_pressure ?? data.systolic ?? null, // Map blood_pressure to systolic
              diastolic: data.diastolic ?? null,
            })
            setLastUpdated(new Date())
            setError(null)
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

        console.log("API data received:", data) // Debug log

        if (Array.isArray(data) && data.length > 0) {
          const latestReading = data[0]
          console.log("Latest reading:", latestReading) // Debug log
          
          setVitals({
            heart_rate: latestReading.heart_rate ?? null,
            spo2: latestReading.spo2 ?? null,
            temperature: latestReading.temperature ?? null,
            systolic: latestReading.blood_pressure ?? null, // Use blood_pressure field directly
            diastolic: null, // No diastolic in database
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

  if (loading) return <div className="p-4 text-gray-600">Loading...</div>

  const healthTips = generateHealthTips()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-lg mr-2">
                <Baby className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Health Monitor</h1>
                <p className="text-xs text-gray-600">ID: {patientId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/notifications")}
                className="bg-yellow-100 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4 text-yellow-600" />
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
                Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>}

        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Pregnancy Progress</h2>
              <p className="text-sm opacity-90">Week 32 of 40 • Monitor vitals</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">56</div>
              <div className="text-xs opacity-90">Days to go</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2" style={{ width: "80%" }}></div>
            </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <VitalCard
            icon={Activity}
            title="Blood Pressure"
            value={
              vitals.systolic
                ? `${vitals.systolic.toFixed(0)}/--`
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

        <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
          <div className="flex items-center mb-3">
            <Phone className="w-4 h-4 text-red-600 mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">Emergency</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
              📞 Doctor
            </button>
            <button className="bg-pink-500 hover:bg-pink-600 text-white py-2 px-3 rounded-lg font-medium transition-colors text-sm">
              👨‍👩‍👧‍👦 Family
            </button>
          </div>
        </div>

        {/* Dynamic Health Tips based on vital signs */}
        <div className="space-y-3">
          {healthTips.map((tip, index) => {
            const IconComponent = tip.icon
            return (
              <div key={index} className={`${tip.bgColor} border ${tip.borderColor} rounded-xl p-4`}>
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${tip.bgColor.replace('50', '100')}`}>
                    <IconComponent className={`w-4 h-4 ${tip.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${tip.color}`}>{tip.title}</h3>
                    <p className="text-sm text-gray-700 mt-1">{tip.message}</p>
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
