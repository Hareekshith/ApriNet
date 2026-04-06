document.addEventListener('DOMContentLoaded', () => {
    // --- Existing DOM Elements ---
    const form = document.getElementById('apriori-form');
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');
    const minSupport = document.getElementById('min-support');
    const supportVal = document.getElementById('support-val');
    const minConfidence = document.getElementById('min-confidence');
    const confidenceVal = document.getElementById('confidence-val');
    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('results-section');
    const rulesTableBody = document.querySelector('#rules-table tbody');
    const itemsetsTableBody = document.querySelector('#itemsets-table tbody');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const submitBtn = document.getElementById('submit-btn');
    const submitWarning = document.getElementById('submit-warning');

    // --- New DOM Elements for Feature ---
    const navBtns = document.querySelectorAll('.nav-btn');
    const modals = document.querySelectorAll('.modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const modalOverlay = document.getElementById('modal-overlay');

    const columnSelectorContainer = document.getElementById('column-selector');
    const checkboxGrid = document.getElementById('checkbox-grid');

    // --- Modal Logic ---
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modalOverlay.classList.remove('hidden');
        }
    }

    function closeAllModals() {
        modals.forEach(m => m.classList.add('hidden'));
        modalOverlay.classList.add('hidden');
        
        // Stop video playback by reloading iframe
        const learnModal = document.getElementById('modal-learn');
        const iframe = learnModal.querySelector('iframe');
        if (iframe) {
            const src = iframe.src;
            iframe.src = src; 
        }
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            openModal(btn.dataset.modal);
        });
    });

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    modalOverlay.addEventListener('click', closeAllModals);

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // --- Range sliders logic ---
    minSupport.addEventListener('input', (e) => supportVal.textContent = e.target.value);
    minConfidence.addEventListener('input', (e) => confidenceVal.textContent = e.target.value);

    // --- File Upload Visual Feedback ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => uploadZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => uploadZone.classList.remove('dragover'), false);
    });

    uploadZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            fileInput.files = files;
            updateFileName();
        }
    }

    fileInput.addEventListener('change', updateFileName);

    function updateFileName() {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileName = file.name;
            fileNameDisplay.innerHTML = `
                <span>📄 ${fileName}</span>
                <span class="remove-btn" style="font-size: 0.8rem; color: var(--danger-color); cursor: pointer;">✕ Remove</span>
            `;
            
            fileNameDisplay.querySelector('.remove-btn').addEventListener('click', () => {
                fileInput.value = '';
                fileNameDisplay.classList.add('hidden');
                uploadZone.style.display = 'block';
                columnSelectorContainer.classList.add('hidden');
                checkboxGrid.innerHTML = '';
                checkSubmitButtonState();
            });
            
            fileNameDisplay.classList.remove('hidden');
            uploadZone.style.display = 'none';

            // Feature: Parse CSV Headers
            const isKdd = document.getElementById('dataset-type').checked;
            if (!isKdd) {
                parseCSVHeaders(file);
            } else {
                columnSelectorContainer.classList.add('hidden');
                submitBtn.disabled = false;
                submitWarning.classList.add('hidden');
            }
        }
    }

    document.getElementById('dataset-type').addEventListener('change', (e) => {
        if (e.target.checked) {
            columnSelectorContainer.classList.add('hidden');
            submitBtn.disabled = false;
            submitWarning.classList.add('hidden');
        } else if (fileInput.files.length > 0) {
            // Unchecked, we need to show headers
            parseCSVHeaders(fileInput.files[0]);
        }
    });

    function parseCSVHeaders(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            // Get first line
            const firstLine = text.split(/\r?\n/)[0];
            if (firstLine) {
                // simple split by comma
                const headers = firstLine.split(',').map(h => h.trim());
                renderCheckboxes(headers);
            }
        };
        // Read just the start of the file for performance
        const slice = file.slice(0, 1024 * 10); // First 10KB
        reader.readAsText(slice);
    }

    function renderCheckboxes(headers) {
        checkboxGrid.innerHTML = '';
        if (headers.length === 0) return;

        headers.forEach((header, index) => {
            const colName = header || `Column_${index}`;
            const label = document.createElement('label');
            label.className = 'col-checkbox-label';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'selected_columns';
            checkbox.value = colName;
            checkbox.checked = true; // Default to checked
            
            // Recheck submit state on change
            checkbox.addEventListener('change', checkSubmitButtonState);

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(colName));
            checkboxGrid.appendChild(label);
        });

        columnSelectorContainer.classList.remove('hidden');
        checkSubmitButtonState();
    }

    function checkSubmitButtonState() {
        if (document.getElementById('dataset-type').checked) {
            submitBtn.disabled = false;
            submitWarning.classList.add('hidden');
            return;
        }

        const checkedBoxes = checkboxGrid.querySelectorAll('input[type="checkbox"]:checked');
        if (document.getElementById('dataset-type').checked === false && checkboxGrid.children.length > 0) {
            if (checkedBoxes.length === 0) {
                submitBtn.disabled = true;
                submitWarning.classList.remove('hidden');
            } else {
                submitBtn.disabled = false;
                submitWarning.classList.add('hidden');
            }
        }
    }

    // --- Tabs functionality ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // --- Form submission ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!fileInput.files.length) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData(form);
        const isKdd = document.getElementById('dataset-type').checked;
        if (isKdd) {
            formData.set('dataset_type', 'kdd');
        } else {
            formData.set('dataset_type', 'generic');
            // Gather selected columns
            const checkedBoxes = checkboxGrid.querySelectorAll('input[type="checkbox"]:checked');
            const selectedCols = Array.from(checkedBoxes).map(cb => cb.value);
            formData.set('selected_columns', JSON.stringify(selectedCols));
        }

        loading.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        
        try {
            const response = await fetch('/api/apriori', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong processing the file');
            }

            renderResults(data);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            loading.classList.add('hidden');
        }
    });

    function createBadges(items) {
        return items.map(item => `<span class="item-badge">${item}</span>`).join('');
    }

    function renderResults(data) {
        // Render Rules
        rulesTableBody.innerHTML = '';
        if (data.rules && data.rules.length > 0) {
            data.rules.forEach(rule => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${createBadges(rule.antecedents)}</td>
                    <td>${createBadges(rule.consequents)}</td>
                    <td>${rule.support.toFixed(4)}</td>
                    <td>${rule.confidence.toFixed(4)}</td>
                    <td>${rule.lift.toFixed(4)}</td>
                `;
                rulesTableBody.appendChild(tr);
            });
        } else {
            rulesTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No association rules found for the given parameters. Try lowering minimum support or confidence.</td></tr>';
        }

        // Render Itemsets
        itemsetsTableBody.innerHTML = '';
        if (data.frequent_itemsets && data.frequent_itemsets.length > 0) {
            // Sort by support descending
            data.frequent_itemsets.sort((a, b) => b.support - a.support).forEach(itemset => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${createBadges(itemset.itemsets)}</td>
                    <td>${itemset.support.toFixed(4)}</td>
                `;
                itemsetsTableBody.appendChild(tr);
            });
        } else {
            itemsetsTableBody.innerHTML = '<tr><td colspan="2" class="empty-state">No frequent itemsets found for the given parameters. Try lowering minimum support.</td></tr>';
        }

        resultsSection.classList.remove('hidden');
        
        // Timeout to allow DOM update before scrolling
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
});
