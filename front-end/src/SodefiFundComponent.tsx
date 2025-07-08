import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ContributionChart from './components/ContributionChart';
import { supabase } from './lib/supabase'; // Corrected import path
import { calculateCumulativePerformance, PerformanceDataPoint } from './components/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";

// --- Type Definitions for our data ---
interface PerformanceStat {
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

interface PerformanceHistory {
  point_date: string;
  sodefi_value: number | null;
  reference_value: number | null;
  date?: string; // from remap
}

interface Contribution {
  portfolio_type: string;
  name: string;
  value: number | null;
  fill: string;
}

interface FactsheetData {
  commentary: string | null;
  performanceStats: PerformanceStat[];
  performanceHistory: PerformanceDataPoint[];
  contributions: Contribution[];
}

interface AvailableFactsheet {
  year: number;
  month: number;
}

const SodefiFundComponent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableFactsheets, setAvailableFactsheets] = useState<AvailableFactsheet[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [factsheetData, setFactsheetData] = useState<FactsheetData | null>(null);

  useEffect(() => {
    const fetchAvailableFactsheets = async () => {
      const { data, error } = await supabase
        .from('factsheet_versions')
        .select('year, month')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) {
        setError('Failed to fetch available factsheets.');
        console.error('Error fetching available factsheets:', error);
      } else if (data && data.length > 0) {
        setAvailableFactsheets(data);
        // Set the most recent factsheet as the default
        setSelectedYear(data[0].year);
        setSelectedMonth(data[0].month);
      } else {
        setError('No factsheets available.');
      }
      // Keep loading until the full factsheet is loaded
    };

    fetchAvailableFactsheets();
  }, []);

  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;

    const fetchFactsheetData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Get the factsheet version ID
        const { data: versionData, error: versionError } = await supabase
          .from('factsheet_versions')
          .select('id, commentary')
          .eq('year', selectedYear)
          .eq('month', selectedMonth)
          .single();

        if (versionError || !versionData) {
          throw new Error(`Factsheet for ${selectedMonth}/${selectedYear} not found.`);
        }

        const factsheetId = versionData.id;
        const endDateString = new Date(Date.UTC(selectedYear, selectedMonth, 1, 0, 0, 0, -1)).toISOString().split('T')[0];

        // 2. Fetch all related data in parallel
        const [
          { data: performanceStats, error: statsError },
          { data: contributions, error: contributionError },
          { data: monthlyReturns, error: returnsError }
        ] = await Promise.all([
          supabase.from('factsheet_performance_stats').select('*').eq('factsheet_id', factsheetId),
          supabase.from('factsheet_contribution').select('*').eq('factsheet_id', factsheetId),
          supabase.from('monthly_returns').select('*').lte('date', endDateString).order('date', { ascending: true })
        ]);

        if (statsError || contributionError || returnsError) {
          console.error({ statsError, contributionError, returnsError });
          throw new Error('Failed to fetch factsheet details.');
        }
        
        const formattedContributions = contributions?.map((c: { name: string; value: number | null; portfolio_type: string}) => ({
          name: c.name,
          value: c.value,
          fill: c.value && c.value > 0 ? '#22c55e' : '#ef4444',
          portfolio_type: c.portfolio_type,
        })) || [];

        const calculatedPerformanceHistory = calculateCumulativePerformance(monthlyReturns || []);

        setFactsheetData({
          commentary: versionData.commentary,
          performanceStats: performanceStats || [],
          performanceHistory: calculatedPerformanceHistory,
          contributions: formattedContributions,
        });

      } catch (e: any) {
        setError(e.message);
        setFactsheetData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFactsheetData();
  }, [selectedYear, selectedMonth]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const factsheetDate = selectedYear && selectedMonth ? `${monthNames[selectedMonth - 1]} ${selectedYear}` : '';
  
  const commentaryEndDate = selectedYear && selectedMonth 
    ? new Date(selectedYear, selectedMonth, 0)
    : null;
    
  const formattedCommentaryEndDate = commentaryEndDate 
    ? `${monthNames[commentaryEndDate.getMonth()]} ${commentaryEndDate.getDate()}, ${commentaryEndDate.getFullYear()}`
    : '';

  const sodefiStats = factsheetData?.performanceStats.find(s => s.series_name.startsWith('Sodefi'));
  const referenceStats = factsheetData?.performanceStats.find(s => s.series_name.startsWith('Reference'));
  
  const performanceData = factsheetData?.performanceHistory.map(h => ({
    date: h.point_date,
    sodefi: h.sodefi_value,
    reference: h.reference_value
  })) || [];
  
  const firstYear = performanceData.length > 0 
    ? parseInt((performanceData[0].date as string).split(' ')[1], 10) 
    : new Date().getFullYear();
  
  const contributionFilter = (data: Contribution[] | undefined) => {
      if (!data) return [];
      return data.filter(c => c.value !== null).map(c => ({...c, value: c.value as number}));
  };

  const usPortfolioData = contributionFilter(factsheetData?.contributions.filter(c => c.portfolio_type === 'US Portfolio'));
  const euPortfolioData = contributionFilter(factsheetData?.contributions.filter(c => c.portfolio_type === 'EU Portfolio'));
  const managedFuturesData = contributionFilter(factsheetData?.contributions.filter(c => c.portfolio_type === 'Managed Futures'));

  const commentaryParagraphs = factsheetData?.commentary
    ? factsheetData.commentary.replace(/\\n/g, '\n').split('\n\n')
    : [];

  const PageHeader = () => (
    <div className="bg-white px-2 py-1">
      <header className="flex justify-between items-center">
        <div>
          <img src="/SodefiFundLogo.png" alt="Sodefi Fund Logo" className="w-64" />
        </div>
        <div className="text-right">
          <div className="text-lg font-normal text-amber-700 mb-[0.125rem]">Sodefi Fund: EUR Class</div>
          <div className="text-base text-gray-600 italic">{factsheetDate}</div>
        </div>
      </header>
    </div>
  );

  const PageFooter = () => (
    <div className="mt-auto pt-0">
      <div className="px-0">
        <img 
          src="/banner.jpg" 
          alt="Sodefi Banner" 
          className="w-full h-auto"
        />
      </div>
      <div className="px-3 py-[0.375rem] mt-0 bg-amber-800 text-white text-center">
        <p className="my-[0.125rem] text-xs">Sodefi Management BV - www.sodefi.nl - gerardrum@sodefi.nl</p>
        <p className="my-[0.125rem] text-xs">Amsterdamseweg 206 - 1182 HL Amstelveen - The Netherlands</p>
      </div>
    </div>
  );

  const generatePdf = async () => {
    setIsGenerating(true);

    const pdf = new jsPDF('p', 'mm', 'a4', true);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const processPage = async (elementId: string, isFirstPage = false) => {
      const element = document.getElementById(elementId);
      if (!element) {
        console.error(`Element with id ${elementId} not found.`);
        return;
      }

      if (!isFirstPage) {
        pdf.addPage();
      }
      
      const canvas = await html2canvas(element, { 
        scale: 4, 
        useCORS: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        onclone: (document) => {
          const button = document.getElementById('pdf-button-container');
          if (button) {
            button.style.visibility = 'hidden';
          }
          const clonedElement = document.getElementById(elementId);
          if (clonedElement) {
            clonedElement.style.margin = '0';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    };

    try {
      await processPage('page1', true);
      await processPage('page2');
      await processPage('page3');

      pdf.save('sodefi-factsheet.pdf');
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <style>{`
        /* A4 paper dimensions at 96 DPI: 794x1123px. */
        #pdf-container {
          width: 794px;
          margin: 0 auto; /* Center the container */
        }
        #page1, #page2, #page3 {
          width: 794px;
          height: 1123px;
          overflow: hidden; /* Hide content that overflows the page */
          display: flex; /* Ensure flex behavior is maintained */
          flex-direction: column; /* Ensure flex direction is maintained */
        }

        /* Add space between pages for on-screen view only */
        #page1, #page2 {
          margin-bottom: 1rem;
        }
      `}</style>
      <div id="factsheet-container" className="font-sans px-8 py-4 bg-gray-200">
        <div id="pdf-button-container" className="text-center mb-2">
          <div className="flex justify-center items-center gap-4 mb-2">
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              disabled={isLoading || availableFactsheets.length === 0}
              className="p-1 border rounded"
            >
              {[...new Set(availableFactsheets.map(f => f.year))].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select
              value={selectedMonth || ''}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              disabled={isLoading || availableFactsheets.length === 0}
              className="p-1 border rounded"
            >
              {availableFactsheets.filter(f => f.year === selectedYear).map(f => (
                <option key={f.month} value={f.month}>{monthNames[f.month - 1]}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={generatePdf}
            disabled={isGenerating || isLoading || !!error}
            className="bg-blue-600 text-white font-bold py-1 px-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating PDF...' : (isLoading ? 'Loading Data...' : 'Download as PDF')}
          </button>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </div>

        {isLoading ? (
          <div className="text-center p-10">Loading factsheet...</div>
        ) : factsheetData ? (
          <div id="pdf-container" className="border border-gray-300 shadow-lg">
            <div id="page1" className="flex flex-col bg-brand-background text-brand-text">
              <PageHeader />
              <div className="px-4 py-2 flex-grow">
                {/* Factsheet Content */}
                <div className="px-2 py-1 mb-1">
                  <p className="text-sm leading-relaxed text-left">
                    <strong>The Sodefi Fund is an absolute return fund that invests primarily in quality European and US stocks together with a 30% allocation to a Trend Following futures strategy. Domiciled in the Netherlands, the fund's objective is to generate above average returns and focuses on mitigation of large drawdowns.</strong>
                  </p>
                </div>
                
                <hr className="border-t-1 border-brand-text my-2" />
                
                <div className="flex justify-start gap-4 mb-2">
                  {/* --- Combined Table --- */}
                  <div className="w-full">
                    <table className="w-full text-[9pt] border-2 border-brand-text border-collapse table-fixed">
                      <thead className="font-bold border-b-2 border-brand-text">
                        <tr>
                          <th className="w-[11%] px-1 py-2 text-red-700 border-r-2 border-brand-text text-center align-middle">Performance</th>
                          <th className="w-[8%] px-0.5 py-0 border-r-2 border-brand-text text-center align-middle">1M</th>
                          <th className="w-[8%] px-0.5 py-0 border-r-2 border-brand-text text-center align-middle">3M</th>
                          <th className="w-[8%] px-0.5 py-0 border-r-2 border-brand-text text-center align-middle">6M</th>
                          <th className="w-[9%] px-0.5 py-0 border-r-2 border-brand-text text-center align-middle">12M</th>
                          <th className="w-[9%] px-0.5 py-0 border-r-2 border-brand-text text-center align-middle">YTD</th>
                          <th className="w-[10%] px-0.5 py-2 border-r-2 border-brand-text text-[7pt] text-center align-middle"><div>CAGR<br />since<br />Inception**</div></th>
                          <th className="w-[10%] px-0.5 py-2 border-r-2 border-brand-text text-[7pt] text-center align-middle"><div>Ann.<br />volatility-<br />36 Month</div></th>
                          <th className="w-[10%] px-0.5 py-2 border-r-2 border-brand-text text-[7pt] text-center align-middle"><div>Worst<br />Monthly<br />Return</div></th>
                          <th className="w-[10%] px-0.5 py-2 border-r-2 border-brand-text text-[7pt] text-center align-middle"><div>Max<br />Drawdown</div></th>
                          <th className="w-[9%] px-0.5 py-2 text-[7pt] text-center align-middle"><div>Sharpe<br />Ratio</div></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b-2 border-brand-text">
                          <td className="px-1 py-2 font-bold border-r-2 border-brand-text text-[7pt] text-center align-middle"><div>Sodefi Fund<br />Lead Series*</div></td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.one_month_return != null ? `${sodefiStats.one_month_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.three_month_return != null ? `${sodefiStats.three_month_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.six_month_return != null ? `${sodefiStats.six_month_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.twelve_month_return != null ? `${sodefiStats.twelve_month_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.ytd_return != null ? `${sodefiStats.ytd_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.cagr_since_inception != null ? `${sodefiStats.cagr_since_inception}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.ann_volatility != null ? `${sodefiStats.ann_volatility}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.worst_monthly_return != null ? `${sodefiStats.worst_monthly_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{sodefiStats?.max_drawdown != null ? `${sodefiStats.max_drawdown}%` : ''}</td>
                          <td className="px-0.5 py-1.5 text-center align-middle">{sodefiStats?.sharpe_ratio}</td>
                        </tr>
                        <tr>
                          <td className="px-1 py-2 font-bold border-r-2 border-brand-text text-[7pt] text-center align-middle"><div>Reference<br />Index 70/30</div></td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.one_month_return != null ? `${referenceStats.one_month_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.three_month_return != null ? `${referenceStats.three_month_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.six_month_return != null ? `${referenceStats.six_month_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.twelve_month_return != null ? `${referenceStats.twelve_month_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.ytd_return != null ? `${referenceStats.ytd_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.cagr_since_inception != null ? `${referenceStats.cagr_since_inception}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.ann_volatility != null ? `${referenceStats.ann_volatility}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.worst_monthly_return != null ? `${referenceStats.worst_monthly_return}%` : ''}</td>
                          <td className="px-0.5 py-1.5 border-r-2 border-brand-text text-center align-middle">{referenceStats?.max_drawdown != null ? `${referenceStats.max_drawdown}%` : ''}</td>
                          <td className="px-0.5 py-1.5 text-center align-middle">{referenceStats?.sharpe_ratio}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="my-1 text-[10px] text-left">
                  <p className="my-[0.125rem]">* Past performance is not a guarantee of future return.</p>
                  <p className="my-[0.125rem]">** Performance of Lead Series from 1st of November 2022, historic track record of founding investor from April 2011 to October 2022.</p>
                </div>

                <div className="my-2">
                  <div className="flex gap-4">
                    <div className="w-1/2 flex flex-col">
                      <h2 className="text-2xl font-bold mb-1 text-left">Performance</h2>
                      <div className="border-2 border-gray-400 bg-white">
                        {/* Legend Above Chart */}
                        <div 
                          className="p-1 text-center"
                          style={{ fontSize: '7.5pt' }}
                        >
                          <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                              <div style={{ width: '20px', height: '2px', backgroundColor: '#dc2626' }} />
                              <span className="font-medium">SODEFI</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div style={{ width: '20px', height: '2px', backgroundColor: '#2563eb' }} />
                              <span className="font-medium text-center">70/30<br />Reference Index</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-2 py-1 relative">
                          <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -30, bottom: 0 }}>
                              <XAxis 
                                dataKey="date" 
                                tickLine={false}
                                tick={(props) => {
                                    const { x, y, payload, index } = props;
                                    const dateStr = payload.value as string;
                                    
                                    const parts = dateStr?.split(' ');
                                    if (!parts || parts.length < 2) return <g />;

                                    const [month, yearStr] = parts;
                                    const currentYear = parseInt(yearStr, 10);

                                    let showTick = false;

                                    if (index === 0) {
                                      showTick = true;
                                    } else if (month === 'Jan') {
                                      if ((currentYear - firstYear) % 2 === 0 || currentYear === 2025) {
                                          showTick = true;
                                      }
                                    }

                                    if (showTick) {
                                      return (
                                          <g transform={`translate(${x},${y})`}>
                                              <line y2={4} stroke="#6b7280" strokeWidth={1} />
                                              <text x={0} y={0} dy={16} textAnchor="middle" fill="#374151" fontSize="7.5pt">
                                                  {currentYear}
                                              </text>
                                          </g>
                                      );
                                    }
                                    return <g />;
                                }}
                                stroke="#6b7280"
                                axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                                interval={0}
                                height={30}
                              />
                              <YAxis 
                                tick={false}
                                stroke="#6b7280"
                                axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                                tickLine={false}
                                domain={[90, 270]}
                                type="number"
                                label={{ 
                                  value: 'Log Scale', 
                                  angle: -90, 
                                  position: 'insideLeft',
                                  offset: 40,
                                  style: { textAnchor: 'middle', fontSize: '7.5pt', fill: '#374151' }
                                }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                  border: '1px solid #d1d5db',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '10px',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value, name) => [
                                  `${(value as number).toFixed(2)}`,
                                  name
                                ]}
                                labelFormatter={(label) => `Date: ${label}`}
                              />
                   
                              <Line 
                                type="monotone" 
                                dataKey="sodefi" 
                                name="SODEFI"
                                stroke="#dc2626" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#dc2626', stroke: '#dc2626', strokeWidth: 1 }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="reference" 
                                name="70/30 Reference Index"
                                stroke="#2563eb" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: '#2563eb', stroke: '#2563eb', strokeWidth: 1 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                          
                          {/* SODEFI Description - Top Left */}
                          <div 
                            className="absolute p-1"
                            style={{ 
                              top: '10px',
                              left: '50px',
                              zIndex: 10,
                              fontSize: '6.5pt'
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="whitespace-pre-line text-gray-600">Sodefi:{'\n'}70% Quality stocks{'\n'}30% Managed futures</span>
                            </div>
                          </div>

                          {/* 70/30 Reference Index Description - Bottom Right */}
                          <div 
                            className="absolute p-1"
                            style={{ 
                              bottom: '40px',
                              right: '20px',
                              zIndex: 10,
                              fontSize: '6.5pt'
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="whitespace-pre-line text-gray-600">70/30 portfolio:{'\n'}70% MSCI World Equity Index (EUR){'\n'}30% FTSE World Government Bond -{'\n'}Developed Markets Index (EUR)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-1/2 px-2 py-1">
                      <h2 className="text-sm font-bold mb-1 text-left">General Information</h2>
                      <div className="mb-2">
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Investment Manager</span>
                          <span className="flex-1 font-medium text-left">Sodefi Management BV</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Type of Fund</span>
                          <span className="flex-1 font-medium text-left">Dutch FGR</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Share Class</span>
                          <span className="flex-1 font-medium text-left">EUR</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Management Fee</span>
                          <span className="flex-1 font-medium text-left">1%</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Performance Fee</span>
                          <span className="flex-1 font-medium text-left">15% with HWM above ECB reference rate</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Minimum Investment</span>
                          <span className="flex-1 font-medium text-left">EUR 250000</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Fund Costs</span>
                          <span className="flex-1 font-medium text-left">Capped at 0.35%</span>
                        </div>
                      </div>
                      
                      <h2 className="text-sm font-bold mb-1 text-left">Administration</h2>
                      <div className="mb-1">
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Custodian (Stichting* Director)</span>
                          <span className="flex-1 font-medium text-left">Stichting Sodefi Umbrella Fund</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left"></span>
                          <span className="flex-1 font-medium text-left">Custodian and Apex Financial Services BV</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Sub investment manager</span>
                          <span className="flex-1 font-medium text-left">Neural Capital Ltd</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Investment Advisor</span>
                          <span className="flex-1 font-medium text-left">Mpartners BV</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Auditor</span>
                          <span className="flex-1 font-medium text-left">London & Van Holland</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Tax advisor</span>
                          <span className="flex-1 font-medium text-left">Vink & Partners Legal and Tax</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Brokers</span>
                          <span className="flex-1 font-medium text-left">Interactive Brokers Inc</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left"></span>
                          <span className="flex-1 font-medium text-left">StoneX Financial Inc.</span>
                        </div>
                        <div className="flex mb-[0.125rem] text-[10px] leading-tight">
                          <span className="w-40 text-left">Administrator</span>
                          <span className="flex-1 font-medium text-left">Apex Fund Services (Malta) Ltd</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] leading-relaxed text-left">
                    <p className="my-[0.125rem]">The performance above represents a pro forma EUR result for a single investor in the fund, prior to the restatement of its Terms & Conditions to permit outside investor participation. The first fund NAV calculation was for the month of NOV 2022. The results have been independently verified.</p>
                    <p className="my-[0.125rem]">* The "stichting" is a foundation which is a self-contained legal entity with separate legal personality that has no members or shareholders.</p>
                    <p className="my-[0.125rem]">All powers within the stichting are vested in its board of Directors.</p>
                  </div>
                </div>
                
                <div className="my-2">
                  <h2 className="text-center mb-1 text-lg text-gray-800">Relative Return Contribution - {factsheetDate}</h2>
                  <div className="flex justify-between gap-2 mb-1">
                    <ContributionChart title="US Portfolio" data={usPortfolioData} />
                    <ContributionChart title="EU Portfolio" data={euPortfolioData} />
                    <ContributionChart title="Managed Futures" data={managedFuturesData} />
                  </div>
                  <p className="text-center text-[10px] text-gray-600 mt-[0.125rem] italic">*C.N.C = Consumer Non Cyclical</p>
                  <p className="text-center text-[10px] text-gray-600 mt-[0.1rem] italic">*C.C = Consumer Cyclical</p>
                  
                </div>
              </div>
              <PageFooter />
            </div>

            <div id="page2" className="flex flex-col bg-brand-background text-brand-text">
              <PageHeader />
              <div className="p-4 flex-grow">
                {/* Monthly Commentary Section */}
                <div className="mt-2">
                  <div className="px-2 mb-4">
                    <h1 className="text-2xl font-bold mb-1">Monthly Commentary - {factsheetDate}</h1>
                    <p className="text-sm italic">
                      Sodefi Fund: EUR Class Performance Review and Market Outlook
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-8 text-sm leading-relaxed text-left">
                    <div className="space-y-4">
                      {commentaryParagraphs.slice(0, 4).map((p, i) => <p key={i} className="mb-3">{p}</p>)}
                    </div>
                    
                    <div className="space-y-4">
                      {commentaryParagraphs.slice(4).map((p, i) => <p key={i} className="mb-3">{p}</p>)}
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4">
                    <p className="text-sm italic text-left">
                      This commentary reflects the views of Sodefi Management BV as of {formattedCommentaryEndDate}. Past performance does not guarantee future results. 
                      All investments carry risk of loss. Please refer to the fund's prospectus for complete risk disclosures.
                    </p>
                  </div>
                </div>
              </div>
              <PageFooter />
            </div>

            <div id="page3" className="flex flex-col bg-brand-background text-brand-text">
              <PageHeader />
              <div className="p-4 flex-grow">
                <div className="px-2 py-1 mb-1">
                  <p className="text-sm leading-relaxed text-left">
                    <strong>The Sodefi Fund is an absolute return fund that invests primarily in quality European and US stocks together with a 30% allocation to a Trend Following futures strategy. The fund's objective is to generate above average returns and focuses on mitigation of large drawdowns.</strong>
                  </p>
                </div>
                <hr className="border-t-1 border-brand-text my-2" />
                {/* Disclaimer - Rewritten based on image */}
                <div className="mt-2 p-4">
                  <h3 className="text-lg font-bold mb-4 text-left">Investing involves risks.</h3>
                  <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed text-left">
                    <div className="space-y-2">
                      <ul className="list-disc list-inside space-y-2">
                        <li>The value of your investment will fluctuate over time, and you may gain or lose money, including loss of principle.</li>
                        <li>Past performance is not a guarantee of future return, nor is it necessarily indicative of future performance.</li>
                        <li>Diversification and rebalancing of a portfolio cannot assure a profit or protect against a loss in any given market environment.</li>
                      </ul>
                      <hr className="border-t-1 border-brand-text my-4 pt-2" />
                      <p>
                        The information provided here is for general informational purpose only and should not be considered an individualized recommendation or personalized investment advice. The investment strategies mentioned here may not be suitable for everyone. Each investor needs to review an investment strategy for his or her own particular situation before making any investment decision.
                      </p>
                      <p>
                        Indexes are unmanaged, do not incur management fees, costs and expenses, and cannot be invested in directly. This document is provided to you on a confidential basis for your information and discussion only. It is not a solicitation or an offer to buy or sell any security or other financial instrument.
                      </p>
                       <p>
                        Any information including facts, opinions or quotations, may be condensed or summarized and is expressed as of the date of writing. The information may change without notice and Sodefi Management BV (Sodefi) is under no obligation to ensure that such updates are brought to your attention.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p>
                        The price and value of investments mentioned and any income that might accrue could fall or rise or fluctuate. Past performance is not a guide to future performance. If an investment is denominated in a currency other than the base currency, changes in the rate of exchange may have an adverse effect on value, price or income.
                      </p>
                      <p>
                        This document and any related recommendations or strategies may not be suitable for you; you should ensure that you fully understand the potential risks and rewards and independently determine that it is suitable for your given objectives, experience, financial resources and any other relevant circumstances.
                      </p>
                      <p>
                        You should consult with such advisor(s) as you consider necessary to assist you in making these determinations. Nothing in this document constitutes investment, legal, accounting or tax advice, or a representation that any investment or strategy is suitable or appropriate to your individual circumstances, or otherwise constitutes a personal recommendation to you.
                      </p>
                      <p>
                        This material is for the exclusive use of the person to whom it has been delivered, is confidential, and may not be copied, distributed, or otherwise given or disclosed to any person. This material is not meant to be, nor shall it be construed as, an attempt to define all terms and conditions of any transaction or to contain all information that is, or maybe, material to an investor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <PageFooter />
            </div>
          </div>
        ) : (
          <div className="text-center p-10 text-red-500">{error || "No data to display."}</div>
        )}
      </div>
    </>
  );
};

export default SodefiFundComponent; 