import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';

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

const FactsheetAdmin = () => {
  const [factsheets, setFactsheets] = useState<FactsheetVersion[]>([]);
  const [selectedFactsheetId, setSelectedFactsheetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [commentary, setCommentary] = useState('');
  const [performanceStats, setPerformanceStats] = useState<PerformanceStat[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);

  // State for the new monthly return form
  const [newSodefiReturn, setNewSodefiReturn] = useState<string>('');
  const [newReferenceReturn, setNewReferenceReturn] = useState<string>('');

  // State for the save confirmation modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    fetchFactsheets();
  }, []);

  useEffect(() => {
    // Auto-populate 1M return for new factsheets
    if (selectedFactsheetId) return;

    const autoPopulateReturn = async () => {
      // Get the last day of the selected month
      const date = new Date(Date.UTC(year, month, 0));
      const dateString = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('monthly_returns')
        .select('sodefi_return, reference_return')
        .eq('date', dateString)
        .single();
      
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

      const date = new Date(Date.UTC(year, month, 0));
      const dateString = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('monthly_returns')
        .select('sodefi_return, reference_return')
        .eq('date', dateString)
        .maybeSingle();
        
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
        const { data: version, error: versionError } = await supabase.from('factsheet_versions').select('*').eq('id', selectedFactsheetId).single();
        
        if (versionError) {
          setError('Could not load factsheet data.');
          setIsLoading(false);
          return;
        }

        setYear(version.year);
        setMonth(version.month);
        setCommentary(version.commentary || '');

        const { data: statsData } = await supabase.from('factsheet_performance_stats').select('*').eq('factsheet_id', selectedFactsheetId);
        const stats = statsData || [];
        const seriesNames = ['Sodefi Fund Lead Series*', 'Reference Index 70/30'];

        const processedStats = seriesNames.map(name => {
          const existingStat = stats.find(s => s.series_name === name);
          return existingStat || {
            series_name: name, one_month_return: null, three_month_return: null, six_month_return: null, twelve_month_return: null, ytd_return: null, cagr_since_inception: null, sharpe_ratio: null, ann_volatility: null, worst_monthly_return: null, max_drawdown: null
          };
        });
        setPerformanceStats(processedStats);
        
        const { data: contribs } = await supabase.from('factsheet_contribution').select('*').eq('factsheet_id', selectedFactsheetId);
        setContributions(contribs || []);
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedFactsheetId]);

  useEffect(() => {
    // This effect syncs the date dropdowns with the selected factsheet.
    if (isLoading || factsheets.length === 0) return;

    const targetFactsheet = factsheets.find(fs => fs.year === year && fs.month === month);
    const targetId = targetFactsheet ? targetFactsheet.id : null;
    
    if (targetId !== selectedFactsheetId) {
        setSelectedFactsheetId(targetId);
    }
  }, [year, month, factsheets, isLoading, selectedFactsheetId]);

  const fetchFactsheets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('factsheet_versions')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

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
    if (field === 'series_name') {
      return; // Do not allow editing of the series name
    } else {
      stat[field] = value === '' ? null : parseFloat(value);
    }
    setPerformanceStats(newStats);
  };

  const handleContribChange = (index: number, field: keyof Contribution, value: string) => {
    const newContribs = [...contributions];
    const item = newContribs[index];
    if (field === 'name' || field === 'portfolio_type') {
        item[field] = value as any; // Cast because TS can't infer the union type here easily
    } else {
        item[field] = value === '' ? null : parseFloat(value);
    }
    setContributions(newContribs);
  };

  const addContribRow = () => {
    setContributions([...contributions, { portfolio_type: 'US Portfolio', name: '', value: null }]);
  };

  const removeContribRow = (index: number) => {
    setContributions(contributions.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedFactsheetId(null);
    setYear(new Date().getFullYear());
    setMonth(new Date().getMonth() + 1);
    setCommentary('');
    setPerformanceStats([
      { series_name: 'Sodefi Fund Lead Series*', one_month_return: null, three_month_return: null, six_month_return: null, twelve_month_return: null, ytd_return: null, cagr_since_inception: null, sharpe_ratio: null, ann_volatility: null, worst_monthly_return: null, max_drawdown: null },
      { series_name: 'Reference Index 70/30', one_month_return: null, three_month_return: null, six_month_return: null, twelve_month_return: null, ytd_return: null, cagr_since_inception: null, sharpe_ratio: null, ann_volatility: null, worst_monthly_return: null, max_drawdown: null },
    ]);
    setContributions([]);
  };

  const handleSave = async () => {
    setIsLoading(true);

    let factsheetId = selectedFactsheetId;

    // Upsert version
    const { data: version, error: versionError } = await supabase
      .from('factsheet_versions')
      .upsert({ id: selectedFactsheetId || undefined, year, month, commentary })
      .select()
      .single();

    if (versionError || !version) {
      setError('Failed to save factsheet version.');
      setIsLoading(false);
      return;
    }
    factsheetId = version.id;

    await Promise.all([
      supabase.from('factsheet_performance_stats').delete().eq('factsheet_id', factsheetId),
      supabase.from('factsheet_contribution').delete().eq('factsheet_id', factsheetId),
    ]);
    
    const upsertPromises = [
      supabase.from('factsheet_performance_stats').upsert(performanceStats.map(s => ({...s, id: undefined, factsheet_id: factsheetId}))),
      supabase.from('factsheet_contribution').upsert(contributions.map(c => ({...c, id: undefined, factsheet_id: factsheetId}))),
    ];

    if (newSodefiReturn !== '' && newReferenceReturn !== '') {
      const dateString = new Date(Date.UTC(year, month, 0)).toISOString().split('T')[0];
      const sodefi_return = parseFloat(newSodefiReturn) / 100;
      const reference_return = parseFloat(newReferenceReturn) / 100;
      upsertPromises.push(
        supabase.from('monthly_returns').upsert({ date: dateString, sodefi_return, reference_return }, { onConflict: 'date' })
      );
    }

    await Promise.all(upsertPromises);
    
    setIsLoading(false);
    fetchFactsheets();
    alert('Factsheet saved successfully!');
  };

  const handleConfirmSave = () => {
    if (passwordInput !== 'S@defi') {
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
    if (!selectedFactsheetId) return;
    if (!window.confirm('Are you sure you want to delete this factsheet? This action cannot be undone.')) return;
    
    setIsLoading(true);
    const { error } = await supabase.from('factsheet_versions').delete().eq('id', selectedFactsheetId);
    if (error) {
        setError('Failed to delete factsheet.');
    } else {
        alert('Factsheet deleted.');
        resetForm();
        fetchFactsheets();
    }
    setIsLoading(false);
  };

  const clearFormFields = () => {
    setCommentary('');
    const seriesNames = ['Sodefi Fund Lead Series*', 'Reference Index 70/30'];
    const blankStats = seriesNames.map(name => ({
        series_name: name, one_month_return: null, three_month_return: null, six_month_return: null, twelve_month_return: null, ytd_return: null, cagr_since_inception: null, sharpe_ratio: null, ann_volatility: null, worst_monthly_return: null, max_drawdown: null
    }));
    setPerformanceStats(blankStats);
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
                {factsheets.map(fs => (
                  <li
                    key={fs.id}
                    onClick={() => setSelectedFactsheetId(fs.id)}
                    className={`p-2 cursor-pointer hover:bg-gray-200 ${selectedFactsheetId === fs.id ? 'bg-blue-200' : ''}`}
                  >
                    {fs.year} - {monthNames[fs.month - 1]}
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

            <div className="p-4 border rounded bg-gray-50 space-y-4">
                <h3 className="font-bold mb-2 text-lg">Contributions</h3>
                {contributions.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                            <select value={item.portfolio_type} onChange={e => handleContribChange(index, 'portfolio_type', e.target.value)} className="w-full p-2 border rounded">
                                <option value="US Portfolio">US Portfolio</option>
                                <option value="EU Portfolio">EU Portfolio</option>
                                <option value="Managed Futures">Managed Futures</option>
                            </select>
                        </div>
                        <div className="col-span-4">
                            <input type="text" placeholder="Name" value={item.name} onChange={e => handleContribChange(index, 'name', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                        <div className="col-span-2">
                            <input type="number" step="any" placeholder="Value" value={item.value ?? ''} onChange={e => handleContribChange(index, 'value', e.target.value)} className="p-2 border rounded" />
                        </div>
                        <div className="col-span-2">
                            <button type="button" onClick={() => removeContribRow(index)} className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600">Remove</button>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addContribRow} className="w-full bg-gray-200 p-2 rounded hover:bg-gray-300">+ Add Contribution Row</button>
            </div>

            <div className="flex justify-end gap-4">
              {selectedFactsheetId && (
                <Button type="button" onClick={handleDelete} variant="destructive">Delete</Button>
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
    </div>
  );
};

export default FactsheetAdmin; 