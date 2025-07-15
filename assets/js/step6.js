// Step 6: Summary & Installation JavaScript Module
// Updated: 2025-07-15 Enhanced Data Management
// User: jharrvis

class Step6SummaryInstallation {
  constructor() {
    this.wizardData = {};
    this.installationSteps = [
      {
        id: "downloadStep",
        title: "Downloading Platform",
        description: "Downloading and extracting platform files...",
        icon: "fas fa-download",
        duration: 2000,
      },
      {
        id: "databaseStep",
        title: "Setting up Database",
        description: "Creating database structure and tables...",
        icon: "fas fa-database",
        duration: 3000,
      },
      {
        id: "configStep",
        title: "Configuring Platform",
        description: "Applying configuration settings and plugins...",
        icon: "fas fa-cog",
        duration: 2500,
      },
      {
        id: "completeStep",
        title: "Installation Complete",
        description: "Your website is ready to use!",
        icon: "fas fa-check",
        duration: 1000,
      },
    ];

    this.init();
  }

  init() {
    this.loadWizardData();
    this.bindEvents();
    this.generateSummary();
    this.updateInstallButton();
  }

  bindEvents() {
    // Edit configuration button
    document.addEventListener("click", (e) => {
      if (e.target.closest(".edit-config-btn")) {
        this.editConfiguration();
      }
    });

    // Export configuration button
    document.addEventListener("click", (e) => {
      if (e.target.closest(".export-config-btn")) {
        this.exportConfiguration();
      }
    });
  }

  loadWizardData() {
    try {
      // Always load from localStorage first for persistence across refreshes
      const saved = localStorage.getItem("wizardData");
      this.wizardData = saved ? JSON.parse(saved) : {};

      // Also update global wizard data to match localStorage
      if (window.wizardData && saved) {
        window.wizardData = { ...window.wizardData, ...this.wizardData };
      }

      console.log(
        "Loaded wizard data for summary from localStorage:",
        this.wizardData
      );
    } catch (error) {
      console.error("Error loading wizard data:", error);
      this.wizardData = {};
    }
  }

  generateSummary() {
    this.updateStoreInfo();
    this.updateSystemOptions();
    this.updateStylesSummary();
    this.updatePluginsSummary();
    this.updateSampleDataSummary();
    this.generateSystemRequirements();
    this.generateInstallationEstimate();
    this.addEditButton();
    this.showConfigurationWarnings();
  }

  updateStoreInfo() {
    const storeNameElement = document.getElementById("summary-store-name");
    if (storeNameElement) {
      const storeName = this.wizardData.storeInfo?.name || "Not Set";
      storeNameElement.textContent = storeName;
    }
  }

  updateSystemOptions() {
    const versionElement = document.getElementById("summary-version");
    if (versionElement) {
      const platform = this.wizardData.platform?.selected;
      const version = this.wizardData.platform?.version;

      if (platform && version) {
        const platformName =
          platform.charAt(0).toUpperCase() + platform.slice(1);
        versionElement.textContent = `${platformName} ${version}`;
      } else {
        versionElement.textContent = "Not Selected";
      }
    }
  }

  updateStylesSummary() {
    const themeElement = document.getElementById("summary-selected-theme");
    const desktopLogoElement = document.getElementById("summary-desktop-logo");
    const mobileLogoElement = document.getElementById("summary-mobile-logo");
    const primaryColorElement = document.getElementById(
      "summary-primary-color"
    );
    const secondaryColorElement = document.getElementById(
      "summary-secondary-color"
    );
    const tertiaryColorElement = document.getElementById(
      "summary-tertiary-color"
    );
    const fontsElement = document.getElementById("summary-fonts");

    // Theme
    if (themeElement) {
      const theme = this.wizardData.theme;
      if (theme) {
        const themeNames = {
          luma: "Luma Theme",
          hyva: "Hyvä Theme",
          default: "Default Theme",
          ecommerce: "E-commerce Pro",
        };
        themeElement.textContent = themeNames[theme] || theme;
      } else {
        themeElement.textContent = "Not Selected";
      }
    }

    // Styling data
    const styling = this.wizardData.styling;
    if (styling) {
      // Logos
      if (desktopLogoElement) {
        if (styling.logos?.desktop) {
          const logoName = styling.logos.desktopName || "Desktop logo";
          desktopLogoElement.textContent = `✓ ${logoName} uploaded`;
        } else {
          desktopLogoElement.textContent = "No desktop logo uploaded";
        }
      }

      if (mobileLogoElement) {
        if (styling.logos?.mobile) {
          const logoName = styling.logos.mobileName || "Mobile logo";
          mobileLogoElement.textContent = `✓ ${logoName} uploaded`;
        } else {
          mobileLogoElement.textContent = "No mobile logo uploaded";
        }
      }

      // Colors
      if (primaryColorElement && styling.colors?.primary) {
        primaryColorElement.textContent = styling.colors.primary;
        primaryColorElement.style.color = styling.colors.primary;
      }

      if (secondaryColorElement && styling.colors?.secondary) {
        secondaryColorElement.textContent = styling.colors.secondary;
        secondaryColorElement.style.color = styling.colors.secondary;
      }

      if (tertiaryColorElement && styling.colors?.tertiary) {
        tertiaryColorElement.textContent = styling.colors.tertiary;
        tertiaryColorElement.style.color = styling.colors.tertiary;
      }

      // Fonts
      if (fontsElement) {
        if (styling.fonts?.useDefault) {
          fontsElement.textContent = "Using Default Theme Font";
        } else {
          const fontName =
            styling.fonts?.customFont || styling.fonts?.family || "Custom Font";
          fontsElement.textContent = fontName;
        }
      }
    }
  }

  updatePluginsSummary() {
    const pluginsListElement = document.getElementById("summary-plugins");
    if (!pluginsListElement) return;

    pluginsListElement.innerHTML = "";

    const selectedPlugins = Object.keys(this.wizardData.plugins || {}).filter(
      (pluginId) => this.wizardData.plugins[pluginId]
    );

    if (selectedPlugins.length > 0) {
      selectedPlugins.forEach((pluginId) => {
        const li = document.createElement("li");
        const pluginName = this.getPluginName(pluginId);
        const hasLicense = this.wizardData.licenseKeys?.[pluginId];
        const needsLicense = this.pluginNeedsLicense(pluginId);

        let statusText = "";
        if (needsLicense) {
          statusText = hasLicense ? " (Licensed)" : " (License Required)";
        }

        li.innerHTML = `
            <span>${pluginName}${statusText}</span>
            <span class="summary-list-value">${
              needsLicense ? "Premium" : "Free"
            }</span>
          `;

        // Add warning class if license is required but not provided
        if (needsLicense && !hasLicense) {
          li.classList.add("warning");
        }

        pluginsListElement.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.innerHTML = "<span>No plugins selected</span>";
      pluginsListElement.appendChild(li);
    }
  }

  updateSampleDataSummary() {
    const sampleDataElement = document.getElementById("summary-sample-data");
    if (sampleDataElement) {
      // Get data from step 5 if available, otherwise from stored data
      let sampleData = this.wizardData.sampleData;

      if (window.step5SampleData) {
        const step5Data = window.step5SampleData.getStepData();
        sampleData = step5Data.sampleData;
        console.log("Got sample data from step 5:", sampleData);
      }

      const sampleText =
        sampleData === "with_sample"
          ? "Yes, using sample data"
          : "No, using own data";
      sampleDataElement.textContent = sampleText;

      console.log("Updated sample data summary:", sampleText);
    }
  }

  generateSystemRequirements() {
    const summaryDisplay = document.querySelector(".summary-display");
    if (!summaryDisplay) return;

    // Check if requirements section already exists
    if (summaryDisplay.querySelector(".system-requirements")) return;

    const platform = this.wizardData.platform?.selected;
    const version = this.wizardData.platform?.version;

    if (!platform || !version) return;

    const requirements = this.getSystemRequirements(platform, version);
    if (!requirements || requirements.length === 0) return;

    const requirementsSection = document.createElement("div");
    requirementsSection.className = "summary-item system-requirements";
    requirementsSection.innerHTML = `
          <h4 class="h4-headline">
            <i class="fas fa-server"></i>
            System Requirements
          </h4>
          <div class="requirements-grid">
            ${requirements
              .map(
                (req) => `
              <div class="requirement-item">
                <div class="requirement-icon">
                  <i class="${req.icon}"></i>
                </div>
                <div>
                  <div class="requirement-text">${req.name}</div>
                  <div class="requirement-version">v${req.version}</div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        `;

    summaryDisplay.appendChild(requirementsSection);
  }

  getSystemRequirements(platform, version) {
    const dependencies = this.wizardData.platform?.dependencies;
    if (!dependencies) return [];

    const iconMap = {
      php: "fab fa-php",
      mariadb: "fas fa-database",
      redis: "fas fa-memory",
      opensearch: "fas fa-search",
    };

    return Object.entries(dependencies)
      .filter(([key, value]) => value !== "N/A")
      .map(([key, value]) => ({
        name: key.toUpperCase(),
        version: value,
        icon: iconMap[key] || "fas fa-cog",
      }));
  }

  generateInstallationEstimate() {
    const summaryDisplay = document.querySelector(".summary-display");
    if (
      !summaryDisplay ||
      summaryDisplay.querySelector(".installation-summary")
    )
      return;

    const estimatedTime = this.calculateInstallationTime();
    const estimatedSize = this.calculateInstallationSize();

    const installationSummary = document.createElement("div");
    installationSummary.className = "summary-item installation-summary";
    installationSummary.innerHTML = `
          <h4 class="h4-headline">
            <i class="fas fa-rocket"></i>
            Installation Estimate
          </h4>
          <p class="p-text">Your website configuration is complete and ready to be installed.</p>
          <div class="installation-estimates">
            <div class="estimate-item">
              <span class="estimate-value">${estimatedTime}</span>
              <span class="estimate-label">Install Time</span>
            </div>
            <div class="estimate-item">
              <span class="estimate-value">${estimatedSize}</span>
              <span class="estimate-label">Total Size</span>
            </div>
          </div>
        `;

    summaryDisplay.appendChild(installationSummary);
  }

  calculateInstallationTime() {
    let baseTime = 3; // Base time in minutes

    // Add time for sample data
    if (this.wizardData.sampleData === "with_sample") {
      baseTime += 2;
    }

    // Add time for plugins
    const pluginCount = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    ).length;
    baseTime += pluginCount * 0.5;

    return `${Math.ceil(baseTime)} min`;
  }

  calculateInstallationSize() {
    let baseSize = 150; // Base size in MB

    // Add size for sample data
    if (this.wizardData.sampleData === "with_sample") {
      baseSize += 50;
    }

    // Add size for plugins
    const pluginCount = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    ).length;
    baseSize += pluginCount * 5;

    return baseSize > 1000
      ? `${(baseSize / 1000).toFixed(1)} GB`
      : `${baseSize} MB`;
  }

  addEditButton() {
    const summaryDisplay = document.querySelector(".summary-display");
    if (!summaryDisplay || summaryDisplay.querySelector(".edit-config-btn"))
      return;

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "summary-actions";
    buttonContainer.innerHTML = `
        <button class="btn btn-secondary edit-config-btn">
          <i class="fas fa-edit"></i> Edit Configuration
        </button>
        <button class="btn btn-outline export-config-btn">
          <i class="fas fa-download"></i> Export Config
        </button>
      `;

    summaryDisplay.appendChild(buttonContainer);
  }

  showConfigurationWarnings() {
    const warnings = this.getConfigurationWarnings();

    if (warnings.length > 0) {
      const summaryDisplay = document.querySelector(".summary-display");
      if (!summaryDisplay || summaryDisplay.querySelector(".config-warnings"))
        return;

      const warningSection = document.createElement("div");
      warningSection.className = "summary-item config-warnings";
      warningSection.innerHTML = `
            <h4 class="h4-headline">
              <i class="fas fa-exclamation-triangle"></i>
              Configuration Warnings
            </h4>
            <p class="p-text">Please review the following before installation:</p>
            <ul class="warning-list">
              ${warnings
                .map((warning) => `<li class="warning-item">${warning}</li>`)
                .join("")}
            </ul>
          `;

      // Insert at the beginning of summary
      summaryDisplay.insertBefore(warningSection, summaryDisplay.firstChild);
    }
  }

  getConfigurationWarnings() {
    const warnings = [];

    // Check for missing required data
    if (!this.wizardData.storeInfo?.name) {
      warnings.push("Store name is not set");
    }

    if (
      !this.wizardData.platform?.selected ||
      !this.wizardData.platform?.version
    ) {
      warnings.push("Platform and version must be selected");
    }

    if (!this.wizardData.theme) {
      warnings.push("Theme must be selected");
    }

    // Check for plugins requiring licenses
    const selectedPlugins = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    );

    selectedPlugins.forEach((pluginId) => {
      if (
        this.pluginNeedsLicense(pluginId) &&
        !this.wizardData.licenseKeys?.[pluginId]
      ) {
        const pluginName = this.getPluginName(pluginId);
        warnings.push(`${pluginName} requires a license key`);
      }
    });

    // Check theme compatibility
    if (
      this.wizardData.platform?.selected === "magento" &&
      this.wizardData.theme === "hyva" &&
      selectedPlugins.length > 5
    ) {
      warnings.push(
        "Hyvä theme may require additional plugin compatibility checks with many plugins selected"
      );
    }

    // Check sample data warning
    if (this.wizardData.sampleData === "with_sample") {
      warnings.push(
        "Remember to remove sample data before going live with your store"
      );
    }

    // Check for missing logos
    if (
      !this.wizardData.styling?.logos?.desktop &&
      !this.wizardData.styling?.logos?.mobile
    ) {
      warnings.push(
        "Consider uploading your logo for better brand recognition"
      );
    }

    return warnings;
  }

  editConfiguration() {
    if (confirm("Do you want to go back and edit your configuration?")) {
      // Go back to step 1
      if (typeof showStep === "function") {
        showStep(1);
      }
    }
  }

  exportConfiguration() {
    const config = {
      timestamp: new Date().toISOString(),
      configuration: this.wizardData,
      summary: this.generateConfigSummary(),
      systemRequirements: this.getSystemRequirements(
        this.wizardData.platform?.selected,
        this.wizardData.platform?.version
      ),
      estimates: {
        installTime: this.calculateInstallationTime(),
        totalSize: this.calculateInstallationSize(),
      },
      warnings: this.getConfigurationWarnings(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `website-configuration-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generateConfigSummary() {
    return {
      storeName: this.wizardData.storeInfo?.name || "Not Set",
      platform: this.wizardData.platform?.selected || "Not Selected",
      version: this.wizardData.platform?.version || "Not Selected",
      theme: this.wizardData.theme || "Not Selected",
      selectedPlugins: Object.keys(this.wizardData.plugins || {}).filter(
        (id) => this.wizardData.plugins[id]
      ),
      hasLogos: {
        desktop: !!this.wizardData.styling?.logos?.desktop,
        mobile: !!this.wizardData.styling?.logos?.mobile,
      },
      sampleData: this.wizardData.sampleData === "with_sample",
      customization: {
        colors: this.wizardData.styling?.colors || {},
        customFont: !this.wizardData.styling?.fonts?.useDefault,
      },
    };
  }

  // Installation process methods
  startInstallation() {
    this.showInstallationModal();
    this.runInstallationSteps();
  }

  showInstallationModal() {
    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.classList.add("show");
      document.body.classList.add("modal-open");
    }
  }

  runInstallationSteps() {
    let currentStepIndex = 0;

    const runNextStep = () => {
      if (currentStepIndex < this.installationSteps.length) {
        const step = this.installationSteps[currentStepIndex];
        this.activateInstallationStep(step.id);

        const progress =
          ((currentStepIndex + 1) / this.installationSteps.length) * 100;
        this.updateInstallationProgress(progress, step.description);

        setTimeout(() => {
          this.completeInstallationStep(step.id);
          currentStepIndex++;

          if (currentStepIndex < this.installationSteps.length) {
            runNextStep();
          } else {
            this.completeInstallation();
          }
        }, step.duration);
      }
    };

    runNextStep();
  }

  activateInstallationStep(stepId) {
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      stepElement.classList.add("active");

      const icon = stepElement.querySelector(".install-status i");
      if (icon) {
        icon.className = "fas fa-spinner fa-spin";
      }
    }
  }

  completeInstallationStep(stepId) {
    const stepElement = document.getElementById(stepId);
    if (stepElement) {
      stepElement.classList.remove("active");
      stepElement.classList.add("completed");

      const icon = stepElement.querySelector(".install-status i");
      if (icon) {
        icon.className = "fas fa-check";
      }
    }
  }

  updateInstallationProgress(percentage, message) {
    const progressBar = document.querySelector(".installation-progress-fill");
    const progressText = document.querySelector(".installation-progress-text");

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    if (progressText) {
      progressText.textContent =
        message || `Installation Progress: ${Math.round(percentage)}%`;
    }
  }

  completeInstallation() {
    setTimeout(() => {
      document
        .querySelector(".installation-steps")
        ?.style.setProperty("display", "none");
      document
        .getElementById("installationComplete")
        ?.style.setProperty("display", "block");

      this.showFinalStats();
      this.updateWebsiteDetails();
      this.saveFinalConfiguration();
    }, 1000);
  }

  showFinalStats() {
    const installationComplete = document.getElementById(
      "installationComplete"
    );
    if (!installationComplete) return;

    const stats = this.generateFinalStats();

    let statsSection = installationComplete.querySelector(".final-stats");
    if (!statsSection) {
      statsSection = document.createElement("div");
      statsSection.className = "final-stats";

      // Insert before the website details
      const websiteDetails =
        installationComplete.querySelector(".website-details");
      if (websiteDetails) {
        websiteDetails.parentNode.insertBefore(statsSection, websiteDetails);
      } else {
        installationComplete.appendChild(statsSection);
      }
    }

    statsSection.innerHTML = stats
      .map(
        (stat) => `
          <div class="final-stat">
            <div class="final-stat-icon">
              <i class="${stat.icon}"></i>
            </div>
            <span class="final-stat-value">${stat.value}</span>
            <div class="final-stat-label">${stat.label}</div>
          </div>
        `
      )
      .join("");
  }

  generateFinalStats() {
    const selectedPlugins = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    );

    return [
      {
        icon: "fas fa-puzzle-piece",
        value: selectedPlugins.length,
        label: "Plugins Installed",
      },
      {
        icon: "fas fa-palette",
        value: this.wizardData.theme ? "1" : "0",
        label: "Theme Applied",
      },
      {
        icon: "fas fa-database",
        value: this.wizardData.sampleData === "with_sample" ? "Yes" : "No",
        label: "Sample Data",
      },
      {
        icon: "fas fa-clock",
        value: this.calculateInstallationTime(),
        label: "Install Time",
      },
    ];
  }

  updateWebsiteDetails() {
    const storeName = this.wizardData.storeInfo?.name || "yourwebsite";
    const websiteUrl = `https://${storeName
      .toLowerCase()
      .replace(/\s+/g, "-")}.com`;
    const adminUrl = `${websiteUrl}/admin`;

    // Update website details in the completion screen
    const websiteDetails = document.querySelector(".website-details");
    if (websiteDetails) {
      websiteDetails.innerHTML = `
            <h4>Your Website is Ready!</h4>
            <div class="website-details-grid">
              <div class="website-detail-item">
                <div class="website-detail-icon">
                  <i class="fas fa-globe"></i>
                </div>
                <div class="website-detail-content">
                  <div class="website-detail-label">Website URL</div>
                  <div class="website-detail-value">
                    <a href="${websiteUrl}" target="_blank">${websiteUrl}</a>
                  </div>
                </div>
              </div>
              <div class="website-detail-item">
                <div class="website-detail-icon">
                  <i class="fas fa-user-shield"></i>
                </div>
                <div class="website-detail-content">
                  <div class="website-detail-label">Admin Panel</div>
                  <div class="website-detail-value">
                    <a href="${adminUrl}" target="_blank">${adminUrl}</a>
                  </div>
                </div>
              </div>
            </div>
          `;
    }
  }

  saveFinalConfiguration() {
    const finalConfig = {
      timestamp: new Date().toISOString(),
      configuration: this.wizardData,
      installation: {
        completed: true,
        duration: this.installationSteps.reduce(
          (sum, step) => sum + step.duration,
          0
        ),
        steps: this.installationSteps.map((step) => step.id),
      },
      website: {
        url: `https://${
          this.wizardData.storeInfo?.name?.toLowerCase().replace(/\s+/g, "-") ||
          "yourwebsite"
        }.com`,
        adminUrl: `https://${
          this.wizardData.storeInfo?.name?.toLowerCase().replace(/\s+/g, "-") ||
          "yourwebsite"
        }.com/admin`,
      },
      summary: this.generateConfigSummary(),
    };

    localStorage.setItem(
      "finalInstallationConfig",
      JSON.stringify(finalConfig)
    );

    // Could send to server here
    console.log("Final configuration saved:", finalConfig);
  }

  getPluginName(pluginId) {
    // Get plugin name from step 4 if available
    if (window.step4PluginSettings) {
      return window.step4PluginSettings.getPluginName(pluginId);
    }

    // Fallback plugin names
    const pluginNames = {
      ppcp: "PayPal Complete Payments",
      stripe: "Stripe",
      mollie: "Mollie",
      adyen: "Adyen",
      klaviyo: "Klaviyo Email",
      mailchimp: "Mailchimp",
      sendgrid: "SendGrid",
      yotpo: "Yotpo Reviews",
      trustpilot: "Trustpilot",
      reviewsio: "Reviews.io",
      klevu: "Klevu",
      algolia: "Algolia",
      elasticsearch: "Elasticsearch",
      avalara: "Avalara",
      shipperq: "ShipperHQ",
      fedex: "FedEx Shipping",
      ups: "UPS Shipping",
    };

    return pluginNames[pluginId] || pluginId;
  }

  pluginNeedsLicense(pluginId) {
    // Get license requirement from step 4 if available
    if (window.step4PluginSettings) {
      return window.step4PluginSettings.checkIfPluginNeedsLicense(pluginId);
    }

    // Fallback license requirements
    const licenseRequired = [
      "hyva",
      "klaviyo",
      "mailchimp",
      "sendgrid",
      "yotpo",
      "trustpilot",
      "reviewsio",
      "klevu",
      "algolia",
      "avalara",
      "shipperq",
    ];
    return licenseRequired.includes(pluginId);
  }

  updateInstallButton() {
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  // Public methods for validation and data access
  validateStep() {
    const errors = this.validateConfiguration();
    return errors.length === 0;
  }

  validateConfiguration() {
    const errors = [];

    if (!this.wizardData.storeInfo?.name) {
      errors.push("Store name is required");
    }

    if (!this.wizardData.platform?.selected) {
      errors.push("Platform selection is required");
    }

    if (!this.wizardData.platform?.version) {
      errors.push("Platform version is required");
    }

    if (!this.wizardData.theme) {
      errors.push("Theme selection is required");
    }

    // Check if plugins requiring licenses have license keys
    const selectedPlugins = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    );

    selectedPlugins.forEach((pluginId) => {
      if (
        this.pluginNeedsLicense(pluginId) &&
        !this.wizardData.licenseKeys?.[pluginId]
      ) {
        errors.push(`License key required for ${this.getPluginName(pluginId)}`);
      }
    });

    return errors;
  }

  getStepData() {
    const stepData = {
      finalConfiguration: this.wizardData,
      validationErrors: this.validateConfiguration(),
      warnings: this.getConfigurationWarnings(),
      estimates: {
        installTime: this.calculateInstallationTime(),
        totalSize: this.calculateInstallationSize(),
      },
      systemRequirements: this.getSystemRequirements(
        this.wizardData.platform?.selected,
        this.wizardData.platform?.version
      ),
      summary: this.generateConfigSummary(),
      timestamp: new Date().toISOString(),
      isValid: this.validateStep(),
    };

    return stepData;
  }

  resetStep() {
    // Clear any temporary UI elements
    const editBtn = document.querySelector(".edit-config-btn");
    if (editBtn) editBtn.remove();

    const warnings = document.querySelector(".config-warnings");
    if (warnings) warnings.remove();

    const requirements = document.querySelector(".system-requirements");
    if (requirements) requirements.remove();

    const installSummary = document.querySelector(".installation-summary");
    if (installSummary) installSummary.remove();

    const summaryActions = document.querySelector(".summary-actions");
    if (summaryActions) summaryActions.remove();

    // Reload data and regenerate fresh summary
    this.loadWizardData();
    this.generateSummary();
  }

  // Method to create backup point before installation
  createBackupPoint() {
    const backupData = {
      timestamp: new Date().toISOString(),
      configuration: this.wizardData,
      checksum: this.generateConfigChecksum(this.wizardData),
    };

    localStorage.setItem("wizardBackup", JSON.stringify(backupData));
    return backupData;
  }

  generateConfigChecksum(data) {
    // Simple checksum generation
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  // Method to get complete installation configuration for backend
  getInstallationConfig() {
    return {
      timestamp: new Date().toISOString(),
      storeInfo: this.wizardData.storeInfo,
      platform: this.wizardData.platform,
      theme: this.wizardData.theme,
      styling: this.wizardData.styling,
      plugins: this.wizardData.plugins,
      licenseKeys: this.wizardData.licenseKeys,
      sampleData: this.wizardData.sampleData,
      systemRequirements: this.getSystemRequirements(
        this.wizardData.platform?.selected,
        this.wizardData.platform?.version
      ),
      estimates: {
        installTime: this.calculateInstallationTime(),
        totalSize: this.calculateInstallationSize(),
      },
      validation: {
        isValid: this.validateStep(),
        errors: this.validateConfiguration(),
        warnings: this.getConfigurationWarnings(),
      },
    };
  }
}

// Global functions for installation flow
window.viewWebsite = function () {
  if (window.step6SummaryInstallation) {
    window.step6SummaryInstallation.updateWebsiteDetails();
  }

  const storeName = window.wizardData?.storeInfo?.name || "Your Website";
  const websiteUrl = `https://${storeName
    .toLowerCase()
    .replace(/\s+/g, "-")}.com`;

  if (
    confirm(`Opening ${storeName}... Would you like to create another website?`)
  ) {
    // Reset wizard for new installation
    localStorage.removeItem("wizardData");
    location.reload();
  } else {
    // Close modal and show completion
    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }

    console.log(`Installation complete! Website available at: ${websiteUrl}`);
  }
};

window.startInstallation = function () {
  if (window.step6SummaryInstallation) {
    // Create backup before installation
    window.step6SummaryInstallation.createBackupPoint();

    // Start installation process
    window.step6SummaryInstallation.startInstallation();
  }
};

// Initialize Step 6 when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const step6Content = document.querySelector('.step-content[data-step="6"]');
  if (step6Content) {
    window.step6SummaryInstallation = new Step6SummaryInstallation();

    // Also initialize when step 6 becomes visible
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const step6 = document.querySelector('.step-content[data-step="6"]');
          if (step6 && step6.classList.contains("active")) {
            setTimeout(() => {
              if (window.step6SummaryInstallation) {
                window.step6SummaryInstallation.loadWizardData();
                window.step6SummaryInstallation.generateSummary();
              }
            }, 100);
          }
        }
      });
    });

    // Start observing
    const step6Element = document.querySelector('.step-content[data-step="6"]');
    if (step6Element) {
      observer.observe(step6Element, { attributes: true });
    }
  }
});

// Export for global access
window.Step6SummaryInstallation = Step6SummaryInstallation;
