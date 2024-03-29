// * Budget Controller
const budgetController = (() => {

  let Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {

    if (totalIncome > 0) {

      this.percentage = Math.round((this.value / totalIncome) * 100);

    } else {

      this.percentage = -1;

    };

  };

  Expense.prototype.getPercentage = function () {

    return this.percentage;
    
  };

  let Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  let calculateTotal = function (type) {

    let sum = 0;

    data.allItems[type].forEach(function (current) {
      sum = sum + current.value;
    });

    data.totals[type] = sum;

  };

  let data = {

    allItems: {
      exp: [],
      inc: [],
    },

    totals: {
      exp: 0,
      inc: 0,
    },

    budget: 0,
    percentage: -1

  };

  return {

    addItem: function (type, des, val) {

      let newItem, ID;

      // * Creates a new ID
      if (data.allItems[type].length > 0) {

        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

      } else {

        ID = 0;

      };

      // * Creates a new item base on 'inc' or 'exp' tyoe
      if (type === "exp") {

        newItem = new Expense(ID, des, val);

      } else if (type === "inc") {

        newItem = new Income(ID, des, val);

      };

      // * Push it into our data structure
      data.allItems[type].push(newItem);

      return newItem;

    },

    // * Delete Item
    deleteItem: function (type, id) {

      //data.allItems[type][id];
      ids = data.allItems[type].map(function (current) {

        return current.id;

      });

      index = ids.indexOf(id);

      if (index !== -1) {

        data.allItems[type].splice(index, 1);

      };

    },

    // * Calculate Budget
    calculateBudget: function () {

      // * calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // * calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // * calculate the percentage of income that we spent
      if (data.totals.inc > 0) {

        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

      } else {

        data.percentage = -1;

      };

    },

    // * Calculate the Percentages
    calculatePercentages: function () {

      data.allItems.exp.forEach(function (current) {
        current.calcPercentage(data.totals.inc);
      });

    },

    // * Retrieve the Percentages
    getPercentages: function () {

      var allPerc = data.allItems.exp.map(function (current) {

        return current.getPercentage();

      });

      return allPerc;

    },

    // * Retrieve the the Budget
    getBudget: function () {

      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };

    },

    // testing: function () {
    //   console.log(data);
    // }

  };
  
})();


// * UI Controller
const UIController = (function () {

  let DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: '.budget__title--month',
  };

  let formatNumber = function (num, type) {
    
    let numSplit, int, dec;
    //DChanges: + or - before the number, exactly 2 decimal points, and a comma separating the thousands

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];

    if (int.length > 3) {

      int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);

    };

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;

  };

  let nodeListForEach = function (list, callback) {

    for (let i = 0; i < list.length; i++) {

      callback(list[i], i);

    };

  };

  return {

    getInput: function () {

      return {
        type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp

        description: document.querySelector(DOMstrings.inputDescription).value,

        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };

    },

    addListItem: function (obj, type) {

      let html, newHtml, element;
      // * 1. Create an HTML string with placeholder text

      if (type === "inc") {

        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      } else if (type === "exp") {

        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

      };

      // * 2. Replace placeholder text with actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // * Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {

      let fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();

    },

    displayBudget: function (obj) {

      obj.budget > 0 ? type = "inc" : type = "exp";

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);

      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');

      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

      if (obj.percentage > 0) {

        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";

      } else {

        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "---";

      };

    },

    displayPercentages: function (percentages) {

      let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function (current, index) {

        if (percentages[index] > 0) {

          current.textContent = percentages[index] + "%";

        } else {

          current.textContent = "---";

        };

      });

    },

    displayDate: function() {

      let now, year, month, months;

      now = new Date();

      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
      
    },

    changedType: function() {

      let fields = document.querySelectorAll(
          DOMstrings.inputType + ',' + 
          DOMstrings.inputDescription + ',' + 
          DOMstrings.inputValue);
    
        nodeListForEach(fields, function(current) {
          current.classList.toggle('red-focus');
        });

        document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        
    },

    getDOMstrings: function () {
      return DOMstrings;
    }

  };

})();


// * Global App Controller
const controller = ((budgetCtrl, UICtrl) => {

  let setupEventListeners = function () {

    let DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {

      if (event.keyCode === 13 || event.which === 13) {

        ctrlAddItem();

      };

    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType)
  };

  // * Update Percentages
  let updatePercentages = function () {
    // * 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // * 2. Read percentages from the budget controller
    let percentages = budgetCtrl.getPercentages();

    // * 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);

  };

  // * Updates the budget
  let updateBudget = function () {

    // * 1. Calculate the budget
    budgetCtrl.calculateBudget();

    // * 2. Return the Budget
    var budget = budgetCtrl.getBudget();

    // * 3. Display the budget on the UI
    UICtrl.displayBudget(budget);

  };


  let ctrlAddItem = function () {

    let input, newItem;

    // * 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

      // * 2. Add the item to the budget
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // * 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // * 4.Clear the fields
      UIController.clearFields();

      // * 5. Calculate and Update the budget
      updateBudget();

      // * 6. Calculate and update percentages
      updatePercentages();

    } else {

      alert("Something is wrong with your input! Please try again.");

    };

  };


  let ctrlDeleteItem = function (event) {

    let itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      //inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // * 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // * 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // * 3. Update and show the new budget
      updateBudget();
    };

    // console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);

  };

  return {

    init: function () {
      // console.log("Application has started.");
      UICtrl.displayDate();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: "",
      });

      setupEventListeners();

    },

  };

})(budgetController, UIController);

controller.init();