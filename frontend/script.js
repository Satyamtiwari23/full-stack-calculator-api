
(function () {
  const displayEl = document.getElementById('display');
  const historyEl = document.getElementById('history');
  const keysEl = document.getElementById('keys');

  let current = '0';
  let previous = null;
  let operator = null;
  let overwrite = false;
  let historyText = '';

  /* ---------- UI helpers ---------- */

  function render() {
    displayEl.textContent = current;
    historyEl.textContent = historyText;
  }

  function clearAll() {
    current = '0';
    previous = null;
    operator = null;
    overwrite = false;
    historyText = '';

    render();
  }

  /* ---------- Input handling ---------- */

  function inputDigit(digit) {
    if (overwrite) {
      current = digit;
      overwrite = false;
    } else {
      current = current === '0'
        ? digit
        : current + digit;
    }

    render();
  }

  function inputDecimal() {
    if (overwrite) {
      current = '0.';
      overwrite = false;
    } else if (!current.includes('.')) {
      current += '.';
    }

    render();
  }

  function chooseOperator(op) {
    previous = parseFloat(current);
    operator = op;
    overwrite = true;

    historyText = `${current} ${op}`;

    render();
  }

  /* ---------- API call ---------- */

  async function equals() {

    if (previous === null || operator === null) {
      return;
    }

    const secondNumber = parseFloat(current);

    historyText = `${previous} ${operator} ${secondNumber} =`;
    render();

    try {

      const response = await fetch('http://localhost:3000/api/calculate', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          firstNumber: previous,
          secondNumber: secondNumber,
          operator: operator
        })
      });

      const data = await response.json();

      if (!response.ok) {
        current = 'Error';
        historyText = data.error || 'Calculation failed';
        render();
        return;
      }

      // Result received from backend
      current = String(data.result);

      previous = null;
      operator = null;
      overwrite = true;

      render();

    } catch (error) {

      console.error('API Error:', error);

      current = 'Error';
      historyText = 'Backend connection failed';

      render();
    }
  }

  /* ---------- Button events ---------- */

  keysEl.addEventListener('click', (e) => {

    const btn = e.target.closest('button');

    if (!btn) return;

    const { digit, op, action } = btn.dataset;

    if (digit !== undefined) {
      inputDigit(digit);
    }

    else if (op !== undefined) {
      chooseOperator(op);
    }

    else if (action === 'decimal') {
      inputDecimal();
    }

    else if (action === 'clear') {
      clearAll();
    }

    else if (action === 'equals') {
      equals();
    }
  });


  /* ---------- Keyboard events ---------- */

  document.addEventListener('keydown', (e) => {

    const key = e.key;

    if (/^[0-9]$/.test(key)) {
      inputDigit(key);
    }

    else if (key === '.') {
      inputDecimal();
    }

    else if (key === '+') {
      chooseOperator('+');
    }

    else if (key === '-') {
      chooseOperator('−');
    }

    else if (key === '*') {
      chooseOperator('×');
    }

    else if (key === '/') {
      e.preventDefault();
      chooseOperator('÷');
    }

    else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      equals();
    }

    else if (key === 'Escape') {
      clearAll();
    }
  });


  /* ---------- Initial display ---------- */

  render();

})();