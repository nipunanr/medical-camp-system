import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Path to .env.local file
    const envPath = path.join(process.cwd(), '.env')
    
    // Read current .env.local content
    let envContent = ''
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
    }
    
    // Update NEXT_PUBLIC_MAINTENANCE_MODE to false
    const maintenanceLine = `NEXT_PUBLIC_MAINTENANCE_MODE=false`
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
      message: 'Maintenance mode has been turned OFF. Please restart the server for changes to take effect.',
      maintenanceMode: false,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error disabling maintenance mode:', error)
    return NextResponse.json({ 
      error: 'Failed to disable maintenance mode',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}