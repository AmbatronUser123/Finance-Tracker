import React from 'react';
import { CategoryWithBudget } from './types';
import Dashboard from './components/Dashboard';
import ExpenseLogger from './components/ExpenseLogger';
import CategoryManager from './components/CategoryManager';
import GoalManager from './components/GoalManager';
import CategoryEditor from './components/CategoryEditor';
import DataManager from './components/DataManager';
import CategoryDetailModal from './components/CategoryDetailModal';
import SourceManager from './components/SourceManager';
import ExpenseHistory from './components/ExpenseHistory';
import { SunIcon, MoonIcon } from './components/icons';
import NewMonthModal from './components/NewMonthModal';
import IncomeInput from './components/IncomeInput';
import IncomeHistory from './components/IncomeHistory';
import ReportsView from './components/ReportsView';
import Sidebar, { navItems } from './components/Sidebar';
import { useFinanceApp } from './hooks/useFinanceApp';

const AppContent: React.FC = () => {
  const app = useFinanceApp();

  const renderView = (): React.ReactNode => {
    switch (app.currentView) {
      case 'dashboard':
        return (
          <Dashboard
            income={app.effectiveIncome}
            totalExpenses={app.totalExpenses}
            totalSavings={app.totalSavings}
            categories={app.categories}
            goals={app.goals}
            sources={app.sources}
          />
        );
      case 'expenses':
        return (
          <div className="space-y-6">
            <ExpenseLogger
              categories={app.categories}
              onAddExpense={app.handleAddExpense}
              isAddDisabled={false}
              transactionSources={app.sources}
            />
            <ExpenseHistory
              categories={app.categories}
              sources={app.sources}
              onEditExpense={app.handleEditExpense}
              onDeleteExpense={app.handleDeleteExpense}
            />
          </div>
        );
      case 'sources': {
        const totalsBySource: Record<string, number> = {};
        const usedCountBySource: Record<string, number> = {};
        app.categories.forEach((cat: CategoryWithBudget) => {
          cat.expenses.forEach(exp => {
            totalsBySource[exp.sourceId] = (totalsBySource[exp.sourceId] || 0) + exp.amount;
            usedCountBySource[exp.sourceId] = (usedCountBySource[exp.sourceId] || 0) + 1;
          });
        });
        return (
          <SourceManager
            sources={app.sources}
            onAddSource={app.handleAddSource}
            onDeleteSource={app.handleDeleteSource}
            onEditSource={app.handleEditSource}
            onTransfer={app.handleTransferSources}
            totalsBySource={totalsBySource}
            usedCountBySource={usedCountBySource}
          />
        );
      }
      case 'income':
        return (
          <div className="space-y-6">
            <IncomeInput onAddIncome={(payload) => app.handleAddIncome({ ...payload })} transactionSources={app.sources} />
            <IncomeHistory incomes={app.incomes} sources={app.sources} onEditIncome={app.handleEditIncome} onDeleteIncome={app.handleDeleteIncome} />
          </div>
        );
      case 'categories':
        return (
          <CategoryManager
            categories={app.categories}
            onAllocationChange={app.handleAllocationChange}
            totalAllocation={app.categories.reduce((sum: number, cat: CategoryWithBudget) => sum + cat.allocation, 0)}
            onOpenModal={app.handleOpenModal}
            onDeleteCategory={app.handleDeleteCategory}
            onAutoAdjustAllocation={app.handleAutoAdjustAllocation}
            onViewCategory={app.handleViewCategory}
          />
        );
      case 'goals':
        return (
          <GoalManager
            goals={app.goals}
            onAddGoal={app.handleAddGoal}
            onUpdateGoal={app.handleUpdateGoal}
            onDeleteGoal={app.handleDeleteGoal}
            availableFunds={app.totalSavings}
          />
        );
      case 'data':
        return (
          <DataManager
            onImport={app.handleImportData}
            onExport={app.handleExportData}
            onResetCurrentMonth={app.handleArchiveAndResetCurrentMonth}
          />
        );
      case 'reports': {
        return <ReportsView categories={app.categories} monthlyArchives={app.monthlyArchives} incomes={app.incomes} />;
      }
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">404</h2>
              <p className="text-slate-600 dark:text-slate-300">Page not found</p>
              <button
                onClick={() => app.handleNavigation('dashboard')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Sidebar
        currentView={app.currentView}
        mobileMenuOpen={app.mobileMenuOpen}
        onToggleMobileMenu={() => app.setMobileMenuOpen(!app.mobileMenuOpen)}
        onNavigate={app.handleNavigation}
        effectiveIncome={app.effectiveIncome}
        totalExpenses={app.totalExpenses}
        totalSavings={app.totalSavings}
        totalSourceBalance={app.totalSourceBalance}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <header className="bg-white dark:bg-slate-800 shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {navItems.find(item => item.id === app.currentView)?.label || 'Dashboard'}
            </h1>
            <button
              onClick={app.toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600"
              aria-label="Toggle theme"
              title={`Switch to ${app.theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {app.theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              <span className="hidden sm:inline">{app.theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
          {renderView()}
        </main>
      </div>

      {app.isCategoryModalOpen && (
        <CategoryEditor
          categoryToEdit={app.editingCategory}
          onSave={app.handleSaveCategory}
          onClose={() => app.setCategoryModalOpen(false)}
        />
      )}

      <CategoryDetailModal
        category={app.viewingCategory}
        onClose={() => app.setViewingCategory(null)}
      />

      {app.showNewMonthModal && (
        <NewMonthModal
          currentIncome={app.effectiveIncome}
          onConfirm={app.handleNewMonthConfirm}
          onSkip={app.handleNewMonthSkip}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppContent />
  );
};

export default App;
