# Deployment Guide: Vercel + Neon PostgreSQL

This guide will walk you through deploying your CodeReview application to Vercel with Neon PostgreSQL database.

---

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Neon account (sign up at [neon.tech](https://neon.tech))
- Git installed on your local machine

---

## 🗄️ Part 1: Setting Up Neon PostgreSQL Database

### Step 1: Create a Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Click **Sign Up** and create an account (you can use GitHub)
3. Verify your email if required

### Step 2: Create a New Project
1. Once logged in, click **Create a project** or **New Project**
2. Fill in the project details:
   - **Project name**: `code-review-db` (or your preferred name)
   - **Region**: Choose the closest region to your target users
   - **PostgreSQL version**: 16 (recommended, or latest stable)
3. Click **Create Project**

### Step 3: Get Database Connection String
1. After project creation, you'll see the **Connection Details** page
2. Select **Prisma** from the connection string options
3. Copy the connection string - it will look like:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
   ```
4. **Save this connection string** - you'll need it for both local setup and Vercel deployment

### Step 4: Note Additional Connection Details
Make note of these details (you might need them):
- **Host**: `ep-xxx.region.aws.neon.tech`
- **Database name**: Usually `neondb`
- **Username**: Your Neon username
- **Password**: Your generated password
- **Port**: `5432` (default PostgreSQL port)

---

## 💻 Part 2: Local Setup and Testing

### Step 1: Update Environment Variables
1. Open your `.env` file in the project root
2. Update the `DATABASE_URL` with your Neon connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
   ```

### Step 2: Run Database Migrations
1. Open your terminal in the project directory
2. Run Prisma migration to create tables in Neon:
   ```bash
   npx prisma migrate deploy
   ```
3. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

### Step 3: (Optional) Seed Initial Data
If you have seed data, run:
```bash
npx prisma db seed
```

### Step 4: Test Locally
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Visit `http://localhost:3000` and test:
   - Admin login works
   - Can create candidates, problems, etc.
   - Database operations are successful
3. If everything works, you're ready to deploy!

---

## 🚀 Part 3: Deploying to Vercel

### Step 1: Prepare Your Repository
1. Ensure all your code is committed to Git:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   ```

2. Push to GitHub:
   ```bash
   git push origin feature/admin-api-integration
   ```
   
3. **(Optional)** Merge to main branch if ready for production:
   ```bash
   git checkout main
   git merge feature/admin-api-integration
   git push origin main
   ```

### Step 2: Import Project to Vercel
1. Go to [vercel.com](https://vercel.com) and log in
2. Click **Add New** → **Project**
3. Import your GitHub repository:
   - Click **Import Git Repository**
   - Select your `code-review-v2` repository
   - Click **Import**

### Step 3: Configure Project Settings
1. **Project Name**: Leave default or customize
2. **Framework Preset**: Should auto-detect as **Next.js**
3. **Root Directory**: Leave as `./` (root)
4. **Build Command**: `npm run build` or `next build`
5. **Output Directory**: `.next`
6. **Install Command**: `npm install`

### Step 4: Configure Environment Variables
1. In the **Environment Variables** section, add all variables from your `.env` file:

   ```env
   # Database
   DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secret-here
   NEXTAUTH_URL=https://your-app.vercel.app

   # Any other environment variables your app uses
   ```

   **Important Variables:**
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate a secure secret (see below)
   - `NEXTAUTH_URL`: Will be `https://your-app.vercel.app` (update after deployment)

2. To generate a secure `NEXTAUTH_SECRET`, run in terminal:
   ```bash
   openssl rand -base64 32
   ```
   Or use: https://generate-secret.vercel.app/32

### Step 5: Deploy
1. Click **Deploy**
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, Vercel will show you the deployment URL

### Step 6: Update NEXTAUTH_URL
1. Copy your deployment URL (e.g., `https://your-app.vercel.app`)
2. Go to **Project Settings** → **Environment Variables**
3. Edit the `NEXTAUTH_URL` variable and update it with your actual deployment URL
4. Click **Save**
5. **Redeploy** the application:
   - Go to **Deployments** tab
   - Click on the latest deployment
   - Click **Redeploy**

---

## 🔧 Part 4: Post-Deployment Configuration

### Step 1: Run Database Migrations on Production
Vercel automatically runs `prisma generate` during build, but you may need to ensure migrations are applied:

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migration
vercel env pull .env.production.local
npx prisma migrate deploy
```

**Option B: Add Build Command in vercel.json**
Create a `vercel.json` file in your project root:
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build"
}
```

### Step 2: Create Admin User
1. You'll need to manually create an admin user in the database
2. Access Neon Console:
   - Go to [console.neon.tech](https://console.neon.tech)
   - Select your project
   - Go to **SQL Editor**

3. Run this SQL to create an admin user:
   ```sql
   INSERT INTO "User" (id, name, email, password, "userType", "adminRole", "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'Admin User',
     'admin@example.com',
     '$2a$10$YourHashedPasswordHere',  -- Use bcrypt to hash your password
     'ADMIN',
     'ADMIN',
     NOW(),
     NOW()
   );
   ```

4. To generate a bcrypt password hash, use Node.js:
   ```javascript
   const bcrypt = require('bcryptjs');
   const password = 'your-secure-password';
   bcrypt.hash(password, 10).then(hash => console.log(hash));
   ```

### Step 3: Test Your Deployment
1. Visit your deployment URL
2. Test key features:
   - ✅ Admin login at `/admin/login`
   - ✅ Create departments, positions, stacks
   - ✅ Create problems
   - ✅ Create candidates
   - ✅ Candidate login at `/login`
   - ✅ Candidate can take test
   - ✅ Admin can review submissions

---

## 🔒 Part 5: Security Best Practices

### Step 1: Secure Your Environment Variables
- ✅ Never commit `.env` files to Git (already in `.gitignore`)
- ✅ Use different `NEXTAUTH_SECRET` for production
- ✅ Rotate secrets periodically

### Step 2: Database Security
- ✅ Enable **IP Allow List** in Neon (optional but recommended)
- ✅ Use strong passwords
- ✅ Enable SSL connections (already enabled with `sslmode=require`)

### Step 3: Enable Vercel Security Features
1. Go to **Project Settings** → **Domains**
2. Add custom domain (optional)
3. Enable **HTTPS** (automatic with Vercel)
4. Consider adding **Vercel Password Protection** for staging

---

## 📊 Part 6: Monitoring and Maintenance

### Database Monitoring
1. Access Neon Dashboard → Your Project
2. Monitor:
   - **Queries**: Track database performance
   - **Storage**: Monitor database size
   - **Branches**: Use branches for staging (Neon feature)

### Application Monitoring
1. Vercel Dashboard → Your Project
2. Monitor:
   - **Deployments**: Track deployment history
   - **Analytics**: View traffic and performance
   - **Logs**: Debug issues in real-time

### Regular Maintenance
- 🔄 **Update dependencies** regularly
- 🗄️ **Backup database** (Neon provides automatic backups)
- 📈 **Monitor performance** and optimize queries
- 🔐 **Review security** settings periodically

---

## 🐛 Troubleshooting Common Issues

### Issue 1: Build Fails with Prisma Error
**Solution:**
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Add `prisma generate` to build command
- Check Prisma schema for errors

### Issue 2: Authentication Not Working
**Solution:**
- Verify `NEXTAUTH_URL` matches your deployment URL
- Ensure `NEXTAUTH_SECRET` is set
- Check that it includes `https://` in the URL

### Issue 3: Database Connection Timeout
**Solution:**
- Verify Neon connection string is correct
- Check if database is active (Neon auto-suspends after inactivity)
- Ensure `sslmode=require` is in connection string

### Issue 4: 500 Internal Server Error
**Solution:**
- Check Vercel logs: **Project** → **Deployments** → Click deployment → **Functions** tab
- Verify all environment variables are set
- Check database migrations are applied

### Issue 5: Monaco Editor Not Loading
**Solution:**
- Ensure Monaco Editor CDN is accessible
- Check browser console for errors
- Verify CSP (Content Security Policy) settings if any

---

## 🎉 Success Checklist

- ✅ Neon PostgreSQL database created and configured
- ✅ Database migrations applied successfully
- ✅ Application deployed to Vercel
- ✅ Environment variables configured
- ✅ `NEXTAUTH_URL` updated with production URL
- ✅ Admin user created in database
- ✅ Can login to admin panel
- ✅ Can create and manage resources
- ✅ Candidates can take tests
- ✅ Submissions are recorded properly

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## 🔄 Redeployment Process

When you make changes to your code:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Vercel will **automatically** deploy your changes

3. For manual deployment:
   - Go to Vercel Dashboard
   - Click **Deployments**
   - Click **Redeploy** on any previous deployment

---

## 🌐 Custom Domain Setup (Optional)

1. Go to **Project Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (usually 24-48 hours)

---

**🎊 Congratulations! Your application is now live in production!**

Access your app at: `https://your-app.vercel.app`
