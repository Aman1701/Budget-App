// Budget Controller
 budgetController = (function()
{
    //Expense function constructor to create expense objects
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
         this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    //Income function constructor to create income objects
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach( function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    //datastructure
    var data = {
        allItems : {
            exp : [],
            inc :[]
        },
        totals : {
            exp :0,
            inc :0 
        },
        budget : 0,
        percentage : -1
    };

    return {

        addItem : function(type, des, val) {
            var newItem,ID;

            //cretae new id
            if(data.allItems[type].length > 0)
            {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }

            // CREATE NEW ITEM BASED ON INC OR EXP
            if(type === 'exp')
            {
            newItem = new Expense(ID, des, val);
            }

            else if(type === 'inc')
            {
            newItem = new Income(ID, des, val);
            }

            //You can directly access it if you know in which property
            // if that objectthat array resides. 
            //If not, then you can iterate through keys(properties) of that object
            // and try each object[“<property>”] combination to achieve your result.
            // PUSH IT INTO OUR DATASTRUCTURE
            data.allItems[type].push(newItem);

            //RETURN THE NEW ELEMENT
            return newItem;
        },

        deleteItem : function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current)
            {
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1)
            {
                //splice method to remove the elements
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget : function() {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget income - expenses
            data.budget = (data.totals.inc - data.totals.exp);

            //calculate the % of the income that we spent
            if(data.totals.inc > 0)
            {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },

        calculatePercentages : function() {
            data.allItems.exp.forEach(function(cur)
            {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages : function() {
            var allPercentages = data.allItems.exp.map(function(cur)
            {
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget : function() {
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
        },

        testing : function()
        {
            console.log(data);
        }
        
        };    
})();









// UI controller
var UIController = (function()
{

    var DOMstrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel :'.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercentageLabel :'.item__percentage',
        dateLabel : '.budget__title--month'
    };


    var formatNumber = function(num, type) {

        var numSplit, int, dec, type;
       
        num = Math.abs(num);

         // 2 decimal points
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];

        // comma separating the thousands
        if(int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, 3);
        }

        dec = numSplit[1];

         // + or - before the number
        return (type === 'exp' ?'-' : '+') + ' '+ int +'.'+ dec;
       
        
    };

    var nodeListForEach = function(list, callback) {
        //list contains the length property
        //list can be iterated
        for(var i =0; i< list.length; i++) 
        {
            callback(list[i], i);
        }
    };

    return {
        getInput : function()
        {
            return {
            type : document.querySelector(DOMstrings.inputType).value,
            description : document.querySelector(DOMstrings.inputDescription).value,
            value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem : function(obj, type) {

            var html, newHtml, element;

            //1. create an Html string with placeholder text

            if(type === 'inc')
            {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp')
            {
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            //2. replace the placeholder text with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));


            //3. insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        

        
        deleteListItem : function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        
        // to clear the input fields
        clearFields : function () {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            
            // to convert the list into array, we use slice method.
            fieldsArr = Array.prototype.slice.call(fields);

            //forEach loop in js, improved for loop
            fieldsArr.forEach(function(current, index, array)
            {
                current.value = "";
            });

            // to reset the focus to description input field
            fieldsArr[0].focus();
        },

        displayBudget : function(obj) {          

            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if(obj.percentage > 0)
            {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else{
            document.querySelector(DOMstrings.percentageLabel).textContent = '----';
            }
        },


        displayPercentages : function(percentages) {

            //returns a list called a nodeList
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            
            
            //own forEach function for nodeList

            nodeListForEach(fields, function(current, index) {
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                current.textContent = '---';

                }
            }
            );
        },


        displayMonth : function() {

            var now, year, month, months;

            // to store the date of today
            now = new Date();

            months = ['January', 'February', 'March', 'April','May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month]+ ' '+year;

        },

        changeType : function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
                );

                nodeListForEach(fields, function(cur) {
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings : function() {
            return DOMstrings;
        }

    };
})();









//global app controller
var controller = (function(budgetCtrl, UICtrl) 
{
    // the code that will set up the eventlisteners right at the beginning
    // when the appliction starts
    var setUpEventlisteners = function()
    {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

        // add the keypress eventlistener to the global document.
        document.addEventListener('keypress', function(event)
        {
            // to execute the code only when enter key is hit.
            // hence we use event.keycode
            if(event.keyCode === 13)
            {
                ctrlAddItem();
            }
        });

        // Event Delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };


    var updateBudget = function()
    {
        
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3. display the budget on UI.
        UICtrl.displayBudget(budget);

    };


    var updatePercentages = function() {

        // 1. calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. read percentage from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };
    

    var ctrlAddItem = function()
     {
         var input, newItem;
         // 1. get the filled input data
        input = UICtrl.getInput();


        if(input.description !== "" && !isNaN(input.value) && input.value > 0)
        {
            // 2. add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            
            // 3. add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4.Clear the input fields
            UICtrl.clearFields();

            //5. calculate and update budget
            updateBudget();

            //6. calculate and update percentages
            updatePercentages();
        }        
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;


        //event stores the target element on which the event was first fired
        //Dom Traversal through parentNode property
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID)
        {
            //split method splits the string around a specific letter or symbol
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from our data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. calculate and update percentages
            updatePercentages();



        }
    }

    return {
        init : function() {
            console.log('started');
            UICtrl.displayMonth();
            UICtrl.displayBudget(
                {
                    budget : 0,
                    totalInc : 0,
                    totalExp : 0,
                    percentage : -1
                });
            setUpEventlisteners();
        }
    }
   
})(budgetController, UIController);

controller.init();
