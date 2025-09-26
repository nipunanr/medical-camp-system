import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
    return NextResponse.json({ maintenanceMode })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get maintenance status' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { maintenanceMode } = await request.json()
    
    // Path to .env file
    const envPath = path.join(process.cwd(), '.env')
    
    // Read current .env content
    let envContent = ''
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }
    
    // Update or add NEXT_PUBLIC_MAINTENANCE_MODE
    const maintenanceLine = `NEXT_PUBLIC_MAINTENANCE_MODE=${maintenanceMode}`
    const lines = envContent.split('\n')
    
    // Find and replace existing line or add new one
    let found = false
    const updatedLines = lines.map(line => {
      if (line.startsWith('NEXT_PUBLIC_MAINTENANCE_MODE=')) {
        found = true
        return maintenanceLine
      }
      return line
    })
    
    if (!found) {
      updatedLines.push('')
      updatedLines.push('# Maintenance Mode Configuration')
      updatedLines.push(maintenanceLine)
    }
    
    // Write back to file
    fs.writeFileSync(envPath, updatedLines.join('\n'))
    
    return NextResponse.json({ 
      success: true, 
      message: 'Maintenance mode updated. Please restart the server for changes to take effect.',
      maintenanceMode 
    })
  } catch (error) {
    console.error('Error updating maintenance mode:', error)
    return NextResponse.json({ 
      error: 'Failed to update maintenance mode' 
    }, { status: 500 })
  }
}