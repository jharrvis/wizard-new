// Step 5: Sample Data JavaScript Module
// Updated: 2025-07-20 - Improved data persistence logic
// User: jharrvis

class Step5SampleData {
  constructor() {
    this.selectedSample = "with_sample"; // Default selection
    this.isProduction = true; // Set to false for development to enable debug logs.
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadStoredData();
    this.updateSelectionState();
    this.updateNextButton();
  }

  debugLog(message, data = null) {
    if (!this.isProduction && window.DEBUG_MODE) {
      console.log(`[Step5] ${message}:`, data || "");
    }
  }

  errorLog(message, error = null) {
    console.error(`[Step5 Error] ${message}`, error || "");
  }

  bindEvents() {
    // Use event delegation for efficiency
    document.addEventListener("click", (e) => {
      const optionContainer = e.target.closest(".sample-data-option");
      if (optionContainer) {
        const radioInput = optionContainer.querySelector(
          'input[name="sample-data"]'
        );
        if (radioInput && !radioInput.checked) {
          radioInput.checked = true;
          this.selectSample(radioInput.value);
        }
      }
    });
  }

  loadStoredData() {
    const savedData = this.getWizardData();
    if (savedData && savedData.sampleData) {
      this.selectedSample = savedData.sampleData;
    }
    // The UI state will be updated by updateSelectionState()
  }

  selectSample(sampleType) {
    this.selectedSample = sampleType;
    this.updateSelectionState();
    this.saveData();
    this.updateNextButton();
  }

  updateSelectionState() {
    document.querySelectorAll(".sample-data-option").forEach((option) => {
      const radio = option.querySelector('input[name="sample-data"]');
      if (radio) {
        const isSelected = radio.value === this.selectedSample;
        radio.checked = isSelected;
        option.classList.toggle("selected", isSelected);
      }
    });
    this.updateSampleDataInfo();
  }

  updateSampleDataInfo() {
    let infoContainer = document.querySelector(".sample-data-info");
    if (!infoContainer) {
      infoContainer = document.createElement("div");
      infoContainer.className = "sample-data-info";
      const selectionContainer = document.querySelector(
        ".sample-data-selection"
      );
      if (selectionContainer) {
        selectionContainer.appendChild(infoContainer);
      }
    }

    const infoContent =
      this.selectedSample === "with_sample"
        ? {
            title: "Sample Data Included",
            description:
              "Your installation includes demo products, categories, and customers to preview your store. Be sure to remove them before going live.",
          }
        : {
            title: "Clean Installation",
            description:
              "Your store will start with a clean database. You'll need to add your own products and content after installation.",
          };

    infoContainer.innerHTML = `
        <h4><i class="fas fa-info-circle"></i> ${infoContent.title}</h4>
        <p>${infoContent.description}</p>
      `;
  }

  /**
   * Saves the sample data selection robustly.
   * This version reads the latest data from storage, merges the change, and saves it back.
   */
  saveData() {
    try {
      // Always read the latest data from storage to avoid overwriting other keys
      const currentWizardData = this.getWizardData() || {};

      // Update the sampleData property
      currentWizardData.sampleData = this.selectedSample;

      // Save the updated object back to localStorage
      localStorage.setItem("wizardData", JSON.stringify(currentWizardData));

      // Also update the global object if it exists, for immediate use by other scripts
      if (window.wizardData) {
        window.wizardData.sampleData = this.selectedSample;
      }

      this.debugLog("Sample data saved:", currentWizardData);
    } catch (error) {
      this.errorLog("Error saving sample data selection", error);
    }
  }

  getWizardData() {
    try {
      const saved = localStorage.getItem("wizardData");
      return saved ? JSON.parse(saved) : {}; // Return empty object if null
    } catch (error) {
      this.errorLog("Error loading wizard data", error);
      return {};
    }
  }

  updateNextButton() {
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  validateStep() {
    const isValid = !!this.selectedSample;
    if (isValid) {
      this.saveData();
    }
    return isValid;
  }

  getStepData() {
    this.saveData(); // Ensure data is saved whenever it's requested
    return {
      sampleData: this.selectedSample,
      useSampleData: this.selectedSample === "with_sample",
      timestamp: new Date().toISOString(),
      isValid: this.validateStep(),
    };
  }

  resetStep() {
    this.selectedSample = "with_sample"; // Reset to default
    this.updateSelectionState();
    this.saveData();
  }

  cleanup() {
    this.debugLog("Step 5 cleanup completed");
  }
}

// Initialize Step 5 when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  const step5Content = document.querySelector('.step-content[data-step="5"]');
  if (step5Content) {
    if (!window.step5SampleData) {
      window.step5SampleData = new Step5SampleData();
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.attributeName === "class" &&
          step5Content.classList.contains("active")
        ) {
          setTimeout(() => {
            if (window.step5SampleData) {
              window.step5SampleData.loadStoredData();
              window.step5SampleData.updateSelectionState();
              window.step5SampleData.updateNextButton();
            }
          }, 50);
        }
      }
    });

    observer.observe(step5Content, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }
});

// Cleanup on page unload
window.addEventListener("beforeunload", function () {
  if (
    window.step5SampleData &&
    typeof window.step5SampleData.cleanup === "function"
  ) {
    window.step5SampleData.cleanup();
  }
});

// Export for global access
window.Step5SampleData = Step5SampleData;
