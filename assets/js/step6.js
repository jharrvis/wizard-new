/**
 * @file Step 6: Summary & Installation JavaScript Module
 * @description This file handles the final summary, validation, and installation process for a web setup wizard.
 * It consolidates user choices from previous steps, displays a summary, checks for configuration issues,
 * and simulates an installation process.
 * @version 2.0.0
 * @date 2025-07-20
 */

class Step6SummaryInstallation {
  /**
   * Initializes the Step6SummaryInstallation class.
   */
  constructor() {
    this.wizardData = {};
    this.isProduction = true; // Set to false for development to enable debug logs.
    this.boundClickHandler = null; // To hold the bound event listener for later removal.

    // Defines the sequence of steps for the installation modal.
    this.installationSteps = [
      {
        id: "downloadStep",
        title: "Downloading Platform",
        description: "Downloading and extracting platform files...",
        icon: "fas fa-download",
        duration: 800,
      },
      {
        id: "databaseStep",
        title: "Setting up Database",
        description: "Creating database structure and tables...",
        icon: "fas fa-database",
        duration: 1000,
      },
      {
        id: "configStep",
        title: "Configuring Platform",
        description: "Applying configuration settings and plugins...",
        icon: "fas fa-cog",
        duration: 800,
      },
      {
        id: "completeStep",
        title: "Installation Complete",
        description: "Your website is ready to use!",
        icon: "fas fa-check",
        duration: 500,
      },
    ];

    this.init();
  }

  /**
   * Kicks off the initial setup.
   */
  init() {
    this.loadWizardData();
    this.bindEvents();
    this.generateSummary();
    this.updateInstallButton();
  }

  // --- Logging Utilities ---

  /**
   * Logs a debug message to the console if not in production mode.
   * @param {string} message - The message to log.
   * @param {*} [data=null] - Optional data to log with the message.
   */
  debugLog(message, data = null) {
    if (!this.isProduction && window.DEBUG_MODE) {
      console.log(`[Step6] ${message}:`, data || "");
    }
  }

  /**
   * Logs an error message to the console.
   * @param {string} message - The error message.
   * @param {*} [error=null] - The associated error object.
   */
  errorLog(message, error = null) {
    console.error(`[Step6 Error] ${message}`, error || "");
  }

  // --- Event Handling ---

  /**
   * Binds all necessary event listeners.
   */
  bindEvents() {
    // Use a bound handler to ensure 'this' context and allow for later removal.
    this.boundClickHandler = this.handleDocumentClick.bind(this);
    document.addEventListener("click", this.boundClickHandler);

    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        // Close modal if the overlay (the modal element itself) is clicked.
        if (e.target === modal) {
          this.closeInstallationModal();
        }
      });
    }
  }

  /**
   * Handles click events on the document, delegating to specific handlers.
   * @param {Event} e - The click event object.
   */
  handleDocumentClick(e) {
    if (e.target.closest("#closeInstallationModalBtn")) {
      this.closeInstallationModal();
    }
  }

  // --- Data and State Management ---

  /**
   * Loads wizard data from localStorage.
   */
  loadWizardData() {
    try {
      const saved = localStorage.getItem("wizardData");
      this.wizardData = saved ? JSON.parse(saved) : {};
      this.debugLog("Wizard data loaded for summary", this.wizardData);
    } catch (error) {
      this.errorLog("Error loading wizard data", error);
      this.wizardData = {};
    }
  }

  /**
   * Resets the step to its initial state.
   */
  resetStep() {
    this.clearDynamicSections();
    this.loadWizardData();
    this.generateSummary();
  }

  // --- UI Generation and Updates ---

  /**
   * Orchestrates the generation of the entire summary view.
   */
  generateSummary() {
    this.clearDynamicSections();
    this.updateStoreInfo();
    this.updateSystemOptions();
    this.updateStylesSummary();
    this.updatePluginsSummary();
    this.updateSampleDataSummary();
    this.generateSystemRequirements();
    this.generateInstallationEstimate();
    this.showConfigurationWarnings();
  }

  /**
   * Removes dynamically generated sections to prevent duplication on re-renders.
   */
  clearDynamicSections() {
    const summaryDisplay = document.querySelector(".summary-display");
    if (!summaryDisplay) return;

    const selectors = [
      ".system-requirements",
      ".installation-summary",
      ".config-warnings",
    ];
    selectors.forEach((selector) => {
      const element = summaryDisplay.querySelector(selector);
      if (element) {
        element.remove();
      }
    });
  }

  /**
   * Updates the store name in the summary.
   */
  updateStoreInfo() {
    const el = document.getElementById("summary-store-name");
    if (el) {
      el.textContent = this.wizardData.storeInfo?.name || "Not Set";
    }
  }

  /**
   * Updates the platform and version in the summary.
   */
  updateSystemOptions() {
    const el = document.getElementById("summary-version");
    if (el) {
      const { selected: platform, version } = this.wizardData.platform || {};
      if (platform && version) {
        const platformName =
          platform.charAt(0).toUpperCase() + platform.slice(1);
        el.textContent = `${platformName} ${version}`;
      } else {
        el.textContent = "Not Selected";
      }
    }
  }

  /**
   * Updates the theme, logos, colors, and fonts in the summary.
   */
  updateStylesSummary() {
    const styling = this.wizardData.styling || {};
    const { logos = {}, colors = {}, fonts = {} } = styling;

    // Update Theme
    const themeEl = document.getElementById("summary-selected-theme");
    if (themeEl) {
      const themeNames = {
        luma: "Luma Theme",
        hyva: "Hyvä Theme",
        default: "Default Theme",
        ecommerce: "E-commerce Pro",
      };
      themeEl.textContent = themeNames[this.wizardData.theme] || "Not Selected";
    }

    // Update Logos
    const desktopLogoEl = document.getElementById("summary-desktop-logo");
    if (desktopLogoEl) {
      desktopLogoEl.textContent = logos.desktop
        ? `✓ ${logos.desktopName || "Desktop logo"} uploaded`
        : "No desktop logo uploaded";
    }
    const mobileLogoEl = document.getElementById("summary-mobile-logo");
    if (mobileLogoEl) {
      mobileLogoEl.textContent = logos.mobile
        ? `✓ ${logos.mobileName || "Mobile logo"} uploaded`
        : "No mobile logo uploaded";
    }

    // Update Colors
    const primaryColorEl = document.getElementById("summary-primary-color");
    if (primaryColorEl && colors.primary) {
      primaryColorEl.textContent = colors.primary;
      primaryColorEl.style.color = colors.primary;
    }
    const secondaryColorEl = document.getElementById("summary-secondary-color");
    if (secondaryColorEl && colors.secondary) {
      secondaryColorEl.textContent = colors.secondary;
      secondaryColorEl.style.color = colors.secondary;
    }
    const tertiaryColorEl = document.getElementById("summary-tertiary-color");
    if (tertiaryColorEl && colors.tertiary) {
      tertiaryColorEl.textContent = colors.tertiary;
      tertiaryColorEl.style.color = colors.tertiary;
    }

    // Update Fonts
    const fontsEl = document.getElementById("summary-fonts");
    if (fontsEl) {
      fontsEl.textContent = fonts.useDefault
        ? "Using Default Theme Font"
        : fonts.customFont || fonts.family || "Custom Font";
    }
  }

  /**
   * Updates the list of selected plugins and their license status.
   */
  updatePluginsSummary() {
    const pluginsListEl = document.getElementById("summary-plugins");
    if (!pluginsListEl) return;

    pluginsListEl.innerHTML = "";
    const selectedPlugins = Object.keys(this.wizardData.plugins || {}).filter(
      (key) => this.wizardData.plugins[key]
    );

    if (selectedPlugins.length > 0) {
      selectedPlugins.forEach((pluginId) => {
        const li = document.createElement("li");
        const pluginName = this.getPluginName(pluginId);
        const needsLicense = this.pluginNeedsLicense(pluginId);
        const hasLicense = this.wizardData.licenseKeys?.[pluginId];

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
        if (needsLicense && !hasLicense) {
          li.classList.add("warning");
        }
        pluginsListEl.appendChild(li);
      });
    } else {
      pluginsListEl.innerHTML = "<li><span>No plugins selected</span></li>";
    }
  }

  /**
   * Updates the sample data choice in the summary.
   */
  updateSampleDataSummary() {
    const sampleDataEl = document.getElementById("summary-sample-data");
    if (sampleDataEl) {
      const sampleData = this.wizardData.sampleData;
      sampleDataEl.textContent =
        sampleData === "with_sample"
          ? "Yes, using sample data"
          : "No, using own data";
    }
  }

  /**
   * Generates and injects the system requirements section.
   */
  generateSystemRequirements() {
    const summaryDisplay = document.querySelector(".summary-display");
    if (!summaryDisplay) return;

    const {
      selected: platform,
      version,
      dependencies,
    } = this.wizardData.platform || {};
    if (!platform || !version || !dependencies) {
      this.debugLog("Platform data missing, skipping system requirements");
      return;
    }

    const iconMap = {
      php: "fab fa-php",
      mariadb: "fas fa-database",
      redis: "fas fa-memory",
      opensearch: "fas fa-search",
    };
    const requirements = Object.entries(dependencies)
      .filter(([, value]) => value !== "N/A")
      .map(([key, value]) => ({
        key,
        name: key.toUpperCase(),
        version: value,
        icon: iconMap[key] || "fas fa-cog",
      }));

    if (requirements.length === 0) return;

    const requirementsSection = document.createElement("div");
    requirementsSection.className = "summary-item system-requirements";
    requirementsSection.innerHTML = `
      <h4 class="h4-headline"><i class="fas fa-server"></i> System Requirements</h4>
      <div class="requirements-grid">
        ${requirements
          .map(
            (req) => `
          <div class="requirement-item">
            <div class="requirement-icon ${req.key}"><i class="${req.icon}"></i></div>
            <div class="requirement-details">
              <div class="requirement-text">${req.name}</div>
              <div class="requirement-version">v${req.version}</div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>`;

    const summaryItems = summaryDisplay.querySelectorAll(
      ".summary-item:not(.system-requirements):not(.installation-summary):not(.config-warnings)"
    );
    if (summaryItems.length >= 3) {
      summaryItems[2].insertAdjacentElement("afterend", requirementsSection);
    } else {
      summaryDisplay.appendChild(requirementsSection);
    }
  }

  /**
   * Generates and injects the installation estimate section.
   */
  generateInstallationEstimate() {
    const summaryDisplay = document.querySelector(".summary-display");
    if (!summaryDisplay) return;

    const installationSummary = document.createElement("div");
    installationSummary.className = "summary-item installation-summary";
    installationSummary.innerHTML = `
      <h4 class="h4-headline"><i class="fas fa-rocket"></i> Installation Estimate</h4>
      <p class="p-text">Your website configuration is complete and ready to be installed.</p>
      <div class="installation-estimates">
        <div class="estimate-item">
          <span class="estimate-value">${this.calculateInstallationTime()}</span>
          <span class="estimate-label">Install Time</span>
        </div>
        <div class="estimate-item">
          <span class="estimate-value">${this.calculateInstallationSize()}</span>
          <span class="estimate-label">Total Size</span>
        </div>
      </div>`;
    summaryDisplay.appendChild(installationSummary);
  }

  /**
   * Displays configuration warnings if any are found.
   */
  showConfigurationWarnings() {
    const warnings = this.getConfigurationWarnings();
    if (warnings.length === 0) return;

    const summaryDisplay = document.querySelector(".summary-display");
    if (!summaryDisplay) return;

    const warningSection = document.createElement("div");
    warningSection.className = "summary-item config-warnings";
    warningSection.innerHTML = `
      <h4 class="h4-headline"><i class="fas fa-exclamation-triangle"></i> Configuration Warnings</h4>
      <p class="p-text">Please review the following before installation:</p>
      <ul class="warning-list">
        ${warnings
          .map((warning) => `<li class="warning-item">${warning}</li>`)
          .join("")}
      </ul>`;
    summaryDisplay.insertBefore(warningSection, summaryDisplay.firstChild);
  }

  // --- Calculations and Validations ---

  /**
   * Calculates the estimated installation time.
   * @returns {string} The estimated time (e.g., "2 min").
   */
  calculateInstallationTime() {
    let baseTime = 1; // minutes
    if (this.wizardData.sampleData === "with_sample") baseTime += 0.5;
    const pluginCount = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    ).length;
    baseTime += pluginCount * 0.1;
    return `${Math.ceil(baseTime)} min`;
  }

  /**
   * Calculates the estimated installation size.
   * @returns {string} The estimated size (e.g., "75 MB" or "1.2 GB").
   */
  calculateInstallationSize() {
    let baseSize = 50; // MB
    if (this.wizardData.sampleData === "with_sample") baseSize += 20;
    const pluginCount = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    ).length;
    baseSize += pluginCount * 2;
    return baseSize > 1000
      ? `${(baseSize / 1000).toFixed(1)} GB`
      : `${baseSize} MB`;
  }

  /**
   * Gathers all configuration warnings.
   * @returns {string[]} An array of warning messages.
   */
  getConfigurationWarnings() {
    const warnings = [];
    if (!this.wizardData.storeInfo?.name)
      warnings.push("Store name is not set");
    if (
      !this.wizardData.platform?.selected ||
      !this.wizardData.platform?.version
    )
      warnings.push("Platform and version must be selected");
    if (!this.wizardData.theme) warnings.push("Theme must be selected");

    Object.keys(this.wizardData.plugins || {}).forEach((pluginId) => {
      if (
        this.wizardData.plugins[pluginId] &&
        this.pluginNeedsLicense(pluginId) &&
        !this.wizardData.licenseKeys?.[pluginId]
      ) {
        warnings.push(`${this.getPluginName(pluginId)} requires a license key`);
      }
    });

    if (this.wizardData.sampleData === "with_sample")
      warnings.push("Remember to remove sample data before going live");
    if (
      !this.wizardData.styling?.logos?.desktop &&
      !this.wizardData.styling?.logos?.mobile
    )
      warnings.push("Consider uploading a logo for brand recognition");

    return warnings;
  }

  /**
   * Validates the current step's configuration.
   * @returns {boolean} True if valid, false otherwise.
   */
  validateStep() {
    return this.validateConfiguration().length === 0;
  }

  /**
   * Gathers all configuration validation errors.
   * @returns {string[]} An array of error messages.
   */
  validateConfiguration() {
    const errors = [];
    if (!this.wizardData.storeInfo?.name) errors.push("Store name is required");
    if (!this.wizardData.platform?.selected)
      errors.push("Platform selection is required");
    if (!this.wizardData.platform?.version)
      errors.push("Platform version is required");
    if (!this.wizardData.theme) errors.push("Theme selection is required");

    Object.keys(this.wizardData.plugins || {}).forEach((pluginId) => {
      if (
        this.wizardData.plugins[pluginId] &&
        this.pluginNeedsLicense(pluginId) &&
        !this.wizardData.licenseKeys?.[pluginId]
      ) {
        errors.push(`License key required for ${this.getPluginName(pluginId)}`);
      }
    });
    return errors;
  }

  // --- Installation Process ---

  /**
   * Starts the installation simulation.
   */
  startInstallation() {
    this.debugLog("Starting installation process");
    this.createBackupPoint();
    this.showInstallationModal();
    this.resetInstallationModal();
    this.runInstallationSteps();
  }

  /**
   * Shows the installation modal.
   */
  showInstallationModal() {
    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.classList.add("show");
      document.body.classList.add("modal-open");
    }
  }

  /**
   * Closes the installation modal.
   */
  closeInstallationModal() {
    const modal = document.getElementById("installationModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.classList.remove("modal-open");
      this.resetInstallationModal();
    }
  }

  /**
   * Resets the installation modal to its initial state.
   */
  resetInstallationModal() {
    document.querySelector(".installation-progress-fill").style.width = "0%";
    document.querySelector(".installation-progress-text").textContent =
      "Preparing installation...";
    document.querySelector(".installation-steps").style.display = "flex";
    document.getElementById("installationComplete").style.display = "none";

    this.installationSteps.forEach((step) => {
      const stepEl = document.getElementById(step.id);
      if (stepEl) {
        stepEl.classList.remove("active", "completed");
        stepEl.querySelector(".install-status i").className = "fas fa-clock";
      }
    });
  }

  /**
   * Runs the installation steps sequentially.
   */
  runInstallationSteps() {
    let currentStepIndex = 0;
    const runNextStep = () => {
      if (currentStepIndex >= this.installationSteps.length) {
        this.completeInstallation();
        return;
      }

      const step = this.installationSteps[currentStepIndex];
      this.activateInstallationStep(step.id);

      const progress =
        ((currentStepIndex + 1) / this.installationSteps.length) * 100;
      this.updateInstallationProgress(progress, step.description);

      setTimeout(() => {
        this.completeInstallationStep(step.id);
        currentStepIndex++;
        runNextStep();
      }, step.duration);
    };
    runNextStep();
  }

  /**
   * Sets a step's visual state to "active".
   * @param {string} stepId - The ID of the step element.
   */
  activateInstallationStep(stepId) {
    const stepEl = document.getElementById(stepId);
    if (stepEl) {
      stepEl.classList.add("active");
      stepEl.querySelector(".install-status i").className =
        "fas fa-spinner fa-spin";
    }
  }

  /**
   * Sets a step's visual state to "completed".
   * @param {string} stepId - The ID of the step element.
   */
  completeInstallationStep(stepId) {
    const stepEl = document.getElementById(stepId);
    if (stepEl) {
      stepEl.classList.remove("active");
      stepEl.classList.add("completed");
      stepEl.querySelector(".install-status i").className = "fas fa-check";
    }
  }

  /**
   * Updates the main progress bar and text.
   * @param {number} percentage - The progress percentage (0-100).
   * @param {string} message - The message to display.
   */
  updateInstallationProgress(percentage, message) {
    const progressBar = document.querySelector(".installation-progress-fill");
    if (progressBar) progressBar.style.width = `${percentage}%`;

    const progressText = document.querySelector(".installation-progress-text");
    if (progressText)
      progressText.textContent =
        message || `Installation Progress: ${Math.round(percentage)}%`;
  }

  /**
   * Finalizes the installation process and shows the completion screen.
   */
  completeInstallation() {
    setTimeout(() => {
      document.querySelector(".installation-steps").style.display = "none";
      const completeSection = document.getElementById("installationComplete");
      if (completeSection) completeSection.style.display = "block";

      this.showFinalStats();
      this.updateWebsiteDetails();
      this.saveFinalConfiguration();
    }, 1000);
  }

  /**
   * Displays the final installation statistics.
   */
  showFinalStats() {
    const stats = this.generateFinalStats();
    const statsSection = document.querySelector(
      "#installationComplete .final-stats"
    );
    if (statsSection) {
      statsSection.innerHTML = stats
        .map(
          (stat) => `
        <div class="final-stat">
          <div class="final-stat-icon"><i class="${stat.icon}"></i></div>
          <span class="final-stat-value">${stat.value}</span>
          <div class="final-stat-label">${stat.label}</div>
        </div>
      `
        )
        .join("");
    }
  }

  /**
   * Generates the data for the final stats display.
   * @returns {object[]} An array of stat objects.
   */
  generateFinalStats() {
    const pluginCount = Object.keys(this.wizardData.plugins || {}).filter(
      (id) => this.wizardData.plugins[id]
    ).length;
    return [
      {
        icon: "fas fa-puzzle-piece",
        value: pluginCount,
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

  /**
   * Updates the website URL and admin panel links on the completion screen.
   */
  updateWebsiteDetails() {
    const storeName = this.wizardData.storeInfo?.name || "yourwebsite";
    const websiteUrl = `https://${storeName
      .toLowerCase()
      .replace(/\s+/g, "-")}.com`;
    const adminUrl = `${websiteUrl}/admin`;

    const detailsEl = document.querySelector(".website-details");
    if (detailsEl) {
      detailsEl.innerHTML = `
        <h4>Your Website is Ready!</h4>
        <div class="website-details-grid">
          <div class="website-detail-item">
            <div class="website-detail-icon"><i class="fas fa-globe"></i></div>
            <div class="website-detail-content">
              <div class="website-detail-label">Website URL</div>
              <div class="website-detail-value"><a href="${websiteUrl}" target="_blank">${websiteUrl}</a></div>
            </div>
          </div>
          <div class="website-detail-item">
            <div class="website-detail-icon"><i class="fas fa-user-shield"></i></div>
            <div class="website-detail-content">
              <div class="website-detail-label">Admin Panel</div>
              <div class="website-detail-value"><a href="${adminUrl}" target="_blank">${adminUrl}</a></div>
            </div>
          </div>
        </div>`;
    }
  }

  // --- Data Persistence and Export ---

  /**
   * Saves the final configuration to localStorage.
   */
  saveFinalConfiguration() {
    try {
      const finalConfig = this.getInstallationConfig();
      localStorage.setItem(
        "finalInstallationConfig",
        JSON.stringify(finalConfig)
      );
      this.debugLog("Final configuration saved", finalConfig);
    } catch (error) {
      this.errorLog("Failed to save final configuration", error);
    }
  }

  /**
   * Creates a backup of the configuration in localStorage.
   */
  createBackupPoint() {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        configuration: this.wizardData,
      };
      localStorage.setItem("wizardBackup", JSON.stringify(backupData));
      this.debugLog("Backup point created", backupData.timestamp);
    } catch (error) {
      this.errorLog("Failed to create backup point", error);
    }
  }

  /**
   * Returns the complete configuration object for the current step.
   * @returns {object} The step data.
   */
  getStepData() {
    return {
      finalConfiguration: this.wizardData,
      isValid: this.validateStep(),
      validationErrors: this.validateConfiguration(),
      warnings: this.getConfigurationWarnings(),
      estimates: {
        installTime: this.calculateInstallationTime(),
        totalSize: this.calculateInstallationSize(),
      },
      summary: this.generateConfigSummary(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generates a summary object of the configuration.
   * @returns {object} A summary of the configuration.
   */
  generateConfigSummary() {
    return {
      storeName: this.wizardData.storeInfo?.name || "Not Set",
      platform: this.wizardData.platform?.selected || "Not Selected",
      version: this.wizardData.platform?.version || "Not Selected",
      theme: this.wizardData.theme || "Not Selected",
      selectedPlugins: Object.keys(this.wizardData.plugins || {}).filter(
        (id) => this.wizardData.plugins[id]
      ),
      sampleData: this.wizardData.sampleData === "with_sample",
    };
  }

  /**
   * Returns a complete configuration object for backend processing.
   * @returns {object} The full installation configuration.
   */
  getInstallationConfig() {
    return {
      ...this.getStepData(),
      systemRequirements: this.getSystemRequirements(
        this.wizardData.platform?.selected,
        this.wizardData.platform?.version
      ),
    };
  }

  // --- Helpers & Utilities ---

  /**
   * Retrieves a plugin's display name.
   * @param {string} pluginId - The ID of the plugin.
   * @returns {string} The plugin's name.
   */
  getPluginName(pluginId) {
    if (window.step4PluginSettings?.getPluginName) {
      return window.step4PluginSettings.getPluginName(pluginId);
    }
    const fallbackNames = {
      ppcp: "PayPal",
      stripe: "Stripe",
      adyen: "Adyen",
      klaviyo: "Klaviyo",
      klevu: "Klevu",
      algolia: "Algolia",
    };
    return (
      fallbackNames[pluginId] ||
      pluginId.charAt(0).toUpperCase() + pluginId.slice(1)
    );
  }

  /**
   * Checks if a plugin requires a license.
   * @param {string} pluginId - The ID of the plugin.
   * @returns {boolean} True if a license is needed.
   */
  pluginNeedsLicense(pluginId) {
    if (window.step4PluginSettings?.checkIfPluginNeedsLicense) {
      return window.step4PluginSettings.checkIfPluginNeedsLicense(pluginId);
    }
    const licenseRequired = [
      "hyva",
      "klaviyo",
      "yotpo",
      "klevu",
      "algolia",
      "avalara",
      "shipperq",
    ];
    return licenseRequired.includes(pluginId);
  }

  /**
   * Triggers a global UI update for the main navigation button.
   */
  updateInstallButton() {
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  /**
   * Cleans up resources like event listeners to prevent memory leaks.
   */
  cleanup() {
    if (this.boundClickHandler) {
      document.removeEventListener("click", this.boundClickHandler);
    }
    this.debugLog("Step 6 cleanup completed");
  }
}

// --- Global Scope & Initialization ---

/**
 * Initializes the Step6SummaryInstallation class when the DOM is ready and the step is active.
 */
document.addEventListener("DOMContentLoaded", () => {
  const step6Content = document.querySelector('.step-content[data-step="6"]');
  if (!step6Content) return;

  // Initialize the class and attach it to the window for global access.
  window.step6SummaryInstallation = new Step6SummaryInstallation();

  // Use a MutationObserver to efficiently detect when the step becomes active.
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.attributeName === "class" &&
        step6Content.classList.contains("active")
      ) {
        // When the step is activated, reload data and regenerate the summary.
        // Use a small timeout to ensure other scripts have finished.
        setTimeout(() => {
          window.step6SummaryInstallation?.resetStep();
        }, 50);
        // No need to observe further once activated, but we keep it in case of deactivation/reactivation.
      }
    }
  });

  observer.observe(step6Content, {
    attributes: true,
    attributeFilter: ["class"],
  });
});

/**
 * Global function to start the installation process.
 */
window.startInstallation = function () {
  if (window.step6SummaryInstallation) {
    window.step6SummaryInstallation.startInstallation();
  } else {
    console.error("Step6SummaryInstallation not initialized.");
  }
};

/**
 * Cleans up resources when the user navigates away from the page.
 */
window.addEventListener("beforeunload", () => {
  window.step6SummaryInstallation?.cleanup();
});
