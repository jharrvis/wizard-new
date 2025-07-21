// Step 3: Styles & Design JavaScript Module
// Updated: 2025-07-21 - Enhanced Theme Preview with External Loading
// User: jharrvis
// MODIFIED: Re-enabled modal and added live-update functionality within it.
// FIXED: Changed iframe loading method to fix broken styles (CSS not loading).
// FIXED: Implemented a robust 2-way communication to prevent style update race conditions.
// FIXED: Added theme-specific CSS selectors for robust styling across themes.
// FIXED: Implemented a more robust logo replacement method.
// FIXED: Updated mobile preview to resize modal instead of using a frame.

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
    this.injectModalStyles(); // [NEW] Inject custom styles for the modal
    this.bindEvents();
    this.loadStoredData();
    this.initializeColorGuide();
    this.updateThemeOptions();
  }

  // [NEW] Injects CSS to handle the mobile preview appearance.
  injectModalStyles() {
    const styleId = "jh-modal-preview-styles";
    if (document.getElementById(styleId)) return;

    const css = `
        #themePreviewModal.is-mobile-preview .modal-dialog {
            max-width: 414px; /* Typical mobile width */
            height: 85vh;
            margin-top: 5vh;
            transition: max-width 0.3s ease-in-out, height 0.3s ease-in-out;
        }
        #themePreviewModal.is-mobile-preview .modal-content {
            height: 100%;
            border-radius: 20px;
            overflow: hidden;
        }
        #themePreviewModal .mobile-frame {
            border: none !important;
            background: none !important;
            padding: 0 !important;
            box-shadow: none !important;
            width: 100%;
            height: 100%;
        }
        #themePreviewModal .mobile-preview-container {
            height: 100%;
        }
    `;

    const style = document.createElement("style");
    style.id = styleId;
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  bindEvents() {
    // Listen for messages from the iframe
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "JH_IFRAME_READY") {
        if (window.DEBUG_MODE)
          console.log("Iframe is ready. Sending initial styles.");
        this.broadcastStyleUpdate();
      }
    });

    // Tab navigation
    document.querySelectorAll(".style-tabs .tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const tab = button.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });

    // Theme selection and preview button
    document.querySelectorAll(".theme-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".theme-preview-btn")) {
          const theme = item.getAttribute("data-theme");
          this.selectTheme(theme);
          this.openThemePreview();
          return;
        }
        const theme = item.getAttribute("data-theme");
        this.selectTheme(theme);
      });
    });

    // Logo uploads
    const desktopLogoFile = document.getElementById("desktopLogoFile");
    const mobileLogoFile = document.getElementById("mobileLogoFile");
    if (desktopLogoFile)
      desktopLogoFile.addEventListener("change", (e) =>
        this.handleLogoUpload(e.target, "desktop")
      );
    if (mobileLogoFile)
      mobileLogoFile.addEventListener("change", (e) =>
        this.handleLogoUpload(e.target, "mobile")
      );

    // Color inputs
    ["primary", "secondary", "tertiary"].forEach((colorType) => {
      const picker = document.getElementById(`${colorType}ColorPicker`);
      const input = document.getElementById(`${colorType}ColorValue`);
      if (picker)
        picker.addEventListener("input", (e) =>
          this.updateColor(colorType, e.target.value)
        );
      if (input)
        input.addEventListener("input", (e) =>
          this.updateColorFromText(colorType, e.target.value)
        );
    });

    // Font selection
    const useDefaultFont = document.getElementById("useDefaultFont");
    if (useDefaultFont)
      useDefaultFont.addEventListener("change", (e) =>
        this.toggleFontSelection(e.target.checked)
      );
    const fontSearchInput = document.getElementById("fontSearchInput");
    if (fontSearchInput)
      fontSearchInput.addEventListener("input", (e) =>
        this.searchGoogleFonts(e.target.value)
      );
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".font-search-container"))
        this.hideFontSuggestions();
    });

    // Responsive device toggle buttons for modal
    document
      .querySelectorAll(".preview-device-toggle .device-btn")
      .forEach((button) => {
        button.addEventListener("click", (e) =>
          this.switchPreviewMode(e.dataset.device)
        );
      });

    // Close theme preview modal
    const themePreviewModal = document.getElementById("themePreviewModal");
    if (themePreviewModal)
      themePreviewModal.addEventListener("click", (e) => {
        if (e.target === themePreviewModal) this.closeThemePreview();
      });
    const themePreviewCloseBtn = document.querySelector(
      "#themePreviewModal .modal-close"
    );
    if (themePreviewCloseBtn)
      themePreviewCloseBtn.addEventListener("click", () =>
        this.closeThemePreview()
      );
  }

  loadStoredData() {
    const savedData = this.getWizardData();
    if (!savedData) return;
    if (window.DEBUG_MODE)
      console.log("Loading styling data from localStorage:", savedData);
    if (savedData.theme) {
      this.selectedTheme = savedData.theme;
      this.updateThemeUI(savedData.theme);
    }
    if (savedData.styling) {
      const { colors, fonts, logos } = savedData.styling;
      if (colors) {
        Object.assign(this.colors, colors);
        this.updateColorInputs();
      }
      if (fonts) {
        if (fonts.useDefault !== undefined)
          this.toggleFontSelection(fonts.useDefault, false);
        if (fonts.customFont && !fonts.useDefault) {
          this.customFont = fonts.customFont;
          const fontInput = document.getElementById("fontSearchInput");
          if (fontInput) {
            fontInput.value = this.customFont;
            this.loadGoogleFont(this.customFont);
            this.updateFontPreview(this.customFont);
          }
        }
      }
      if (logos) {
        Object.assign(this.logos, logos);
        this.displayLogos();
      }
    }
  }

  updateThemeUI(themeName) {
    document
      .querySelectorAll(".theme-item.selected")
      .forEach((item) => item.classList.remove("selected"));
    const selectedItem = document.querySelector(`[data-theme="${themeName}"]`);
    if (selectedItem) selectedItem.classList.add("selected");
    const radioInput = document.querySelector(`input[value="${themeName}"]`);
    if (radioInput) radioInput.checked = true;
  }

  switchTab(tabName) {
    this.currentTab = tabName;
    document
      .querySelectorAll(".style-tabs .tab-button.active")
      .forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
    document
      .querySelectorAll(".style-tabs .tab-panel.active")
      .forEach((panel) => panel.classList.remove("active"));
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
      if (!this.selectedTheme || !["luma", "hyva"].includes(this.selectedTheme))
        this.selectTheme("luma");
    } else {
      magentoThemes.forEach((theme) => (theme.style.display = "none"));
      defaultThemes.forEach((theme) => (theme.style.display = "block"));
      if (!this.selectedTheme || ["luma", "hyva"].includes(this.selectedTheme))
        this.selectTheme("default");
    }
  }

  handleLogoUpload(input, type) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return alert("File size must be less than 2MB.");
    if (!file.type.match(/^image\/(png|jpg|jpeg|svg\+xml)$/))
      return alert("Please upload a valid image file (PNG, JPG, SVG).");
    const reader = new FileReader();
    reader.onload = (e) => {
      this.logos[type] = e.target.result;
      this.logos[`${type}Name`] = file.name;
      this.displayLogo(type, e.target.result);
      this.saveStylingData();
      this.broadcastStyleUpdate();
    };
    reader.readAsDataURL(file);
  }

  displayLogo(type, src) {
    const preview = document.getElementById(`${type}LogoPreview`);
    const image = document.getElementById(`${type}LogoImage`);
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
    this.broadcastStyleUpdate();
  }

  updateColorFromText(colorType, value) {
    if (!/^#[0-9A-F]{6}$/i.test(value)) return;
    this.colors[colorType] = value;
    const picker = document.getElementById(`${colorType}ColorPicker`);
    if (picker) picker.value = value;
    this.saveStylingData();
    this.updateColorGuide();
    this.broadcastStyleUpdate();
  }

  updateColorGuide = () => {
    if (!this.colors) return;
    document.querySelector(".primary-demo").style.backgroundColor =
      this.colors.primary;
    document.querySelector(".secondary-demo").style.backgroundColor =
      this.colors.secondary;
    document.querySelector(".tertiary-demo").style.backgroundColor =
      this.colors.tertiary;
  };

  updateColorInputs = () => {
    if (!this.colors) return;
    Object.entries(this.colors).forEach(([type, value]) => {
      document.getElementById(`${type}ColorPicker`).value = value;
      document.getElementById(`${type}ColorValue`).value = value;
    });
    this.updateColorGuide();
  };

  initializeColorGuide() {
    setTimeout(this.updateColorGuide, 100);
  }

  toggleFontSelection(useDefault = true, doSave = true) {
    this.useDefaultFont = useDefault;
    document.getElementById("customFontSelection").style.display = useDefault
      ? "none"
      : "block";
    document.getElementById("useDefaultFont").checked = useDefault;
    const fontFamily = useDefault
      ? "Montserrat, sans-serif"
      : this.customFont
      ? `'${this.customFont}', sans-serif`
      : "Montserrat, sans-serif";
    document.getElementById("fontPreviewText").style.fontFamily = fontFamily;
    if (doSave) {
      this.saveStylingData();
      this.broadcastStyleUpdate();
    }
  }

  searchGoogleFonts(query) {
    const container = document.getElementById("fontSuggestions");
    if (!container || !query || query.trim().length < 2)
      return this.hideFontSuggestions();
    const filtered = this.popularGoogleFonts.filter((f) =>
      f.toLowerCase().includes(query.toLowerCase())
    );
    if (filtered.length > 0) this.showFontSuggestions(filtered.slice(0, 8));
    else this.hideFontSuggestions();
  }

  showFontSuggestions(fonts) {
    const container = document.getElementById("fontSuggestions");
    container.innerHTML = fonts
      .map(
        (font) => `
      <div class="font-suggestion-item" onclick="window.step3StylesDesign.selectGoogleFont('${font}')">
        <div class="font-suggestion-name">${font}</div>
        <div class="font-suggestion-preview" style="font-family: '${font}', sans-serif;">Sample Text</div>
      </div>`
      )
      .join("");
    container.classList.add("show");
  }

  hideFontSuggestions() {
    document.getElementById("fontSuggestions").classList.remove("show");
  }

  selectGoogleFont(fontName) {
    document.getElementById("fontSearchInput").value = fontName;
    this.hideFontSuggestions();
    this.customFont = fontName;
    this.useDefaultFont = false;
    this.loadGoogleFont(fontName);
    this.updateFontPreview(fontName);
    this.saveStylingData();
    this.broadcastStyleUpdate();
  }

  loadGoogleFont(fontName) {
    const fontId = `google-font-${fontName.replace(/\s+/g, "-")}`;
    if (document.getElementById(fontId)) return;
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
      /\s+/g,
      "+"
    )}:wght@300;400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  updateFontPreview(fontName) {
    document.getElementById(
      "fontPreviewText"
    ).style.fontFamily = `'${fontName}', sans-serif`;
  }

  saveThemeData() {
    try {
      const currentWizardData = this.getWizardData() || {};
      currentWizardData.theme = this.selectedTheme;
      localStorage.setItem("wizardData", JSON.stringify(currentWizardData));
      if (window.wizardData) window.wizardData.theme = this.selectedTheme;
      if (window.DEBUG_MODE)
        console.log("Theme data saved:", currentWizardData);
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
      if (window.wizardData) window.wizardData.styling = stylingData;
      if (window.DEBUG_MODE)
        console.log("Styling data saved:", currentWizardData);
    } catch (error) {
      console.error("Error saving styling data:", error);
    }
  }

  broadcastStyleUpdate() {
    const desktopFrame = document.getElementById("desktopPreviewFrame");
    const mobileFrame = document.getElementById("mobilePreviewFrame");
    const liveSettings = {
      colors: this.colors,
      font: this.useDefaultFont ? null : this.customFont,
      logo: this.logos.desktop || this.logos.mobile || null,
    };
    const message = { type: "JH_WIZARD_STYLE_UPDATE", settings: liveSettings };
    if (desktopFrame && desktopFrame.contentWindow)
      desktopFrame.contentWindow.postMessage(message, "*");
    if (mobileFrame && mobileFrame.contentWindow)
      mobileFrame.contentWindow.postMessage(message, "*");
  }

  async openThemePreview() {
    const modal = document.getElementById("themePreviewModal");
    if (!modal) return;
    modal.classList.add("show");
    document.body.classList.add("modal-open");
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

  closeThemePreview() {
    const modal = document.getElementById("themePreviewModal");
    if (!modal) return;
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
    // [FIXED] Also remove the mobile preview class when closing
    modal.classList.remove("is-mobile-preview");
    const modalBody = modal.querySelector(".modal-body");
    if (modalBody) modalBody.innerHTML = "";
  }

  async loadThemePreview() {
    const modalBody = document.querySelector("#themePreviewModal .modal-body");
    if (!modalBody) return;
    modalBody.innerHTML = `<div class="theme-preview-loading"><i class="fas fa-spinner"></i> Loading theme preview...</div>`;
    modalBody.innerHTML = `
      <div class="theme-preview-iframe-container preview-desktop-view">
        <iframe class="theme-preview-iframe" id="desktopPreviewFrame"></iframe>
      </div>
      <div class="mobile-preview-container preview-mobile-view" style="display: none;">
        <div class="mobile-frame"><iframe class="theme-preview-iframe" id="mobilePreviewFrame"></iframe></div>
      </div>`;
    this.injectCustomizedContent("desktopPreviewFrame");
    this.injectCustomizedContent("mobilePreviewFrame");
  }

  injectCustomizedContent(iframeId) {
    const iframe = document.getElementById(iframeId);
    if (!iframe) return;
    const themePath =
      this.themeFiles[this.selectedTheme] || this.themeFiles.default;
    if (!themePath) {
      console.error("Theme path not found for:", this.selectedTheme);
      return;
    }
    iframe.src = themePath;
    iframe.onload = () => {
      const listenerScript = this.getListenerScript();
      const scriptEl = iframe.contentDocument.createElement("script");
      scriptEl.innerHTML = listenerScript;
      iframe.contentDocument.body.appendChild(scriptEl);
    };
  }

  getListenerScript() {
    return `
        function generateCss(settings) {
            const { colors, font } = settings;
            return \`
                /* --- Generic CSS Variables --- */
                :root {
                    --jh-primary-color: \${colors.primary || '#4e54c8'};
                    --jh-secondary-color: \${colors.secondary || '#8f94fb'};
                    --jh-tertiary-color: \${colors.tertiary || '#19b78a'};
                    \${font ? \`--jh-body-font: '\${font}', sans-serif;\` : ''}
                }

                /* --- Global Font Override (High Specificity) --- */
                \${font ? \`
                body, body *, p, span, div, a, button, input, textarea, select {
                    font-family: var(--jh-body-font) !important;
                }
                h1, h2, h3, h4, h5, h6 {
                    font-family: var(--jh-body-font) !important;
                }
                \` : ''}

                /* --- Luma Theme Specific Color Overrides --- */
                .page-wrapper .action.primary,
                .page-wrapper .action.tocart,
                .page-wrapper .block-search .action.search {
                    background-color: var(--jh-primary-color) !important;
                    border-color: var(--jh-primary-color) !important;
                    color: white !important;
                }
                .page-wrapper .action.primary:hover,
                .page-wrapper .action.tocart:hover,
                .page-wrapper .block-search .action.search:hover {
                    background-color: var(--jh-secondary-color) !important;
                    border-color: var(--jh-secondary-color) !important;
                }
                .page-wrapper .price,
                .page-wrapper .special-price .price,
                .page-wrapper .old-price .price {
                    color: var(--jh-tertiary-color) !important;
                }
                .page-wrapper .page-header,
                .page-wrapper .header.content {
                    border-bottom-color: var(--jh-primary-color) !important;
                }

                /* --- Hyva Theme Specific Color Overrides (Tailwind-based) --- */
                body .bg-primary,
                body .button-primary {
                    background-color: var(--jh-primary-color) !important;
                    border-color: var(--jh-primary-color) !important;
                    color: white !important;
                }
                body .text-primary {
                    color: var(--jh-primary-color) !important;
                }
                body .border-primary {
                    border-color: var(--jh-primary-color) !important;
                }
                body a:hover {
                    color: var(--jh-secondary-color) !important;
                }
                body .price {
                     color: var(--jh-tertiary-color) !important;
                }
            \`;
        }

        function applyStyles(settings) {
            if (!settings) return;
            
            // Logo: Replace content of logo container for robustness
            if (settings.logo) {
                const logoContainer = document.querySelector('a.logo, .header .logo, .header-logo a, a[aria-label="Go to Home page"]');
                if (logoContainer) {
                    logoContainer.innerHTML = \`<img src="\${settings.logo}" alt="Store Logo" style="max-height: 80px; width: auto;">\`;
                }
            }

            // Colors & Font
            let styleTag = document.getElementById('wizard-live-styles');
            if (!styleTag) {
                styleTag = document.createElement('style');
                styleTag.id = 'wizard-live-styles';
                document.head.appendChild(styleTag);
            }
            styleTag.innerHTML = generateCss(settings);

            // Font: Load from Google Fonts
            if (settings.font) {
                const fontId = 'google-font-' + settings.font.replace(/\\s+/g, "-");
                if (!document.getElementById(fontId)) {
                    const link = document.createElement('link');
                    link.id = fontId;
                    link.rel = 'stylesheet';
                    link.href = 'https://fonts.googleapis.com/css2?family=' + settings.font.replace(/\\s+/g, '+') + ':wght@300;400;500;600;700&display=swap';
                    document.head.appendChild(link);
                }
            }
        }

        // Listen for style updates from the parent
        window.addEventListener('message', function(event) {
            const data = event.data;
            if (data && data.type === 'JH_WIZARD_STYLE_UPDATE') {
                applyStyles(data.settings);
            }
        });

        // Announce that the iframe is ready to receive messages
        window.parent.postMessage({ type: 'JH_IFRAME_READY' }, '*');
    `;
  }

  // [MODIFIED] Add/remove class from modal for resizing
  switchPreviewMode(mode) {
    this.currentPreviewMode = mode;
    const modal = document.getElementById("themePreviewModal");
    const desktopView = document.querySelector(".preview-desktop-view");
    const mobileView = document.querySelector(".preview-mobile-view");
    const desktopBtn = document.querySelector(
      '.device-btn[data-device="desktop"]'
    );
    const mobileBtn = document.querySelector(
      '.device-btn[data-device="mobile"]'
    );

    if (modal && desktopView && mobileView && desktopBtn && mobileBtn) {
      desktopView.style.display = mode === "desktop" ? "flex" : "none";
      mobileView.style.display = mode === "mobile" ? "flex" : "none";

      desktopBtn.classList.toggle("active", mode === "desktop");
      mobileBtn.classList.toggle("active", mode === "mobile");

      modal.classList.toggle("is-mobile-preview", mode === "mobile");
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
    if (typeof window.updateNextButton === "function")
      window.updateNextButton();
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
