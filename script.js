// Üýtgeşmäniň koeffisiýentleri (Python kodyndan)
const CONVERSION_FACTORS = {
    'length': {
        'meter': 1.0,
        'kilometer': 1000.0,
        'centimeter': 0.01,
        'millimeter': 0.001,
        'foot': 0.3048,
        'inch': 0.0254,
        'mile': 1609.34,
        'yard': 0.9144
    },
    'volume': {
        'liter': 1.0,
        'milliliter': 0.001,
        'cubic-meter': 1000.0,
        'cubic-centimeter': 0.001,
        'gallon': 3.78541,
        'quart': 0.946353,
        'pint': 0.473176
    }
};

// Kategoriýalar we ölçeg birlikleri
const CATEGORIES_DATA = {
    'length': {
        'name': 'Uzynlyk',
        'defaultFrom': 'meter',
        'defaultTo': 'kilometer',
        'units': [
            {'id': 'meter', 'name': 'Metr', 'symbol': 'm'},
            {'id': 'kilometer', 'name': 'Kilometr', 'symbol': 'km'},
            {'id': 'centimeter', 'name': 'Santimetr', 'symbol': 'sm'},
            {'id': 'millimeter', 'name': 'Millimetr', 'symbol': 'mm'},
            {'id': 'foot', 'name': 'Fut', 'symbol': 'ft'},
            {'id': 'inch', 'name': 'Dýuým', 'symbol': 'in'},
            {'id': 'mile', 'name': 'Mil', 'symbol': 'mil'},
            {'id': 'yard', 'name': 'Ýard', 'symbol': 'ýd'}
        ]
    },
    'temperature': {
        'name': 'Temperatura',
        'defaultFrom': 'celsius',
        'defaultTo': 'fahrenheit',
        'units': [
            {'id': 'celsius', 'name': 'Selsiý', 'symbol': '°C'},
            {'id': 'fahrenheit', 'name': 'Farengeýt', 'symbol': '°F'},
            {'id': 'kelvin', 'name': 'Kelwin', 'symbol': 'K'}
        ]
    },
    'volume': {
        'name': 'Göwrüm',
        'defaultFrom': 'liter',
        'defaultTo': 'milliliter',
        'units': [
            {'id': 'liter', 'name': 'Litr', 'symbol': 'L'},
            {'id': 'milliliter', 'name': 'Millilitr', 'symbol': 'mL'},
            {'id': 'cubic-meter', 'name': 'Kub metr', 'symbol': 'm³'},
            {'id': 'gallon', 'name': 'Gallon', 'symbol': 'gal'},
            {'id': 'quart', 'name': 'Kwarta', 'symbol': 'kw'},
            {'id': 'pint', 'name': 'Pinta', 'symbol': 'pt'},
            {'id': 'cubic-centimeter', 'name': 'Kub santimetr', 'symbol': 'sm³'}
        ]
    }
};

// Ýagdaý üýtgeýjileri
let currentCategory = 'length';
let conversionHistory = [];
let historyIdCounter = 1;

// DOM elementleri
const tabButtons = document.querySelectorAll('.tab-btn');
const fromUnitSelect = document.getElementById('from-unit');
const toUnitSelect = document.getElementById('to-unit');
const valueInput = document.getElementById('value-input');
const resultElement = document.getElementById('result');
const formulaElement = document.getElementById('formula');
const convertButton = document.getElementById('convert-btn');
const resetButton = document.getElementById('reset-btn');
const swapButton = document.getElementById('swap-btn');
const historyList = document.getElementById('history-list');
const errorMessage = document.getElementById('error-message');

// Programmany başlatmak
function init() {
    loadCategories();
    setupEventListeners();
    loadHistoryFromStorage();
    convert();
}

// Kategoriýalary UI-da ýüklemek
function loadCategories() {
    updateCategory(currentCategory);
}

// Kategoriýany täzelemek
function updateCategory(category) {
    currentCategory = category;
    
    // Işjeň bellikleri täzelemek
    tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Kategoriýanyň maglumatlaryny almak
    const categoryData = CATEGORIES_DATA[category];
    if (!categoryData) {
        showError('Kategoriýa tapylmady');
        return;
    }
    
    // Nusgalary dogry başlangyç bahalary bilen doldurmak
    populateUnitSelect(
        fromUnitSelect, 
        categoryData.units, 
        categoryData.defaultFrom || categoryData.units[0].id
    );
    populateUnitSelect(
        toUnitSelect, 
        categoryData.units, 
        categoryData.defaultTo || (categoryData.units[1]?.id || categoryData.units[0].id)
    );
    
    // Ýalňyşlygy gizlemek
    hideError();
    
    // Netijäniň mysalyny täzelemek
    updateResultExample();
}

// Nusga saýlawy doldurmak
function populateUnitSelect(select, units, defaultValue = null) {
    select.innerHTML = '';
    units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = `${unit.name} (${unit.symbol})`;
        if (unit.id === defaultValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// Netijäniň mysalyny täzelemek (başlangyç görkezmek üçin)
function updateResultExample() {
    if (valueInput.value === '1') {
        // Bahasy 1-e deň bolsa (başlangyç), netijäni täzelemek
        setTimeout(convert, 100);
    }
}

// Esasy üýtgetmek funksiýasy
function convert() {
    try {
        // Formadan maglumatlary almak
        const value = parseFloat(valueInput.value);
        if (isNaN(value)) {
            throw new Error('Haýyş edýäris, dogry san giriziň');
        }
        
        const fromUnit = fromUnitSelect.value;
        const toUnit = toUnitSelect.value;
        
        // Üýtgetmek
        let result;
        let formula = '';
        
        if (currentCategory === 'temperature') {
            const conversion = convertTemperature(value, fromUnit, toUnit);
            result = conversion.result;
            formula = conversion.formula;
        } else {
            const conversion = convertRegular(value, fromUnit, toUnit);
            result = conversion.result;
            formula = conversion.formula;
        }
        
        // UI täzelemek
        resultElement.textContent = formatResult(result);
        formulaElement.textContent = formula;
        
        // Taryha goşmak (diňe bahasy üýtgedilende)
        if (value !== 1 || fromUnit !== 'meter' || toUnit !== 'kilometer') {
            addToHistory(value, fromUnit, toUnit, result, formula);
        }
        
        // Ýalňyşlygy gizlemek
        hideError();
        
    } catch (error) {
        showError(error.message);
        resultElement.textContent = '0';
        formulaElement.textContent = '';
    }
}

// Adaty birlikleri üýtgetmek (uzynlyk, göwrüm)
function convertRegular(value, fromUnit, toUnit) {
    if (!CONVERSION_FACTORS[currentCategory]) {
        throw new Error(`Näbelli kategoriýa: ${currentCategory}`);
    }
    
    const factors = CONVERSION_FACTORS[currentCategory];
    
    if (!factors[fromUnit] || !factors[toUnit]) {
        throw new Error('Näbelli ölçeg birligi');
    }
    
    // Esasy birlik arkaly üýtgetmek
    const valueInBase = value * factors[fromUnit];
    const result = valueInBase / factors[toUnit];
    
    const categoryData = CATEGORIES_DATA[currentCategory];
    const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
    const toUnitData = categoryData.units.find(u => u.id === toUnit);
    
    // Koeffisiýent 1-e deň bolanda formulany ýönekeýleşdirmek
    let formula;
    if (factors[fromUnit] === 1 && factors[toUnit] === 1) {
        formula = `${value} ${fromUnitData.symbol} = ${result.toFixed(6)} ${toUnitData.symbol}`;
    } else if (factors[fromUnit] === 1) {
        formula = `${value} ${fromUnitData.symbol} / ${factors[toUnit]} = ${result.toFixed(6)} ${toUnitData.symbol}`;
    } else if (factors[toUnit] === 1) {
        formula = `${value} ${fromUnitData.symbol} × ${factors[fromUnit]} = ${result.toFixed(6)} ${toUnitData.symbol}`;
    } else {
        formula = `${value} ${fromUnitData.symbol} × ${factors[fromUnit]} / ${factors[toUnit]} = ${result.toFixed(6)} ${toUnitData.symbol}`;
    }
    
    return {
        result: result,
        formula: formula
    };
}

// Temperaturany üýtgetmek
function convertTemperature(value, fromUnit, toUnit) {
    let celsius;
    let formula = '';
    
    // Selsiýa üýtgetmek
    switch(fromUnit) {
        case 'celsius':
            celsius = value;
            formula = `${value}°C`;
            break;
        case 'fahrenheit':
            celsius = (value - 32) * 5/9;
            formula = `(${value}°F - 32) × 5/9 = ${celsius.toFixed(2)}°C`;
            break;
        case 'kelvin':
            celsius = value - 273.15;
            formula = `${value}K - 273.15 = ${celsius.toFixed(2)}°C`;
            break;
        default:
            throw new Error(`Näbelli temperatura birligi: ${fromUnit}`);
    }
    
    // Selsiýdan niýetlenen birlige üýtgetmek
    let result;
    switch(toUnit) {
        case 'celsius':
            result = celsius;
            formula += ` = ${result.toFixed(2)}°C`;
            break;
        case 'fahrenheit':
            result = (celsius * 9/5) + 32;
            formula += ` × 9/5 + 32 = ${result.toFixed(2)}°F`;
            break;
        case 'kelvin':
            result = celsius + 273.15;
            formula += ` + 273.15 = ${result.toFixed(2)}K`;
            break;
        default:
            throw new Error(`Näbelli temperatura birligi: ${toUnit}`);
    }
    
    return {
        result: result,
        formula: formula
    };
}

// Netijäni formatlamak
function formatResult(num) {
    if (typeof num !== 'number' || isNaN(num)) {
        return '0';
    }
    
    // Örän uly ýa-da örän kiçi sanlar üçin eksponensial ýazgy ulanmak
    if (Math.abs(num) > 1e9 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6).replace('e', ' × 10^');
    }
    
    // Töwerekleýäris we artykmaç nollar aýyrmak
    const rounded = Math.round(num * 1000000) / 1000000;
    const formatted = rounded.toString();
    
    // Noktadan soňky artykmaç nollary aýyrmak
    if (formatted.includes('.')) {
        return formatted.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.$/, '');
    }
    
    return formatted;
}

// Taryha goşmak
function addToHistory(value, fromUnit, toUnit, result, formula) {
    const categoryData = CATEGORIES_DATA[currentCategory];
    const fromUnitData = categoryData.units.find(u => u.id === fromUnit);
    const toUnitData = categoryData.units.find(u => u.id === toUnit);
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const historyItem = {
        id: historyIdCounter++,
        category: currentCategory,
        from: `${value} ${fromUnitData.symbol}`,
        to: `${formatResult(result)} ${toUnitData.symbol}`,
        timestamp: timeString,
        formula: formula
    };
    
    conversionHistory.unshift(historyItem);
    
    // Taryhy 10 ýazgy bilen çäklendirmek
    if (conversionHistory.length > 10) {
        conversionHistory = conversionHistory.slice(0, 10);
    }
    
    updateHistoryDisplay();
    saveHistoryToStorage();
}

// Taryhyň görkezilişini täzelemek
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    if (conversionHistory.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'history-empty';
        emptyMessage.textContent = 'Entek üýtgeşme ýok';
        historyList.appendChild(emptyMessage);
        return;
    }
    
    conversionHistory.forEach(item => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        historyElement.innerHTML = `
            <div>
                <div class="history-from">${item.from} →</div>
                <div class="history-date">${item.timestamp}</div>
            </div>
            <div class="history-to">${item.to}</div>
        `;
        
        // Formula bilen maslahat goşmak
        historyElement.title = item.formula;
        
        historyList.appendChild(historyElement);
    });
}

// Birlikleri çalyşmak
function swapUnits() {
    const tempFrom = fromUnitSelect.value;
    const tempFromText = fromUnitSelect.options[fromUnitSelect.selectedIndex].text;
    
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = tempFrom;
    
    // Nusgalaryň tekstini täzelemek
    fromUnitSelect.options[fromUnitSelect.selectedIndex].text = toUnitSelect.options[toUnitSelect.selectedIndex].text;
    toUnitSelect.options[toUnitSelect.selectedIndex].text = tempFromText;
    
    convert();
}

// Formany arassalamak
function reset() {
    valueInput.value = '1';
    updateCategory(currentCategory);
    convert();
}

// Ýalňyşlygy görkezmek
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Ýalňyşlygy gizlemek
function hideError() {
    errorMessage.style.display = 'none';
}

// Taryhy LocalStorage-a ýazmak
function saveHistoryToStorage() {
    try {
        localStorage.setItem('unitConverterHistory', JSON.stringify(conversionHistory));
        localStorage.setItem('unitConverterHistoryId', historyIdCounter.toString());
    } catch (e) {
        console.warn('LocalStorage-a taryh ýazyp bolmady');
    }
}

// Taryhy LocalStorage-dan ýüklemek
function loadHistoryFromStorage() {
    try {
        const savedHistory = localStorage.getItem('unitConverterHistory');
        const savedId = localStorage.getItem('unitConverterHistoryId');
        
        if (savedHistory) {
            conversionHistory = JSON.parse(savedHistory);
            historyIdCounter = savedId ? parseInt(savedId) : conversionHistory.length + 1;
            updateHistoryDisplay();
        }
    } catch (e) {
        console.warn('LocalStorage-dan taryh ýüklemek bolmady');
    }
}

// Waka dinleýjilerini gurnamak
function setupEventListeners() {
    // Kategoriýa bellikleri
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            updateCategory(btn.dataset.category);
            convert();
        });
    });
    
    // Ölçeg birlikleriniň üýtgemegi
    fromUnitSelect.addEventListener('change', convert);
    toUnitSelect.addEventListener('change', convert);
    
    // Bahanyň üýtgemegi
    valueInput.addEventListener('input', () => {
        // Girizilende awtomatik üýtgetmek
        convert();
    });
    
    // Düwmeler
    convertButton.addEventListener('click', convert);
    resetButton.addEventListener('click', reset);
    swapButton.addEventListener('click', swapUnits);
    
    // Enter klawişasyny goldamak
    valueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            convert();
        }
    });
    
    // Ilkinji işledilende taryhyň mysalyny ýüklemek
    if (conversionHistory.length === 0) {
        // Python kodyndan mysallary goşmak
        setTimeout(() => {
            conversionHistory = [
                {
                    id: 1,
                    category: 'length',
                    from: '10 m',
                    to: '0.01 km',
                    timestamp: '14:30:25',
                    formula: '10 m / 1000 = 0.01 km'
                },
                {
                    id: 2,
                    category: 'temperature',
                    from: '100 °C',
                    to: '212 °F',
                    timestamp: '14:28:10',
                    formula: '100°C × 9/5 + 32 = 212°F'
                }
            ];
            historyIdCounter = 3;
            updateHistoryDisplay();
        }, 1000);
    }
}

// Sahypa ýüklenende programmany işletmek
document.addEventListener('DOMContentLoaded', init);

// Synamak üçin funksiýalary eksport etmek
window.UnitConverter = {
    convert: convert,
    reset: reset,
    swapUnits: swapUnits,
    getHistory: () => conversionHistory,
    clearHistory: () => {
        conversionHistory = [];
        updateHistoryDisplay();
        localStorage.removeItem('unitConverterHistory');
        localStorage.removeItem('unitConverterHistoryId');
    }
};