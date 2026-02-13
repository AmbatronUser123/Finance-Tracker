import { test, describe, it } from 'node:test';
import assert from 'node:assert';
import { isCategoryNameUnique } from './validation.ts';
import type { Category } from '../../types.ts';

describe('isCategoryNameUnique', () => {
    const mockCategories: Category[] = [
        { id: '1', name: 'Food', allocation: 10, budget: 100, spent: 0, planned: 0, expenses: [], color: 'red', icon: 'food' },
        { id: '2', name: 'Transport', allocation: 20, budget: 200, spent: 0, planned: 0, expenses: [], color: 'blue', icon: 'car' },
    ];

    it('should return true for a unique name', () => {
        assert.strictEqual(isCategoryNameUnique('Savings', mockCategories), true);
    });

    it('should return false for a duplicate name (case insensitive)', () => {
        assert.strictEqual(isCategoryNameUnique('food', mockCategories), false);
        assert.strictEqual(isCategoryNameUnique('Transport', mockCategories), false);
    });

    it('should return true when editing an existing category keeping same name', () => {
        // Editing 'Food' (id: '1')
        assert.strictEqual(isCategoryNameUnique('Food', mockCategories, '1'), true);
    });

    it('should return false when editing an existing category changing to another existing name', () => {
        // Editing 'Food' (id: '1') but changing name to 'Transport'
        assert.strictEqual(isCategoryNameUnique('Transport', mockCategories, '1'), false);
    });
});
