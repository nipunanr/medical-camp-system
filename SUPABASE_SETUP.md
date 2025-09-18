# Supabase Setup Guide for Medical Camp System

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login and click "New Project"
3. Choose your organization
4. Project details:
   - **Name**: medical-camp-system
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

## 2. Get Connection Details

Once your project is ready:

1. Go to **Settings** > **Database**
2. Scroll down to **Connection string**
3. Copy the **URI** format connection string

Your connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

## 3. Get API Keys

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** (starts with https://)
   - **anon public** key
   - **service_role** key (keep secret!)

## 4. Update Environment Variables

Replace the content of your `.env` file with:

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Optional: Supabase Project Details
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
```

## 5. Next Steps

After updating your `.env` file:

1. Run `npx prisma generate` to regenerate the Prisma client
2. Run `npx prisma db push` to create tables in Supabase
3. Test the connection locally
4. Deploy to Vercel with environment variables

## Notes

- Keep your database password and service role key secret
- The `DIRECT_URL` is the same as `DATABASE_URL` for Supabase
- Environment variables in Vercel need to be set separately in the dashboard