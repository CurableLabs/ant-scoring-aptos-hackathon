// ====================================
// 3D MOLECULAR VIEWER - Using 3Dmol.js
// Professional WebGL-based molecule visualization
// ====================================

class MolecularViewer {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        
        this.options = {
            width: options.width || 280,
            height: options.height || 280,
            backgroundColor: options.backgroundColor || 0x0a0a0f,
            style: options.style || 'stick', // 'stick', 'sphere', 'cartoon', 'surface'
            spin: options.spin !== false,
            ...options
        };
        
        this.viewer = null;
        this.currentStyle = this.options.style;
        this.isSpinning = this.options.spin;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        // Clear container
        this.container.innerHTML = '';
        
        // Set container styles
        this.container.style.width = this.options.width + 'px';
        this.container.style.height = this.options.height + 'px';
        this.container.style.position = 'relative';
        
        // Check if 3Dmol is loaded
        if (typeof $3Dmol !== 'undefined') {
            this.init3Dmol();
        } else {
            // Show loading placeholder
            this.showPlaceholder('Loading 3D viewer...');
            
            // Wait for 3Dmol to load
            this.waitFor3Dmol().then(() => {
                this.init3Dmol();
            }).catch(() => {
                this.showPlaceholder('3D viewer unavailable');
            });
        }
    }
    
    waitFor3Dmol() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const check = () => {
                if (typeof $3Dmol !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject();
                } else {
                    attempts++;
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }
    
    init3Dmol() {
        if (!this.container) return;
        
        // Create viewer div
        const viewerDiv = document.createElement('div');
        viewerDiv.style.width = '100%';
        viewerDiv.style.height = '100%';
        viewerDiv.style.position = 'relative';
        this.container.innerHTML = '';
        this.container.appendChild(viewerDiv);
        
        // Initialize 3Dmol viewer
        this.viewer = $3Dmol.createViewer(viewerDiv, {
            backgroundColor: this.rgbToHex(this.options.backgroundColor),
            antialias: true
        });
        
        // Enable spinning
        if (this.isSpinning) {
            this.viewer.spin('y', 1);
        }
    }
    
    rgbToHex(num) {
        if (typeof num === 'string') return num;
        return '#' + num.toString(16).padStart(6, '0');
    }
    
    showPlaceholder(message) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: rgba(255,255,255,0.5);
                font-size: 12px;
                text-align: center;
                padding: 10px;
                box-sizing: border-box;
            ">
                <div style="font-size: 32px; margin-bottom: 8px;">🧬</div>
                <div>${message}</div>
            </div>
        `;
    }
    
    // Set molecule from SMILES string
    async setMoleculeFromSMILES(smiles) {
        if (!this.viewer || !smiles) {
            this.showPlaceholder('No structure data');
            return;
        }
        
        try {
            // Clear existing models
            this.viewer.removeAllModels();
            
            // Add model from SMILES
            // 3Dmol can generate 3D coords from SMILES using SDF format
            const model = this.viewer.addModel();
            
            // Use the SMILES to SDF conversion via 3Dmol's built-in parser
            // First try to add as SMILES directly
            this.viewer.addModel(smiles, 'smi');
            
            // Apply style
            this.applyStyle();
            
            // Zoom to fit
            this.viewer.zoomTo();
            this.viewer.render();
            
        } catch (error) {
            console.warn('SMILES parsing failed, using formula fallback');
            this.showPlaceholder('Structure preview');
        }
    }
    
    // Set molecule from formula (generates placeholder structure)
    setMolecule(formula) {
        if (!this.viewer) {
            // If 3Dmol not ready, show placeholder
            this.showAnimatedPlaceholder(formula);
            return;
        }
        
        // Clear existing models
        this.viewer.removeAllModels();
        
        // Parse formula and create simple representation
        const atoms = this.parseFormula(formula);
        
        if (atoms.length === 0) {
            this.showAnimatedPlaceholder(formula);
            return;
        }
        
        // Create XYZ format string
        const xyz = this.generateXYZ(atoms);
        
        // Add model from XYZ
        this.viewer.addModel(xyz, 'xyz');
        
        // Apply current style
        this.applyStyle();
        
        // Zoom to fit with padding (0.8 = 80% zoom to add some margin)
        this.viewer.zoomTo();
        this.viewer.zoom(0.7); // Zoom out a bit so molecule isn't too close
        this.viewer.render();
        
        // Start spinning if enabled
        if (this.isSpinning) {
            this.viewer.spin('y', 1);
        }
    }
    
    parseFormula(formula) {
        if (!formula) return [];
        
        const atoms = [];
        const regex = /([A-Z][a-z]?)(\d*)/g;
        let match;
        
        while ((match = regex.exec(formula)) !== null) {
            const element = match[1];
            const count = parseInt(match[2]) || 1;
            
            for (let i = 0; i < count; i++) {
                atoms.push(element);
            }
        }
        
        return atoms;
    }
    
    generateXYZ(atoms) {
        const totalAtoms = atoms.length;
        let xyz = `${totalAtoms}\nGenerated molecule\n`;
        
        // Generate positions using golden spiral for even distribution
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        // Smaller spread so molecule appears smaller/further away
        const spread = Math.max(1.5, Math.sqrt(totalAtoms) * 0.5);
        
        atoms.forEach((element, i) => {
            const theta = 2 * Math.PI * i / goldenRatio;
            const phi = Math.acos(1 - 2 * (i + 0.5) / totalAtoms);
            
            const x = (spread * Math.sin(phi) * Math.cos(theta)).toFixed(4);
            const y = (spread * Math.sin(phi) * Math.sin(theta)).toFixed(4);
            const z = (spread * Math.cos(phi)).toFixed(4);
            
            xyz += `${element} ${x} ${y} ${z}\n`;
        });
        
        return xyz;
    }
    
    applyStyle() {
        if (!this.viewer) return;
        
        // Clear existing styles
        this.viewer.setStyle({}, {});
        
        // Define color scheme
        const colorScheme = {
            'C': 0x4a5568,   // Carbon - gray
            'H': 0xffffff,   // Hydrogen - white
            'O': 0xef4444,   // Oxygen - red
            'N': 0x3b82f6,   // Nitrogen - blue
            'S': 0xeab308,   // Sulfur - yellow
            'P': 0xf97316,   // Phosphorus - orange
            'F': 0x22c55e,   // Fluorine - green
            'Cl': 0x14b8a6,  // Chlorine - teal
            'Br': 0xa855f7,  // Bromine - purple
            'I': 0x8b5cf6    // Iodine - violet
        };
        
        switch (this.currentStyle) {
            case 'sphere':
                this.viewer.setStyle({}, {
                    sphere: {
                        scale: 0.3,
                        colorscheme: { prop: 'elem', map: colorScheme }
                    }
                });
                break;
                
            case 'surface':
                this.viewer.setStyle({}, {
                    stick: { radius: 0.1 }
                });
                this.viewer.addSurface($3Dmol.SurfaceType.VDW, {
                    opacity: 0.8,
                    colorscheme: { prop: 'elem', map: colorScheme }
                });
                break;
                
            case 'cartoon':
                this.viewer.setStyle({}, {
                    cartoon: { color: 'spectrum' }
                });
                break;
                
            case 'stick':
            default:
                this.viewer.setStyle({}, {
                    stick: {
                        radius: 0.15,
                        colorscheme: { prop: 'elem', map: colorScheme }
                    },
                    sphere: {
                        scale: 0.25,
                        colorscheme: { prop: 'elem', map: colorScheme }
                    }
                });
                break;
        }
        
        this.viewer.render();
    }
    
    showAnimatedPlaceholder(formula) {
        if (!this.container) return;
        
        // Create animated CSS placeholder
        this.container.innerHTML = `
            <div class="mol-placeholder">
                <div class="mol-atom mol-atom-1"></div>
                <div class="mol-atom mol-atom-2"></div>
                <div class="mol-atom mol-atom-3"></div>
                <div class="mol-atom mol-atom-4"></div>
                <div class="mol-bond mol-bond-1"></div>
                <div class="mol-bond mol-bond-2"></div>
                <div class="mol-bond mol-bond-3"></div>
                <div class="mol-formula">${formula || ''}</div>
            </div>
            <style>
                .mol-placeholder {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: mol-rotate 8s linear infinite;
                    transform-style: preserve-3d;
                    perspective: 500px;
                }
                @keyframes mol-rotate {
                    from { transform: rotateY(0deg); }
                    to { transform: rotateY(360deg); }
                }
                .mol-atom {
                    position: absolute;
                    border-radius: 50%;
                    box-shadow: inset -3px -3px 8px rgba(0,0,0,0.4), 
                                inset 3px 3px 8px rgba(255,255,255,0.2),
                                0 0 15px rgba(59, 130, 246, 0.3);
                }
                .mol-atom-1 {
                    width: 28px; height: 28px;
                    background: linear-gradient(135deg, #60a5fa, #3b82f6);
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                }
                .mol-atom-2 {
                    width: 18px; height: 18px;
                    background: linear-gradient(135deg, #f87171, #ef4444);
                    top: 25%; left: 30%;
                    animation: mol-orbit 4s linear infinite;
                }
                .mol-atom-3 {
                    width: 18px; height: 18px;
                    background: linear-gradient(135deg, #4ade80, #22c55e);
                    top: 70%; left: 65%;
                    animation: mol-orbit 4s linear infinite reverse;
                }
                .mol-atom-4 {
                    width: 14px; height: 14px;
                    background: linear-gradient(135deg, #fcd34d, #eab308);
                    top: 35%; left: 72%;
                    animation: mol-orbit 5s linear infinite;
                }
                @keyframes mol-orbit {
                    from { transform: rotate(0deg) translateX(10px) rotate(0deg); }
                    to { transform: rotate(360deg) translateX(10px) rotate(-360deg); }
                }
                .mol-bond {
                    position: absolute;
                    height: 3px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.1));
                    border-radius: 2px;
                    transform-origin: left center;
                }
                .mol-bond-1 {
                    width: 35px;
                    top: 42%; left: 45%;
                    transform: rotate(-35deg);
                }
                .mol-bond-2 {
                    width: 40px;
                    top: 58%; left: 52%;
                    transform: rotate(25deg);
                }
                .mol-bond-3 {
                    width: 30px;
                    top: 40%; left: 58%;
                    transform: rotate(15deg);
                }
                .mol-formula {
                    position: absolute;
                    bottom: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    color: rgba(255,255,255,0.4);
                    font-family: 'JetBrains Mono', monospace;
                    white-space: nowrap;
                }
            </style>
        `;
    }
    
    // Public methods
    setStyle(style) {
        this.currentStyle = style;
        this.applyStyle();
    }
    
    toggleSpin() {
        if (!this.viewer) return;
        
        this.isSpinning = !this.isSpinning;
        
        if (this.isSpinning) {
            this.viewer.spin('y', 1);
        } else {
            this.viewer.spin(false);
        }
    }
    
    reset() {
        if (!this.viewer) {
            console.log('Viewer not initialized, cannot reset');
            return;
        }
        
        try {
            this.viewer.zoomTo();
            this.viewer.zoom(0.7); // Same zoom out as initial view
            this.viewer.render();
            this.isSpinning = true;
            this.viewer.spin('y', 1);
            console.log('Viewer reset successfully');
        } catch (err) {
            console.error('Reset error:', err);
        }
    }
    
    zoomIn() {
        if (!this.viewer) return;
        this.viewer.zoom(1.2);
    }
    
    zoomOut() {
        if (!this.viewer) return;
        this.viewer.zoom(0.8);
    }
    
    cycleStyle() {
        const styles = ['stick', 'sphere', 'surface'];
        const currentIndex = styles.indexOf(this.currentStyle);
        const nextIndex = (currentIndex + 1) % styles.length;
        this.setStyle(styles[nextIndex]);
        return styles[nextIndex];
    }
    
    resize(width, height) {
        if (!this.viewer) return;
        
        this.options.width = width;
        this.options.height = height;
        this.container.style.width = width + 'px';
        this.container.style.height = height + 'px';
        this.viewer.resize();
    }
    
    destroy() {
        if (this.viewer) {
            this.viewer.spin(false);
            this.viewer = null;
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other files
window.MolecularViewer = MolecularViewer;
