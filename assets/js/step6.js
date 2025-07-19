// Step 6: Summary & Installation JavaScript Module
// Updated: 2025-07-19 Production Ready - Zero Console Spam
// User: jharrvis

class Step6SummaryInstallation {
  constructor() {
    this.wizardData = {};
    this.isProduction = true; // Production mode flag
    this.installationSteps = [
      {
        id: "downloadStep",
        title: "Downloading Platform",
        description: "Downloading and extracting platform files...",
        icon: "fas fa-download",
        duration: 800, // Optimized duration
      },
      {
        id: "databaseStep",
        title: "Setting up Database",
        description: "Creating database structure and tables...",
        icon: "fas fa-database",
        duration: 1000, // Optimized duration
      },
      {
        id: "configStep",
        title: "Configuring Platform",
        description: "Applying configuration settings and plugins...",
        icon: "fas fa-cog",
        duration: 800, // Optimized duration
      },
      {
        id: "completeStep",
        title: "Installation Complete",
        description: "Your website is ready to use!",
        icon: "fas fa-check",
        duration: 500, // Optimized duration
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

  // Debug logging only when explicitly enabled
  debugLog(message, data = null) {
    if (!this.isProduction && window.DEBUG_MODE) {
      if (data) {
        console.log(`[Step6] ${message}:`, data);
      } else {
        console.log(`[Step6] ${message}`);
      }
    }
  }

  // Error logging (always enabled for critical issues)
  errorLog(message, error = null) {
    console.error(`[Step6 Error] ${message}`, error || "");
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

    // Close modal button
    document.addEventListener("click", (e) => {
      if (e.target.closest("#closeInstallationModalBtn")) {
        this.closeInstallationModal();
      }
    });

    // Close modal by clicking overlay
    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeInstallationModal();
        }
      });
    }
  }

  loadWizardData() {
    try {
      // Load from localStorage - silent operation
      const saved = localStorage.getItem("wizardData");
      this.wizardData = saved ? JSON.parse(saved) : {};

      // Sync with global wizard data
      if (window.wizardData && saved) {
        window.wizardData = { ...window.wizardData, ...this.wizardData };
      }

      this.debugLog("Wizard data loaded for summary", this.wizardData);
    } catch (error) {
      this.errorLog("Error loading wizard data", error);
      this.wizardData = {};
    }
  }

  generateSummary() {
    // Silent summary generation
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
    // Silent update of styles summary
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
        this.debugLog("Got sample data from step 5", sampleData);
      }

      const sampleText =
        sampleData === "with_sample"
          ? "Yes, using sample data"
          : "No, using own data";
      sampleDataElement.textContent = sampleText;

      this.debugLog("Updated sample data summary", sampleText);
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
    let baseTime = 1; // Base time in minutes

    // Add time for sample data
    if (this.wizardData.sampleData === "with_sample") {
      baseTime += 0.5;
    }

    // Add time for plugins
    const pluginCount = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    ).length;
    baseTime += pluginCount * 0.1;

    return `${Math.ceil(baseTime)} min`;
  }

  calculateInstallationSize() {
    let baseSize = 50; // Base size in MB

    // Add size for sample data
    if (this.wizardData.sampleData === "with_sample") {
      baseSize += 20;
    }

    // Add size for plugins
    const pluginCount = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    ).length;
    baseSize += pluginCount * 2;

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
    // Hide the modal if it's open
    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.classList.remove("modal-open");
    }

    // Use a custom message box instead of confirm()
    this.showCustomMessageBox(
      "Confirmation",
      "Do you want to go back and edit your configuration?",
      () => {
        // User confirmed "Yes"
        if (typeof showStep === "function") {
          showStep(1);
        }
      },
      () => {
        // User confirmed "No"
        // Do nothing or provide alternative action
      }
    );
  }

  exportConfiguration() {
    try {
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

      this.debugLog("Configuration exported successfully");
    } catch (error) {
      this.errorLog("Failed to export configuration", error);
    }
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

  // Installation process methods - Optimized for production
  startInstallation() {
    this.debugLog("Starting installation process");
    this.showInstallationModal();
    this.resetInstallationModal();
    this.runInstallationSteps();
  }

  showInstallationModal() {
    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.classList.add("show");
      document.body.classList.add("modal-open");
    }
  }

  resetInstallationModal() {
    const progressFill = document.querySelector(".installation-progress-fill");
    const progressText = document.querySelector(".installation-progress-text");
    const installationStepsContainer = document.querySelector(
      ".installation-steps"
    );
    const installationComplete = document.getElementById(
      "installationComplete"
    );

    if (progressFill) progressFill.style.width = "0%";
    if (progressText) progressText.textContent = "Preparing installation...";

    if (installationStepsContainer) {
      installationStepsContainer.style.display = "flex";
      // Reset all step statuses
      this.installationSteps.forEach((step) => {
        const stepElement = document.getElementById(step.id);
        if (stepElement) {
          stepElement.classList.remove("active", "completed");
          const icon = stepElement.querySelector(".install-status i");
          if (icon) {
            icon.className = "fas fa-clock";
          }
        }
      });
    }
    if (installationComplete) installationComplete.style.display = "none";
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
      const stepsContainer = document.querySelector(".installation-steps");
      const completeSection = document.getElementById("installationComplete");

      if (stepsContainer) stepsContainer.style.display = "none";
      if (completeSection) completeSection.style.display = "block";

      this.showFinalStats();
      this.updateWebsiteDetails();
      this.saveFinalConfiguration();

      // Add a close button to the installation complete section
      const installationActions = document.querySelector(
        "#installationComplete .installation-actions"
      );
      if (
        installationActions &&
        !installationActions.querySelector("#closeInstallationModalBtn")
      ) {
        const closeButton = document.createElement("button");
        closeButton.id = "closeInstallationModalBtn";
        closeButton.className = "btn btn-secondary";
        closeButton.innerHTML = '<i class="fas fa-times"></i> Close';
        installationActions.appendChild(closeButton);
      }
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
    try {
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
            this.wizardData.storeInfo?.name
              ?.toLowerCase()
              .replace(/\s+/g, "-") || "yourwebsite"
          }.com`,
          adminUrl: `https://${
            this.wizardData.storeInfo?.name
              ?.toLowerCase()
              .replace(/\s+/g, "-") || "yourwebsite"
          }.com/admin`,
        },
        summary: this.generateConfigSummary(),
      };

      localStorage.setItem(
        "finalInstallationConfig",
        JSON.stringify(finalConfig)
      );
      this.debugLog("Final configuration saved", finalConfig);
    } catch (error) {
      this.errorLog("Failed to save final configuration", error);
    }
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
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        configuration: this.wizardData,
        checksum: this.generateConfigChecksum(this.wizardData),
      };

      localStorage.setItem("wizardBackup", JSON.stringify(backupData));
      this.debugLog("Backup point created", backupData.timestamp);
      return backupData;
    } catch (error) {
      this.errorLog("Failed to create backup point", error);
      return null;
    }
  }

  generateConfigChecksum(data) {
    // Simple checksum generation - optimized for production
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

  // Method to close the installation modal
  closeInstallationModal() {
    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.classList.remove("modal-open");
      // Reset the modal content to its initial state
      this.resetInstallationModal();
    }
  }

  // Custom message box function (replaces native alert/confirm)
  showCustomMessageBox(title, message, onConfirm, onCancel) {
    // Create modal elements dynamically
    let msgBox = document.getElementById("customMessageBox");
    if (!msgBox) {
      msgBox = document.createElement("div");
      msgBox.id = "customMessageBox";
      msgBox.className = "custom-message-box";
      document.body.appendChild(msgBox);
    }

    msgBox.innerHTML = `
        <div class="message-box-overlay"></div>
        <div class="message-box-content">
          <div class="message-box-header">
            <h3 class="message-box-title">${title}</h3>
            <button class="message-box-close">&times;</button>
          </div>
          <div class="message-box-body">
            <p>${message}</p>
          </div>
          <div class="message-box-actions">
            <button class="btn btn-primary message-box-confirm">Yes</button>
            <button class="btn btn-secondary message-box-cancel">No</button>
          </div>
        </div>
      `;

    // Show the message box
    msgBox.classList.add("show");
    document.body.classList.add("modal-open");

    // Bind events
    const confirmBtn = msgBox.querySelector(".message-box-confirm");
    const cancelBtn = msgBox.querySelector(".message-box-cancel");
    const closeBtn = msgBox.querySelector(".message-box-close");
    const overlay = msgBox.querySelector(".message-box-overlay");

    const closeMessageBox = () => {
      msgBox.classList.remove("show");
      document.body.classList.remove("modal-open");
      // Clean up event listeners to prevent memory leaks
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
      closeBtn.removeEventListener("click", handleCancel);
      overlay.removeEventListener("click", handleCancel);
    };

    const handleConfirm = () => {
      if (onConfirm) onConfirm();
      closeMessageBox();
    };

    const handleCancel = () => {
      if (onCancel) onCancel();
      closeMessageBox();
    };

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
    closeBtn.addEventListener("click", handleCancel);
    overlay.addEventListener("click", handleCancel);
  }

  // Optimized method to handle large data operations
  performBulkOperation(operation, data, callback) {
    // Use requestAnimationFrame to prevent UI blocking
    const batchSize = 100;
    let index = 0;

    const processBatch = () => {
      const endIndex = Math.min(index + batchSize, data.length);

      for (let i = index; i < endIndex; i++) {
        operation(data[i], i);
      }

      index = endIndex;

      if (index < data.length) {
        requestAnimationFrame(processBatch);
      } else if (callback) {
        callback();
      }
    };

    requestAnimationFrame(processBatch);
  }

  // Method to cleanup resources when component is destroyed
  cleanup() {
    // Clear any timers or intervals
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    // Remove event listeners
    document.removeEventListener("click", this.boundClickHandler);

    // Clear any pending operations
    if (this.pendingOperations) {
      this.pendingOperations.forEach((operation) => {
        if (operation.cancel) {
          operation.cancel();
        }
      });
    }

    this.debugLog("Step 6 cleanup completed");
  }
}

// Global functions for installation flow - Production ready
window.viewWebsite = function () {
  if (window.step6SummaryInstallation) {
    window.step6SummaryInstallation.updateWebsiteDetails();
  }

  const storeName = window.wizardData?.storeInfo?.name || "Your Website";
  const websiteUrl = `https://${storeName
    .toLowerCase()
    .replace(/\s+/g, "-")}.com`;

  // Use custom message box instead of confirm()
  if (window.step6SummaryInstallation) {
    window.step6SummaryInstallation.showCustomMessageBox(
      "Installation Complete",
      `Opening ${storeName}... Would you like to create another website?`,
      () => {
        // User confirmed "Yes" (create another website)
        localStorage.removeItem("wizardData");
        location.reload();
      },
      () => {
        // User confirmed "No" (do not create another website)
        window.step6SummaryInstallation.closeInstallationModal();
      }
    );
  }
};

window.startInstallation = function () {
  if (window.step6SummaryInstallation) {
    // Create backup before installation
    window.step6SummaryInstallation.createBackupPoint();

    // Start installation process
    window.step6SummaryInstallation.startInstallation();
  } else {
    console.error("Step6SummaryInstallation not initialized");
  }
};

// Initialize Step 6 when DOM is ready - Production optimized
document.addEventListener("DOMContentLoaded", function () {
  const step6Content = document.querySelector('.step-content[data-step="6"]');
  if (step6Content) {
    window.step6SummaryInstallation = new Step6SummaryInstallation();

    // Optimized initialization with reduced timeout
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const step6 = document.querySelector('.step-content[data-step="6"]');
          if (step6 && step6.classList.contains("active")) {
            // Use shorter timeout for better performance
            setTimeout(() => {
              if (window.step6SummaryInstallation) {
                window.step6SummaryInstallation.loadWizardData();
                window.step6SummaryInstallation.generateSummary();
              }
            }, 50); // Reduced from 100ms
          }
        }
      });
    });

    // Start observing with optimized settings
    const step6Element = document.querySelector('.step-content[data-step="6"]');
    if (step6Element) {
      observer.observe(step6Element, {
        attributes: true,
        attributeFilter: ["class"], // Only watch for class changes
      });
    }
  }
});

// Cleanup on page unload to prevent memory leaks
window.addEventListener("beforeunload", function () {
  if (
    window.step6SummaryInstallation &&
    typeof window.step6SummaryInstallation.cleanup === "function"
  ) {
    window.step6SummaryInstallation.cleanup();
  }
});

// Export for global access
window.Step6SummaryInstallation = Step6SummaryInstallation;
