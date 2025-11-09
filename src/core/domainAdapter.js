/**
 * Domain Adapter - محول المجالات
 * 
 * يسمح بتكييف النظام لأي مجال عمل (تجارة، صحة، تعليم، إلخ)
 * Allows adapting the system to any business domain
 */
class DomainAdapter {
  constructor() {
    this.domains = new Map();
    this.activeDomain = null;
  }

  /**
   * Register a new domain
   */
  registerDomain(domainConfig) {
    const {
      name,
      displayName,
      description,
      schema,
      workflows,
      aiPrompts,
      integrations,
      models
    } = domainConfig;

    if (this.domains.has(name)) {
      throw new Error(`Domain ${name} is already registered`);
    }

    this.domains.set(name, {
      name,
      displayName: displayName || name,
      description: description || '',
      schema: schema || {},
      workflows: workflows || [],
      aiPrompts: aiPrompts || {},
      integrations: integrations || [],
      models: models || [],
      registeredAt: new Date()
    });

    console.log(`✅ Domain registered: ${displayName}`);
  }

  /**
   * Activate a domain
   */
  activateDomain(name) {
    if (!this.domains.has(name)) {
      throw new Error(`Domain ${name} not found`);
    }

    this.activeDomain = name;
    console.log(`🎯 Domain activated: ${this.domains.get(name).displayName}`);
  }

  /**
   * Get active domain
   */
  getActiveDomain() {
    if (!this.activeDomain) {
      return null;
    }
    return this.domains.get(this.activeDomain);
  }

  /**
   * Get domain-specific AI prompts
   */
  getDomainPrompts(domainName = this.activeDomain) {
    const domain = this.domains.get(domainName);
    return domain ? domain.aiPrompts : {};
  }

  /**
   * Get domain-specific workflows
   */
  getDomainWorkflows(domainName = this.activeDomain) {
    const domain = this.domains.get(domainName);
    return domain ? domain.workflows : [];
  }

  /**
   * Get domain-specific models
   */
  getDomainModels(domainName = this.activeDomain) {
    const domain = this.domains.get(domainName);
    return domain ? domain.models : [];
  }

  /**
   * Get all registered domains
   */
  getAllDomains() {
    const domainList = [];
    
    this.domains.forEach((domain, name) => {
      domainList.push({
        name,
        displayName: domain.displayName,
        description: domain.description,
        isActive: name === this.activeDomain,
        workflowCount: domain.workflows.length,
        integrationCount: domain.integrations.length,
        modelCount: domain.models.length
      });
    });

    return domainList;
  }

  /**
   * Extend domain with custom workflows
   */
  extendDomain(name, workflows = [], integrations = [], models = []) {
    const domain = this.domains.get(name);
    
    if (!domain) {
      throw new Error(`Domain ${name} not found`);
    }

    domain.workflows = [...domain.workflows, ...workflows];
    domain.integrations = [...domain.integrations, ...integrations];
    domain.models = [...domain.models, ...models];

    console.log(`✅ Domain extended: ${domain.displayName}`);
  }

  /**
   * Get domain schema for data validation
   */
  getDomainSchema(domainName = this.activeDomain) {
    const domain = this.domains.get(domainName);
    return domain ? domain.schema : {};
  }
}

module.exports = DomainAdapter;
