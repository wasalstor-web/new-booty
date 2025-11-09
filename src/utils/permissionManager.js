/**
 * Permission Manager - نظام إدارة الصلاحيات
 * 
 * يتحكم في من يستطيع تنفيذ أي عملية في النظام
 */
class PermissionManager {
  constructor() {
    // الصلاحيات الافتراضية
    this.roles = {
      admin: {
        name: 'مدير النظام',
        permissions: ['*'], // جميع الصلاحيات
        description: 'صلاحيات كاملة لكل شيء'
      },
      developer: {
        name: 'مطور',
        permissions: [
          'workflow.read',
          'workflow.create',
          'workflow.update',
          'workflow.execute',
          'ai.analyze',
          'ai.generate',
          'ai.optimize'
        ],
        description: 'يستطيع إنشاء وتعديل الـ workflows'
      },
      operator: {
        name: 'مشغّل',
        permissions: [
          'workflow.read',
          'workflow.execute',
          'ai.analyze'
        ],
        description: 'يستطيع تشغيل الـ workflows فقط'
      },
      viewer: {
        name: 'مشاهد',
        permissions: [
          'workflow.read'
        ],
        description: 'يستطيع المشاهدة فقط'
      }
    };

    // قائمة المستخدمين المصرح لهم
    this.authorizedUsers = new Map();
    
    // سجل العمليات
    this.auditLog = [];
  }

  /**
   * Add user with specific role
   */
  addUser(userId, role, metadata = {}) {
    if (!this.roles[role]) {
      throw new Error(`الدور ${role} غير موجود`);
    }

    this.authorizedUsers.set(userId, {
      role,
      permissions: this.roles[role].permissions,
      addedAt: new Date(),
      metadata: {
        name: metadata.name || 'Unknown',
        email: metadata.email || null,
        ...metadata
      }
    });

    this.log('user.added', userId, { role, metadata });
    
    console.log(`✅ تم إضافة المستخدم ${userId} بدور ${this.roles[role].name}`);
  }

  /**
   * Remove user
   */
  removeUser(userId) {
    if (!this.authorizedUsers.has(userId)) {
      throw new Error(`المستخدم ${userId} غير موجود`);
    }

    this.authorizedUsers.delete(userId);
    this.log('user.removed', userId);
    
    console.log(`🗑️  تم حذف المستخدم ${userId}`);
  }

  /**
   * Check if user has permission
   */
  hasPermission(userId, permission) {
    const user = this.authorizedUsers.get(userId);
    
    if (!user) {
      return false;
    }

    // Admin has all permissions
    if (user.permissions.includes('*')) {
      return true;
    }

    // Check specific permission
    return user.permissions.includes(permission);
  }

  /**
   * Check permission and throw error if not authorized
   */
  requirePermission(userId, permission) {
    if (!this.hasPermission(userId, permission)) {
      const user = this.authorizedUsers.get(userId);
      const roleName = user ? this.roles[user.role].name : 'غير مصرح';
      
      throw new Error(
        `⛔ غير مصرح!\n\n` +
        `المستخدم: ${userId}\n` +
        `الدور: ${roleName}\n` +
        `الصلاحية المطلوبة: ${permission}\n\n` +
        `يرجى التواصل مع المدير للحصول على الصلاحية.`
      );
    }
    
    return true;
  }

  /**
   * Get user info
   */
  getUserInfo(userId) {
    const user = this.authorizedUsers.get(userId);
    
    if (!user) {
      return null;
    }

    return {
      userId,
      role: user.role,
      roleName: this.roles[user.role].name,
      permissions: user.permissions,
      addedAt: user.addedAt,
      metadata: user.metadata
    };
  }

  /**
   * Get all users
   */
  getAllUsers() {
    const users = [];
    
    this.authorizedUsers.forEach((user, userId) => {
      users.push(this.getUserInfo(userId));
    });
    
    return users;
  }

  /**
   * Update user role
   */
  updateUserRole(userId, newRole) {
    if (!this.roles[newRole]) {
      throw new Error(`الدور ${newRole} غير موجود`);
    }

    const user = this.authorizedUsers.get(userId);
    if (!user) {
      throw new Error(`المستخدم ${userId} غير موجود`);
    }

    const oldRole = user.role;
    user.role = newRole;
    user.permissions = this.roles[newRole].permissions;

    this.log('user.role_updated', userId, { oldRole, newRole });
    
    console.log(`🔄 تم تحديث دور المستخدم ${userId} من ${this.roles[oldRole].name} إلى ${this.roles[newRole].name}`);
  }

  /**
   * Log action for audit
   */
  log(action, userId, details = {}) {
    this.auditLog.push({
      timestamp: new Date(),
      action,
      userId,
      details
    });

    // Keep only last 1000 logs
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(filters = {}) {
    let logs = [...this.auditLog];

    // Filter by user
    if (filters.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    // Filter by action
    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    // Filter by date
    if (filters.since) {
      const sinceDate = new Date(filters.since);
      logs = logs.filter(log => log.timestamp >= sinceDate);
    }

    // Limit results
    if (filters.limit) {
      logs = logs.slice(-filters.limit);
    }

    return logs;
  }

  /**
   * Get available roles
   */
  getRoles() {
    return Object.entries(this.roles).map(([key, role]) => ({
      key,
      name: role.name,
      description: role.description,
      permissions: role.permissions
    }));
  }

  /**
   * Check if user is admin
   */
  isAdmin(userId) {
    return this.hasPermission(userId, '*');
  }

  /**
   * Export user data
   */
  exportUsers() {
    return {
      users: this.getAllUsers(),
      roles: this.getRoles(),
      exported: new Date().toISOString()
    };
  }

  /**
   * Import user data
   */
  importUsers(data) {
    data.users.forEach(user => {
      this.addUser(user.userId, user.role, user.metadata);
    });
    
    console.log(`📥 تم استيراد ${data.users.length} مستخدم`);
  }
}

module.exports = PermissionManager;
