// AI Engine for Maternal Health Monitoring
class MaternalHealthAI {
  constructor() {
    this.knowledgeBase = this.initializeKnowledgeBase()
    this.context = {
      currentVitals: null,
      pregnancyWeek: 32,
      userRole: 'patient',
      conversationHistory: []
    }
  }

  // Initialize comprehensive knowledge base
  initializeKnowledgeBase() {
    return {
      // Vital Signs Knowledge
      vitals: {
        heart_rate: {
          normal: { min: 60, max: 100, pregnancy_adjustment: 10 },
          warning: { min: 100, max: 120 },
          critical: { min: 0, max: 50, high: 120 },
          advice: {
            normal: "Your heart rate is within normal range for pregnancy.",
            elevated: "Elevated heart rate may indicate stress, dehydration, or fever. Try deep breathing exercises and stay hydrated.",
            high: "High heart rate requires immediate attention. Contact your doctor.",
            low: "Low heart rate may indicate underlying issues. Seek medical attention."
          }
        },
        spo2: {
          normal: { min: 95, max: 100 },
          warning: { min: 90, max: 95 },
          critical: { min: 0, max: 90 },
          advice: {
            normal: "Your oxygen levels are healthy.",
            low: "Low oxygen levels may indicate respiratory issues. Sit upright, take deep breaths, and contact your doctor.",
            critical: "Critical oxygen levels require immediate medical attention."
          }
        },
        temperature: {
          normal: { min: 36.1, max: 37.2 },
          warning: { min: 37.3, max: 38.0 },
          critical: { min: 0, max: 36.0, high: 38.0 },
          advice: {
            normal: "Your temperature is normal.",
            elevated: "Elevated temperature may indicate infection. Rest, stay hydrated, and monitor closely.",
            fever: "Fever during pregnancy requires medical attention. Contact your doctor immediately.",
            low: "Low temperature may indicate hypothermia. Warm up gradually and seek medical help."
          }
        },
        blood_pressure: {
          normal: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
          warning: { systolic: { min: 140, max: 160 }, diastolic: { min: 90, max: 100 } },
          critical: { systolic: { min: 0, max: 90, high: 160 }, diastolic: { min: 0, max: 60, high: 100 } },
          advice: {
            normal: "Your blood pressure is within healthy range.",
            elevated: "Elevated blood pressure may indicate preeclampsia. Monitor closely and contact your doctor.",
            high: "High blood pressure requires immediate medical attention.",
            low: "Low blood pressure may cause dizziness. Sit or lie down and contact your doctor."
          }
        }
      },

      // Pregnancy-specific knowledge
      pregnancy: {
        nutrition: {
          essential_nutrients: ["folic acid", "iron", "calcium", "omega-3", "vitamin D"],
          foods_to_avoid: ["raw fish", "unpasteurized dairy", "undercooked meat", "excess caffeine"],
          recommendations: [
            "Eat plenty of fruits and vegetables",
            "Include lean proteins and whole grains",
            "Stay hydrated with 8-10 glasses of water daily",
            "Take prenatal vitamins as prescribed"
          ]
        },
        exercise: {
          safe_activities: ["walking", "swimming", "prenatal yoga", "gentle stretching"],
          avoid: ["high-impact sports", "contact sports", "hot yoga", "scuba diving"],
          recommendations: [
            "Aim for 30 minutes of moderate exercise daily",
            "Listen to your body and rest when needed",
            "Stay hydrated during exercise",
            "Avoid lying flat on your back after first trimester"
          ]
        },
        symptoms: {
          normal: ["morning sickness", "fatigue", "mood swings", "back pain", "swelling"],
          concerning: ["severe headache", "vision changes", "severe abdominal pain", "bleeding", "decreased fetal movement"],
          emergency: ["severe bleeding", "water breaking", "severe pain", "fainting", "chest pain"]
        }
      },

      // Health monitoring patterns
      patterns: {
        stress_indicators: ["elevated heart rate", "high blood pressure", "rapid breathing"],
        dehydration_signs: ["elevated heart rate", "low blood pressure", "dizziness"],
        infection_indicators: ["fever", "elevated heart rate", "fatigue"],
        preeclampsia_signs: ["high blood pressure", "headache", "vision changes", "swelling"]
      }
    }
  }

  // Analyze current vital signs
  analyzeVitals(vitals) {
    const analysis = {
      overall_status: 'normal',
      concerns: [],
      recommendations: [],
      alerts: []
    }

    // Analyze each vital sign
    Object.keys(vitals).forEach(vitalType => {
      if (vitals[vitalType] !== null && vitals[vitalType] !== -127) {
        const vitalData = this.knowledgeBase.vitals[vitalType]
        const value = vitals[vitalType]
        
        let status = 'normal'
        let advice = vitalData.advice.normal

        // Determine status based on ranges
        if (vitalType === 'blood_pressure') {
          const systolic = vitals.systolic
          if (systolic < vitalData.critical.systolic.min || systolic > vitalData.critical.systolic.high) {
            status = 'critical'
            advice = systolic > vitalData.critical.systolic.high ? vitalData.advice.high : vitalData.advice.low
          } else if (systolic > vitalData.warning.systolic.min) {
            status = 'warning'
            advice = vitalData.advice.elevated
          }
        } else {
          if (value < vitalData.critical.min || value > vitalData.critical.high) {
            status = 'critical'
            advice = value > vitalData.critical.high ? vitalData.advice.high : vitalData.advice.low
          } else if (value > vitalData.warning.min) {
            status = 'warning'
            advice = vitalData.advice.elevated
          }
        }

        // Add to analysis
        if (status !== 'normal') {
          analysis.concerns.push({
            vital: vitalType,
            value: value,
            status: status,
            advice: advice
          })
          
          if (status === 'critical') {
            analysis.alerts.push(`${vitalType.replace('_', ' ')} is critical: ${value}`)
            analysis.overall_status = 'critical'
          } else if (analysis.overall_status === 'normal') {
            analysis.overall_status = 'warning'
          }
        }
      }
    })

    // Pattern recognition
    this.recognizePatterns(vitals, analysis)

    return analysis
  }

  // Recognize health patterns
  recognizePatterns(vitals, analysis) {
    // Stress pattern
    if (vitals.heart_rate > 100 && vitals.systolic > 140) {
      analysis.concerns.push({
        pattern: 'stress',
        advice: "Your vitals suggest stress. Try deep breathing, meditation, or gentle exercise."
      })
    }

    // Dehydration pattern
    if (vitals.heart_rate > 100 && vitals.systolic < 90) {
      analysis.concerns.push({
        pattern: 'dehydration',
        advice: "Your vitals suggest dehydration. Increase fluid intake immediately."
      })
    }

    // Infection pattern
    if (vitals.temperature > 37.5 && vitals.heart_rate > 100) {
      analysis.concerns.push({
        pattern: 'possible_infection',
        advice: "Your vitals suggest possible infection. Monitor closely and contact your doctor."
      })
    }

    // Preeclampsia pattern
    if (vitals.systolic > 140 && vitals.temperature > 37.5) {
      analysis.concerns.push({
        pattern: 'preeclampsia_risk',
        advice: "Your vitals suggest risk of preeclampsia. Contact your doctor immediately."
      })
    }
  }

  // Generate personalized health tips
  generateHealthTips(vitals, pregnancyWeek = 32) {
    const analysis = this.analyzeVitals(vitals)
    const tips = []

    // Add vital-specific tips
    analysis.concerns.forEach(concern => {
      tips.push({
        type: 'vital',
        priority: concern.status === 'critical' ? 'high' : 'medium',
        title: `${concern.vital.replace('_', ' ').toUpperCase()} Alert`,
        message: concern.advice,
        icon: this.getVitalIcon(concern.vital)
      })
    })

    // Add pregnancy week-specific tips
    const weekTips = this.getPregnancyWeekTips(pregnancyWeek)
    tips.push(...weekTips)

    // Add general wellness tips
    tips.push({
      type: 'wellness',
      priority: 'low',
      title: 'Daily Wellness',
      message: 'Stay hydrated, get adequate rest, and maintain gentle physical activity.',
      icon: 'heart'
    })

    return tips.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Get pregnancy week-specific tips
  getPregnancyWeekTips(week) {
    const tips = []
    
    if (week >= 30 && week <= 35) {
      tips.push({
        type: 'pregnancy',
        priority: 'medium',
        title: 'Third Trimester Care',
        message: 'Monitor fetal movements daily. Contact your doctor if you notice decreased movement.',
        icon: 'baby'
      })
    }

    if (week >= 35) {
      tips.push({
        type: 'pregnancy',
        priority: 'medium',
        title: 'Preparing for Delivery',
        message: 'Pack your hospital bag and review your birth plan with your healthcare provider.',
        icon: 'calendar'
      })
    }

    return tips
  }

  // Get vital icon
  getVitalIcon(vital) {
    const icons = {
      heart_rate: 'heart',
      spo2: 'activity',
      temperature: 'thermometer',
      blood_pressure: 'activity'
    }
    return icons[vital] || 'activity'
  }

  // Process user questions and generate responses
  async processQuestion(question, vitals = null, userRole = 'patient') {
    const lowerQuestion = question.toLowerCase()
    let response = {
      text: '',
      confidence: 0.8,
      suggestions: [],
      vital_context: null
    }

    // Update context
    if (vitals) {
      this.context.currentVitals = vitals
    }
    this.context.userRole = userRole

    // Vital signs questions
    if (lowerQuestion.includes('heart rate') || lowerQuestion.includes('pulse')) {
      response = this.handleHeartRateQuestion(lowerQuestion, vitals)
    } else if (lowerQuestion.includes('oxygen') || lowerQuestion.includes('spo2')) {
      response = this.handleOxygenQuestion(lowerQuestion, vitals)
    } else if (lowerQuestion.includes('temperature') || lowerQuestion.includes('fever')) {
      response = this.handleTemperatureQuestion(lowerQuestion, vitals)
    } else if (lowerQuestion.includes('blood pressure') || lowerQuestion.includes('bp')) {
      response = this.handleBloodPressureQuestion(lowerQuestion, vitals)
    }
    // Nutrition questions
    else if (lowerQuestion.includes('eat') || lowerQuestion.includes('diet') || lowerQuestion.includes('nutrition')) {
      response = this.handleNutritionQuestion(lowerQuestion)
    }
    // Exercise questions
    else if (lowerQuestion.includes('exercise') || lowerQuestion.includes('workout') || lowerQuestion.includes('activity')) {
      response = this.handleExerciseQuestion(lowerQuestion)
    }
    // Symptom questions
    else if (lowerQuestion.includes('symptom') || lowerQuestion.includes('normal') || lowerQuestion.includes('concerning')) {
      response = this.handleSymptomQuestion(lowerQuestion)
    }
    // General pregnancy questions
    else if (lowerQuestion.includes('pregnancy') || lowerQuestion.includes('pregnant')) {
      response = this.handlePregnancyQuestion(lowerQuestion)
    }
    // Emergency questions
    else if (lowerQuestion.includes('emergency') || lowerQuestion.includes('urgent') || lowerQuestion.includes('danger')) {
      response = this.handleEmergencyQuestion(lowerQuestion)
    }
    // Default response
    else {
      response = this.handleGeneralQuestion(lowerQuestion)
    }

    // Add context-aware suggestions
    response.suggestions = this.generateSuggestions(lowerQuestion, vitals)

    return response
  }

  // Handle specific question types
  handleHeartRateQuestion(question, vitals) {
    let response = {
      text: "A normal resting heart rate for adults is typically 60-100 beats per minute. During pregnancy, it's common for heart rate to increase by 10-20 beats per minute.",
      confidence: 0.9,
      vital_context: 'heart_rate'
    }

    if (vitals && vitals.heart_rate) {
      const hr = vitals.heart_rate
      if (hr > 120) {
        response.text = `Your current heart rate is ${Math.round(hr)} BPM, which is elevated. This may indicate stress, fever, or other concerns. I recommend contacting your doctor and trying relaxation techniques.`
        response.confidence = 0.95
      } else if (hr > 100) {
        response.text = `Your current heart rate is ${Math.round(hr)} BPM, which is slightly elevated. This is common during pregnancy but monitor it closely. Try deep breathing exercises and stay hydrated.`
        response.confidence = 0.9
      } else if (hr < 50) {
        response.text = `Your current heart rate is ${Math.round(hr)} BPM, which is lower than normal. This may indicate an underlying issue. Please contact your doctor immediately.`
        response.confidence = 0.95
      } else {
        response.text = `Your current heart rate is ${Math.round(hr)} BPM, which is within normal range for pregnancy. Continue monitoring and maintain healthy habits.`
        response.confidence = 0.9
      }
    }

    return response
  }

  handleOxygenQuestion(question, vitals) {
    let response = {
      text: "Normal oxygen saturation (SpO2) is 95-100%. During pregnancy, levels should remain above 95%.",
      confidence: 0.9,
      vital_context: 'spo2'
    }

    if (vitals && vitals.spo2) {
      const spo2 = vitals.spo2
      if (spo2 < 90) {
        response.text = `Your current oxygen level is ${spo2.toFixed(1)}%, which is critically low. This requires immediate medical attention. Please contact your doctor or go to the emergency room.`
        response.confidence = 0.95
      } else if (spo2 < 95) {
        response.text = `Your current oxygen level is ${spo2.toFixed(1)}%, which is below normal. This may indicate respiratory issues. Sit upright, take deep breaths, and contact your doctor.`
        response.confidence = 0.9
      } else {
        response.text = `Your current oxygen level is ${spo2.toFixed(1)}%, which is healthy. Continue monitoring and maintain good respiratory health.`
        response.confidence = 0.9
      }
    }

    return response
  }

  handleTemperatureQuestion(question, vitals) {
    let response = {
      text: "Normal body temperature ranges from 97°F to 99°F (36.1°C to 37.2°C). A fever during pregnancy (>100.4°F or 38°C) should be evaluated by a healthcare provider.",
      confidence: 0.9,
      vital_context: 'temperature'
    }

    if (vitals && vitals.temperature) {
      const temp = vitals.temperature
      const tempF = (temp * 9/5) + 32
      
      if (temp > 38.0) {
        response.text = `Your current temperature is ${temp.toFixed(1)}°C (${tempF.toFixed(1)}°F), which indicates a fever. This requires immediate medical attention during pregnancy. Contact your doctor immediately.`
        response.confidence = 0.95
      } else if (temp > 37.5) {
        response.text = `Your current temperature is ${temp.toFixed(1)}°C (${tempF.toFixed(1)}°F), which is elevated. This may indicate infection. Rest, stay hydrated, and contact your doctor if it persists.`
        response.confidence = 0.9
      } else {
        response.text = `Your current temperature is ${temp.toFixed(1)}°C (${tempF.toFixed(1)}°F), which is normal. Continue monitoring and maintain good health practices.`
        response.confidence = 0.9
      }
    }

    return response
  }

  handleBloodPressureQuestion(question, vitals) {
    let response = {
      text: "Normal blood pressure is generally below 120/80 mmHg. During pregnancy, blood pressure changes are common. High blood pressure (>140/90) requires immediate medical attention.",
      confidence: 0.9,
      vital_context: 'blood_pressure'
    }

    if (vitals && vitals.systolic) {
      const systolic = vitals.systolic
      if (systolic > 160) {
        response.text = `Your current systolic blood pressure is ${systolic.toFixed(0)} mmHg, which is critically high. This may indicate preeclampsia and requires immediate medical attention. Contact your doctor immediately.`
        response.confidence = 0.95
      } else if (systolic > 140) {
        response.text = `Your current systolic blood pressure is ${systolic.toFixed(0)} mmHg, which is elevated. This may indicate preeclampsia risk. Monitor closely and contact your doctor.`
        response.confidence = 0.9
      } else if (systolic < 90) {
        response.text = `Your current systolic blood pressure is ${systolic.toFixed(0)} mmHg, which is low. This may cause dizziness. Sit or lie down and contact your doctor.`
        response.confidence = 0.9
      } else {
        response.text = `Your current systolic blood pressure is ${systolic.toFixed(0)} mmHg, which is within normal range. Continue monitoring and maintain healthy habits.`
        response.confidence = 0.9
      }
    }

    return response
  }

  handleNutritionQuestion(question) {
    const nutrition = this.knowledgeBase.pregnancy.nutrition
    return {
      text: `A healthy pregnancy diet should include: ${nutrition.recommendations.join(', ')}. Essential nutrients include ${nutrition.essential_nutrients.join(', ')}. Avoid ${nutrition.foods_to_avoid.join(', ')}.`,
      confidence: 0.9,
      suggestions: ['What foods are safe?', 'How much water should I drink?', 'What vitamins do I need?']
    }
  }

  handleExerciseQuestion(question) {
    const exercise = this.knowledgeBase.pregnancy.exercise
    return {
      text: `Safe pregnancy exercises include: ${exercise.safe_activities.join(', ')}. ${exercise.recommendations.join(' ')} Avoid ${exercise.avoid.join(', ')}.`,
      confidence: 0.9,
      suggestions: ['What exercises are safe?', 'How much should I exercise?', 'When should I stop exercising?']
    }
  }

  handleSymptomQuestion(question) {
    const symptoms = this.knowledgeBase.pregnancy.symptoms
    return {
      text: `Normal pregnancy symptoms include: ${symptoms.normal.join(', ')}. Concerning symptoms requiring medical attention: ${symptoms.concerning.join(', ')}. Emergency symptoms: ${symptoms.emergency.join(', ')}.`,
      confidence: 0.9,
      suggestions: ['What symptoms are normal?', 'When should I call my doctor?', 'What are emergency signs?']
    }
  }

  handlePregnancyQuestion(question) {
    return {
      text: "During pregnancy, it's important to maintain regular prenatal checkups, eat a balanced diet rich in folic acid and iron, stay hydrated, get adequate rest, and exercise moderately. Always consult with your healthcare provider for personalized advice.",
      confidence: 0.8,
      suggestions: ['What should I eat?', 'How much exercise is safe?', 'What symptoms are normal?']
    }
  }

  handleEmergencyQuestion(question) {
    return {
      text: "If you're experiencing severe symptoms like bleeding, severe pain, decreased fetal movement, or other concerning signs, contact your doctor immediately or go to the emergency room. Don't wait for symptoms to improve on their own.",
      confidence: 0.95,
      suggestions: ['Call your doctor', 'Go to emergency room', 'What are emergency signs?']
    }
  }

  handleGeneralQuestion(question) {
    return {
      text: "I understand your concern. For specific medical questions or symptoms, I always recommend consulting with your healthcare provider who can give you personalized advice based on your individual situation. Is there anything specific about your vital signs or pregnancy health I can help you with?",
      confidence: 0.7,
      suggestions: ['Check my vital signs', 'Pregnancy nutrition', 'Exercise safety', 'Common symptoms']
    }
  }

  // Generate contextual suggestions
  generateSuggestions(question, vitals) {
    const suggestions = []
    
    if (vitals) {
      if (vitals.heart_rate > 100) {
        suggestions.push('Why is my heart rate elevated?')
      }
      if (vitals.spo2 < 95) {
        suggestions.push('What does low oxygen mean?')
      }
      if (vitals.temperature > 37.5) {
        suggestions.push('Is my temperature normal?')
      }
      if (vitals.systolic > 140) {
        suggestions.push('What does high blood pressure mean?')
      }
    }

    if (question.includes('pregnancy')) {
      suggestions.push('Pregnancy nutrition', 'Safe exercises', 'Common symptoms')
    }

    return suggestions.slice(0, 3)
  }

  // Update context with conversation history
  updateContext(conversationHistory) {
    this.context.conversationHistory = conversationHistory.slice(-5) // Keep last 5 messages
  }
}

// Create singleton instance
const maternalHealthAI = new MaternalHealthAI()

export default maternalHealthAI 