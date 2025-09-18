import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const satisfactionRating = await prisma.satisfactionRating.create({
      data: {
        rating: data.rating,
        feedback: data.feedback || null,
      }
    })
    
    return NextResponse.json(satisfactionRating)
  } catch (error) {
    console.error('Error creating satisfaction rating:', error)
    return NextResponse.json(
      { error: 'Failed to create satisfaction rating' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const ratings = await prisma.satisfactionRating.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Error fetching satisfaction ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch satisfaction ratings' },
      { status: 500 }
    )
  }
}