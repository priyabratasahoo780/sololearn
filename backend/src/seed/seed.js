const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User.model');
const Quiz = require('../models/Quiz.model');

const connectDB = require('../config/db');

// Load env vars
dotenv.config({ path: './.env' });

connectDB();

const questionsHTML = [
  { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Markup Language"], answerIndex: 0, explanation: "HTML stands for Hyper Text Markup Language." },
  { question: "Who is making the Web standards?", options: ["Mozilla", "Microsoft", "The World Wide Web Consortium", "Google"], answerIndex: 2, explanation: "The W3C is the main international standards organization for the World Wide Web." },
  { question: "Choose the correct HTML element for the largest heading:", options: ["<h6>", "<head>", "<h1>", "<heading>"], answerIndex: 2, explanation: "<h1> defines the most important heading." },
  { question: "What is the correct HTML element for inserting a line break?", options: ["<lb>", "<br>", "<break>", "<newline>"], answerIndex: 1, explanation: "<br> tag inserts a single line break." },
  { question: "Which character is used to indicate an end tag?", options: ["^", "<", "*", "/"], answerIndex: 3, explanation: "End tags are indicated by a forward slash /." },
  { question: "How can you open a link in a new tab/browser window?", options: ["<a href='url' target='new'>", "<a href='url' new>", "<a href='url' target='_blank'>", "<a href='url' target='window'>"], answerIndex: 2, explanation: "target='_blank' opens the link in a new tab or window." },
  { question: "Which HTML element is defined by the <table> tag?", options: ["Tables", "Tabular data", "Layout tables", "All of the above"], answerIndex: 0, explanation: "The <table> tag defines an HTML table." },
  { question: "Inline elements are normally displayed without starting a new line.", options: ["True", "False", "Partially True", "Depending on CSS"], answerIndex: 0, explanation: "Inline elements do not start on a new line." },
  { question: "Which HTML attribute specifies an alternate text for an image, if the image cannot be displayed?", options: ["title", "longdesc", "src", "alt"], answerIndex: 3, explanation: "The alt attribute provides alternative text." },
  { question: "To define an unordered list, we use:", options: ["<ul>", "<ol>", "<li>", "<list>"], answerIndex: 0, explanation: "<ul> defines an unordered list." },
  { question: "Which HTML element is used to define key-value pairs?", options: ["<dl>", "<kv>", "<key>", "<list>"], answerIndex: 0, explanation: "<dl> (Description List) is used for key-value pairs." },
  { question: "What is the correct HTML for making a text input field?", options: ["<input type='textfield'>", "<textinput>", "<input type='text'>", "<textfield>"], answerIndex: 2, explanation: "<input type='text'> defines a single-line text input." },
  { question: "Which HTML element is used to specify a footer for a document or section?", options: ["<bottom>", "<footer>", "<section>", "<end>"], answerIndex: 1, explanation: "<footer> defines a footer." },
  { question: "In HTML, text inside <canvas> is rendered as:", options: ["Graphics", "Text", "Images", "Nothing (hidden)"], answerIndex: 3, explanation: "Text inside <canvas> includes fallback content for browsers that don't support it." },
  { question: "Which element is used to define a navigation link?", options: ["<nav>", "<link>", "<a>", "<navigation>"], answerIndex: 0, explanation: "<nav> is used for a set of navigation links." },
  { question: "HTML5 introduced which element to play video files?", options: ["<media>", "<movie>", "<video>", "<play>"], answerIndex: 2, explanation: "<video> is used to embed video content." },
  { question: "Which element is used to represent the progress of a task?", options: ["<meter>", "<progress>", "<bar>", "<task>"], answerIndex: 1, explanation: "<progress> represents the completion progress of a task." },
  { question: "The <title> element must be located inside:", options: ["<body>", "<head>", "<html>", "<meta>"], answerIndex: 1, explanation: "<title> must be inside <head>." },
  { question: "Which attribute is used to specify the character encoding?", options: ["charset", "encoding", "lang", "type"], answerIndex: 0, explanation: "<meta charset='UTF-8'>" },
  { question: "Which element is used to define semantic content independent of other content?", options: ["<section>", "<article>", "<div>", "<aside>"], answerIndex: 1, explanation: "<article> specifies independent, self-contained content." }
];

const questionsCSS = [
  { question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets", "Computer Style Sheets"], answerIndex: 1, explanation: "CSS stands for Cascading Style Sheets." },
  { question: "Which HTML attribute is used to define inline styles?", options: ["class", "font", "styles", "style"], answerIndex: 3, explanation: "The style attribute is used for inline CSS." },
  { question: "Which is the correct CSS syntax?", options: ["body:color=black;", "{body;color:black;}", "body {color: black;}", "{body:color=black;}"], answerIndex: 2, explanation: "Selector { property: value; }" },
  { question: "How do you insert a comment in a CSS file?", options: ["// this is a comment", "' this is a comment", "/* this is a comment */", "<!-- this is a comment -->"], answerIndex: 2, explanation: "CSS comments are wrapped in /* */." },
  { question: "Which property is used to change the background color?", options: ["color", "bgcolor", "background-color", "background-image"], answerIndex: 2, explanation: "background-color sets the background color." },
  { question: "How do you add a background color for all <h1> elements?", options: ["all.h1 {background-color:#FFFFFF;}", "h1.all {background-color:#FFFFFF;}", "h1 {background-color:#FFFFFF;}", "#h1 {background-color:#FFFFFF;}"], answerIndex: 2, explanation: "h1 selector targets all h1 elements." },
  { question: "Which property controls the text size?", options: ["font-style", "text-size", "font-size", "text-style"], answerIndex: 2, explanation: "font-size sets the size of the font." },
  { question: "What is the correct CSS to display hyperlinks without an underline?", options: ["a {text-decoration:none;}", "a {decoration:no-underline;}", "a {text-decoration:no-underline;}", "a {underline:none;}"], answerIndex: 0, explanation: "text-decoration: none removes the underline." },
  { question: "How do you make each word in a text start with a capital letter?", options: ["text-style:capitalize", "text-transform:capitalize", "transform:capitalize", "font-transform:capitalize"], answerIndex: 1, explanation: "text-transform: capitalize capitalizes the first letter of each word." },
  { question: "Which property is used to change the font of an element?", options: ["font-family", "font-style", "font-weight", "font-type"], answerIndex: 0, explanation: "font-family specifies the font." },
  { question: "How do you make a list that lists its items with squares?", options: ["list-type: square;", "list-style-type: square;", "list: square;", "list-item: square;"], answerIndex: 1, explanation: "list-style-type: square;" },
  { question: "Which property is used to generate space around an element's content, inside of any defined borders?", options: ["padding", "margin", "border", "spacing"], answerIndex: 0, explanation: "Padding is the space inside the border." },
  { question: "Which property is used to generate space outside the border?", options: ["padding", "margin", "spacing", "border"], answerIndex: 1, explanation: "Margin is the space outside the border." },
  { question: "How do you select an element with id 'demo'?", options: ["demo", ".demo", "#demo", "*demo"], answerIndex: 2, explanation: "ID selectors start with #." },
  { question: "How do you select elements with class name 'test'?", options: ["test", ".test", "#test", "*test"], answerIndex: 1, explanation: "Class selectors start with ." },
  { question: "What is the default value of the position property?", options: ["relative", "fixed", "absolute", "static"], answerIndex: 3, explanation: "static is the default position." },
  { question: "Which CSS property controls the z-order?", options: ["z-index", "depth", "stack-order", "elevation"], answerIndex: 0, explanation: "z-index controls vertical stacking order." },
  { question: "Which property is used to align text?", options: ["text-align", "align-text", "justify", "center"], answerIndex: 0, explanation: "text-align property." },
  { question: "What does the 'flex' property do?", options: ["Makes elements float", "Creates a flex container", "Sets flex-grow, flex-shrink, flex-basis", "Aligns items centrally"], answerIndex: 2, explanation: "Is a shorthand for flex-grow, flex-shrink, and flex-basis." },
  { question: "Which unit is relative to the font-size of the root element?", options: ["em", "rem", "vh", "px"], answerIndex: 1, explanation: "rem is relative to the root (html) font-size." }
];

const questionsJS = [
  { question: "Inside which HTML element do we put the JavaScript?", options: ["<javascript>", "<js>", "<script>", "<scripting>"], answerIndex: 2, explanation: "<script> tag is used." },
  { question: "What is the correct syntax for referring to an external script called 'xxx.js'?", options: ["<script name='xxx.js'>", "<script src='xxx.js'>", "<script href='xxx.js'>", "<script file='xxx.js'>"], answerIndex: 1, explanation: "src attribute is used." },
  { question: "How do you write 'Hello World' in an alert box?", options: ["msg('Hello World');", "alertBox('Hello World');", "alert('Hello World');", "msgBox('Hello World');"], answerIndex: 2, explanation: "alert() function." },
  { question: "How do you create a function in JavaScript?", options: ["function = myFunction()", "function myFunction()", "function:myFunction()", "create myFunction()"], answerIndex: 1, explanation: "function keyword followed by name." },
  { question: "How do you call a function named 'myFunction'?", options: ["call myFunction()", "call function myFunction()", "myFunction()", "Action myFunction()"], answerIndex: 2, explanation: "By using its name followed by parentheses." },
  { question: "How to write an IF statement in JavaScript?", options: ["if i = 5 then", "if i == 5 then", "if (i == 5)", "if i = 5"], answerIndex: 2, explanation: "if (condition) { ... }" },
  { question: "How to write an IF statement for executing some code if 'i' is NOT equal to 5?", options: ["if (i <> 5)", "if (i != 5)", "if i <> 5", "if i != 5 then"], answerIndex: 1, explanation: "!= is the not equal operator." },
  { question: "How does a WHILE loop start?", options: ["while (i <= 10)", "while i = 1 to 10", "while (i <= 10; i++)", "until (i > 10)"], answerIndex: 0, explanation: "while (condition)" },
  { question: "How does a FOR loop start?", options: ["for (i = 0; i <= 5)", "for (i = 0; i <= 5; i++)", "for i = 1 to 5", "for (i <= 5; i++)"], answerIndex: 1, explanation: "for (initialization; condition; increment)" },
  { question: "How can you add a comment in a JavaScript?", options: ["'This is a comment", "//This is a comment", "<!--This is a comment-->", "#This is a comment"], answerIndex: 1, explanation: "// for single line comments." },
  { question: "What is the correct way to write a JavaScript array?", options: ["var colors = (1:'red', 2:'green', 3:'blue')", "var colors = ['red', 'green', 'blue']", "var colors = 'red', 'green', 'blue'", "var colors = 1=('red'), 2=('green')"], answerIndex: 1, explanation: "Arrays use square brackets []" },
  { question: "How do you round the number 7.25, to the nearest integer?", options: ["Math.round(7.25)", "rnd(7.25)", "Math.rnd(7.25)", "round(7.25)"], answerIndex: 0, explanation: "Math.round() rounds to nearest integer." },
  { question: "How do you find the number with the highest value of x and y?", options: ["Math.ceil(x, y)", "Math.max(x, y)", "ceil(x, y)", "top(x, y)"], answerIndex: 1, explanation: "Math.max() returns the largest number." },
  { question: "What event occurs when the user clicks on an HTML element?", options: ["onmouseover", "onchange", "onclick", "onmouseclick"], answerIndex: 2, explanation: "onclick event." },
  { question: "How do you declare a JavaScript variable?", options: ["v carName;", "var carName;", "variable carName;", "string carName;"], answerIndex: 1, explanation: "var, let, or const." },
  { question: "Which operator is used to assign a value to a variable?", options: ["*", "-", "=", "x"], answerIndex: 2, explanation: "= is the assignment operator." },
  { question: "What will the following code return: Boolean(10 > 9)", options: ["NaN", "false", "true", "undefined"], answerIndex: 2, explanation: "10 is greater than 9, so true." },
  { question: "Is JavaScript case-sensitive?", options: ["No", "Yes", "Only in functions", "Depends on browser"], answerIndex: 1, explanation: "Yes, variables `myVar` and `myvar` are different." },
  { question: "Which method converts a JSON string into a JavaScript object?", options: ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.toObj()"], answerIndex: 0, explanation: "JSON.parse() parses a string." },
  { question: "What acts as a blueprint for creating objects?", options: ["Method", "Variable", "Class", "Array"], answerIndex: 2, explanation: "A Class is a blueprint for objects." }
];

const questionsReact = [
  { question: "What is React?", options: ["A Database", "A JavaScript library for building UIs", "A Server framework", "A CSS framework"], answerIndex: 1, explanation: "React is a library for user interfaces." },
  { question: "Who maintains React?", options: ["Google", "Facebook (Meta)", "Amazon", "Microsoft"], answerIndex: 1, explanation: "Meta maintains React." },
  { question: "What is a component?", options: ["A reusable piece of UI", "A database table", "A server function", "A variable"], answerIndex: 0, explanation: "Components are independent, reusable UI bits." },
  { question: "What syntax extension does React use?", options: ["Java", "JSX", "XML", "HTML"], answerIndex: 1, explanation: "JSX (JavaScript XML)." },
  { question: "How do you pass data to components?", options: ["State", "Props", "Render", "DOM"], answerIndex: 1, explanation: "Props (properties) pass data down." },
  { question: "Props are ______.", options: ["Mutable", "Immutable", "Static", "Global"], answerIndex: 1, explanation: "Props are read-only (immutable)." },
  { question: "Which hook manages state?", options: ["useEffect", "useState", "useContext", "useReducer"], answerIndex: 1, explanation: "useState adds state to functional components." },
  { question: "Which hook handles side effects?", options: ["useState", "useEffect", "useCallback", "useRef"], answerIndex: 1, explanation: "useEffect handles side effects." },
  { question: "What prevents unnecessary re-renders?", options: ["useMemo", "useState", "useEffect", "useContext"], answerIndex: 0, explanation: "useMemo caches values." },
  { question: "What is the Virtual DOM?", options: ["A real DOM copy", "A lightweight representation of the DOM", "A heavy DOM", "A server DOM"], answerIndex: 1, explanation: "React uses it for performance." },
  { question: "How do you create a ref?", options: ["useReference", "useRef", "createRef", "ref()"], answerIndex: 1, explanation: "useRef hook." },
  { question: "Context API is for:", options: ["Local state", "Global state management", "API calls", "Routing"], answerIndex: 1, explanation: "Sharing data globally without prop drilling." },
  { question: "useEffect(fn, []) runs:", options: ["Every render", "Only once (mount)", "On update", "On unmount"], answerIndex: 1, explanation: "Empty dependency array means mount only." },
  { question: "What is a fragment?", options: ["<div> wrapper", "Memory leak", "Grouping children without DOM node", "A component error"], answerIndex: 2, explanation: "<>...</> or <Fragment>." },
  { question: "Events in React are:", options: ["Lowercase", "CamelCase", "Uppercase", "Kebab-case"], answerIndex: 1, explanation: "onClick, onChange, etc." },
  { question: "Unidirectional data flow means:", options: ["Data flows up", "Data flows down", "Data flows both ways", "Data is static"], answerIndex: 1, explanation: "Parent to child (down)." },
  { question: "What is Redux?", options: ["A database", "A state management library", "A server", "A browser"], answerIndex: 1, explanation: "Predictable state container." },
  { question: "What replaces componentDidMount in hooks?", options: ["useState", "useEffect", "useMount", "useCallback"], answerIndex: 1, explanation: "useEffect with empty deps." },
  { question: "Keys in lists should be:", options: ["Unique", "Random", "Index", "Null"], answerIndex: 0, explanation: "Keys help React identify changed items." },
  { question: "Can you return multiple elements from a component?", options: ["No, must wrap in one parent", "Yes, always", "Only strings", "Only null"], answerIndex: 0, explanation: "Must be wrapped (e.g., Fragment or div)." }
];

const questionsSQL = [
  { question: "What does SQL stand for?", options: ["Structured Question Language", "Structured Query Language", "Strong Query Language", "Standard Query Language"], answerIndex: 1, explanation: "Structured Query Language." },
  { question: "Which statement is used to extract data?", options: ["GET", "OPEN", "SELECT", "EXTRACT"], answerIndex: 2, explanation: "SELECT statement." },
  { question: "Which statement is used to update data?", options: ["SAVE", "UPDATE", "MODIFY", "SAVE AS"], answerIndex: 1, explanation: "UPDATE statement." },
  { question: "Which statement is used to delete data?", options: ["REMOVE", "DELETE", "COLLAPSE", "DROP"], answerIndex: 1, explanation: "DELETE statement." },
  { question: "How do you select all columns from a table named 'Customers'?", options: ["SELECT [all] FROM Customers", "SELECT * FROM Customers", "SELECT Customers", "SELECT ALL FROM Customers"], answerIndex: 1, explanation: "* selects all columns." },
  { question: "Which clause is used to filter records?", options: ["WHERE", "FILTER", "LIKE", "SEARCH"], answerIndex: 0, explanation: "WHERE clause." },
  { question: "Which operator checks for a pattern?", options: ["LIKE", "Pattern", "MATCH", "CHECK"], answerIndex: 0, explanation: "LIKE operator." },
  { question: "How do you sort the result-set?", options: ["SORT BY", "ORDER BY", "ARRANGE BY", "GROUP BY"], answerIndex: 1, explanation: "ORDER BY keyword." },
  { question: "Which function returns the number of records?", options: ["NUM()", "COUNT()", "TOTAL()", "SUM()"], answerIndex: 1, explanation: "COUNT() function." },
  { question: "Which keyword creates a new table?", options: ["CREATE TABLE", "MAKE TABLE", "NEW TABLE", "ADD TABLE"], answerIndex: 0, explanation: "CREATE TABLE." },
  { question: "What is a primary key?", options: ["A duplicate value", "A unique identifier for a row", "A global variable", "A backup key"], answerIndex: 1, explanation: "Uniquely identifies each record." },
  { question: "Which operator is used to select values within a range?", options: ["WITHIN", "BETWEEN", "RANGE", "IN"], answerIndex: 1, explanation: "BETWEEN operator." },
  { question: "Which join returns all records from the left table, and the matched records from the right table?", options: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "OUTER JOIN"], answerIndex: 2, explanation: "LEFT JOIN." },
  { question: "Which constraint ensures a column cannot have a NULL value?", options: ["NOT NULL", "UNIQUE", "PRIMARY KEY", "CHECK"], answerIndex: 0, explanation: "NOT NULL constraint." },
  { question: "What does DISTINCT do?", options: ["Selects all values", "Selects only different values", "Deletes duplicates", "Sorts values"], answerIndex: 1, explanation: "Returns only distinct (different) values." },
  { question: "Which SQL statement is used to insert new data?", options: ["ADD RECORD", "INSERT NEW", "INSERT INTO", "ADD INTO"], answerIndex: 2, explanation: "INSERT INTO." },
  { question: "Which statement is used to delete a table?", options: ["DELETE TABLE", "DROP TABLE", "REMOVE TABLE", "CLEAR TABLE"], answerIndex: 1, explanation: "DROP TABLE deletes the schema and data." }
];

const questionsPython = [
  { question: "What is Python?", options: ["A snake", "A compiled language", "An interpreted, high-level language", "A web browser"], answerIndex: 2, explanation: "Python is an interpreted, high-level programming language." },
  { question: "How do you output text to the console in Python?", options: ["echo('Hello')", "console.log('Hello')", "print('Hello')", "System.out.println('Hello')"], answerIndex: 2, explanation: "print() is the function." },
  { question: "Which symbol is used for comments in Python?", options: ["//", "#", "/*", "--"], answerIndex: 1, explanation: "# is used for single-line comments." },
  { question: "How do you create a variable in Python?", options: ["var x = 5", "int x = 5", "x = 5", "declare x = 5"], answerIndex: 2, explanation: "Python has no command for declaring a variable, just assignment." },
  { question: "What is the correct file extension for Python files?", options: [".pt", ".pyt", ".py", ".python"], answerIndex: 2, explanation: ".py is the standard extension." },
  { question: "How do you create a function in Python?", options: ["function myFunc():", "def myFunc():", "create myFunc():", "func myFunc():"], answerIndex: 1, explanation: "def keyword defines a function." },
  { question: "Which collection is ordered, changeable, and allows duplicates?", options: ["Tuple", "Set", "Dictionary", "List"], answerIndex: 3, explanation: "List is the correct collection type." },
  { question: "Which collection is unordered, unchangeable, and indexed?", options: ["List", "Dictionary", "Tuple", "Set"], answerIndex: 2, explanation: "Tuple is immutable (unchangeable)." },
  { question: "How do you start a for loop?", options: ["for x in y:", "for each x in y:", "for x inside y:", "loop x in y:"], answerIndex: 0, explanation: "Standard for-in syntax." },
  { question: "What is the correct syntax to import a module?", options: ["include module", "import module", "using module", "require module"], answerIndex: 1, explanation: "import keyword." },
  { question: "What is indentation used for in Python?", options: ["Readability only", "To define blocks of code", "It is optional", "Decoration"], answerIndex: 1, explanation: "Indentation is mandatory to define scope/blocks." },
  { question: "Which operator is used for exponentiation?", options: ["^", "**", "exp", "pow"], answerIndex: 1, explanation: "** is the power operator." },
  { question: "What does 'len()' do?", options: ["Returns the length", "Converts to number", "Loops", "Exits"], answerIndex: 0, explanation: "Returns the length of an object." },
  { question: "How to check if a key exists in a dictionary?", options: ["has_key()", "in operator", "exists()", "check()"], answerIndex: 1, explanation: "'key' in dict" },
  { question: "What is a lambda function?", options: ["A large function", "A named function", "An anonymous small function", "A loop"], answerIndex: 2, explanation: "Small anonymous function." },
  { question: "Which library is popular for data analysis?", options: ["Pandas", "Requests", "Django", "Flask"], answerIndex: 0, explanation: "Pandas is the standard for data analysis." },
  { question: "Which framework is used for web development?", options: ["Numpy", "Django", "Scipy", "PyGame"], answerIndex: 1, explanation: "Django is a web framework." },
  { question: "What is 'pip'?", options: ["A snake", "A package manager", "A variable", "A function"], answerIndex: 1, explanation: "Pip Installs Packages." },
  { question: "How do you handle exceptions?", options: ["try...except", "try...catch", "do...catch", "attempt...rescue"], answerIndex: 0, explanation: "try...except blocks." },
  { question: "What is the output of: print(bool(0))", options: ["True", "False", "Error", "None"], answerIndex: 1, explanation: "0 is Falsey." }
];

const questionsGit = [
  { question: "What command initializes a new repository?", options: ["git start", "git init", "git new", "git create"], answerIndex: 1, explanation: "git init creates a new repo." },
  { question: "How do you check the status of your files?", options: ["git status", "git check", "git info", "git log"], answerIndex: 0, explanation: "git status shows working tree status." },
  { question: "Which command stages changes?", options: ["git commit", "git add", "git stage", "git push"], answerIndex: 1, explanation: "git add stages files." },
  { question: "How do you save your staged changes?", options: ["git save", "git commit", "git push", "git done"], answerIndex: 1, explanation: "git commit saves snapshots." },
  { question: "Which command uploads changes to a remote repo?", options: ["git upload", "git push", "git send", "git update"], answerIndex: 1, explanation: "git push uploads commits." },
  { question: "How do you download changes from a remote repo?", options: ["git pull", "git download", "git fetch", "git get"], answerIndex: 0, explanation: "git pull fetches and merges." },
  { question: "What is a branch?", options: ["A wooden stick", "A parallel version of the code", "A command", "A bug"], answerIndex: 1, explanation: "Branches allow isolated development." },
  { question: "How do you create a new branch?", options: ["git branch <name>", "git new <name>", "git checkout <name>", "git create <name>"], answerIndex: 0, explanation: "git branch creates it." },
  { question: "How do you switch to another branch?", options: ["git switch", "git checkout", "git move", "Both A and B"], answerIndex: 3, explanation: "Both checkout and switch work." },
  { question: "What command shows the commit history?", options: ["git history", "git log", "git show", "git past"], answerIndex: 1, explanation: "git log shows history." },
  { question: "What is 'origin'?", options: ["The local repo", "The default remote repo name", "The first commit", "The user"], answerIndex: 1, explanation: "Default alias for remote repository." },
  { question: "How do you merge a branch?", options: ["git merge <branch>", "git join <branch>", "git combine <branch>", "git mix <branch>"], answerIndex: 0, explanation: "git merge combines histories." },
  { question: "What is a conflict?", options: ["A fight", "Incompatible changes in same file", "A virus", "A network error"], answerIndex: 1, explanation: "When changes overlap." },
  { question: "How do you undo the last commit (soft)?", options: ["git undo", "git reset --soft HEAD~1", "git revert", "git delete"], answerIndex: 1, explanation: "git reset moves HEAD back." },
  { question: "What does 'git clone' do?", options: ["Copies a repo locally", "Duplicates a file", "Creates a branch", "Deletes a repo"], answerIndex: 0, explanation: "Clones a remote repo." },
  { question: "What is .gitignore?", options: ["A virus", "A file listing ignored files", "A command", "A folder"], answerIndex: 1, explanation: "Specifies intentionally untracked files." },
  { question: "Which command creates a tag?", options: ["git tag", "git mark", "git label", "git stamp"], answerIndex: 0, explanation: "git tag marks specific points." },
  { question: "What is 'HEAD'?", options: ["The user", "The current commit reference", "The server", "The main branch"], answerIndex: 1, explanation: "Pointer to the latest commit in current branch." },
  { question: "How do you view changes between commits?", options: ["git diff", "git view", "git changes", "git compare"], answerIndex: 0, explanation: "git diff shows changes." },
  { question: "What is a pull request?", options: ["A demand", "A request to merge changes", "A download", "A command"], answerIndex: 1, explanation: "Mechanism to review and merge code." }
];

const seedQuizzes = async () => {
  try {
    // Find or create a user to assign as creator
    let user = await User.findOne({ role: 'admin' });
    if (!user) {
      user = await User.findOne({});
    }
    
    // If absolutely no user exists, create a dummy one
    if (!user) {
      user = await User.create({
        name: 'Admin User',
        email: 'admin@sololearn.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('Created dummy admin user for seeding...');
    }

    await Quiz.deleteMany({});
    console.log('Quizzes cleared...');

    const quizzes = [
      {
        title: "HTML Basics",
        description: "Master the building blocks of the web. Learn about tags, elements, and attributes.",
        icon: "Layout",
        color: "from-orange-400 to-red-500",
        questions: questionsHTML,
        category: "HTML",
        difficulty: "Beginner",
        pointsPerQuestion: 10,
        createdBy: user._id
      },
      {
        title: "CSS Styling",
        description: "Make the web beautiful. Learn about selectors, properties, and layouts.",
        icon: "Palette",
        color: "from-blue-400 to-indigo-500",
        questions: questionsCSS,
        category: "CSS",
        difficulty: "Beginner",
        pointsPerQuestion: 10,
        createdBy: user._id
      },
      {
        title: "JavaScript Logic",
        description: "Add interactivity to your sites. Variables, functions, loops, and DOM manipulation.",
        icon: "Code",
        color: "from-yellow-400 to-orange-500",
        questions: questionsJS,
        category: "JavaScript",
        difficulty: "Intermediate",
        pointsPerQuestion: 15,
        createdBy: user._id
      },
      {
        title: "React Fundamentals",
        description: "Build modern UIs with components, hooks, and state management.",
        icon: "Atom",
        color: "from-cyan-400 to-blue-500",
        questions: questionsReact,
        category: "ReactJS",
        difficulty: "Advanced",
        pointsPerQuestion: 20,
        createdBy: user._id
      },
      {
        title: "SQL Databases",
        description: "Learn to manage and query relational databases with SQL.",
        icon: "Database",
        color: "from-blue-600 to-cyan-600",
        questions: questionsSQL,
        category: "SQL",
        difficulty: "Intermediate",
        pointsPerQuestion: 15,
        createdBy: user._id
      },
      {
        title: "Python Essentials",
        description: "Learn the syntax, data structures, and power of Python programming.",
        icon: "Terminal",
        color: "from-green-400 to-emerald-600",
        questions: questionsPython,
        category: "Python",
        difficulty: "Beginner",
        pointsPerQuestion: 10,
        createdBy: user._id
      },
      {
        title: "Git Version Control",
        description: "Master source control management. Branch, commit, and merge like a pro.",
        icon: "GitBranch",
        color: "from-red-500 to-pink-600",
        questions: questionsGit,
        category: "Git",
        difficulty: "Intermediate",
        pointsPerQuestion: 15,
        createdBy: user._id
      }
    ];

    await Quiz.insertMany(quizzes);
    console.log('Quizzes seeded successfully! 🚀');
    process.exit();
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
};

seedQuizzes();
