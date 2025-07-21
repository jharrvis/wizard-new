// Step 3: Styles & Design JavaScript Module
// Updated: 2025-07-21 - Enhanced Theme Preview with External Loading
// User: jharrvis

class Step3StylesDesign {
  constructor() {
    this.currentTab = "theme";
    this.selectedTheme = null;
    this.useDefaultFont = true;
    this.customFont = null;
    this.colors = {
      primary: "#4e54c8",
      secondary: "#8f94fb",
      tertiary: "#19b78a",
    };
    this.logos = {
      desktop: null,
      mobile: null,
      desktopName: null,
      mobileName: null,
    };
    this.currentPreviewMode = "desktop"; // 'desktop' or 'mobile'

    this.popularGoogleFonts = [
      "Open Sans",
      "Roboto",
      "Lato",
      "Montserrat",
      "Poppins",
      "Source Sans Pro",
      "Oswald",
      "Raleway",
      "Nunito",
      "Playfair Display",
      "Merriweather",
      "Ubuntu",
      "Roboto Condensed",
      "Roboto Slab",
      "PT Sans",
      "Noto Sans",
      "Libre Baskerville",
      "Crimson Text",
      "Work Sans",
      "Fira Sans",
      "Inter",
      "Rubik",
      "Quicksand",
      "Barlow",
      "Titillium Web",
    ];

    // Theme file paths
    this.themeFiles = {
      luma: "assets/themes/luma/index.html",
      hyva: "assets/themes/hyva/index.html",
      default: "assets/themes/default/index.html",
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadStoredData();
    this.initializeColorGuide();
    this.updateThemeOptions();
  }

  bindEvents() {
    // Tab navigation
    document.querySelectorAll(".style-tabs .tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const tab = button.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });

    // Theme selection
    document.querySelectorAll(".theme-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        const theme = item.getAttribute("data-theme");
        this.selectTheme(theme);
      });
    });

    // Logo uploads
    const desktopLogoFile = document.getElementById("desktopLogoFile");
    const mobileLogoFile = document.getElementById("mobileLogoFile");

    if (desktopLogoFile) {
      desktopLogoFile.addEventListener("change", (e) => {
        this.handleLogoUpload(e.target, "desktop");
      });
    }

    if (mobileLogoFile) {
      mobileLogoFile.addEventListener("change", (e) => {
        this.handleLogoUpload(e.target, "mobile");
      });
    }

    // Color inputs
    ["primary", "secondary", "tertiary"].forEach((colorType) => {
      const picker = document.getElementById(`${colorType}ColorPicker`);
      const input = document.getElementById(`${colorType}ColorValue`);

      if (picker) {
        picker.addEventListener("input", (e) => {
          this.updateColor(colorType, e.target.value);
        });
      }

      if (input) {
        input.addEventListener("input", (e) => {
          this.updateColorFromText(colorType, e.target.value);
        });
      }
    });

    // Font selection
    const useDefaultFont = document.getElementById("useDefaultFont");
    if (useDefaultFont) {
      useDefaultFont.addEventListener("change", (e) => {
        this.toggleFontSelection(e.target.checked);
      });
    }

    const fontSearchInput = document.getElementById("fontSearchInput");
    if (fontSearchInput) {
      fontSearchInput.addEventListener("input", (e) => {
        this.searchGoogleFonts(e.target.value);
      });
    }

    // Click outside to close font suggestions
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".font-search-container")) {
        this.hideFontSuggestions();
      }
    });

    // Responsive device toggle buttons
    document
      .querySelectorAll(".preview-device-toggle .device-btn")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const device = button.dataset.device;
          this.switchPreviewMode(device);
        });
      });

    // Close theme preview modal by clicking overlay
    const themePreviewModal = document.getElementById("themePreviewModal");
    if (themePreviewModal) {
      themePreviewModal.addEventListener("click", (e) => {
        if (e.target === themePreviewModal) {
          this.closeThemePreview();
        }
      });
    }

    // Close theme preview modal by clicking the 'x' button
    const themePreviewCloseBtn = document.querySelector(
      "#themePreviewModal .modal-close"
    );
    if (themePreviewCloseBtn) {
      themePreviewCloseBtn.addEventListener("click", () => {
        this.closeThemePreview();
      });
    }
  }

  loadStoredData() {
    const savedData = this.getWizardData();

    if (savedData) {
      if (window.DEBUG_MODE) {
        console.log("Loading styling data from localStorage:", savedData);
      }

      if (savedData.theme) {
        this.selectedTheme = savedData.theme;
        this.updateThemeUI(savedData.theme);
      }

      if (savedData.styling) {
        const styling = savedData.styling;
        if (styling.colors) {
          Object.assign(this.colors, styling.colors);
          this.updateColorInputs();
        }
        if (styling.fonts) {
          if (styling.fonts.useDefault !== undefined) {
            this.useDefaultFont = styling.fonts.useDefault;
            this.toggleFontSelection(this.useDefaultFont);
          }
          if (styling.fonts.customFont && !this.useDefaultFont) {
            this.customFont = styling.fonts.customFont;
            const fontInput = document.getElementById("fontSearchInput");
            if (fontInput) {
              fontInput.value = this.customFont;
              this.loadGoogleFont(this.customFont);
              this.updateFontPreview(this.customFont);
            }
          }
        }
        if (styling.logos) {
          Object.assign(this.logos, styling.logos);
          this.displayLogos();
        }
      }
    }
  }

  updateThemeUI(themeName) {
    document.querySelectorAll(".theme-item").forEach((item) => {
      item.classList.remove("selected");
    });
    const selectedItem = document.querySelector(`[data-theme="${themeName}"]`);
    if (selectedItem) {
      selectedItem.classList.add("selected");
    }
    const radioInput = document.querySelector(`input[value="${themeName}"]`);
    if (radioInput) {
      radioInput.checked = true;
    }
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll(".style-tabs .tab-button").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    document.querySelectorAll(".style-tabs .tab-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    document
      .querySelector(`.style-tabs .tab-panel[data-tab="${tabName}"]`)
      .classList.add("active");
  }

  selectTheme(themeName) {
    this.selectedTheme = themeName;
    this.updateThemeUI(themeName);
    this.saveThemeData();
    this.updateNextButton();
  }

  updateThemeOptions() {
    const platform =
      window.wizardData?.platform?.selected ||
      this.getWizardData()?.platform?.selected;
    const magentoThemes = document.querySelectorAll(".magento-themes");
    const defaultThemes = document.querySelectorAll(".default-themes");

    if (platform === "magento") {
      magentoThemes.forEach((theme) => (theme.style.display = "block"));
      defaultThemes.forEach((theme) => (theme.style.display = "none"));
      if (
        !this.selectedTheme ||
        !["luma", "hyva"].includes(this.selectedTheme)
      ) {
        this.selectTheme("luma");
      }
    } else {
      magentoThemes.forEach((theme) => (theme.style.display = "none"));
      defaultThemes.forEach((theme) => (theme.style.display = "block"));
      if (
        !this.selectedTheme ||
        ["luma", "hyva"].includes(this.selectedTheme)
      ) {
        this.selectTheme("default");
      }
    }
  }

  handleLogoUpload(input, type) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB.");
      return;
    }
    if (!file.type.match(/^image\/(png|jpg|jpeg|svg\+xml)$/)) {
      alert("Please upload a valid image file (PNG, JPG, SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.logos[type] = e.target.result;
      this.logos[`${type}Name`] = file.name;
      this.displayLogo(type, e.target.result);
      this.saveStylingData();
    };
    reader.readAsDataURL(file);
  }

  displayLogo(type, src) {
    const previewId =
      type === "desktop" ? "desktopLogoPreview" : "mobileLogoPreview";
    const imageId = type === "desktop" ? "desktopLogoImage" : "mobileLogoImage";
    const preview = document.getElementById(previewId);
    const image = document.getElementById(imageId);
    if (preview && image) {
      image.src = src;
      preview.style.display = "block";
    }
  }

  displayLogos() {
    if (this.logos.desktop) this.displayLogo("desktop", this.logos.desktop);
    if (this.logos.mobile) this.displayLogo("mobile", this.logos.mobile);
  }

  updateColor(colorType, value) {
    this.colors[colorType] = value;
    const textInput = document.getElementById(`${colorType}ColorValue`);
    if (textInput) textInput.value = value;
    this.saveStylingData();
    this.updateColorGuide();
  }

  updateColorFromText(colorType, value) {
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      this.colors[colorType] = value;
      const picker = document.getElementById(`${colorType}ColorPicker`);
      if (picker) picker.value = value;
      this.saveStylingData();
      this.updateColorGuide();
    }
  }

  updateColorGuide = () => {
    if (!this.colors) return;
    const primaryDemo = document.querySelector(".primary-demo");
    const secondaryDemo = document.querySelector(".secondary-demo");
    const tertiaryDemo = document.querySelector(".tertiary-demo");
    if (primaryDemo) primaryDemo.style.backgroundColor = this.colors.primary;
    if (secondaryDemo)
      secondaryDemo.style.backgroundColor = this.colors.secondary;
    if (tertiaryDemo) tertiaryDemo.style.backgroundColor = this.colors.tertiary;
  };

  updateColorInputs = () => {
    if (!this.colors) return;
    Object.entries(this.colors).forEach(([type, value]) => {
      const picker = document.getElementById(`${type}ColorPicker`);
      const input = document.getElementById(`${type}ColorValue`);
      if (picker) picker.value = value;
      if (input) input.value = value;
    });
    this.updateColorGuide();
  };

  initializeColorGuide() {
    setTimeout(this.updateColorGuide, 100);
  }

  toggleFontSelection(useDefault = true) {
    this.useDefaultFont = useDefault;
    const customSelection = document.getElementById("customFontSelection");
    const useDefaultCheckbox = document.getElementById("useDefaultFont");
    const fontPreviewText = document.getElementById("fontPreviewText");

    if (useDefaultCheckbox) useDefaultCheckbox.checked = useDefault;
    if (customSelection)
      customSelection.style.display = useDefault ? "none" : "block";
    if (fontPreviewText) {
      fontPreviewText.style.fontFamily = useDefault
        ? "Montserrat, sans-serif"
        : this.customFont
        ? `'${this.customFont}', sans-serif`
        : "Montserrat, sans-serif";
    }
    this.saveStylingData();
  }

  searchGoogleFonts(query) {
    const suggestionsContainer = document.getElementById("fontSuggestions");
    if (!suggestionsContainer || !query || query.trim().length < 2) {
      this.hideFontSuggestions();
      return;
    }
    const filteredFonts = this.popularGoogleFonts.filter((font) =>
      font.toLowerCase().includes(query.toLowerCase())
    );
    if (filteredFonts.length > 0) {
      this.showFontSuggestions(filteredFonts.slice(0, 8));
    } else {
      this.hideFontSuggestions();
    }
  }

  showFontSuggestions(fonts) {
    const suggestionsContainer = document.getElementById("fontSuggestions");
    if (!suggestionsContainer) return;
    suggestionsContainer.innerHTML = fonts
      .map(
        (font) => `
      <div class="font-suggestion-item" onclick="window.step3StylesDesign.selectGoogleFont('${font}')">
        <div class="font-suggestion-name">${font}</div>
        <div class="font-suggestion-preview" style="font-family: '${font}', sans-serif;">Sample Text</div>
      </div>`
      )
      .join("");
    suggestionsContainer.classList.add("show");
  }

  hideFontSuggestions() {
    const suggestionsContainer = document.getElementById("fontSuggestions");
    if (suggestionsContainer) suggestionsContainer.classList.remove("show");
  }

  selectGoogleFont(fontName) {
    const fontInput = document.getElementById("fontSearchInput");
    if (fontInput) fontInput.value = fontName;
    this.hideFontSuggestions();
    this.customFont = fontName;
    this.useDefaultFont = false;
    this.loadGoogleFont(fontName);
    this.updateFontPreview(fontName);
    this.saveStylingData();
  }

  loadGoogleFont(fontName) {
    const fontId = `google-font-${fontName.replace(/\s+/g, "-")}`;
    if (document.getElementById(fontId)) return;
    const fontLink = document.createElement("link");
    fontLink.id = fontId;
    fontLink.rel = "stylesheet";
    fontLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
      /\s+/g,
      "+"
    )}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(fontLink);
  }

  updateFontPreview(fontName) {
    const previewText = document.getElementById("fontPreviewText");
    if (previewText) {
      previewText.style.fontFamily = `'${fontName}', sans-serif`;
    }
  }

  saveThemeData() {
    try {
      const currentWizardData = this.getWizardData() || {};
      currentWizardData.theme = this.selectedTheme;
      localStorage.setItem("wizardData", JSON.stringify(currentWizardData));

      if (window.wizardData) {
        window.wizardData.theme = this.selectedTheme;
      }

      if (window.DEBUG_MODE) {
        console.log("Theme data saved:", currentWizardData);
      }
    } catch (error) {
      console.error("Error saving theme data:", error);
    }
  }

  saveStylingData() {
    try {
      const stylingData = {
        colors: this.colors,
        fonts: {
          useDefault: this.useDefaultFont,
          customFont: this.customFont,
          family: this.useDefaultFont ? "default" : this.customFont,
        },
        logos: this.logos,
        timestamp: new Date().toISOString(),
      };

      const currentWizardData = this.getWizardData() || {};
      currentWizardData.styling = stylingData;
      localStorage.setItem("wizardData", JSON.stringify(currentWizardData));

      if (window.wizardData) {
        window.wizardData.styling = stylingData;
      }

      if (window.DEBUG_MODE) {
        console.log("Styling data saved:", currentWizardData);
      }
    } catch (error) {
      console.error("Error saving styling data:", error);
    }
  }

  // Enhanced Theme Preview Methods
  async openThemePreview() {
    const modal = document.getElementById("themePreviewModal");
    if (modal) {
      modal.classList.add("show");
      document.body.classList.add("modal-open");

      // Update modal title with current theme
      const modalTitle = document.getElementById("themePreviewTitle");
      if (modalTitle) {
        const themeNames = {
          luma: "Luma Theme Preview",
          hyva: "Hyvä Theme Preview",
          default: "Default Theme Preview",
        };
        modalTitle.textContent =
          themeNames[this.selectedTheme] || "Theme Preview";
      }

      await this.loadThemePreview();
      this.switchPreviewMode(this.currentPreviewMode);
    }
  }

  closeThemePreview() {
    const modal = document.getElementById("themePreviewModal");
    if (modal) {
      modal.classList.remove("show");
      document.body.classList.remove("modal-open");

      // Clear iframe content
      const modalBody = modal.querySelector(".modal-body");
      if (modalBody) {
        modalBody.innerHTML = "";
      }
    }
  }

  async loadThemePreview() {
    const modalBody = document.querySelector("#themePreviewModal .modal-body");
    if (!modalBody) return;

    // Show loading state
    modalBody.innerHTML = `
      <div class="theme-preview-loading">
        <i class="fas fa-spinner"></i>
        Loading theme preview...
      </div>
    `;

    try {
      const themePath =
        this.themeFiles[this.selectedTheme] || this.themeFiles.default;
      const response = await fetch(themePath);

      if (!response.ok) {
        throw new Error(`Failed to load theme: ${response.status}`);
      }

      const themeHtml = await response.text();

      // Create iframe containers for both desktop and mobile
      modalBody.innerHTML = `
        <div class="theme-preview-iframe-container preview-desktop-view">
          <iframe class="theme-preview-iframe" id="desktopPreviewFrame"></iframe>
        </div>
        <div class="mobile-preview-container preview-mobile-view" style="display: none;">
          <div class="mobile-frame">
            <iframe class="theme-preview-iframe" id="mobilePreviewFrame"></iframe>
          </div>
        </div>
      `;

      // Load customized content into both frames
      setTimeout(() => {
        this.injectCustomizedContent("desktopPreviewFrame", themeHtml);
        this.injectCustomizedContent("mobilePreviewFrame", themeHtml);
      }, 100);
    } catch (error) {
      console.error("Error loading theme preview:", error);
      modalBody.innerHTML = `
        <div class="theme-preview-loading" style="color: #e91e64;">
          <i class="fas fa-exclamation-triangle"></i>
          Failed to load theme preview. Please try again.
        </div>
      `;
    }
  }

  injectCustomizedContent(iframeId, originalHtml) {
    const iframe = document.getElementById(iframeId);
    if (!iframe) return;

    // Customize the HTML with user's settings
    let customizedHtml = this.applyCustomizations(originalHtml);

    // Create blob URL for the customized content
    const blob = new Blob([customizedHtml], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);

    iframe.src = blobUrl;

    // Clean up blob URL after loading
    iframe.onload = () => {
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    };
  }

  applyCustomizations(html) {
    let customizedHtml = html;

    // Apply logo customizations
    if (this.logos.desktop) {
      // Replace logo src attributes with uploaded logo
      customizedHtml = customizedHtml.replace(
        /src="[^"]*logo[^"]*"/gi,
        `src="${this.logos.desktop}"`
      );
    }

    // Apply color customizations
    const colorStyles = `
      <style id="wizard-custom-colors">
        /* Custom color overrides */
        .action.tocart.primary,
        .action.primary,
        .button.primary,
        .btn-primary {
          background-color: ${this.colors.primary} !important;
          border-color: ${this.colors.primary} !important;
        }
        
        .action.tocart.primary:hover,
        .action.primary:hover,
        .button.primary:hover,
        .btn-primary:hover {
          background-color: ${this.colors.secondary} !important;
          border-color: ${this.colors.secondary} !important;
        }
        
        .price,
        .special-price .price,
        .old-price .price {
          color: ${this.colors.tertiary} !important;
        }
        
        .page-header,
        .header.content {
          border-bottom: 3px solid ${this.colors.primary};
        }
        
        .navigation .level0 > .level-top:hover,
        .navigation .level0.active > .level-top {
          color: ${this.colors.primary} !important;
        }
        
        .minicart-wrapper .showcart:before,
        .block-search .action.search:before {
          color: ${this.colors.primary} !important;
        }
      </style>
    `;

    // Insert custom styles before closing head tag
    customizedHtml = customizedHtml.replace("</head>", colorStyles + "</head>");

    // Apply font customizations
    if (!this.useDefaultFont && this.customFont) {
      const fontStyles = `
        <style id="wizard-custom-font">
          body, .page-wrapper {
            font-family: '${this.customFont}', sans-serif !important;
          }
        </style>
        <link href="https://fonts.googleapis.com/css2?family=${this.customFont.replace(
          /\s+/g,
          "+"
        )}:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      `;
      customizedHtml = customizedHtml.replace(
        "</head>",
        fontStyles + "</head>"
      );
    }

    return customizedHtml;
  }

  switchPreviewMode(mode) {
    this.currentPreviewMode = mode;
    const desktopView = document.querySelector(".preview-desktop-view");
    const mobileView = document.querySelector(".preview-mobile-view");
    const desktopBtn = document.querySelector(
      '.device-btn[data-device="desktop"]'
    );
    const mobileBtn = document.querySelector(
      '.device-btn[data-device="mobile"]'
    );

    if (desktopView && mobileView && desktopBtn && mobileBtn) {
      desktopView.style.display = mode === "desktop" ? "flex" : "none";
      mobileView.style.display = mode === "mobile" ? "flex" : "none";
      desktopBtn.classList.toggle("active", mode === "desktop");
      mobileBtn.classList.toggle("active", mode === "mobile");
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

  updateNextButton() {
    if (typeof window.updateNextButton === "function") {
      window.updateNextButton();
    }
  }

  validateStep() {
    const isValid = this.selectedTheme !== null;
    if (isValid) {
      this.saveThemeData();
      this.saveStylingData();
    }
    return isValid;
  }

  getStepData() {
    const stepData = {
      theme: this.selectedTheme,
      styling: {
        colors: this.colors,
        fonts: {
          useDefault: this.useDefaultFont,
          customFont: this.customFont,
          family: this.useDefaultFont ? "default" : this.customFont,
        },
        logos: this.logos,
        timestamp: new Date().toISOString(),
      },
      isValid: this.validateStep(),
    };
    if (stepData.isValid) {
      this.saveThemeData();
      this.saveStylingData();
    }
    return stepData;
  }

  resetStep() {
    this.selectedTheme = null;
    this.useDefaultFont = true;
    this.customFont = null;
    this.colors = {
      primary: "#4e54c8",
      secondary: "#8f94fb",
      tertiary: "#19b78a",
    };
    this.logos = {
      desktop: null,
      mobile: null,
      desktopName: null,
      mobileName: null,
    };
    document
      .querySelectorAll(".theme-item.selected")
      .forEach((item) => item.classList.remove("selected"));
    this.updateColorInputs();
    this.toggleFontSelection(true);
    ["desktop", "mobile"].forEach((type) => {
      const preview = document.getElementById(`${type}LogoPreview`);
      if (preview) preview.style.display = "none";
    });
    this.switchTab("theme");
    if (window.wizardData) {
      window.updateWizardData("theme", null);
      window.updateWizardData("styling", {});
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const step3Content = document.querySelector('.step-content[data-step="3"]');
  if (step3Content) {
    if (!window.step3StylesDesign) {
      window.step3StylesDesign = new Step3StylesDesign();
    }
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.attributeName === "class" &&
          step3Content.classList.contains("active")
        ) {
          setTimeout(() => {
            window.step3StylesDesign?.loadStoredData();
            window.step3StylesDesign?.updateThemeOptions();
            window.step3StylesDesign?.updateNextButton();
          }, 100);
        }
      }
    });
    observer.observe(step3Content, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }
});

window.Step3StylesDesign = Step3StylesDesign;
