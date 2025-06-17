import { useState, useEffect } from "react"
import {
  Heart,
  Activity,
  Thermometer,
  Gauge,
  MapPin,
  Bell,
  User,
  Baby,
  Stethoscope,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  X,
  Save,
  UserPlus,
  ArrowLeft,
  Upload,
  Camera,
} from "lucide-react"

// Mock data for demonstration
const mockVitalsData = {
  heartRate: 78,
  spo2: 97,
  temperature: 36.8,
  bpSystolic: 115,
  bpDiastolic: 75,
  timestamp: new Date().toISOString(),
}

const mockHistoricalData = [
  { heartRate: 75, spo2: 98, temperature: 36.5, bpSystolic: 110, bpDiastolic: 70, timestamp: "2024-01-15T10:00:00Z" },
  { heartRate: 78, spo2: 97, temperature: 36.8, bpSystolic: 115, bpDiastolic: 75, timestamp: "2024-01-15T10:05:00Z" },
  { heartRate: 82, spo2: 96, temperature: 37.0, bpSystolic: 118, bpDiastolic: 78, timestamp: "2024-01-15T10:10:00Z" },
]

const mockAlerts = [
  { message: "Heart Rate: 110 BPM (Elevated)", timestamp: "2024-01-15T09:30:00Z", severity: "warning" },
  { message: "Blood Pressure: 140/90 mmHg (High)", timestamp: "2024-01-15T08:15:00Z", severity: "critical" },
]

// Mock API request function
async function mockApiRequest(endpoint, method = 'GET', data = null) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  switch (endpoint) {
    case '/api/auth/login':
      if (data?.email === 'doctor@example.com' && data?.password === 'password123') {
        return { token: 'mock-token', role: 'doctor' }
      }
      if (data?.email === 'patient@example.com' && data?.password === 'password123') {
        return { token: 'mock-token', role: 'patient' }
      }
      throw new Error('Invalid credentials')
    case '/api/health':
      try {
        const response = await fetch('http://localhost:3000/api/health')
        if (!response.ok) {
          throw new Error('Failed to fetch vital signs')
        }
        return await response.json()
      } catch (error) {
        console.error('Error fetching vital signs:', error)
        return {
          temperature: 36.5 + Math.random() * 0.5,
          heartRate: 70 + Math.random() * 10,
          spo2: 95 + Math.random() * 3
        }
      }
    default:
      throw new Error('Not found')
  }
}

// Login Component
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [showRegister, setShowRegister] = useState(false)

  // Doctor registration form state
  const [doctorForm, setDoctorForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialization: "Obstetrics & Gynecology",
    licenseNumber: "",
    hospital: "",
    experience: "",
    bio: "",
  })

  const [formErrors, setFormErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin(role, role === "patient" ? "patient123" : "doctor456")
  }

  const validateDoctorForm = () => {
    const errors = {}

    if (!doctorForm.fullName) errors.fullName = "Name is required"
    if (!doctorForm.email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(doctorForm.email)) errors.email = "Email is invalid"

    if (!doctorForm.password) errors.password = "Password is required"
    else if (doctorForm.password.length < 6) errors.password = "Password must be at least 6 characters"

    if (doctorForm.password !== doctorForm.confirmPassword) errors.confirmPassword = "Passwords don't match"
    if (!doctorForm.phone) errors.phone = "Phone number is required"
    if (!doctorForm.licenseNumber) errors.licenseNumber = "License number is required"

    return errors
  }

  const handleDoctorRegister = (e) => {
    e.preventDefault()
    const errors = validateDoctorForm()

    if (Object.keys(errors).length === 0) {
      // In a real app, you would send this data to your backend
      console.log("Doctor registration data:", doctorForm)
      // For demo purposes, log in as the newly registered doctor
      onLogin("doctor", "doctor456")
    } else {
      setFormErrors(errors)
    }
  }

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-6">
          <div className="flex items-center mb-6">
            <button onClick={() => setShowRegister(false)} className="p-2 hover:bg-gray-100 rounded-full mr-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Doctor Registration</h1>
          </div>

          <form onSubmit={handleDoctorRegister} className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-200">
                  <Camera className="w-8 h-8 text-purple-400" />
                </div>
                <button className="absolute bottom-0 right-0 bg-purple-500 text-white p-1.5 rounded-full">
                  <Upload className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Full Name *"
                value={doctorForm.fullName}
                onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.fullName ? "border-red-500" : "border-gray-300"}`}
              />
              {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.phone ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="password"
                  placeholder="Password *"
                  value={doctorForm.password}
                  onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.password ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password *"
                  value={doctorForm.confirmPassword}
                  onChange={(e) => setDoctorForm({ ...doctorForm, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <select
                value={doctorForm.specialization}
                onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                <option value="Maternal-Fetal Medicine">Maternal-Fetal Medicine</option>
                <option value="Neonatology">Neonatology</option>
                <option value="Midwifery">Midwifery</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="License Number *"
                  value={doctorForm.licenseNumber}
                  onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${formErrors.licenseNumber ? "border-red-500" : "border-gray-300"}`}
                />
                {formErrors.licenseNumber && <p className="text-red-500 text-xs mt-1">{formErrors.licenseNumber}</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Years of Experience"
                  value={doctorForm.experience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Hospital/Clinic"
                value={doctorForm.hospital}
                onChange={(e) => setDoctorForm({ ...doctorForm, hospital: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <textarea
                placeholder="Professional Bio"
                value={doctorForm.bio}
                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all text-sm"
            >
              Register as Doctor
            </button>

            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-3">
            <Baby className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Maternal Health</h1>
          <p className="text-sm text-gray-600">Monitor • Care • Protect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`p-2 rounded-lg border transition-all text-sm ${
                role === "patient"
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <User className="w-4 h-4 mx-auto mb-1" />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`p-2 rounded-lg border transition-all text-sm ${
                role === "doctor"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Stethoscope className="w-4 h-4 mx-auto mb-1" />
              Doctor
            </button>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            placeholder="Email address"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            placeholder="Password"
            required
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 text-sm"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Demo: any email/password works</p>

          {role === "doctor" && (
            <button
              onClick={() => setShowRegister(true)}
              className="mt-4 flex items-center justify-center w-full text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Register as a new doctor
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Vital Signs Card Component
const VitalCard = ({ icon: Icon, title, value, unit, status, color }) => {
  const getStatusColor = () => {
    switch (status) {
      case "normal":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "critical":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-white"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-3 h-3 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />
      case "critical":
        return <XCircle className="w-3 h-3 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className={`rounded-lg p-4 border-2 ${getStatusColor()} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center">{getStatusIcon()}</div>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{unit}</div>
      </div>
      <h3 className="text-sm font-medium text-gray-700 mt-1">{title}</h3>
    </div>
  )
}

// Patient Dashboard Component
const PatientDashboard = ({ patientId, onLogout }) => {
  const [vitals, setVitals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const data = await mockApiRequest('/api/health')
        setVitals(data)
        setError(null)
      } catch (err) {
        setError('Failed to fetch vital signs')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchVitals()
    const interval = setInterval(fetchVitals, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getVitalStatus = (type, value) => {
    if (value === null) return 'bg-gray-100'
    switch (type) {
      case 'temperature':
        return value > 37.5 ? 'bg-red-100' : value > 37 ? 'bg-yellow-100' : 'bg-green-100'
      case 'heartRate':
        return value > 100 ? 'bg-red-100' : value > 90 ? 'bg-yellow-100' : 'bg-green-100'
      case 'spo2':
        return value < 95 ? 'bg-red-100' : value < 97 ? 'bg-yellow-100' : 'bg-green-100'
      default:
        return 'bg-gray-100'
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Compact Header */}
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
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs font-medium">Live</span>
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
        {/* Status Banner with Delivery Countdown */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Pregnancy Progress</h2>
              <p className="text-sm opacity-90">Week 32 of 40 • All vitals normal</p>
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

        {/* Compact Vital Signs Grid */}
        <div className="grid grid-cols-3 gap-3">
          <VitalCard
            icon={Heart}
            title="Heart Rate"
            value={Math.round(vitals?.heartRate)}
            unit="BPM"
            status={getVitalStatus('heartRate', vitals?.heartRate)}
            color="bg-gradient-to-r from-red-500 to-pink-500"
          />
          <VitalCard
            icon={Activity}
            title="Oxygen"
            value={Math.round(vitals?.spo2)}
            unit="%"
            status={getVitalStatus('spo2', vitals?.spo2)}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          <VitalCard
            icon={Thermometer}
            title="Temperature"
            value={vitals?.temperature?.toFixed(1)}
            unit="°C"
            status={getVitalStatus('temperature', vitals?.temperature)}
            color="bg-gradient-to-r from-orange-500 to-red-500"
          />
        </div>

        {/* Compact Location & Emergency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-purple-600 mr-2" />
                <h3 className="text-sm font-semibold text-gray-800">Location</h3>
              </div>
              <span className="text-xs text-gray-500">GPS Active</span>
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg h-20 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xs text-gray-600">Location tracking not available</p>
              </div>
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
        </div>

        {/* Quick Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-blue-800">Health Tips</h3>
          </div>
          <p className="text-sm text-blue-700">
            Stay hydrated, rest well, and take gentle walks. Contact your doctor if you feel unwell.
          </p>
        </div>
      </main>
    </div>
  )
}

// Doctor Dashboard Component
const DoctorDashboard = ({ doctorId, onLogout }) => {
  const [selectedPatient, setSelectedPatient] = useState("patient123")
  const [vitals, setVitals] = useState(mockVitalsData)
  const [alerts, setAlerts] = useState(mockAlerts)
  const [currentView, setCurrentView] = useState("dashboard") // dashboard, notifications
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
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
      status: "warning",
      phone: "+91 9876543211",
      email: "anita@email.com",
      conceivedDate: "2024-06-10",
      deliveryDate: "2025-03-17",
      address: "Ahmedabad, Gujarat",
    },
    {
      id: "patient789",
      name: "Meera Singh",
      age: 31,
      weeks: 36,
      status: "normal",
      phone: "+91 9876543212",
      email: "meera@email.com",
      conceivedDate: "2024-04-20",
      deliveryDate: "2025-01-25",
      address: "Delhi, India",
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
    const interval = setInterval(() => {
      setVitals((prev) => ({
        ...prev,
        heartRate: 70 + Math.random() * 20,
        spo2: 95 + Math.random() * 5,
        temperature: 36.5 + Math.random() * 1,
        bpSystolic: 110 + Math.random() * 20,
        bpDiastolic: 70 + Math.random() * 15,
        timestamp: new Date().toISOString(),
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Calculate delivery date (40 weeks from conception)
  const calculateDeliveryDate = (conceivedDate) => {
    const conceived = new Date(conceivedDate)
    const delivery = new Date(conceived)
    delivery.setDate(conceived.getDate() + 280) // 40 weeks = 280 days
    return delivery.toISOString().split("T")[0]
  }

  // Calculate weeks pregnant
  const calculateWeeksPregnant = (conceivedDate) => {
    const conceived = new Date(conceivedDate)
    const now = new Date()
    const diffTime = Math.abs(now - conceived)
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.min(diffWeeks, 40)
  }

  // Calculate days until delivery
  const calculateDaysUntilDelivery = (deliveryDate) => {
    const delivery = new Date(deliveryDate)
    const now = new Date()
    const diffTime = delivery - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Filter patients based on search
  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add new patient
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

  // Delete patient
  const handleDeletePatient = (patientId) => {
    setPatients(patients.filter((p) => p.id !== patientId))
    if (selectedPatient === patientId) {
      setSelectedPatient(patients[0]?.id || "")
    }
  }

  // Update patient
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

  if (currentView === "notifications") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg mr-3 transition-colors"
                >
                  ←
                </button>
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-red-600 mr-2" />
                  <h1 className="text-lg font-bold text-gray-800">Notifications & Alerts</h1>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Critical Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Critical Alerts
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-red-800">Priya Sharma</h3>
                      <p className="text-red-700">Blood Pressure: 150/95 mmHg (High)</p>
                      <p className="text-sm text-red-600">2 hours ago</p>
                    </div>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                      Call Patient
                    </button>
                  </div>
                </div>
                <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-red-800">Anita Patel</h3>
                      <p className="text-red-700">Heart Rate: 125 BPM (Elevated)</p>
                      <p className="text-sm text-red-600">4 hours ago</p>
                    </div>
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                      Call Patient
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Alerts */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Warning Alerts
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-yellow-800">Meera Singh</h3>
                      <p className="text-yellow-700">Temperature: 37.8°C (Elevated)</p>
                      <p className="text-sm text-yellow-600">1 hour ago</p>
                    </div>
                    <button className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                      Monitor
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Reminders */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-blue-600 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Delivery Reminders
              </h2>
              <div className="space-y-4">
                {patients.map((patient) => {
                  const daysLeft = calculateDaysUntilDelivery(patient.deliveryDate)
                  if (daysLeft <= 30 && daysLeft > 0) {
                    return (
                      <div key={patient.id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                        <h3 className="font-semibold text-blue-800">{patient.name}</h3>
                        <p className="text-blue-700">Expected delivery in {daysLeft} days</p>
                        <p className="text-sm text-blue-600">
                          Due: {new Date(patient.deliveryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            </div>

            {/* System Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                System Notifications
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-gray-500 bg-gray-50 p-4 rounded">
                  <h3 className="font-semibold text-gray-800">Device Offline</h3>
                  <p className="text-gray-700">Patient device for Priya Sharma went offline</p>
                  <p className="text-sm text-gray-600">30 minutes ago</p>
                </div>
                <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                  <h3 className="font-semibold text-green-800">Device Connected</h3>
                  <p className="text-green-700">Anita Patel's device reconnected successfully</p>
                  <p className="text-sm text-green-600">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                onClick={() => setCurrentView("notifications")}
                className="relative bg-red-100 hover:bg-red-200 p-2 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4 text-red-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                <span className="text-xs font-medium">Live</span>
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
        {/* Patient Management Section */}
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

          {/* Search Bar */}
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

          {/* Patient Cards */}
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

        {/* Rest of the existing dashboard content... */}
        {/* (Keep the existing vitals, charts, etc. sections) */}
        {/* Compact Real-time Vitals */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Live Vitals - {patients.find((p) => p.id === selectedPatient)?.name}
            </h2>
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              <span className="text-xs font-medium">Real-time</span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <VitalCard
              icon={Heart}
              title="Heart Rate"
              value={Math.round(vitals.heartRate)}
              unit="BPM"
              status="normal"
              color="bg-gradient-to-r from-red-500 to-pink-500"
            />
            <VitalCard
              icon={Activity}
              title="Oxygen"
              value={Math.round(vitals.spo2)}
              unit="%"
              status="normal"
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
            <VitalCard
              icon={Thermometer}
              title="Temperature"
              value={vitals.temperature.toFixed(1)}
              unit="°C"
              status="normal"
              color="bg-gradient-to-r from-orange-500 to-red-500"
            />
            <VitalCard
              icon={Gauge}
              title="Blood Pressure"
              value={`${Math.round(vitals.bpSystolic)}/${Math.round(vitals.bpDiastolic)}`}
              unit="mmHg"
              status="normal"
              color="bg-gradient-to-r from-purple-500 to-indigo-500"
            />
          </div>
        </div>

        {/* Compact Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trends Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">24h Trends</h3>
            <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <p className="text-xs text-gray-500">📈 Chart Integration</p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <MapPin className="w-4 h-4 text-purple-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">Location</h3>
            </div>
            <div className="h-32 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
              <p className="text-xs text-gray-500">🗺️ Maps Integration</p>
            </div>
          </div>

          {/* Alerts */}
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
                  <div className="text-xs opacity-75">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
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

// Main App Component
const App = () => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  const handleLogin = (role, userId) => {
    setUser(userId)
    setUserRole(role)
  }

  const handleLogout = () => {
    setUser(null)
    setUserRole(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <>
      {userRole === "patient" ? (
        <PatientDashboard patientId={user} onLogout={handleLogout} />
      ) : (
        <DoctorDashboard doctorId={user} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App