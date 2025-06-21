"use client"

import { useState } from "react"
import { Baby, User, Stethoscope, ArrowLeft, Upload, Camera, UserPlus } from "lucide-react"

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [showRegister, setShowRegister] = useState(false)
  const [error, setError] = useState(null)

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

  const handleDoctorRegister = async () => {
    const errors = validateDoctorForm()
    if (Object.keys(errors).length === 0) {
      try {
        console.log("Doctor registration data:", doctorForm)
        onLogin("doctor", `doctor_${doctorForm.email}`)
      } catch (err) {
        setError("Registration failed. Please try again.")
      }
    } else {
      setFormErrors(errors)
    }
  }

  const handleSubmit = async () => {
    try {
      if (email && password) {
        onLogin(role, role === "patient" ? `patient_${email}` : `doctor_${email}`)
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.")
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

          <div className="space-y-4">
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
              onClick={handleDoctorRegister}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-700 transition-all text-sm"
            >
              Register as Doctor
            </button>

            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
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

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <div className="space-y-4">
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
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 px-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 text-sm"
          >
            Sign In
          </button>
        </div>

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

export default Login
