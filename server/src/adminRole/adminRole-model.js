const mongoose = require('mongoose');
const { Schema } = mongoose;

const permissionSchema = new Schema({
  read: { type: Boolean, default: false },
  write: { type: Boolean, default: false },
  update: { type: Boolean, default: false },
  delete: { type: Boolean, default: false }
}, { _id: false });

const adminRoleSchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  permissions: {
    dashboard: { type: permissionSchema, default: {} },
    banners: { type: permissionSchema, default: {} },
    categories: { type: permissionSchema, default: {} },
    products: { type: permissionSchema, default: {} },
    orders: { type: permissionSchema, default: {} },
    sales: { type: permissionSchema, default: {} },
    returns: { type: permissionSchema, default: {} },
    sizes: { type: permissionSchema, default: {} },
    coupons: { type: permissionSchema, default: {} },
    admins: { type: permissionSchema, default: {} },
    userManagement: { type: permissionSchema, default: {} },
    videos: { type: permissionSchema, default: {} },
    wishlists: { type: permissionSchema, default: {} },
    clientRewards: { type: permissionSchema, default: {} },
    notifications: { type: permissionSchema, default: {} },
    FAQs: { type: permissionSchema, default: {} },
    marketing: { type: permissionSchema, default: {} },
    enquiries: { type: permissionSchema, default: {} },
    catalogueUpload: { type: permissionSchema, default: {} },
  },



  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

adminRoleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const AdminRole = mongoose.model('AdminRole', adminRoleSchema);
module.exports = AdminRole;
