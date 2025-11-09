const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Workflow Version Control System
 * نظام التحكم في إصدارات الـ Workflows
 * 
 * يتيح حفظ نسخ احتياطية والتراجع عن التعديلات
 */
class WorkflowVersionControl {
  constructor(storageDir = './workflow-versions') {
    this.storageDir = storageDir;
    this.versions = new Map();
    this.init();
  }

  /**
   * Initialize storage directory
   */
  async init() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      console.log('✅ Version Control initialized');
    } catch (error) {
      console.error('Error initializing version control:', error.message);
    }
  }

  /**
   * Generate hash for workflow data
   */
  generateHash(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Save a new version of workflow
   */
  async saveVersion(workflowId, workflowData, metadata = {}) {
    try {
      const version = {
        timestamp: new Date().toISOString(),
        workflowId,
        data: JSON.parse(JSON.stringify(workflowData)),
        hash: this.generateHash(workflowData),
        metadata: {
          ...metadata,
          userId: metadata.userId || 'system',
          description: metadata.description || 'Auto-saved version'
        }
      };

      // Save to memory
      if (!this.versions.has(workflowId)) {
        this.versions.set(workflowId, []);
      }
      this.versions.get(workflowId).push(version);

      // Save to disk
      const filename = `${workflowId}-${version.hash}.json`;
      const filepath = path.join(this.storageDir, filename);
      await fs.writeFile(filepath, JSON.stringify(version, null, 2));

      // Update index
      await this.updateIndex(workflowId);

      console.log(`✅ Version saved: ${workflowId} - ${version.hash}`);
      return version;
    } catch (error) {
      console.error('Error saving version:', error.message);
      throw error;
    }
  }

  /**
   * Update index file for workflow
   */
  async updateIndex(workflowId) {
    const indexPath = path.join(this.storageDir, `${workflowId}-index.json`);
    const versions = this.versions.get(workflowId) || [];
    
    const index = versions.map(v => ({
      hash: v.hash,
      timestamp: v.timestamp,
      description: v.metadata.description
    }));

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * Get version history for workflow
   */
  async getHistory(workflowId) {
    try {
      const versions = this.versions.get(workflowId) || [];
      
      return versions.map((v, index) => ({
        version: versions.length - index,
        hash: v.hash,
        timestamp: v.timestamp,
        description: v.metadata.description,
        userId: v.metadata.userId,
        isCurrent: index === versions.length - 1
      }));
    } catch (error) {
      console.error('Error getting history:', error.message);
      throw error;
    }
  }

  /**
   * Get specific version
   */
  async getVersion(workflowId, versionNumber) {
    const versions = this.versions.get(workflowId);
    
    if (!versions || versions.length < versionNumber) {
      throw new Error(`Version ${versionNumber} not found for workflow ${workflowId}`);
    }

    return versions[versions.length - versionNumber];
  }

  /**
   * Rollback to previous version
   */
  async rollback(workflowId, steps = 1) {
    const versions = this.versions.get(workflowId);
    
    if (!versions || versions.length < steps + 1) {
      throw new Error(`لا توجد نسخ كافية للرجوع. المطلوب: ${steps + 1}, المتوفر: ${versions?.length || 0}`);
    }

    const targetVersion = versions[versions.length - steps - 1];
    
    console.log(`🔙 Rolling back workflow ${workflowId} to version from ${targetVersion.timestamp}`);
    
    return {
      workflowData: targetVersion.data,
      version: targetVersion,
      message: `تم الرجوع إلى الإصدار من ${new Date(targetVersion.timestamp).toLocaleString('ar-SA')}`
    };
  }

  /**
   * Compare two versions
   */
  async compareVersions(workflowId, version1, version2) {
    const v1 = await this.getVersion(workflowId, version1);
    const v2 = await this.getVersion(workflowId, version2);

    const differences = {
      nodesAdded: [],
      nodesRemoved: [],
      nodesModified: [],
      connectionsChanged: false
    };

    const v1NodeIds = new Set(v1.data.nodes?.map(n => n.id) || []);
    const v2NodeIds = new Set(v2.data.nodes?.map(n => n.id) || []);

    // Find added nodes
    v2NodeIds.forEach(id => {
      if (!v1NodeIds.has(id)) {
        const node = v2.data.nodes.find(n => n.id === id);
        differences.nodesAdded.push(node.name || node.id);
      }
    });

    // Find removed nodes
    v1NodeIds.forEach(id => {
      if (!v2NodeIds.has(id)) {
        const node = v1.data.nodes.find(n => n.id === id);
        differences.nodesRemoved.push(node.name || node.id);
      }
    });

    // Check connections
    const v1Connections = JSON.stringify(v1.data.connections || {});
    const v2Connections = JSON.stringify(v2.data.connections || {});
    differences.connectionsChanged = v1Connections !== v2Connections;

    return {
      version1: { number: version1, timestamp: v1.timestamp },
      version2: { number: version2, timestamp: v2.timestamp },
      differences
    };
  }

  /**
   * Clean old versions (keep last N versions)
   */
  async cleanup(workflowId, keepLast = 10) {
    const versions = this.versions.get(workflowId);
    
    if (!versions || versions.length <= keepLast) {
      return { removed: 0, kept: versions?.length || 0 };
    }

    const toRemove = versions.length - keepLast;
    const removed = versions.splice(0, toRemove);

    // Delete files
    for (const version of removed) {
      const filename = `${workflowId}-${version.hash}.json`;
      const filepath = path.join(this.storageDir, filename);
      try {
        await fs.unlink(filepath);
      } catch (error) {
        console.error(`Error deleting file ${filename}:`, error.message);
      }
    }

    await this.updateIndex(workflowId);

    console.log(`🗑️  Cleaned up ${toRemove} old versions for workflow ${workflowId}`);
    
    return { removed: toRemove, kept: keepLast };
  }

  /**
   * Export workflow with full history
   */
  async exportWorkflow(workflowId) {
    const versions = this.versions.get(workflowId);
    
    if (!versions || versions.length === 0) {
      throw new Error(`No versions found for workflow ${workflowId}`);
    }

    return {
      workflowId,
      totalVersions: versions.length,
      currentVersion: versions[versions.length - 1],
      history: versions,
      exported: new Date().toISOString()
    };
  }

  /**
   * Import workflow with history
   */
  async importWorkflow(exportData) {
    const { workflowId, history } = exportData;

    this.versions.set(workflowId, history);

    // Save all versions to disk
    for (const version of history) {
      const filename = `${workflowId}-${version.hash}.json`;
      const filepath = path.join(this.storageDir, filename);
      await fs.writeFile(filepath, JSON.stringify(version, null, 2));
    }

    await this.updateIndex(workflowId);

    console.log(`📥 Imported workflow ${workflowId} with ${history.length} versions`);
    
    return { workflowId, imported: history.length };
  }
}

module.exports = WorkflowVersionControl;
