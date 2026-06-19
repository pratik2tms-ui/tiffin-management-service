
# Config
mkdir -p src/config
touch src/config/database.js       # Sequelize connection
touch src/config/app.js            # Express app setup
touch src/config/cors.js           # CORS options
touch src/config/jwt.js            # JWT secret + expiry config

# Models (one per table)
mkdir -p src/models
touch src/models/index.js          # Sequelize init + associations
touch src/models/User.js
touch src/models/TiffinCenter.js
touch src/models/Pricing.js
touch src/models/TiffinEntry.js
touch src/models/Approval.js
touch src/models/Payment.js
touch src/models/AuditLog.js

# Controllers (business logic)
mkdir -p src/controllers
touch src/controllers/auth.controller.js
touch src/controllers/user.controller.js
touch src/controllers/tiffinCenter.controller.js
touch src/controllers/pricing.controller.js
touch src/controllers/tiffinEntry.controller.js
touch src/controllers/approval.controller.js
touch src/controllers/payment.controller.js
touch src/controllers/report.controller.js

# Routes (URL definitions)
mkdir -p src/routes
touch src/routes/index.js          # Mounts all routers
touch src/routes/auth.routes.js
touch src/routes/user.routes.js
touch src/routes/tiffinCenter.routes.js
touch src/routes/pricing.routes.js
touch src/routes/tiffinEntry.routes.js
touch src/routes/approval.routes.js
touch src/routes/payment.routes.js
touch src/routes/report.routes.js

# Middleware
mkdir -p src/middleware
touch src/middleware/auth.middleware.js      # JWT verify
touch src/middleware/role.middleware.js      # Role guard (admin/center/user)
touch src/middleware/validate.middleware.js  # Joi/Zod request validation
touch src/middleware/audit.middleware.js     # Auto audit log on mutating routes
touch src/middleware/error.middleware.js     # Global error handler
touch src/middleware/notFound.middleware.js  # 404 handler

# Validators (request schemas)
mkdir -p src/validators
touch src/validators/auth.validator.js
touch src/validators/tiffinEntry.validator.js
touch src/validators/pricing.validator.js
touch src/validators/payment.validator.js
touch src/validators/user.validator.js

# Services (reusable logic called by controllers)
mkdir -p src/services
touch src/services/auth.service.js
touch src/services/tiffinEntry.service.js
touch src/services/pricing.service.js
touch src/services/payment.service.js
touch src/services/report.service.js
touch src/services/audit.service.js

# Utils
mkdir -p src/utils
touch src/utils/response.js        # Standard API response helpers
touch src/utils/pagination.js      # Offset/limit helpers
touch src/utils/calculateAmount.js # Tiffin amount calculation (mirrors frontend)
touch src/utils/dateHelpers.js     # Date range, month/year helpers
touch src/utils/constants.js       # ROLES, TIFFIN_TYPES, STATUS enums

# Database migrations
mkdir -p src/database/migrations
touch src/database/migrations/001_create_tiffin_centers.js
touch src/database/migrations/002_create_users.js
touch src/database/migrations/003_create_pricing.js
touch src/database/migrations/004_create_tiffin_entries.js
touch src/database/migrations/005_create_approvals.js
touch src/database/migrations/006_create_payments.js
touch src/database/migrations/007_create_audit_logs.js
touch src/database/migrations/008_create_indexes.js

# Seeders
mkdir -p src/database/seeders
touch src/database/seeders/001_seed_admin.js
touch src/database/seeders/002_seed_tiffin_center.js
touch src/database/seeders/003_seed_customers.js
touch src/database/seeders/004_seed_pricing.js
touch src/database/seeders/005_seed_tiffin_entries.js

echo ""
echo "✅ Backend folder structure created in tiffin-backend/"
echo ""
echo "Next steps:"
echo "  cd tiffin-backend"
echo "  npm init -y"
echo "  npm install express pg sequelize sequelize-cli bcryptjs jsonwebtoken joi dotenv cors helmet morgan"
echo "  npm install --save-dev nodemon"
