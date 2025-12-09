import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const MultiSelectFilter = ({ label, options, selected, onChange }) => (
  <div className="filter-group">
    <label>{label}</label>
    <div className="multi-select">
      {options.map(option => (
        <label key={option} className="checkbox-label">
          <input
            type="checkbox"
            checked={selected.includes(option)}
            onChange={e => {
              const newSelected = e.target.checked
                ? [...selected, option]
                : selected.filter(v => v !== option);
              onChange(newSelected);
            }}
          />
          {option}
        </label>
      ))}
    </div>
  </div>
);

const AgeRangeFilter = ({ filters, onChange }) => (
  <div className="filter-group">
    <label>Age Range</label>
    <div className="range-inputs">
      <input
        type="number"
        placeholder="Min"
        value={filters.ageMin || ''}
        onChange={e => onChange({ ageMin: e.target.value })}
      />
      <input
        type="number"
        placeholder="Max"
        value={filters.ageMax || ''}
        onChange={e => onChange({ ageMax: e.target.value })}
      />
    </div>
  </div>
);

const SortSelect = ({ sort, onChange }) => {
  const options = [
    { field: 'date', label: 'Date (Newest)', order: 'desc' },
    { field: 'quantity', label: 'Quantity (High)', order: 'desc' },
    { field: 'customerName', label: 'Customer A-Z', order: 'asc' },
  ];

  return (
    <select
      onChange={e => {
        const [field, order] = e.target.value.split('|');
        onChange({ field, order });
      }}
      value={`${sort.field}|${sort.order}`}
    >
      {options.map(opt => (
        <option key={`${opt.field}|${opt.order}`} value={`${opt.field}|${opt.order}`}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

const Pagination = ({ page, totalPages, onChange }) => (
  <div className="pagination">
    <button disabled={page === 1} onClick={() => onChange(page - 1)}>Previous</button>
    <span>Page {page} of {totalPages}</span>
    <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
  </div>
);

const SalesDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sales, setSales] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const getQueryState = useCallback(
    () => ({
      search: searchParams.get('search') || '',
      filters: {
        region: searchParams.get('region')?.split(',') || [],
        gender: searchParams.get('gender')?.split(',') || [],
        ageMin: searchParams.get('ageMin') || '',
        ageMax: searchParams.get('ageMax') || '',
        category: searchParams.get('category')?.split(',') || [],
        paymentMethod: searchParams.get('paymentMethod')?.split(',') || [],
      },
      sort: { field: searchParams.get('sort') || 'date', order: searchParams.get('order') || 'desc' },
      page: parseInt(searchParams.get('page')) || 1,
    }),
    [searchParams]
  );

  const fetchSales = useCallback(
    async queryState => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          search: queryState.search || '',
          region: queryState.filters.region.join(','),
          gender: queryState.filters.gender.join(','),
          ageMin: queryState.filters.ageMin,
          ageMax: queryState.filters.ageMax,
          category: queryState.filters.category.join(','),
          paymentMethod: queryState.filters.paymentMethod.join(','),
          sort: queryState.sort.order,
          page: queryState.page.toString(),
          limit: '10',
        });

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sales?${params.toString()}`);

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const result = await response.json();

        setSales(result.data || []);
        setTotalPages(result.totalPages || 1);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSales(getQueryState());
  }, [getQueryState, fetchSales]);

  const updateQuery = useCallback(
    newQueryState => {
      const params = new URLSearchParams();
      if (newQueryState.search) params.set('search', newQueryState.search);
      if (newQueryState.filters.region?.length) params.set('region', newQueryState.filters.region.join(','));
      if (newQueryState.filters.gender?.length) params.set('gender', newQueryState.filters.gender.join(','));
      if (newQueryState.filters.ageMin) params.set('ageMin', newQueryState.filters.ageMin);
      if (newQueryState.filters.ageMax) params.set('ageMax', newQueryState.filters.ageMax);
      if (newQueryState.filters.category?.length) params.set('category', newQueryState.filters.category.join(','));
      if (newQueryState.filters.paymentMethod?.length) params.set('paymentMethod', newQueryState.filters.paymentMethod.join(','));
      params.set('sort', newQueryState.sort.field);
      params.set('order', newQueryState.sort.order);
      params.set('page', newQueryState.page.toString());
      setSearchParams(params);
    },
    [setSearchParams]
  );

  const queryState = getQueryState();

  return (
    <div className="sales-dashboard">
      <h1>Sales Dashboard</h1>

      <div className="search-section">
        <input
          placeholder="Search Customer Name/Phone..."
          value={queryState.search}
          onChange={e => updateQuery({ ...queryState, search: e.target.value, page: 1 })}
          className="search-input"
        />
      </div>

      <div className="filters-section">
        <MultiSelectFilter
          label="Region"
          options={['North', 'South', 'East', 'West']}
          selected={queryState.filters.region}
          onChange={v => updateQuery({ ...queryState, filters: { ...queryState.filters, region: v }, page: 1 })}
        />
      </div>

      <div className="controls-section">
        <SortSelect sort={queryState.sort} onChange={sort => updateQuery({ ...queryState, sort, page: 1 })} />
        <Pagination page={queryState.page} totalPages={totalPages} onChange={page => updateQuery({ ...queryState, page })} />
      </div>

      <div className="sales-table">
        {loading ? (
          <div className="loading">Loading sales data...</div>
        ) : sales.length === 0 ? (
          <div className="no-data">No sales data found</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={sale._id || index}>
                  <td>{new Date(sale['Date']).toLocaleDateString()}</td>
                  <td>{sale['Customer Name']} ({sale['Phone Number']})</td>
                  <td>{sale['Product Name']}</td>
                  <td>{sale['Quantity']}</td>
                  <td>₹{sale['Final Amount']}</td>
                  <td>{sale['Payment Method']}</td>
                  <td>{sale['Order Status']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SalesDashboard;
