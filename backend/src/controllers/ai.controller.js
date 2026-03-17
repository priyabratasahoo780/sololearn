const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Ask AI Tutor a question
// @route   POST /api/ai/ask
// @access  Private
exports.askTutor = asyncHandler(async (req, res, next) => {
  const { question } = req.body;

  if (!question) {
    return next(new ApiError(400, 'Please provide a question'));
  }

  // MOCK LOGIC - In production, replace this with a call to OpenAI/Gemini/Anthropic
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate thinking time

  let answer = `I'm an AI Tutor (currently in simulated mode). I can help you with **JavaScript**, **React**, **CSS**, and **APIs**. Try asking about "loops" or "components"!`;
  
  const lowerQ = question.toLowerCase();
  
  if (lowerQ.includes('javascript') || lowerQ.includes('js')) {
    answer = `**JavaScript** is the language of the web! 🚀

Here is a simple example of a function:

\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Developer"));
\`\`\`

Key concepts include:
- **Variables**: \`let\` and \`const\`
- **Functions**: Arrow functions \`() => {}\`
- **DOM Manipulation**: Changing HTML dynamically`;

  } else if (lowerQ.includes('react')) {
    answer = `**React** is a library for building UIs using components. ⚛️

Here is a basic component:

\`\`\`javascript
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
};
\`\`\`

React uses a **Virtual DOM** to make updates fast and efficient!`;

  } else if (lowerQ.includes('css') || lowerQ.includes('style')) {
    answer = `**CSS** controls the visual style of your web pages. 🎨

A modern way to center content is using **Flexbox**:

\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
\`\`\`

You can also use **Grid** for complex layouts!`;

  } else if (lowerQ.includes('api')) {
    answer = `**APIs** (Application Programming Interfaces) let apps talk to each other. 🌐

Here is how you might fetch data in JS:

\`\`\`javascript
async function getData() {
  const response = await fetch('https://api.example.com/data');
  const data = await response.json();
  console.log(data);
}
\`\`\`

Common methods are \`GET\`, \`POST\`, \`PUT\`, and \`DELETE\`.`;

  } else if (lowerQ.includes('python')) {
    answer = `**Python** is a versatile and readable programming language! 🐍

It is great for data science, automation, and web backends.

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Pythonista"))
\`\`\`

Python uses **indentation** to define blocks of code instead of curly braces!`;

  } else if (lowerQ.includes('sql') || lowerQ.includes('database')) {
    answer = `**SQL** (Structured Query Language) is used to interact with databases. 🗄️

Example of a simple query:

\`\`\`sql
SELECT name, score 
FROM users 
WHERE score > 100 
ORDER BY score DESC;
\`\`\`

Key commands: \`SELECT\`, \`INSERT\`, \`UPDATE\`, and \`DELETE\`.`;

  } else if (lowerQ.includes('git') || lowerQ.includes('version control')) {
    answer = `**Git** is the world's most popular version control system! 🌿

Common workflow:

\`\`\`bash
git add .
git commit -m "Add amazing new feature"
git push origin main
\`\`\`

It helps developers collaborate and keep track of changes!`;

  } else if (lowerQ.includes('hello') || lowerQ.includes('hi')) {
    answer = "Hello! 👋 I'm ready to help you learn. Ask me about **JavaScript**, **React**, **CSS**, **Python**, **SQL**, or **Git**!";
  } else if (lowerQ.includes('thank')) {
    answer = "You're welcome! Happy coding! 💻";
  } else {
    // Fallback with random facts
    const facts = [
      "JavaScript was created in just 10 days by Brendan Eich in 1995!",
      "Python was named after the comedy group 'Monty Python', not the snake.",
      "The first computer bug was an actual moth found in a relay of the Harvard Mark II computer.",
      "The majority of the world's websites are powered by Linux."
    ];
    const randomFact = facts[Math.floor(Math.random() * facts.length)];

    answer = `I'm currently specialized in **JavaScript**, **React**, **CSS**, **Python**, **SQL**, and **Git**. 
    
I didn't quite get that, but did you know? 
> ${randomFact}

Try asking:
- "Explain Git branches"
- "How do I use a dictionary in Python?"
- "What is a React Hook?"`;
  }

  res.status(200).json({
    success: true,
    data: {
      answer,
      timestamp: new Date()
    }
  });
});
