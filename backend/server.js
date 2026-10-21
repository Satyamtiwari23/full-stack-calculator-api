const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.post("/calculate", (req, res) => {
    const expression = req.body.expression;
    if (!Array.isArray(expression) || expression.length === 0) {
        return res.status(400).json({
            error: "Expression must be a non-empty array"
        });
    }
    if (expression.length % 2 === 0) {
        return res.status(400).json({
            error: "Expression must end with a number"
        });
    }

    for (let i = 0; i < expression.length; i++) {

        if (i % 2 === 0) {
            if (typeof expression[i] !== "number" ||
                !Number.isFinite(expression[i])) {

                return res.status(400).json({
                    error: "Expected a valid number"
                });
            }

        } else {
            if (!["+", "-", "*", "/"].includes(expression[i])) {

                return res.status(400).json({
                    error: "Invalid operator"
                });
            }
        }
    }
    // Pass 1: Division
    for (let i = 1; i < expression.length;) {

        if (expression[i] === "/") {

            let left = expression[i - 1];
            let right = expression[i + 1];

            if (right === 0) {
                return res.status(400).json({
                    result: "Cannot divide by zero"
                });
            }

            expression.splice(i - 1, 3, left / right);
            i = 1;

        } else {
            i += 2;
        }
    }

    // Pass 2: Multiplication
    for (let i = 1; i < expression.length;) {

        if (expression[i] === "*") {

            let left = expression[i - 1];
            let right = expression[i + 1];

            let answer = left * right;

            expression.splice(i - 1, 3, answer);
            i = 1;

        } else {
            i += 2;
        }
    }

    // Pass 3: Addition and subtraction, left to right
    for (let i = 1; i < expression.length;) {

        let operator = expression[i];
        let left = expression[i - 1];
        let right = expression[i + 1];

        if (operator === "+" || operator === "-") {

            let answer = operator === "+"
                ? left + right
                : left - right;

            expression.splice(i - 1, 3, answer);
            i = 1;

        } else {
            i += 2;
        }
    }
    const answer = expression[0];

    res.json({ result: answer });
});
app.listen(3000, () => {
    console.log("Calculator API running on port 3000");
});