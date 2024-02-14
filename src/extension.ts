/** @format */

import * as vscode from "vscode";
const path = require('path');

let calculatorPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("CodeCalc", () => {
    if (calculatorPanel) {
      // If the calculator is open, close it
      calculatorPanel.dispose();
      calculatorPanel = undefined;
    } else {
      // If the calculator is not open, create a new webview panel
      calculatorPanel = vscode.window.createWebviewPanel(
        "CALCULATOR",
        "CALCULATOR",
        vscode.ViewColumn.Two, // Open in the second column (you can change it to your preferred column)
        { enableScripts: true }
      );

      const htmlContent = getCalculatorHTML(calculatorPanel, context);

      calculatorPanel.webview.html = htmlContent;

      // Dispose the panel when it is closed by the user
      calculatorPanel.onDidDispose(() => {
        calculatorPanel = undefined;
      });
    }
  });

  // Create a status bar item with the calculator icon
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(symbol-math)";
  statusBarItem.tooltip = "CALCULATOR";
  statusBarItem.command = "CALCULATOR";
  statusBarItem.show();

  context.subscriptions.push(disposable, statusBarItem);

  console.log("Calculator extension activated!");
}

function getCalculatorHTML(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Calculator</title>
		<meta
		http-equiv="Content-Security-Policy"
		content="script-src 'self' 'unsafe-inline' vscode-resource:; object-src 'self';"
	  />
      </head>
      <style>
		:root {
		  --scale: 1px;
		  --window-height: calc(322 * var(--scale));
		  --window-width: calc(232 * var(--scale));
		  --calculator-border-radius: 10px;
		}
		body {
		  box-sizing: border-box;
		  font-family: Helvetica, Arial, sans-serif;
		  overflow-x: hidden;
		  overflow-y: hidden;
		  background-color: transparent;
		  -webkit-user-select: none; /* Safari */
		  -ms-user-select: none; /* IE 10 and IE 11 */
		  user-select: none; /* Standard syntax */
		  position: relative;
		}
	
		table {
		  table-layout: fixed;
		  width: var(--window-width);
		}
	
		td {
		  height: calc(var(--window-height) / 7);
		  background-color: #8f7d9f;
		  text-align: center;
		  border: calc(var(--scale) * 0.5) solid #432655;
		  color: white !important;
		  font-size: calc(22 * var(--scale));
		  width: 10px !important ;
		}
	
		td:hover {
		  background-color: #a89db2;
		}
	
		tr:nth-child(2) td {
		  background-color: #543b66 !important;
		}
	
		tr:nth-child(2) td:hover {
		  background-color: #8f7d9f !important;
		}
	
		tr td:last-child {
		  background-color: orange !important;
		}
	
		tr:last-child td:first-child {
		  border-radius: 0 0 0 var(--calculator-border-radius);
		}
	
		tr:last-child td:last-child {
		  border-radius: 0 0 var(--calculator-border-radius) 0;
		}
	
		tr td:last-child:hover {
		  background-color: #cb7d07 !important;
		}
	
		#display {
		  height: calc(var(--window-height) * 7 / 28 - 2px) !important;
		  text-align: right;
		  background-color: #3f2655 !important;
		  padding-right: 20px;
		  font-size: calc(56 * var(--scale));
		  font-weight: 100;
		  border-radius: var(--calculator-border-radius)
			var(--calculator-border-radius) 0 0;
		  vertical-align: bottom;
		}
	
		tr:last-child td {
		  /* background-color: red!important; */
		  height: calc(var(--window-height) / 7 + 2px) !important;
		}
	  </style>
	
	  <body sandbox="allow-scripts allow-same-origin">
		<table border="0" cellpadding="0" cellspacing="0" class="calc">
		  <tr>
			<td colspan="4" class="calc-display" id="display">0</td>
		  </tr>
		  <tr>
			<td class="calc-button" id="clear">C</td>
			<td class="calc-button" id="plus-minus">±</td>
			<td class="calc-button" id="percentage">%</td>
			<td class="calc-button" id="divide">&divide;</td>
		  </tr>
		  <tr>
			<td class="calc-button" id="seven">7</td>
			<td class="calc-button" id="eight">8</td>
			<td class="calc-button" id="nine">9</td>
			<td class="calc-button" id="multiply">&times;</td>
		  </tr>
		  <tr>
			<td class="calc-button" id="four">4</td>
			<td class="calc-button" id="five">5</td>
			<td class="calc-button" id="six">6</td>
			<td class="calc-button" id="subtract">&minus;</td>
		  </tr>
		  <tr>
			<td class="calc-button" id="one">1</td>
			<td class="calc-button" id="two">2</td>
			<td class="calc-button" id="three">3</td>
			<td class="calc-button" id="add">+</td>
		  </tr>
		  <tr>
			<td colspan="2" class="calc-button" id="zero">0</td>
			<td class="calc-button" id="decimal">.</td>
			<td class="calc-button" id="equals">=</td>
		  </tr>
		</table>
		<script>
		// Get all the button elements
		const buttons = document.querySelectorAll(".calc-button");
		// Get the display element
		const display = document.querySelector(".calc-display");
  
		let firstOperand = null;
		let operator = null;
		let currentOperand = "";
  
		// Add click event listeners to all buttons
		buttons.forEach((button) => {
		  button.addEventListener("click", (event) => {
			// Get the value of the button that was clicked
			const target = event.target;
			const value = target.innerText;
  
			if (target.id === "clear") {
			  firstOperand = null;
			  operator = null;
			  currentOperand = "";
			  display.innerText = "0";
			} else if (target.id === "plus-minus") {
			  display.innerText = -1 * display.innerText;
			} else if (target.id === "percentage") {
			  display.innerText = parseFloat(display.innerText) / 100;
			} else if (
			  target.id === "divide" ||
			  target.id === "multiply" ||
			  target.id === "subtract" ||
			  target.id === "add"
			) {
			  operator = value;
			  firstOperand = parseFloat(display.innerText);
			  currentOperand = "";
			} else if (target.id === "equals") {
			  if (operator) {
				const secondOperand = parseFloat(display.innerText);
				console.log(firstOperand, secondOperand, operator);
				if (operator === "+") {
				  firstOperand = firstOperand + secondOperand;
				} else if (operator === "−") {
				  firstOperand = firstOperand - secondOperand;
				} else if (operator === "\u00D7") {
				  firstOperand = firstOperand * secondOperand;
				} else if (operator === "\u00F7") {
				  firstOperand = firstOperand / secondOperand;
				}
				operator = null;
				currentOperand = firstOperand.toString();
				display.innerText = firstOperand;
			  }
			} else {
			  if (value === "." && currentOperand.includes(".")) {
				return;
			  }
			  currentOperand += value;
			  display.innerText = currentOperand;
			}
			console.log(operator);
		  });
		});</script>
	  </body>
	</html>
	
    `;
}
