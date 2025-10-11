# Navigation Update Instructions

## Add Predictive Intel Button

**File:** `advanced-security-enhanced.html`

**Location:** Line ~645 in the nav-tabs section

**Find this code:**
```html
                <button class="nav-tab" onclick="switchTab('quantum')">Quantum Defense</button>
            </div>
```

**Replace with:**
```html
                <button class="nav-tab" onclick="switchTab('quantum')">Quantum Defense</button>
                <button class="nav-tab" onclick="window.location.href='predictive-exposure-intel.html'" style="background: linear-gradient(45deg, #06b6d4, #3b82f6); color: white; border-color: #06b6d4;">⚡ Predictive Intel</button>
            </div>
```

## Result

This will add a new cyan-blue gradient button labeled "⚡ Predictive Intel" that links to the new predictive-exposure-intel.html page.

---

**IMPORTANT:** Only change this ONE line. Do not modify any other content in the file.

**Test URL after update:**
- https://bharathk2498.github.io/digital-footprint-eraser/advanced-security-enhanced.html
- Click the new "⚡ Predictive Intel" button
- Should navigate to: https://bharathk2498.github.io/digital-footprint-eraser/predictive-exposure-intel.html
