
let expression = [];
let currentNumber = "";
let result = "";

function input(value) {

    // If a new calculation starts after "="
    if (result !== "" && value !== "C") {
        if (value >= "0" && value <= "9" || value === ".") {
            expression = [];
            currentNumber = "";
        } else if (value !== "=") {
            expression = [result];
            currentNumber = "";
        }

        result = "";
    }

    // 1. Number input
    if (value >= "0" && value <= "9") {
        currentNumber += value;
    }

    // 2. Decimal input
    else if (value === ".") {
        if (!currentNumber.includes(".")) {
            currentNumber = currentNumber === ""
                ? "0."
                : currentNumber + ".";
        }
    }

    // 3. Operator input
    else if (["+", "-", "*", "/"].includes(value)) {

        if (currentNumber !== "") {
            expression.push(Number(currentNumber));
            currentNumber = "";
        }

        // Prevent an operator at the beginning
        if (expression.length === 0) {
            if (value === "-") {
                currentNumber = "-";
            }
            display();
            return;
        }

        // Replace the previous operator if needed
        if (typeof expression[expression.length - 1] === "string") {
            expression[expression.length - 1] = value;
        } else {
            expression.push(value);
        }
    }

    // 4. Equal input
    else if (value === "=") {

        if (currentNumber !== "") {
            expression.push(Number(currentNumber));
            currentNumber = "";
        }

        // Ignore incomplete expressions
        if (
            expression.length === 0 ||
            typeof expression[expression.length - 1] === "string"
        ) {
            display();
            return;
        }

        operation();
    }

    // 5. Clear input
    else if (value === "C") {
        expression = [];
        currentNumber = "";
        result = "";
    }

    display();
}


async function operation() {
    try {
        const response = await fetch("http://localhost:3000/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                expression: expression
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Calculation failed");
        }

        result = data.result;
        display();

    } catch (error) {
        console.error("Calculator API error:", error);

        result = error.message === "Failed to fetch"
            ? "Server connection error"
            : error.message;

        display();
    }
}


function display() {

    const displayElement = document.getElementById("display");
    const historyElement = document.getElementById("history");

    if (result !== "") {
        displayElement.textContent = result;
    } else {
        displayElement.textContent =
            expression.join(" ") +
            (currentNumber !== ""
                ? (expression.length > 0 ? " " : "") + currentNumber
                : "") || "0";
    }

    historyElement.textContent = "";
}


// Connect buttons to the input function
const buttons = document.querySelectorAll("#keys button");

buttons.forEach(function (button) {
    button.addEventListener("click", function () {
        input(button.dataset.value);
    });
});
