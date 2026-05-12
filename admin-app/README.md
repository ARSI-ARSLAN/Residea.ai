# Residea.ai Admin Panel

A dedicated admin dashboard for managing the Residea.ai platform — properties, users, and system statistics.

🛡️ **Live at:** http://localhost:3001

---

## Quick Start

```powershell
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

✅ Open **http://localhost:3001** in your browser.

> **Prerequisite:** The Django backend must be running at `http://localhost:8000`.
> ```powershell
> cd "e:\exp\phase1\Residea.ai_Frontend\Residea.ai_Frontend\backend"
> .\.venv\Scripts\activate
> python manage.py runserver
> ```

---

## Login Credentials

You need a **staff or superuser** account to access the admin panel.

| Field | Value |
|-------|-------|
| Email | `engr.arslanjd@gmail.com` |
| Password | `Admin@123` |

> To create a new admin user:
> ```powershell
> cd "e:\exp\phase1\Residea.ai_Frontend\Residea.ai_Frontend\backend"
> .\.venv\Scripts\activate
> python manage.py createsuperuser
> ```

---

## Features

| Page | Description |
|------|-------------|
| 📊 **Dashboard** | Live system stats — property/user counts, recent activity, type breakdown |
| 🏘️ **Properties** | Full CRUD — create, edit, verify, feature, activate/deactivate, delete |
| 👥 **Users** | View details, edit profiles, promote/demote staff, suspend accounts |

### Actions Available

- **Verify / Unverify** properties with a single click
- **Feature / Unfeature** properties for homepage promotion
- **Activate / Deactivate** properties and user accounts
- **Promote / Demote** users to staff access
- **CSV Export** of property data
- **Bulk Actions** — verify, activate, or delete multiple properties

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Vite | Build tool & dev server |
| React 19 | UI framework |
| TypeScript | Type safety |
| React Router DOM | Client-side routing |
| Lucide React | Icon library |

---

## Project Structure

```
admin-panel/
├── src/
│   ├── config/
│   │   └── api.ts                  ← API endpoint URLs
│   ├── services/
│   │   ├── tokenService.ts         ← JWT token management
│   │   ├── adminApiClient.ts       ← HTTP client with auth
│   │   ├── propertyAdminService.ts ← Property CRUD operations
│   │   └── userAdminService.ts     ← User CRUD + dashboard stats
│   ├── components/
│   │   ├── AdminLogin.tsx          ← Login page
│   │   ├── AdminLayout.tsx         ← Sidebar + header shell
│   │   ├── DashboardHome.tsx       ← System stats dashboard
│   │   ├── PropertyManager.tsx     ← Property CRUD table
│   │   └── UserManager.tsx         ← User management table
│   ├── App.tsx                     ← Router + auth guards
│   ├── main.tsx                    ← Entry point
│   └── index.css                   ← Dark theme styles
├── index.html
├── vite.config.ts                  ← Pinned to port 3001
├── tsconfig.json
└── package.json
```

---

## API Endpoints Used

All requests go to the Django backend at `http://localhost:8000`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login/` | JWT authentication |
| `POST` | `/api/auth/token/refresh/` | Refresh expired tokens |
| `GET` | `/api/admin/dashboard/` | System statistics |
| `GET/POST` | `/api/admin/properties/` | List / create properties |
| `PATCH/DELETE` | `/api/admin/properties/{id}/` | Update / delete property |
| `POST` | `/api/admin/properties/{id}/verify/` | Toggle verified |
| `POST` | `/api/admin/properties/{id}/feature/` | Toggle featured |
| `POST` | `/api/admin/properties/{id}/toggle_active/` | Toggle active |
| `GET` | `/api/admin/properties/export/` | CSV export |
| `GET` | `/api/admin/users/` | List all users |
| `GET/PATCH` | `/api/admin/users/{id}/` | Detail / update user |
| `POST` | `/api/admin/users/{id}/toggle_active/` | Suspend / activate |
| `POST` | `/api/admin/users/{id}/make_staff/` | Promote / demote staff |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Unable to connect to server` | Django backend is not running at port 8000 |
| `Unable to verify admin access` | Dashboard endpoint returned an error — check Django logs |
| `Access denied` | Your account is not `is_staff=True` — use `createsuperuser` |
| Port 3001 already in use | Kill the process or change port in `vite.config.ts` |
