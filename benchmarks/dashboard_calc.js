const { performance } = require('perf_hooks');

// Mock data generation
const generateData = () => {
    const categories = [];
    for (let i = 0; i < 1000; i++) {
        const expenses = [];
        for (let j = 0; j < 10; j++) {
            expenses.push({
                id: `exp-${i}-${j}`,
                amount: Math.random() * 100,
                date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
                description: `Expense ${i}-${j}`,
                sourceId: 'src-1'
            });
        }
        categories.push({
            id: `cat-${i}`,
            name: `Category ${i}`,
            budget: 1000,
            spent: 0, // Not used in this logic but part of Category type
            allocation: 10,
            color: '#000000',
            expenses: expenses
        });
    }
    return categories;
};

const categories = generateData();

console.log(`Generated ${categories.length} categories with ${categories[0].expenses.length} expenses each.`);
console.log('Running benchmark...');

const start = performance.now();

// The exact logic from Dashboard.tsx
const recent = categories
    .flatMap(cat => (cat.expenses || []).map(exp => ({
        ...exp,
        categoryName: cat.name,
    })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

const end = performance.now();

console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
console.log(`Result count: ${recent.length}`);
