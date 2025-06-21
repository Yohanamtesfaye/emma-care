
"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Bot, User, MessageCircle, Baby, Stethoscope, Loader } from "lucide-react"

const AIChat = ({ user, userRole, onLogout }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI health assistant. I can help answer questions about maternal health, pregnancy, and general wellness. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateAIResponse = async (userMessage) => {
    // Simulate AI response based on keywords
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("pregnancy") || lowerMessage.includes("pregnant")) {
      return "During pregnancy, it's important to maintain regular prenatal checkups, eat a balanced diet rich in folic acid and iron, stay hydrated, and get adequate rest. Always consult with your healthcare provider for personalized advice."
    } else if (lowerMessage.includes("heart rate") || lowerMessage.includes("pulse")) {
      return "A normal resting heart rate for adults is typically 60-100 beats per minute. During pregnancy, it's common for heart rate to increase by 10-20 beats per minute. If you notice any unusual patterns, please consult your doctor."
    } else if (lowerMessage.includes("blood pressure")) {
      return "Normal blood pressure is generally below 120/80 mmHg. During pregnancy, blood pressure changes are common. High blood pressure (>140/90) during pregnancy requires immediate medical attention as it could indicate preeclampsia."
    } else if (lowerMessage.includes("temperature") || lowerMessage.includes("fever")) {
      return "Normal body temperature ranges from 97°F to 99°F (36.1°C to 37.2°C). A fever during pregnancy (>100.4°F or 38°C) should be evaluated by a healthcare provider, especially if accompanied by other symptoms."
    } else if (lowerMessage.includes("nutrition") || lowerMessage.includes("diet")) {
      return "A healthy pregnancy diet should include plenty of fruits, vegetables, whole grains, lean proteins, and dairy. Key nutrients include folic acid, iron, calcium, and omega-3 fatty acids. Avoid raw fish, unpasteurized products, and limit caffeine."
    } else if (lowerMessage.includes("exercise") || lowerMessage.includes("workout")) {
      return "Moderate exercise during pregnancy is generally safe and beneficial. Activities like walking, swimming, and prenatal yoga are excellent choices. Always consult your healthcare provider before starting any exercise routine during pregnancy."
    } else if (lowerMessage.includes("sleep") || lowerMessage.includes("rest")) {
      return "Adequate sleep is crucial during pregnancy. Aim for 7-9 hours per night. Sleep on your side (preferably left) after the first trimester, use pillows for support, and maintain a consistent sleep schedule."
    } else if (lowerMessage.includes("stress") || lowerMessage.includes("anxiety")) {
      return "Managing stress during pregnancy is important for both mother and baby. Try relaxation techniques like deep breathing, meditation, prenatal yoga, or talking to a counselor. Don't hesitate to reach out for support."
    } else {
      return "I understand your concern. For specific medical questions or symptoms, I always recommend consulting with your healthcare provider who can give you personalized advice based on your individual situation. Is there anything else about general health and wellness I can help you with?"
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simulate AI processing time
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputMessage)
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "What should I eat during pregnancy?",
    "Is my heart rate normal?",
    "How much exercise is safe?",
    "What are signs of complications?",
    "How to manage pregnancy stress?",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => navigate(userRole === "patient" ? "/patient" : "/doctor")}
                className="p-2 hover:bg-gray-100 rounded-full mr-3 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 rounded-lg mr-2">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">AI Health Assistant</h1>
                <p className="text-xs text-gray-600">Get instant health guidance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1 rounded-lg mr-1">
                  {userRole === "patient" ? (
                    <Baby className="w-3 h-3 text-white" />
                  ) : (
                    <Stethoscope className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-xs text-gray-600 capitalize">{userRole}</span>
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

      <main className="max-w-4xl mx-auto px-4 py-4 h-[calc(100vh-80px)] flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div className={`p-2 rounded-full ${message.sender === "user" ? "bg-purple-100" : "bg-blue-100"}`}>
                    {message.sender === "user" ? (
                      <User className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender === "user" ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === "user" ? "text-purple-200" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <div className="p-2 rounded-full bg-blue-100">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin text-blue-600" />
                      <p className="text-sm">AI is thinking...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-xs bg-white hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about pregnancy, health monitoring, or general wellness..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 This AI assistant provides general information only. Always consult your healthcare provider for
              medical advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AIChat
