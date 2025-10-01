// ================== CONFIGURAÇÕES ==================
const CONFIG = {
    DEBOUNCE_DELAY: 300,
    MIN_QUANTITY: 1
};

// ================== HELPERS ==================
function normalizeText(text) {
    return String(text || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function isValidQuantity(value) {
    return Number.isFinite(value) && value >= CONFIG.MIN_QUANTITY;
}

function isValidProductName(name) {
    return typeof name === 'string' && name.trim().length > 0;
}

function showAlert(message, type = 'error') {
    alert(message); // Pode ser substituído por um toast/notification mais elegante
}

function askConfirmation(message) {
    return confirm(message);
}

function askQuantity(productName, currentQuantity) {
    const raw = prompt(`Editar quantidade de "${productName}":`, String(currentQuantity));
    if (raw === null) return null;
    
    const candidate = Number(raw.trim());
    return isValidQuantity(candidate) ? candidate : null;
}

// ================== VALIDAÇÃO DE FORMULÁRIO ==================
function validateForm(product, quantity) {
    const errors = [];
    
    if (!isValidProductName(product)) {
        errors.push("Nome do produto é obrigatório!");
    }
    
    if (!isValidQuantity(quantity)) {
        errors.push(`Quantidade deve ser um número maior ou igual a ${CONFIG.MIN_QUANTITY}!`);
    }
    
    return errors;
}

// ================== DOM REFERENCES ==================
const DOM = {
    form: document.querySelector("form"),
    productInput: document.querySelector("#inProduct"),
    quantityInput: document.querySelector("#inQuantity"),
    stockTable: document.querySelector("#bodyStockTable"),
    searchInput: document.querySelector("#inSearch"),
    stockLink: document.querySelector("#linkStock"),
    stockSection: document.querySelector("#estoque")
};

// Verificação de elementos DOM críticos
const criticalElements = [DOM.form, DOM.productInput, DOM.quantityInput, DOM.stockTable];
criticalElements.forEach(element => {
    if (!element) {
        console.error('Elemento DOM não encontrado:', element);
    }
});

// ================== STATE MANAGEMENT ==================
class StockManager {
    constructor() {
        this.stockMap = new Map();
    }

    addProduct(product, quantity) {
        const key = normalizeText(product);

        if (this.stockMap.has(key)) {
            const entry = this.stockMap.get(key);
            if (askConfirmation(`"${product}" já está no estoque. Deseja adicionar a quantidade informada?`)) {
                this.updateProductQuantity(key, entry.quantity + quantity);
            }
            return false; // Produto já existe
        } else {
            const newRow = this.createRow(product, quantity, key);
            DOM.stockTable.appendChild(newRow);
            this.stockMap.set(key, { 
                row: newRow, 
                quantity,
                originalName: product // Mantém o nome original para display
            });
            return true; // Produto adicionado
        }
    }

    updateProductQuantity(key, newQuantity) {
        const entry = this.stockMap.get(key);
        if (!entry) return;

        this.setRowQuantity(entry.row, newQuantity);
        this.stockMap.set(key, { 
            ...entry, 
            quantity: newQuantity 
        });
    }

    deleteProduct(key) {
        const entry = this.stockMap.get(key);
        if (!entry) return;

        this.stockMap.delete(key);
        entry.row.remove();
    }

    editProduct(key) {
        const entry = this.stockMap.get(key);
        if (!entry) return;

        const productName = entry.originalName;
        const currentQuantity = entry.quantity;
        const candidate = askQuantity(productName, currentQuantity);

        if (candidate === null) {
            showAlert("Quantidade inválida!");
            return;
        }

        this.updateProductQuantity(key, candidate);
    }

    filterProducts(searchTerm) {
        const filter = normalizeText(searchTerm);
        this.stockMap.forEach((entry, productKey) => {
            const shouldShow = productKey.includes(filter);
            entry.row.style.display = shouldShow ? "" : "none";
        });
    }

    createRow(product, quantity, key) {
        const row = document.createElement("tr");
        row.dataset.key = key;
        row.innerHTML = `
            <td data-type="name">${this.escapeHtml(product)}</td>
            <td data-type="quantity">${quantity}</td>
            <td class="table__actions">
                <button type="button" class="btn-edit" data-action="edit" aria-label="Editar ${product}">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button type="button" class="btn-delete" data-action="delete" aria-label="Excluir ${product}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>`;
        return row;
    }

    setRowQuantity(row, newQuantity) {
        const qCell = row.querySelector("[data-type='quantity']");
        if (qCell) qCell.textContent = String(newQuantity);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getStockCount() {
        return this.stockMap.size;
    }

    getTotalQuantity() {
        return Array.from(this.stockMap.values()).reduce((total, entry) => total + entry.quantity, 0);
    }
}

// ================== INITIALIZATION ==================
const stockManager = new StockManager();
let searchTimeout;

// ================== EVENT HANDLERS ==================
function handleFormSubmit(e) {
    e.preventDefault();

    const product = DOM.productInput.value.trim();
    const quantity = Number(DOM.quantityInput.value);

    // Validação
    const errors = validateForm(product, quantity);
    if (errors.length > 0) {
        showAlert(errors.join('\n'));
        return;
    }

    // Adicionar produto
    const added = stockManager.addProduct(product, quantity);

    // Reset e focus
    DOM.form.reset();
    DOM.productInput.focus();
    
    // Feedback visual opcional
    if (added) {
        console.log(`Produto "${product}" adicionado com sucesso!`);
    }
}

function handleTableClick(e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const row = btn.closest("tr");
    const key = row?.dataset?.key;
    if (!row || !key) return;

    // Prevenir múltiplos cliques acidentais
    btn.disabled = true;
    setTimeout(() => { btn.disabled = false; }, 500);

    if (btn.dataset.action === "delete") {
        if (askConfirmation("Tem certeza que deseja excluir este produto?")) {
            stockManager.deleteProduct(key);
        }
    } else if (btn.dataset.action === "edit") {
        stockManager.editProduct(key);
    }
}

function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        stockManager.filterProducts(DOM.searchInput.value);
    }, CONFIG.DEBOUNCE_DELAY);
}

function handleStockLinkClick(e) {
    e.preventDefault();
    DOM.stockSection.classList.toggle("ativo");

    if (DOM.stockSection.classList.contains("ativo")) {
        // Scroll suave apenas se necessário
        const isSectionVisible = DOM.stockSection.getBoundingClientRect().top >= 0;
        if (!isSectionVisible) {
            DOM.stockSection.scrollIntoView({ 
                behavior: "smooth",
                block: "start"
            });
        }
        
        // Focar no search input quando abrir o estoque
        setTimeout(() => DOM.searchInput.focus(), 500);
    }
}

// ================== EVENT LISTENERS ==================
function initializeEventListeners() {
    // Form submission
    DOM.form.addEventListener("submit", handleFormSubmit);

    // Table actions (event delegation)
    DOM.stockTable.addEventListener("click", handleTableClick);

    // Search with debounce
    DOM.searchInput.addEventListener("input", handleSearchInput);

    // Stock section toggle
    DOM.stockLink.addEventListener("click", handleStockLinkClick);

    // Prevenir submit com Enter no search (opcional)
    DOM.searchInput.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
}

// ================== INITIALIZATION ==================
function initializeApp() {
    initializeEventListeners();
    
    // Focus no primeiro input ao carregar
    DOM.productInput.focus();
    
    console.log('Sistema de estoque inicializado!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ================== EXPORTS PARA TESTES ==================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StockManager,
        normalizeText,
        isValidQuantity,
        isValidProductName
    };
}