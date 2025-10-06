# System Configuration Prompt

## Database Usage Policy

**CRITICAL REQUIREMENT: ALWAYS USE REMOTE SUPABASE DATABASE**

### Remote Database Configuration
- **Production URL**: `https://ecaamkrcsjrcjmcjshlu.supabase.co`
- **Environment**: Production/Remote only
- **Configuration File**: `.env` (already configured)

### Strict Rules

1. **NEVER use local Supabase database**
   - Do not run `supabase start`
   - Do not use `supabase db reset`
   - Do not apply local migrations or seed files
   - Do not connect to `http://localhost:54321`

2. **ALWAYS use remote Supabase database**
   - Use the configured remote URL: `https://ecaamkrcsjrcjmcjshlu.supabase.co`
   - All database operations must target the remote instance
   - Authentication and data operations use remote services only

3. **Environment Configuration**
   - The `.env` file is already properly configured for remote usage
   - `VITE_SUPABASE_URL=https://ecaamkrcsjrcjmcjshlu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` is set for remote access

### Development Workflow
- Use `npm run dev` for local development (connects to remote DB)
- All authentication flows use remote Supabase Auth
- All data operations use remote Supabase database
- Demo accounts and test data should be managed on the remote instance

### Enforcement
This configuration ensures:
- No local database dependencies
- Consistent data across all environments
- Production-ready authentication and data handling
- Simplified deployment and testing processes

**Remember: The local database should NEVER be used. All operations must target the remote Supabase instance.**