const { performance } = require('perf_hooks');

// Generate data
const NUM_CATEGORIES = 20;
const EXPENSES_PER_CATEGORY = 5000; // Total 100,000 expenses
const categories = [];
const sources = [];

// Helper to generate random date string
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
}

// Setup data
for (let i = 0; i < NUM_CATEGORIES; i++) {
    const expenses = [];
    for (let j = 0; j < EXPENSES_PER_CATEGORY; j++) {
        expenses.push({
            id: `exp-${i}-${j}`,
            categoryId: `cat-${i}`,
            sourceId: `src-${j % 5}`,
            description: `Expense description ${j}`,
            amount: Math.random() * 100000,
            date: randomDate(new Date(2020, 0, 1), new Date(2025, 11, 31)),
        });
    }
    categories.push({
        id: `cat-${i}`,
        name: `Category ${i}`,
        expenses: expenses
    });
}

const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
const sourceMap = {};

console.log(`Generated ${NUM_CATEGORIES * EXPENSES_PER_CATEGORY} expenses.`);

// Baseline: allExpenses creation
const startAllExpenses = performance.now();
const allExpenses = categories.flatMap(cat =>
    (cat.expenses || []).map(exp => ({
        ...exp,
        categoryName: categoryMap[exp.categoryId] || 'Unknown',
        sourceName: sourceMap[exp.sourceId] || 'Unknown',
    }))
);
const endAllExpenses = performance.now();
console.log(`Baseline allExpenses creation: ${(endAllExpenses - startAllExpenses).toFixed(2)}ms`);

const filterIterations = 50;
let totalTime = 0;

// Baseline: filter + sort
// Warmup
for (let i=0; i<5; i++) {
     const arr = allExpenses.filter(exp => {
        const d = new Date(exp.date);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return true;
     });
     arr.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

for (let i = 0; i < filterIterations; i++) {
    const start = performance.now();
    const filtered = allExpenses.filter(exp => {
        // Current implementation logic
        if (false) return false;
        if (false) return false;
        const d = new Date(exp.date);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear());
        if ('10' !== 'all' && mm !== '10') return false;
        if (false) return false;
        return true;
    });
    filtered.sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return db - da;
    });
    totalTime += (performance.now() - start);
}
console.log(`Baseline filter+sort (avg): ${(totalTime / filterIterations).toFixed(2)}ms`);


// Optimized Strategy A3: Pre-calculation using new Date() + timestamp
const startAllExpensesOpt3 = performance.now();
const allExpensesOpt3 = categories.flatMap(cat =>
    (cat.expenses || []).map(exp => {
        const d = new Date(exp.date);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear());
        const ts = d.getTime();
        return {
            ...exp,
            categoryName: categoryMap[exp.categoryId] || 'Unknown',
            sourceName: sourceMap[exp.sourceId] || 'Unknown',
            mm,
            yy,
            ts
        };
    })
);
const endAllExpensesOpt3 = performance.now();
console.log(`Optimized allExpenses creation (A3): ${(endAllExpensesOpt3 - startAllExpensesOpt3).toFixed(2)}ms`);

// Filter + Sort using Strategy A3
totalTime = 0;
// Warmup
for (let i=0; i<5; i++) {
    const arr = allExpensesOpt3.filter(exp => true);
    arr.sort((a,b) => b.ts - a.ts);
}

for (let i = 0; i < filterIterations; i++) {
    const start = performance.now();
    const filtered = allExpensesOpt3.filter(exp => {
        if (false) return false;
        if (false) return false;
        const mm = exp.mm;
        if ('10' !== 'all' && mm !== '10') return false;
        if (false) return false;
        return true;
    });
    // Sorting using pre-calculated timestamp
    filtered.sort((a, b) => {
        return b.ts - a.ts; // Descending
    });
    totalTime += (performance.now() - start);
}
console.log(`Optimized Strategy A3 filter+sort (avg): ${(totalTime / filterIterations).toFixed(2)}ms`);
