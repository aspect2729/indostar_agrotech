# ⚠️ REMOVE BEFORE PRODUCTION

## Dev Login Files to Delete

These files bypass authentication and MUST be removed before deploying:

### Backend Files
- [ ] `backend/app/routes/dev_auth.py`

### Frontend Files
- [ ] `frontend/src/pages/DevLogin.tsx`

### Code Changes

**backend/main.py:**
```python
# REMOVE THIS LINE:
from app.routes import auth, products, inventory, orders, users, dev_auth

# REMOVE THIS LINE:
app.include_router(dev_auth.router, prefix="/api/auth", tags=["Development Auth"])

# KEEP ONLY:
from app.routes import auth, products, inventory, orders, users
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
```

**frontend/src/pages/index.ts:**
```typescript
// REMOVE THIS LINE:
export { default as DevLogin } from './DevLogin';
```

**frontend/src/App.tsx:**
```typescript
// REMOVE FROM IMPORTS:
import { 
  LoginPage,
  DevLogin,  // <-- REMOVE THIS
  HomePage,
  // ...
}

// REMOVE THIS ROUTE:
<Route path="/dev-login" element={<DevLogin />} />
```

## Verification Checklist

Before deploying to production:

- [ ] Deleted `backend/app/routes/dev_auth.py`
- [ ] Deleted `frontend/src/pages/DevLogin.tsx`
- [ ] Removed dev_auth import from `backend/main.py`
- [ ] Removed dev_auth router from `backend/main.py`
- [ ] Removed DevLogin export from `frontend/src/pages/index.ts`
- [ ] Removed DevLogin import from `frontend/src/App.tsx`
- [ ] Removed `/dev-login` route from `frontend/src/App.tsx`
- [ ] Added real Google OAuth credentials to `.env` files
- [ ] Tested regular Google OAuth login works
- [ ] Updated redirect URIs in Google Cloud Console

## Quick Removal Script

### Windows (PowerShell):
```powershell
# Backend
Remove-Item backend\app\routes\dev_auth.py

# Frontend
Remove-Item frontend\src\pages\DevLogin.tsx

# Then manually edit:
# - backend/main.py
# - frontend/src/pages/index.ts
# - frontend/src/App.tsx
```

### Mac/Linux:
```bash
# Backend
rm backend/app/routes/dev_auth.py

# Frontend
rm frontend/src/pages/DevLogin.tsx

# Then manually edit:
# - backend/main.py
# - frontend/src/pages/index.ts
# - frontend/src/App.tsx
```

## After Removal

1. Restart backend server
2. Restart frontend server
3. Test regular login at `http://localhost:3000/login`
4. Verify Google OAuth works correctly
5. Test all three user roles

## Security Note

The dev login endpoint:
- Creates users without verification
- Bypasses all authentication
- Allows anyone to become any role
- Should NEVER be in production

**Leaving it in production is a critical security vulnerability!**

---

**Set a reminder to remove these files before deploying! ⚠️**
