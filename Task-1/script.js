 // Initial Dataset matching exact visual design requirements
    const DEFAULT_TRANSACTIONS = [
      { id: '1', name: 'Palantir Systems Retainer', category: 'Salary & Retainer', date: '2024-10-22', amount: 14500.00, type: 'income', icon: 'fa-briefcase' },
      { id: '2', name: 'Metropolitan Luxury Apt Lease', category: 'Housing & Bills', date: '2024-10-20', amount: -3850.00, type: 'expense', icon: 'fa-house' },
      { id: '3', name: 'Angel Investment Dividend (Series A)', category: 'Investments', date: '2024-10-18', amount: 6200.00, type: 'income', icon: 'fa-chart-line' },
      { id: '4', name: 'Equinox Tier-X Executive Fitness', category: 'Healthcare', date: '2024-10-16', amount: -395.00, type: 'expense', icon: 'fa-heart-pulse' },
      { id: '5', name: 'Le Bernardin Executive Dinner', category: 'Food & Dining', date: '2024-10-15', amount: -840.00, type: 'expense', icon: 'fa-utensils' },
      { id: '6', name: 'Apex AI Strategic Advisory', category: 'Freelance & Advisory', date: '2024-10-12', amount: 3500.00, type: 'income', icon: 'fa-wand-magic-sparkles' },
      { id: '7', name: 'Apple Store Flagship Hardware', category: 'Shopping', date: '2024-10-10', amount: -2499.00, type: 'expense', icon: 'fa-bag-shopping' },
      { id: '8', name: 'NetJets Flight Share & Transfer', category: 'Travel & Transport', date: '2024-10-08', amount: -1650.00, type: 'expense', icon: 'fa-plane' },
      { id: '9', name: 'Symphony Hall Gala Reserve', category: 'Entertainment', date: '2024-10-04', amount: -480.00, type: 'expense', icon: 'fa-ticket' }
    ];

    // Application State Variables
    let transactions = JSON.parse(localStorage.getItem('lumina_pure_css_txs')) || [...DEFAULT_TRANSACTIONS];
    let currentTypeFilter = 'all';
    let categoryDoughnutChart = null;
    let cashFlowBarChart = null;

    // Icon Mapping lookup
    const categoryIcons = {
      'Salary & Retainer': 'fa-briefcase',
      'Housing & Bills': 'fa-house',
      'Investments': 'fa-chart-line',
      'Healthcare': 'fa-heart-pulse',
      'Food & Dining': 'fa-utensils',
      'Freelance & Advisory': 'fa-wand-magic-sparkles',
      'Shopping': 'fa-bag-shopping',
      'Travel & Transport': 'fa-plane',
      'Entertainment': 'fa-ticket'
    };

    // Helper: Currency Formatter
    function formatCurrency(val) {
      const sign = val > 0 ? '+' : (val < 0 ? '-' : '');
      const absVal = Math.abs(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `${sign}$${absVal}`;
    }

    // Helper: Date Display Formatter
    function formatDate(dateStr) {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    }

    function setTypeFilter(type) {
      currentTypeFilter = type;
      ['all', 'income', 'expense'].forEach(t => {
        const btn = document.getElementById(`type-${t}`);
        if (t === type) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      filterTransactions();
    }

    function handleGlobalSearch(val) {
      document.getElementById('table-search').value = val;
      filterTransactions();
    }

    function filterTransactions() {
      const query = (document.getElementById('table-search').value || '').toLowerCase().trim();
      const catVal = document.getElementById('category-filter').value;
      const sortVal = document.getElementById('sort-order').value;

      let filtered = transactions.filter(t => {
        const matchesQuery = t.name.toLowerCase().includes(query) || t.category.toLowerCase().includes(query);
        const matchesType = currentTypeFilter === 'all' || t.type === currentTypeFilter;
        const matchesCat = catVal === 'ALL' || t.category === catVal;
        return matchesQuery && matchesType && matchesCat;
      });

      // Sorting Logic
      filtered.sort((a, b) => {
        if (sortVal === 'newest') return new Date(b.date) - new Date(a.date);
        if (sortVal === 'oldest') return new Date(a.date) - new Date(b.date);
        if (sortVal === 'highest') return Math.abs(b.amount) - Math.abs(a.amount);
        if (sortVal === 'lowest') return Math.abs(a.amount) - Math.abs(b.amount);
        return 0;
      });

      renderTable(filtered);
    }

    function renderTable(data) {
      const tbody = document.getElementById('transactions-tbody');
      tbody.innerHTML = '';

      if (data.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-dim); font-family: var(--font-mono);">
              No matching transactions found in executive ledger.
            </td>
          </tr>
        `;
        document.getElementById('entries-count-text').textContent = `Showing 0 of ${transactions.length} entries`;
        return;
      }

      data.forEach(t => {
        const isIncome = t.amount >= 0;
        const iconClass = categoryIcons[t.category] || 'fa-receipt';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div class="counterparty-cell">
              <div class="counterparty-icon">
                <i class="fa-solid ${iconClass}"></i>
              </div>
              <span>${t.name}</span>
            </div>
          </td>
          <td>
            <span class="category-badge">
              <span class="category-badge-dot" style="background-color: ${isIncome ? 'var(--secondary)' : 'var(--primary)'};"></span>
              ${t.category}
            </span>
          </td>
          <td style="color: var(--text-muted); font-family: var(--font-mono);">${formatDate(t.date)}</td>
          <td class="magnitude-val ${isIncome ? 'income' : 'expense'}">${formatCurrency(t.amount)}</td>
          <td style="text-align: center;">
            <button class="action-btn" onclick="deleteTransaction('${t.id}')" title="Delete entry">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      document.getElementById('entries-count-text').textContent = `Showing ${data.length} of ${transactions.length} entries`;
    }

    // Delete Item
    function deleteTransaction(id) {
      transactions = transactions.filter(t => t.id !== id);
      saveAndRefresh();
    }

    function updateMetrics() {
      let totalInflow = 0;
      let totalOutflow = 0;

      transactions.forEach(t => {
        if (t.amount > 0) {
          totalInflow += t.amount;
        } else {
          totalOutflow += Math.abs(t.amount);
        }
      });

      const netPosition = totalInflow - totalOutflow;

      document.getElementById('kpi-net-position').textContent = formatCurrency(netPosition).replace('+', '');
      document.getElementById('kpi-inflow').textContent = formatCurrency(totalInflow);
      document.getElementById('kpi-outflow').textContent = formatCurrency(-totalOutflow);
      document.getElementById('kpi-surplus').textContent = formatCurrency(netPosition).replace('+', '');

      // Update progress bar
      const velocityRate = totalInflow > 0 ? Math.min(100, Math.max(0, (netPosition / totalInflow) * 100)) : 0;
      document.getElementById('velocity-fill').style.width = `${velocityRate.toFixed(1)}%`;

      updateDoughnutChart();
    }

    function saveAndRefresh() {
      localStorage.setItem('lumina_pure_css_txs', JSON.stringify(transactions));
      filterTransactions();
      updateMetrics();
    }

    function resetSampleData() {
      transactions = [...DEFAULT_TRANSACTIONS];
      saveAndRefresh();
    }

    function exportToCSV() {
      let csv = "ID,Counterparty,Category,Date,Amount,Type\n";
      transactions.forEach(t => {
        csv += `"${t.id}","${t.name}","${t.category}","${t.date}","${t.amount}","${t.type}"\n`;
      });
      const uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      const link = document.createElement("a");
      link.setAttribute("href", uri);
      link.setAttribute("download", `Lumina_Executive_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function initCharts() {
      // 1. Category Expenditure Weight Doughnut Chart
      const ctxDoughnut = document.getElementById('categoryDoughnutChart').getContext('2d');
      categoryDoughnutChart = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
          labels: ['Housing & Bills', 'Shopping', 'Travel & Transport', 'Food & Dining'],
          datasets: [{
            data: [3850, 2499, 1650, 840],
            backgroundColor: ['#6366F1', '#10B981', '#F43F5E', '#38BDF8'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          cutout: '75%',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      });

      // 2. Cash Flow Delta Bar Chart
      const ctxBar = document.getElementById('cashFlowBarChart').getContext('2d');
      cashFlowBarChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
          labels: ['JUL', 'AUG', 'SEP', 'OCT'],
          datasets: [
            {
              label: 'Inflow',
              data: [18500, 21000, 22400, 24200],
              backgroundColor: '#10B981',
              borderRadius: 6,
              barPercentage: 0.4
            },
            {
              label: 'Outflow',
              data: [8200, 9100, 8800, 9714],
              backgroundColor: '#F43F5E',
              borderRadius: 6,
              barPercentage: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94A3B8', font: { family: 'JetBrains Mono', size: 10 } }
            },
            y: { display: false }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });

      updateDoughnutChart();
    }

    function updateDoughnutChart() {
      if (!categoryDoughnutChart) return;

      const categoryTotals = {};
      let totalExpense = 0;

      transactions.filter(t => t.type === 'expense').forEach(t => {
        const absVal = Math.abs(t.amount);
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + absVal;
        totalExpense += absVal;
      });

      const sortedCats = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);
      const top4 = sortedCats.slice(0, 4);
      const palette = ['#6366F1', '#10B981', '#F43F5E', '#38BDF8'];

      if (top4.length > 0) {
        document.getElementById('top-tag-name').textContent = top4[0].split(' ')[0];
      } else {
        document.getElementById('top-tag-name').textContent = "None";
      }

      categoryDoughnutChart.data.labels = top4;
      categoryDoughnutChart.data.datasets[0].data = top4.map(c => categoryTotals[c]);
      categoryDoughnutChart.data.datasets[0].backgroundColor = palette.slice(0, top4.length);
      categoryDoughnutChart.update();

      // Render Custom Legend HTML
      const legendBox = document.getElementById('category-legend-box');
      legendBox.innerHTML = '';

      if (top4.length === 0) {
        legendBox.innerHTML = `<span style="font-size:12px; color:var(--text-dim);">No expenses recorded</span>`;
        return;
      }

      top4.forEach((cat, idx) => {
        const amt = categoryTotals[cat];
        const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
        const color = palette[idx % palette.length];

        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
          <div class="legend-item-info">
            <span><span class="legend-color-dot" style="background-color: ${color};"></span> ${cat}</span>
            <span style="color:#fff; font-weight:600;">$${amt.toLocaleString()} <span style="color:var(--text-dim); font-size:10px;">(${pct}%)</span></span>
          </div>
          <div class="legend-bar-track">
            <div class="legend-bar-fill" style="width: ${pct}%; background-color: ${color};"></div>
          </div>
        `;
        legendBox.appendChild(item);
      });
    }

    function openModal() {
      document.getElementById('form-date').value = new Date().toISOString().slice(0, 10);
      updateModalCategories();
      document.getElementById('modal-overlay').classList.add('open');
    }

    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('open');
      document.getElementById('tx-form').reset();
    }

    function updateModalCategories() {
      const type = document.getElementById('form-type').value;
      const select = document.getElementById('form-category');
      select.innerHTML = '';

      const options = type === 'income' 
        ? ['Salary & Retainer', 'Investments', 'Freelance & Advisory', 'Other Inflow']
        : ['Housing & Bills', 'Shopping', 'Travel & Transport', 'Food & Dining', 'Healthcare', 'Entertainment'];

      options.forEach(opt => {
        const el = document.createElement('option');
        el.value = opt;
        el.textContent = opt;
        select.appendChild(el);
      });
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      const name = document.getElementById('form-name').value.trim();
      const type = document.getElementById('form-type').value;
      const rawAmount = parseFloat(document.getElementById('form-amount').value);
      const category = document.getElementById('form-category').value;
      const date = document.getElementById('form-date').value;

      if (!name || isNaN(rawAmount) || !date) return;

      const finalAmount = type === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);

      const newTx = {
        id: Date.now().toString(),
        name,
        category,
        date,
        amount: finalAmount,
        type
      };

      transactions.unshift(newTx);
      saveAndRefresh();
      closeModal();
    }

    // Keyboard Shortcuts (⌘K / Ctrl+K for search)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search').focus();
      }
    });

    // Page Load Initialization
    window.onload = function() {
      initCharts();
      filterTransactions();
      updateMetrics();
    };