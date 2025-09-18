# Medical Camp Management System

A comprehensive web-based solution for managing medical camps with registration, testing, medicine dispensing, and reporting capabilities.

## Features

### ✅ Implemented
- **Patient Registration**: Complete registration form with demographics, health metrics, and test selection
- **Test Type Management**: CRUD interface for managing medical tests and their configurations
- **Medicine Management**: Inventory management for medicines with stock tracking
- **Prescription Printing**: A5 format prescription sheets with QR codes
- **Satisfaction Rating**: Touch-optimized rating system for patient feedback
- **Touch-Optimized UI**: Modern, responsive design for tablet/touch screen usage

### 🚧 Planned Features
- **QR Code Scanning**: Medicine dispensing with QR code scanning
- **Lab Results Entry**: Interface for entering test results
- **Report Generation**: Comprehensive patient reports with all test results
- **Barcode Generation**: Test sample tracking with barcodes
- **Advanced Analytics**: Camp statistics and reporting

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **UI Components**: Headless UI, Heroicons
- **QR/Barcode**: qrcode, jsbarcode libraries
- **Deployment**: Vercel

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd medical-camp-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The system uses the following main entities:
- **Patients**: Patient demographic and health information
- **Registrations**: Camp registration records with QR codes
- **TestTypes**: Configurable medical tests
- **Medicines**: Medicine inventory management
- **TestResults**: Laboratory test results
- **SatisfactionRatings**: Patient feedback

## Usage

### Patient Registration
1. Navigate to "Patient Registration" from the main menu
2. Fill in patient details (name, address, contact, DOB, gender)
3. Enter health metrics (weight, height - BMI auto-calculated)
4. Select required medical tests
5. Submit to generate QR code and print prescription sheet

### Test Type Management
1. Go to "Test Type Master" to manage available tests
2. Add new test types with configuration options:
   - Result entry required
   - Print sheet required
   - Barcode required

### Medicine Management
1. Access "Medicine Management" to maintain inventory
2. Add medicines with dosage and stock information
3. Monitor stock levels with low-stock warnings

### Satisfaction Rating
1. Patients can rate their experience on the satisfaction page
2. Touch-friendly star rating system (1-5 stars)
3. Optional feedback comments

## Deployment

### Vercel Deployment
1. **Prepare for deployment**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel
   ```

3. **Set up environment variables** in Vercel dashboard:
   - `DATABASE_URL`: SQLite database URL

## Print Functionality

The system generates A5-format printable documents:
- **Prescription Sheets**: Patient details with QR code for doctor consultation
- **Test Sheets**: For tests requiring printed data collection
- **Barcode Labels**: For sample tracking (planned)

## Touch Screen Optimization

All interfaces are optimized for touch screens:
- Large touch targets (minimum 44px)
- Clear visual feedback
- Simplified navigation
- Responsive design for tablets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ for improving healthcare accessibility in medical camps.
