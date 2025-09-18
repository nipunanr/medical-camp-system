'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'

export default function SatisfactionPage() {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback })
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setRating(0)
          setFeedback('')
        }, 3000)
      } else {
        throw new Error('Failed to submit rating')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating')
    } finally {
      setLoading(false)
    }
  }

  const ratingTexts = [
    '',
    'Very Poor',
    'Poor', 
    'Average',
    'Good',
    'Excellent'
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md w-full">
          <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Your feedback has been submitted successfully.
          </p>
          <p className="text-gray-500">
            We appreciate your time and will continue to improve our services.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/" className="mr-4 p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <StarIcon className="h-8 w-8 text-pink-600 mr-3" />
              Satisfaction Rating
            </h1>
            <p className="text-gray-600">Please rate your experience with our medical camp</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          {/* Rating Question */}
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How was your experience today?
            </h2>
            <p className="text-gray-600 text-lg">
              Your feedback helps us improve our services
            </p>
          </div>

          {/* Star Rating */}
          <div className="text-center mb-8">
            <div className="flex justify-center space-x-4 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="p-2 transition-all transform hover:scale-110 touch-manipulation"
                >
                  {star <= rating ? (
                    <StarSolid className="h-16 w-16 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-16 w-16 text-gray-300 hover:text-yellow-200" />
                  )}
                </button>
              ))}
            </div>
            
            {rating > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800 mb-2">
                  {ratingTexts[rating]}
                </p>
                <p className="text-gray-600">
                  {rating} out of 5 stars
                </p>
              </div>
            )}
          </div>

          {/* Feedback Text */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              Additional Comments (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent touch-manipulation text-lg"
              placeholder="Tell us more about your experience..."
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 text-white font-bold py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation text-xl disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Submitting...
                </div>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Your feedback is anonymous and helps us provide better care
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}