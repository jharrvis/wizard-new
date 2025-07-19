// Step 1: Store Info JavaScript Module
// Updated: 2025-07-19 Performance Optimization - Reduced console logging
// User: jharrvis

class Step1StoreInfo {
  constructor() {
    this.storeNameMinLength = 3;
    this.storeNameMaxLength = 50;
    this.suggestedNames = [
      "Amazing Store",
      "Premium Shop",
      "Elite Boutique",
      "Modern Market",
      "Digital Depot",
      "Style Studio",
      "Quality Corner",
      "Smart Shop",
    ];
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadStoredData();
    this.initializeValidation();

    // Check initial validation state after a short delay
    setTimeout(() => {
      const storeNameInput = document.getElementById("storeName");
      if (storeNameInput) {
        this.handleStoreNameInput({ target: storeNameInput });
      }
    }, 100);
  }

  bindEvents() {
    // Store name input events
    const storeNameInput = document.getElementById("storeName");
    if (storeNameInput) {
      storeNameInput.addEventListener("input", (e) =>
        this.handleStoreNameInput(e)
      );
      storeNameInput.addEventListener("blur", (e) =>
        this.validateStoreName(e.target.value)
      );
      storeNameInput.addEventListener("focus", () => this.showSuggestions());
    }

    // Suggestion clicks
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("suggestion-item")) {
        this.selectSuggestion(e.target.textContent);
      }
    });

    // Click outside to hide suggestions
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".store-info-form")) {
        this.hideSuggestions();
      }
    });
  }

  loadStoredData() {
    // Load from global wizard data first
    if (
      window.wizardData &&
      window.wizardData.storeInfo &&
      window.wizardData.storeInfo.name
    ) {
      const storeNameInput = document.getElementById("storeName");
      if (storeNameInput) {
        storeNameInput.value = window.wizardData.storeInfo.name;
        this.handleStoreNameInput({ target: storeNameInput });
      }
    } else {
      // Fallback to localStorage
      const savedData = this.getWizardData();
      if (savedData && savedData.storeInfo && savedData.storeInfo.name) {
        const storeNameInput = document.getElementById("storeName");
        if (storeNameInput) {
          storeNameInput.value = savedData.storeInfo.name;
          this.handleStoreNameInput({ target: storeNameInput });
        }
      } else {
        // Handle the default value from HTML
        const storeNameInput = document.getElementById("storeName");
        if (storeNameInput && storeNameInput.value.trim()) {
          this.handleStoreNameInput({ target: storeNameInput });
        }
      }
    }
  }

  handleStoreNameInput(event) {
    const value = event.target.value;
    this.updateCharacterCounter(value);
    const isValid = this.validateStoreName(value);

    // Update global wizard data
    this.saveStoreInfo(value);

    // Force button state update
    this.updateButtonState(isValid);
  }

  saveStoreInfo(name) {
    try {
      // Update global wizard data
      if (window.wizardData) {
        window.updateWizardData("storeInfo", {
          name: name.trim(),
          timestamp: new Date().toISOString(),
        });
      }

      // Also save to localStorage directly for backward compatibility
      const wizardData = this.getWizardData() || {};
      wizardData.storeInfo = wizardData.storeInfo || {};
      wizardData.storeInfo.name = name.trim();
      wizardData.storeInfo.timestamp = new Date().toISOString();

      localStorage.setItem("wizardData", JSON.stringify(wizardData));

      // Only log in debug mode
      if (window.DEBUG_MODE) {
        console.log("Store info saved:", { name: name.trim() });
      }
    } catch (error) {
      console.error("Error saving store info:", error);
    }
  }

  // New method to handle button state
  updateButtonState(isValid) {
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
      nextBtn.disabled = !isValid;

      // Add visual feedback
      if (isValid) {
        nextBtn.classList.remove("disabled");
      } else {
        nextBtn.classList.add("disabled");
      }
    }

    // Also call the global update function if it exists
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  validateStoreName(name) {
    const trimmedName = name.trim();
    const validationStatus = document.querySelector(".validation-status");

    if (!validationStatus) return false;

    // Clear previous validation
    validationStatus.classList.remove("error", "success");

    if (trimmedName.length === 0) {
      validationStatus.textContent = "Store name is required";
      validationStatus.classList.add("error");
      return false;
    }

    if (trimmedName.length < this.storeNameMinLength) {
      validationStatus.textContent = `Store name must be at least ${this.storeNameMinLength} characters`;
      validationStatus.classList.add("error");
      return false;
    }

    if (trimmedName.length > this.storeNameMaxLength) {
      validationStatus.textContent = `Store name must be less than ${this.storeNameMaxLength} characters`;
      validationStatus.classList.add("error");
      return false;
    }

    // Check for special characters (optional validation)
    const hasSpecialChars = /[^a-zA-Z0-9\s\-_&]/.test(trimmedName);
    if (hasSpecialChars) {
      validationStatus.textContent = "Store name contains invalid characters";
      validationStatus.classList.add("error");
      return false;
    }

    // Check availability (mock check)
    const isAvailable = this.checkNameAvailability(trimmedName);
    if (isAvailable) {
      validationStatus.textContent = "Store name Available";
      validationStatus.classList.add("success");
      return true;
    } else {
      validationStatus.textContent = "Store name not available";
      validationStatus.classList.add("error");
      return false;
    }
  }

  checkNameAvailability(name) {
    // Mock availability check - in real app, this would be an API call
    const unavailableNames = ["test", "demo", "sample", "example", "admin"];
    return !unavailableNames.includes(name.toLowerCase());
  }

  updateCharacterCounter(value) {
    const counter = document.querySelector(".validation-counter");
    if (!counter) return;

    const current = value.length;
    const max = this.storeNameMaxLength;
    counter.textContent = `${current} / ${max}`;

    // Update counter styling based on length
    counter.classList.remove("warning", "error");
    if (current > max * 0.8) {
      counter.classList.add("warning");
    }
    if (current > max) {
      counter.classList.add("error");
    }
  }

  getWizardData() {
    try {
      const saved = localStorage.getItem("wizardData");
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Error loading wizard data:", error);
      return null;
    }
  }

  showSuggestions() {
    const suggestions = document.querySelector(".store-name-suggestions");
    if (suggestions) {
      this.renderSuggestions();
      suggestions.classList.add("show");
    }
  }

  hideSuggestions() {
    const suggestions = document.querySelector(".store-name-suggestions");
    if (suggestions) {
      suggestions.classList.remove("show");
    }
  }

  renderSuggestions() {
    let suggestionsContainer = document.querySelector(
      ".store-name-suggestions"
    );

    if (!suggestionsContainer) {
      suggestionsContainer = document.createElement("div");
      suggestionsContainer.className = "store-name-suggestions";

      const storeInfoForm = document.querySelector(".store-info-form");
      if (storeInfoForm) {
        storeInfoForm.appendChild(suggestionsContainer);
      }
    }

    const html = `
            <div class="suggestions-title">Suggested Store Names:</div>
            <div class="suggestion-list">
              ${this.suggestedNames
                .map((name) => `<div class="suggestion-item">${name}</div>`)
                .join("")}
            </div>
          `;

    suggestionsContainer.innerHTML = html;
  }

  selectSuggestion(name) {
    const storeNameInput = document.getElementById("storeName");
    if (storeNameInput) {
      storeNameInput.value = name;
      this.handleStoreNameInput({ target: storeNameInput });
      this.hideSuggestions();
      storeNameInput.focus();
    }
  }

  initializeValidation() {
    // Create validation elements if they don't exist
    this.createValidationElements();
  }

  createValidationElements() {
    const storeNameFieldset = document
      .querySelector("#storeName")
      ?.closest(".form__fieldset");
    if (!storeNameFieldset) return;

    // Check if validation elements already exist
    if (storeNameFieldset.querySelector(".store-name-validation")) return;

    const validationHTML = `
            <div class="store-name-validation">
              <span class="validation-counter">0 / ${this.storeNameMaxLength}</span>
              <span class="validation-status">Enter your store name</span>
            </div>
          `;

    // Insert after the input box
    const inputBox = storeNameFieldset.querySelector(".form__fieldset_box");
    if (inputBox) {
      inputBox.insertAdjacentHTML("afterend", validationHTML);
    }
  }

  // Public method to validate step
  validateStep() {
    const storeNameInput = document.getElementById("storeName");
    if (!storeNameInput) return false;

    const name = storeNameInput.value.trim();
    const isValid = this.validateStoreName(name);

    // Ensure data is saved when validating
    if (isValid) {
      this.saveStoreInfo(name);
    }

    return isValid;
  }

  // Public method to get step data
  getStepData() {
    const storeNameInput = document.getElementById("storeName");
    const storeData = {
      name: storeNameInput ? storeNameInput.value.trim() : "",
      timestamp: new Date().toISOString(),
      isValid: this.validateStep(),
    };

    // Save data when requested
    this.saveStoreInfo(storeData.name);

    return storeData;
  }

  // Public method to reset step
  resetStep() {
    const storeNameInput = document.getElementById("storeName");
    if (storeNameInput) {
      storeNameInput.value = "";
      this.handleStoreNameInput({ target: storeNameInput });
    }
    this.hideSuggestions();

    // Clear saved data
    if (window.wizardData) {
      window.updateWizardData("storeInfo", {
        name: "",
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Initialize Step 1 when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Only initialize if we're on step 1
  const step1Content = document.querySelector('.step-content[data-step="1"]');
  if (step1Content) {
    window.step1StoreInfo = new Step1StoreInfo();

    // Force enable the next button if there's a valid store name after initialization
    setTimeout(() => {
      const storeNameInput = document.getElementById("storeName");
      const nextBtn = document.getElementById("nextBtn");

      if (storeNameInput && storeNameInput.value.trim() && nextBtn) {
        if (window.step1StoreInfo) {
          const isValid = window.step1StoreInfo.validateStep();
          nextBtn.disabled = !isValid;

          if (isValid) {
            nextBtn.classList.remove("disabled");
          } else {
            nextBtn.classList.add("disabled");
          }
        }
      }
    }, 200);
  }
});

// Export for global access
window.Step1StoreInfo = Step1StoreInfo;
