import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
// import { supabaseAdmin } from '../lib/supabaseAdmin'; // SECURE: No longer used here
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "./lib/utils";

interface FactsheetVersion {
  id: string;
  year: number;
  month: number;
  commentary: string | null;
}

interface PerformanceStat {
  id?: string;
  series_name: string;
  one_month_return: number | null;
  three_month_return: number | null;
  six_month_return: number | null;
  twelve_month_return: number | null;
  ytd_return: number | null;
  cagr_since_inception: number | null;
  sharpe_ratio: number | null;
  ann_volatility: number | null;
  worst_monthly_return: number | null;
  max_drawdown: number | null;
}

interface Contribution {
  id?: string;
  portfolio_type: 'US Portfolio' | 'EU Portfolio' | 'Managed Futures';
  name: string;
  value: number | null;
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const getBlankStats = (): PerformanceStat[] => {
  const seriesNames = ['Sodefi Fund Lead Series*', 'Reference Index 70/30'];
  return seriesNames.map(name => ({
      series_name: name, one_month_return: null, three_month_return: null, six_month_return: null, twelve_month_return: null, ytd_return: null, cagr_since_inception: null, sharpe_ratio: null, ann_volatility: null, worst_monthly_return: null, max_drawdown: null
  }));
};

const FactsheetAdmin = () => {
  const [factsheets, setFactsheets] = useState<FactsheetVersion[]>([]);
  const [selectedFactsheetId, setSelectedFactsheetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [commentary, setCommentary] = useState('');
  const [performanceStats, setPerformanceStats] = useState<PerformanceStat[]>(getBlankStats);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  // State for the new monthly return form
  const [newSodefiReturn, setNewSodefiReturn] = useState<string>('');
  const [newReferenceReturn, setNewReferenceReturn] = useState<string>('');

  // State for the save confirmation modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // State for contribution names dropdown
  const [availableContributionNames, setAvailableContributionNames] = useState<string[]>([]);

  useEffect(() => {
    fetchFactsheets();
    fetchAvailableContributionNames();
  }, []);

  const fetchAvailableContributionNames = async () => {
    const { data, error } = await supabase
      .from('factsheet_contribution')
      .select('name')
      .order('name');
    
    if (!error && data) {
      const uniqueNames = [...new Set(data.map(item => item.name))].filter(name => name.trim() !== '');
      setAvailableContributionNames(uniqueNames);
    }
  };

  useEffect(() => {
    // Auto-populate 1M return for new factsheets
    if (selectedFactsheetId) return;

    const autoPopulateReturn = async () => {
      // Get the last day of the selected month
      const date = new Date(Date.UTC(year, month - 1, 0));
      const dateString = date.toISOString().split('T')[0];

      // const { data, error } = await supabaseAdmin
      //   .from('monthly_returns')
      //   .select('sodefi_return, reference_return')
      //   .eq('date', dateString)
      //   .single();
      const { data: responseData, error } = await supabase.functions.invoke('get-monthly-return', {
        body: { dateString },
      });
      const data = responseData?.data;
      
      const newStats = [...performanceStats];
      const sodefiIndex = newStats.findIndex(s => s.series_name.startsWith('Sodefi'));
      const refIndex = newStats.findIndex(s => s.series_name.startsWith('Reference'));

      if (sodefiIndex === -1 || refIndex === -1) return; // Should not happen if form is reset correctly

      if (data && !error) {
        if (data.sodefi_return !== null) {
          newStats[sodefiIndex].one_month_return = parseFloat((data.sodefi_return * 100).toFixed(2));
        }
        if (data.reference_return !== null) {
          newStats[refIndex].one_month_return = parseFloat((data.reference_return * 100).toFixed(2));
        }
      } else {
        // Reset if no data found for the new date
        newStats[sodefiIndex].one_month_return = null;
        newStats[refIndex].one_month_return = null;
      }
      setPerformanceStats(newStats);
    };
    
    if (year && month && performanceStats.length > 0) {
      autoPopulateReturn();
    }
  }, [year, month, selectedFactsheetId]);

  useEffect(() => {
    const autoPopulateMonthlyReturnInputs = async () => {
      if (!year || !month) return;

      const date = new Date(Date.UTC(year, month - 1, 0));
      const dateString = date.toISOString().split('T')[0];

      // const { data, error } = await supabaseAdmin
      //   .from('monthly_returns')
      //   .select('sodefi_return, reference_return')
      //   .eq('date', dateString)
      //   .maybeSingle();
      const { data: responseData, error } = await supabase.functions.invoke('get-monthly-return', {
        body: { dateString },
      });
      const data = responseData?.data;
        
      if (data && !error) {
        setNewSodefiReturn(data.sodefi_return !== null ? String(data.sodefi_return * 100) : '');
        setNewReferenceReturn(data.reference_return !== null ? String(data.reference_return * 100) : '');
      } else {
        setNewSodefiReturn('');
        setNewReferenceReturn('');
      }
    };

    autoPopulateMonthlyReturnInputs();
  }, [year, month]);

  useEffect(() => {
    // This effect loads all data for a factsheet whenever the selection changes.
    const loadData = async () => {
      if (selectedFactsheetId) {
        setIsLoading(true);
        setError(null);

        const { data: responseData, error: functionError } = await supabase.functions.invoke('get-factsheet-details', {
          body: { factsheetId: selectedFactsheetId },
        });

        if (functionError) {
          setError('Could not load factsheet data.');
          console.error('Error fetching factsheet details:', functionError);
          setIsLoading(false);
          return;
        }

        const { version, statsData, contribs }: { version: FactsheetVersion; statsData: PerformanceStat[]; contribs: Contribution[] } = responseData;

        setYear(version.year);
        setMonth(version.month);
        setCommentary(version.commentary ? version.commentary.replace(/\\n/g, '\n') : '');

        const seriesNames = ['Sodefi Fund Lead Series*', 'Reference Index 70/30'];
        const processedStats = seriesNames.map(name => {
          const existingStat = statsData.find(s => s.series_name === name);
          return existingStat || {
            series_name: name, one_month_return: null, three_month_return: null, six_month_return: null, twelve_month_return: null, ytd_return: null, cagr_since_inception: null, sharpe_ratio: null, ann_volatility: null, worst_monthly_return: null, max_drawdown: null
          };
        });
        setPerformanceStats(processedStats);
        
        setContributions(contribs || []);
        setIsLoading(false);
      } else {
        clearFormFields();
      }
    };
    loadData();
  }, [selectedFactsheetId]);

  const fetchFactsheets = async () => {
    setIsLoading(true);
    // const { data, error } = await supabaseAdmin
    //   .from('factsheet_versions')
    //   .select('*')
    //   .order('year', { ascending: false })
    //   .order('month', { ascending: false });
    const { data: responseData, error } = await supabase.functions.invoke('get-factsheet-versions');
    const data = responseData?.data; // The actual data is nested in the response

    if (error) {
      setError('Failed to fetch factsheets.');
      console.error(error);
    } else {
      setFactsheets(data || []);
    }
    setIsLoading(false);
  };
  
  const handleStatChange = (index: number, field: keyof PerformanceStat, value: string) => {
    const newStats = [...performanceStats];
    const stat = newStats[index];
    if (field === 'series_name' || field === 'id') {
      return; // Do not allow editing of the series name or id
    }
    
    // All other fields are number | null
    (stat[field] as number | null) = value === '' ? null : parseFloat(value);
    
    setPerformanceStats(newStats);
  };

  const handleContribChange = (index: number, field: keyof Contribution, value: string) => {
    const newContribs = [...contributions];
    const item = newContribs[index];
    if (field === 'value') {
        item.value = value === '' ? null : parseFloat(value);
    } else if (field === 'name') {
        item.name = value;
    } else if (field === 'portfolio_type') {
        item.portfolio_type = value as Contribution['portfolio_type'];
    }
    setContributions(newContribs);
  };

  const SearchableContributionInput = ({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(value);

    // Update searchValue when value prop changes
    React.useEffect(() => {
      setSearchValue(value);
    }, [value]);

    const handleSelect = (selectedValue: string) => {
      onChange(selectedValue);
      setSearchValue(selectedValue);
      setOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setSearchValue(inputValue);
      // Don't call onChange on every keystroke - only when selecting or on Enter
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && searchValue.trim() !== '') {
        // Add new contribution name if it doesn't exist
        if (!availableContributionNames.includes(searchValue.trim())) {
          setAvailableContributionNames(prev => [...prev, searchValue.trim()].sort());
        }
        onChange(searchValue.trim());
        setOpen(false);
      }
    };

    const filteredNames = availableContributionNames.filter(name => 
      name.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <div className="relative">
        <Input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full"
        />
        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredNames.length > 0 ? (
              filteredNames.map((name) => (
                <div
                  key={name}
                  onClick={() => handleSelect(name)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                >
                  {value === name && <Check className="inline mr-2 h-4 w-4" />}
                  {name}
                </div>
              ))
            ) : searchValue.trim() !== '' ? (
              <div className="px-4 py-2 text-gray-500 text-sm">
                Press Enter to add "{searchValue}"
              </div>
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                No options found
              </div>
            )}
          </div>
        )}
        {open && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
        )}
      </div>
    );
  };

  const addContribRow = (portfolioType: 'US Portfolio' | 'EU Portfolio' | 'Managed Futures') => {
    // Explicitly create new contribution without id field
    const newContribution: Contribution = { 
      portfolio_type: portfolioType, 
      name: '', 
      value: null 
    };
    setContributions([...contributions, newContribution]);
  };

  const removeContribRow = (index: number) => {
    setContributions(contributions.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedFactsheetId(null);
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth() + 1);
    setCommentary('');
    setPerformanceStats(getBlankStats());
    setContributions([]);
  };

  const handleSave = async () => {
    setIsLoading(true);

    // Prepare the data payload for the edge function
    const factsheet = {
      id: selectedFactsheetId,
      year,
      month,
      commentary: commentary.replace(/\n/g, '\\n'),
    };

    const date = new Date(Date.UTC(year, month - 1, 0));
    const dateString = date.toISOString().split('T')[0];
    const monthlyReturn = {
      date: dateString,
      sodefi_return: newSodefiReturn !== '' ? parseFloat(newSodefiReturn) / 100 : null,
      reference_return: newReferenceReturn !== '' ? parseFloat(newReferenceReturn) / 100 : null,
    };

    // Clean contributions data - remove undefined id fields and empty entries
    const cleanedContributions = contributions
      .filter(c => c.name && c.name.trim() !== '') // Only include contributions with names
      .map(({ id, ...rest }) => {
        // Only include id if it exists and is not undefined
        return id ? { id, ...rest } : rest;
      });

    console.log('Sending contributions to API:', cleanedContributions);

    const { data: responseData, error } = await supabase.functions.invoke('save-factsheet', {
      body: {
        factsheet,
        performanceStats,
        contributions: cleanedContributions,
        monthlyReturn,
      },
    });

    if (error) {
      setError('Failed to save factsheet.');
      console.error('Error saving factsheet:', error);
    } else {
      const newFactsheetId = responseData.factsheetId;
      await fetchFactsheets(); // Refresh the list
      setSelectedFactsheetId(newFactsheetId); // Select the newly saved/created factsheet
    }

    setIsLoading(false);
  };

  const handleConfirmSave = () => {
    if (passwordInput === '123') { // WARNING: Replace with secure authentication
      alert('Incorrect password. Save operation cancelled.');
      setPasswordInput('');
      setIsSaveModalOpen(false);
      return;
    }
    
    setPasswordInput('');
    setIsSaveModalOpen(false);
    handleSave();
  };

  const handleDelete = async () => {
    if (!selectedFactsheetId) {
      alert('No factsheet selected to delete.');
      return;
    }
    setIsLoading(true);

    const { error } = await supabase.functions.invoke('delete-factsheet', {
      body: { factsheetId: selectedFactsheetId },
    });

    if (error) {
      setError(`Failed to delete factsheet: ${error.message}`);
    } else {
      await fetchFactsheets();
      resetForm();
      alert('Factsheet deleted successfully.');
    }
    
    setIsLoading(false);
  };

  const handleConfirmDelete = () => {
    if (passwordInput === '123') { // WARNING: Replace with secure authentication
      alert('Incorrect password. Delete operation cancelled.');
      setPasswordInput('');
      setIsDeleteModalOpen(false);
      return;
    }
    
    setPasswordInput('');
    setIsDeleteModalOpen(false);
    handleDelete();
  };

  const clearFormFields = () => {
    setCommentary('');
    setPerformanceStats(getBlankStats());
    setContributions([]);
  };

  const handleDateChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    const targetFactsheet = factsheets.find(fs => fs.year === newYear && fs.month === newMonth);
    setSelectedFactsheetId(targetFactsheet ? targetFactsheet.id : null);
    if (!targetFactsheet) {
      clearFormFields();
    }
  };

  const handleNewFactsheetClick = () => {
    setSelectedFactsheetId(null);
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth() + 1);
    clearFormFields();
  };

  const handleFactsheetSelect = (factsheetId: string | null) => {
    setSelectedFactsheetId(factsheetId);
  };

  const groupedFactsheets = factsheets.reduce((acc, fs) => {
    const year = fs.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(fs);
    return acc;
  }, {} as Record<number, FactsheetVersion[]>);

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Factsheet Admin Panel</h1>
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-2">Factsheets</h2>
            <button onClick={handleNewFactsheetClick} className="w-full bg-green-500 text-white p-2 rounded mb-4 hover:bg-green-600">
              + New Factsheet
            </button>
            <div className="max-h-96 overflow-y-auto border rounded">
              {isLoading && <p>Loading...</p>}
              <ul>
                {Object.keys(groupedFactsheets).sort((a, b) => Number(b) - Number(a)).map(year => (
                  <li key={year}>
                    <h3 className="font-bold p-2 bg-gray-100">{year}</h3>
                    <ul>
                      {[...groupedFactsheets[Number(year)]].sort((a, b) => a.month - b.month).map(fs => (
                        <li
                          key={fs.id}
                          onClick={() => handleFactsheetSelect(fs.id)}
                          className={`p-2 pl-4 cursor-pointer hover:bg-gray-200 ${selectedFactsheetId === fs.id ? 'bg-blue-200' : ''}`}
                        >
                          {monthNames[fs.month - 1]}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>
        <div className="col-span-8">
          <h2 className="text-xl font-bold mb-2">{selectedFactsheetId ? 'Edit Factsheet' : 'Create New Factsheet'}</h2>
          <form onSubmit={(e) => { e.preventDefault(); setIsSaveModalOpen(true); }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Year" value={year} onChange={e => handleDateChange(Number(e.target.value), month)} className="p-2 border rounded" required />
                <select value={month} onChange={e => handleDateChange(year, Number(e.target.value))} className="p-2 border rounded" required>
                  {monthNames.map((name, index) => (
                    <option key={name} value={index + 1}>{name}</option>
                  ))}
                </select>
            </div>
            <div className="p-4 border rounded bg-gray-50 space-y-4">
                <h3 className="font-bold mb-2 text-lg">Monthly Return</h3>
                <p className="text-sm text-gray-600 -mt-2 mb-2">This return data is for the month selected above. It will be saved with the factsheet and is used by the line chart.</p>
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="any" placeholder="Sodefi Return %" value={newSodefiReturn} onChange={e => setNewSodefiReturn(e.target.value)} className="p-2 border rounded"/>
                    <input type="number" step="any" placeholder="Reference Return %" value={newReferenceReturn} onChange={e => setNewReferenceReturn(e.target.value)} className="p-2 border rounded"/>
                </div>
            </div>
            <textarea placeholder="Commentary" value={commentary} onChange={e => setCommentary(e.target.value)} className="w-full p-2 border rounded" rows={8}></textarea>
            
            <div className="p-4 border rounded bg-gray-50 space-y-4">
                <h3 className="font-bold mb-2 text-lg">Performance Stats</h3>
                {performanceStats.map((stat, index) => (
                    <div key={index} className="p-4 border rounded bg-white">
                        <h4 className="font-bold mb-4">{stat.series_name}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <input type="number" step="any" placeholder="1M Return" value={stat.one_month_return ?? ''} onChange={e => handleStatChange(index, 'one_month_return', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="3M Return" value={stat.three_month_return ?? ''} onChange={e => handleStatChange(index, 'three_month_return', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="6M Return" value={stat.six_month_return ?? ''} onChange={e => handleStatChange(index, 'six_month_return', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="12M Return" value={stat.twelve_month_return ?? ''} onChange={e => handleStatChange(index, 'twelve_month_return', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="YTD Return" value={stat.ytd_return ?? ''} onChange={e => handleStatChange(index, 'ytd_return', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="CAGR" value={stat.cagr_since_inception ?? ''} onChange={e => handleStatChange(index, 'cagr_since_inception', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="Sharpe Ratio" value={stat.sharpe_ratio ?? ''} onChange={e => handleStatChange(index, 'sharpe_ratio', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="Ann. Volatility" value={stat.ann_volatility ?? ''} onChange={e => handleStatChange(index, 'ann_volatility', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="Worst Month" value={stat.worst_monthly_return ?? ''} onChange={e => handleStatChange(index, 'worst_monthly_return', e.target.value)} className="p-2 border rounded" />
                            <input type="number" step="any" placeholder="Max Drawdown" value={stat.max_drawdown ?? ''} onChange={e => handleStatChange(index, 'max_drawdown', e.target.value)} className="p-2 border rounded" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border rounded bg-gray-50 space-y-6">
                <h3 className="font-bold mb-4 text-lg">Contributions</h3>
                
                {/* US Portfolio Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">US Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {contributions.filter(item => item.portfolio_type === 'US Portfolio').map((item, index) => {
                            const originalIndex = contributions.findIndex(c => c === item);
                            return (
                                <div key={originalIndex} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6">
                                        <SearchableContributionInput
                                            value={item.name}
                                            onChange={(value) => handleContribChange(originalIndex, 'name', value)}
                                            placeholder="Select or add contribution name"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input 
                                            type="number" 
                                            step="any" 
                                            placeholder="Value" 
                                            value={item.value ?? ''} 
                                            onChange={e => handleContribChange(originalIndex, 'value', e.target.value)} 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <button 
                                            type="button" 
                                            onClick={() => removeContribRow(originalIndex)} 
                                            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <button 
                            type="button" 
                            onClick={() => addContribRow('US Portfolio')} 
                            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                        >
                            + Add US Portfolio Contribution
                        </button>
                    </CardContent>
                </Card>

                {/* EU Portfolio Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">EU Portfolio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {contributions.filter(item => item.portfolio_type === 'EU Portfolio').map((item, index) => {
                            const originalIndex = contributions.findIndex(c => c === item);
                            return (
                                <div key={originalIndex} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6">
                                        <SearchableContributionInput
                                            value={item.name}
                                            onChange={(value) => handleContribChange(originalIndex, 'name', value)}
                                            placeholder="Select or add contribution name"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input 
                                            type="number" 
                                            step="any" 
                                            placeholder="Value" 
                                            value={item.value ?? ''} 
                                            onChange={e => handleContribChange(originalIndex, 'value', e.target.value)} 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <button 
                                            type="button" 
                                            onClick={() => removeContribRow(originalIndex)} 
                                            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <button 
                            type="button" 
                            onClick={() => addContribRow('EU Portfolio')} 
                            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                        >
                            + Add EU Portfolio Contribution
                        </button>
                    </CardContent>
                </Card>

                {/* Managed Futures Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Managed Futures</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {contributions.filter(item => item.portfolio_type === 'Managed Futures').map((item, index) => {
                            const originalIndex = contributions.findIndex(c => c === item);
                            return (
                                <div key={originalIndex} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-6">
                                        <SearchableContributionInput
                                            value={item.name}
                                            onChange={(value) => handleContribChange(originalIndex, 'name', value)}
                                            placeholder="Select or add contribution name"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input 
                                            type="number" 
                                            step="any" 
                                            placeholder="Value" 
                                            value={item.value ?? ''} 
                                            onChange={e => handleContribChange(originalIndex, 'value', e.target.value)} 
                                            className="w-full p-2 border rounded" 
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <button 
                                            type="button" 
                                            onClick={() => removeContribRow(originalIndex)} 
                                            className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <button 
                            type="button" 
                            onClick={() => addContribRow('Managed Futures')} 
                            className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600"
                        >
                            + Add Managed Futures Contribution
                        </button>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end gap-4">
              {selectedFactsheetId && (
                <Button type="button" onClick={() => setIsDeleteModalOpen(true)} variant="destructive">Delete</Button>
              )}
              <Button type="submit" disabled={isLoading} className="border border-gray-400">
                {isLoading ? 'Saving...' : 'Save Factsheet'}
              </Button>
            </div>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>

      <Dialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <DialogContent className="solid-background">
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
            <DialogDescription>
              Please enter the password to save the changes to the factsheet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmSave()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmSave}>Confirm Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="solid-background">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Please enter the password to delete the factsheet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmDelete()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} variant="destructive">Confirm Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FactsheetAdmin; 