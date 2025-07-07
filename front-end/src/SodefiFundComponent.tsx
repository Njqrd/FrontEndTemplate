import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ContributionChart from './components/ContributionChart';

// Sample performance data - replace with real data
const performanceData = [
  { date: '2011', sodefi: 100, reference: 100 },
  { date: '2012', sodefi: 102, reference: 98 },
  { date: '応13', sodefi: 115, reference: 108 },
  { date: '2014', sodefi: 125, reference: 118 },
  { date: '2015', sodefi: 135, reference: 128 },
  { date: '2016', sodefi: 145, reference: 138 },
  { date: '2017', sodefi: 165, reference: 155 },
  { date: '2018', sodefi: 175, reference: 165 },
  { date: '2019', sodefi: 195, reference: 185 },
  { date: '2020', sodefi: 205, reference: 195 },
  { date: '2021', sodefi: 225, reference: 215 },
  { date: '2022', sodefi: 235, reference: 225 },
  { date: '2023', sodefi: 245, reference: 235 },
  { date: '2024', sodefi: 255, reference: 245 },
  { date: '2025', sodefi: 265, reference: 252 }
];

const lgPortfolioData = [
  { name: 'Industrial', value: 30, fill: '#22c55e' },
  { name: 'Consumer Cyclical', value: 40, fill: '#22c55e' },
  { name: 'Financials', value: 35, fill: '#22c55e' },
  { name: 'Real Estate', value: 25, fill: '#22c55e' },
  { name: 'Telecoms', value: 15, fill: '#22c55e' },
  { name: 'Technology', value: 20, fill: '#22c55e' },
  { name: 'Consumer Cyclical', value: -30, fill: '#ef4444' },
];

const euPortfolioData = [
  { name: 'Technology', value: 10, fill: '#22c55e' },
  { name: 'Basic Materials', value: 30, fill: '#22c55e' },
  { name: 'CAGE', value: 15, fill: '#22c55e' },
  { name: 'Utilities', value: 20, fill: '#22c55e' },
  { name: 'Healthcare', value: 25, fill: '#22c55e' },
  { name: 'Financials', value: 35, fill: '#22c55e' },
  { name: 'Banks', value: 45, fill: '#22c55e' },
];

const managedFuturesData = [
  { name: 'Agriculture', value: 30, fill: '#22c55e' },
  { name: 'Metals', value: 25, fill: '#22c55e' },
  { name: 'Grains', value: 15, fill: '#22c55e' },
  { name: 'FX', value: 20, fill: '#22c55e' },
  { name: 'Equity Index', value: -35, fill: '#ef4444' },
  { name: 'Energy', value: 40, fill: '#22c55e' },
  { name: 'Bonds', value: 50, fill: '#22c55e' },
];

const SodefiFundComponent = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const PageHeader = () => (
    <div className="bg-white px-2 py-1">
      <header className="flex justify-between items-center">
        <div>
          <img src="/SodefiFundLogo.png" alt="Sodefi Fund Logo" className="w-64" />
        </div>
        <div className="text-right">
          <div className="text-lg font-normal text-amber-700 mb-[0.125rem]">Sodefi Fund: EUR Class</div>
          <div className="text-base text-gray-600 italic">March 2025</div>
        </div>
      </header>
    </div>
  );

  const PageFooter = () => (
    <div className="mt-auto pt-2">
      <div className="px-4">
        <img 
          src="/Banner.png" 
          alt="Sodefi Banner" 
          className="w-full h-auto"
        />
      </div>
      <div className="px-3 py-[0.375rem] mt-2 bg-amber-800 text-white text-center">
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
        scale: 2, 
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
          <button 
            onClick={generatePdf}
            disabled={isGenerating}
            className="bg-blue-600 text-white font-bold py-1 px-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating PDF...' : 'Download as PDF'}
          </button>
        </div>

        <div id="pdf-container" className="border border-gray-300 shadow-lg">
          <div id="page1" className="flex flex-col bg-brand-background text-brand-text">
            <PageHeader />
            <div className="px-4 py-2 flex-grow">
              {/* Factsheet Content */}
              <div className="px-2 py-1 mb-1">
                <p className="text-sm leading-relaxed text-left">
                  <strong>The Sodefi Fund is an absolute return fund that invests primarily in quality European and US stocks together with a 30% allocation to a Trend Following futures strategy. Domiciled in the Netherlands, the fund's objective is to generate above average returns and focuses on mitigation of large drawdowns.</strong>
                </p>
                <hr />
              </div>
              
              <hr className="border-none border-t-2 border-brand-text my-2" />
              
              <div className="flex justify-start gap-4 mb-2">
                <div className="w-[48%]">
                  <table className="w-full border-collapse border-2 border-brand-text">
                    <thead>
                      <tr>
                        <th className="font-bold text-left pl-2 border border-brand-text px-2 py-1 text-xs w-40 text-red-700" style={{ verticalAlign: 'middle' }}>
                          Performance<br/>in%
                        </th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>1M</th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>3M</th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>6M</th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>12M</th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>YTD</th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>
                          CAGR<br/>since<br/>Inception**
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left pl-2 font-bold w-40 border border-brand-text px-1 py-[0.125rem] text-xs" style={{ verticalAlign: 'middle' }}>
                          Sodefi Fund<br/>Lead Series*
                        </td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>-0.79</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>2.21</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>7.54</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>10.92</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>3.58</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>10.44</td>
                      </tr>
                      <tr>
                        <td className="text-left pl-2 font-bold w-40 border border-brand-text px-1 py-[0.125rem] text-xs" style={{ verticalAlign: 'middle' }}>
                          Reference<br/>Index 70/30
                        </td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>0.03</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>1.49</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>8.98</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>15.76</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>2.14</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>9.35</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="w-[48%]">
                  <table className="w-full border-collapse border-2 border-brand-text">
                    <thead>
                      <tr>
                        <th className="font-bold text-left pl-2 border border-brand-text px-2 py-1 text-xs w-40 text-red-700" style={{ verticalAlign: 'middle' }}>
                          Statistics<br/>in%
                        </th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>
                          Sharpe<br/>Ratio
                        </th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>
                          Ann.<br/>volatility-<br/>36 Month
                        </th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>
                          Worst<br/>Monthly<br/>Return
                        </th>
                        <th className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>
                          Max<br/>Drawdown
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-left pl-2 font-bold w-40 border border-brand-text px-1 py-[0.125rem] text-xs" style={{ verticalAlign: 'middle' }}>
                          Sodefi Fund<br/>Lead Series*
                        </td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>-0.79</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>2.21</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>7.54</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>10.92</td>
                      </tr>
                      <tr>
                        <td className="text-left pl-2 font-bold w-40 border border-brand-text px-1 py-[0.125rem] text-xs" style={{ verticalAlign: 'middle' }}>
                          Reference<br/>Index 70/30
                        </td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>0.03</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>1.49</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>8.98</td>
                        <td className="font-bold border border-brand-text px-1 py-[0.125rem] text-center text-xs" style={{ verticalAlign: 'middle' }}>15.76</td>
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
                        className="bg-white/95 p-1 text-center"
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
                          <LineChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid 
                              strokeDasharray="1 1" 
                              stroke="#d1d5db" 
                              strokeWidth={0.5}
                            />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: '7.5pt', fill: '#374151' }}
                              stroke="#6b7280"
                              axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                              tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                              interval={1}
                              angle={0}
                              textAnchor="middle"
                              height={30}
                            />
                            <YAxis 
                              tick={{ fontSize: '7.5pt', fill: '#374151' }}
                              stroke="#6b7280"
                              axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                              tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                              domain={[90, 270]}
                              type="number"
                              label={{ 
                                value: 'Log Scale', 
                                angle: -90, 
                                position: 'insideLeft',
                                offset: 25,
                                style: { textAnchor: 'middle', fontSize: '7.5pt', fill: '#374151' }
                              }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                              }}
                              formatter={(value, name) => [
                                `${value}`,
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
                          className="absolute bg-white/95 p-1 rounded shadow-sm border border-gray-200"
                          style={{ 
                            top: '10px',
                            left: '80px',
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
                          className="absolute bg-white/95 p-1 rounded shadow-sm border border-gray-200"
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
                <h2 className="text-center mb-1 text-lg text-gray-800">Relative Return Contribution - February 2025</h2>
                <div className="flex justify-between gap-2 mb-1">
                  <ContributionChart title="LG Portfolio" data={lgPortfolioData} />
                  <ContributionChart title="EU Portfolio" data={euPortfolioData} />
                  <ContributionChart title="Managed Futures" data={managedFuturesData} />
                </div>
                <p className="text-center text-[10px] text-gray-600 mt-[0.125rem] italic">*LG = Consumer Non-Cyclical + Consumer Non-Cyclical</p>
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
                  <h1 className="text-2xl font-bold mb-1">Monthly Commentary - March 2025</h1>
                  <p className="text-sm italic">
                    Sodefi Fund: EUR Class Performance Review and Market Outlook
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 text-base leading-relaxed text-left">
                  <div className="space-y-4">
                    <p className="mb-3">
                      The Sodefi Fund delivered a mixed performance in March 2025, with the EUR Class posting a -0.79% return for the month. While this represents a modest decline, the fund's year-to-date performance remains positive at 3.58%, demonstrating resilience in volatile market conditions.
                    </p>
                    <p className="mb-3">
                      Our diversified approach, combining 70% quality European and US equities with 30% trend-following futures strategies, continues to provide effective risk management while capturing upside opportunities in selective market segments.
                    </p>
                    <p className="mb-3">
                      March 2025 presented a challenging environment characterized by heightened geopolitical tensions and central bank policy uncertainty. European markets faced headwinds from energy price volatility, while US markets grappled with mixed economic data and earnings revisions.
                    </p>
                    <p className="mb-3">
                      The managed futures component of our strategy proved particularly valuable during this period, with strong performance in bonds and energy sectors offsetting some of the weakness in equity index positions.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="mb-3">
                      Our European portfolio maintained strong exposure to financials and banks, which contributed positively to performance despite broader market weakness. The focus on quality stocks with strong fundamentals helped limit downside exposure during the month's volatility.
                    </p>
                    <p className="mb-3">
                      In the US large-cap segment, we reduced exposure to consumer cyclicals early in the month, which proved beneficial as this sector underperformed. Technology and industrial positions provided stability to the overall portfolio.
                    </p>
                    <p className="mb-3">
                      Looking ahead to April, we remain cautiously optimistic about market conditions. Our trend-following strategies are well-positioned to capitalize on emerging market movements, while our equity selections continue to focus on quality companies with strong balance sheets.
                    </p>
                    <p className="mb-3">
                      We expect continued volatility in the near term but believe our diversified approach and active risk management will continue to serve investors well. The fund's low correlation to traditional benchmarks remains a key advantage in the current environment.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 p-4">
                  <p className="text-sm italic text-left">
                    This commentary reflects the views of Sodefi Management BV as of March 31, 2025. Past performance does not guarantee future results. 
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
              {/* Disclaimer - Always visible in two columns */}
              <div className="mt-2 p-4">
                <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed text-left">
                  <div className="space-y-2">
                    <p>
                      The information provided here is for general informational purpose only and should not be considered an individualized recommendation or personalized investment advice. The investment strategies mentioned here may not be suitable for everyone. Each investor needs to review an investment strategy for his or her own particular situation before making any investment decision.
                    </p>
                    <p>
                      Indexes are unmanaged, do not incur management fees, costs and expenses, and cannot be invested in directly. This document is provided to you on a confidential basis for your information and discussion only. It is not a solicitation or an offer to buy or sell any security or other financial instrument.
                    </p>
                    <p>
                      Any information including facts, opinions or quotations, may be condensed or summarized and is expressed as of the date of writing. The information may change without notice and Sodefi Management BV (Sodefi) is under no obligation to ensure that such updates are brought to your attention.
                    </p>
                    <p>
                      The information available within this document may be restricted in certain other jurisdictions. Not all products and services are available in all geographic areas, and an investor's eligibility to such products and services is subject to the local laws and regulations affecting the investor. Accordingly, persons who use this information are required by Sodefi to inform themselves about and observe the restrictions placed on them by their local laws and regulations.
                    </p>
                    <p>
                      The price and value of investments mentioned and any income that might accrue could fall or rise or fluctuate. Past performance is not a guide to future performance. If an investment is denominated in a currency other than the base currency, changes in the rate of exchange may have an adverse effect on value, price or income.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p>
                      This document and any related recommendations or strategies may not be suitable for you; you should ensure that you fully understand the potential risks and rewards and independently determine that it is suitable for your given objectives, experience, financial resources and any other relevant circumstances.
                    </p>
                    <p>
                      You should consult with such advisor(s) as you consider necessary to assist you in making these determinations. Nothing in this document constitutes investment, legal, accounting or tax advice, or a representation that any investment or strategy is suitable or appropriate to your individual circumstances, or otherwise constitutes a personal recommendation to you.
                    </p>
                    <p>
                      This material is for the exclusive use of the person to whom it has been delivered, is confidential, and may not be copied, distributed, or otherwise given or disclosed to any person. This material is not meant to be, nor shall it be construed as, an attempt to define all terms and conditions of any transaction or to contain all information that is, or maybe, material to an investor.
                    </p>
                    <p>
                      Sodefi is not soliciting any action based upon this material, and this material is not meant to be, nor shall it be construed as, an offer or solicitation of an offer for the purchase or sale of any security or advisory or other service. If in the future any security or services is offered or sold, such offer or sale shall occur only pursuant to, and a decision to invest therein should be made solely on the basis of, a definitive prospectus, and shall be made exclusively to qualified investors in a private offering exempt from registration under all applicable securities and other laws.
                    </p>
                    <p>
                      Any such prospectus shall contain material information not contained herein, and shall supplement, amend, and/or supersede in its entirety the information referred to herein. This document is made available to persons who would fall within the definition of a Professional Client or Eligible Counterparty.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <PageFooter />
          </div>
        </div>
      </div>
    </>
  );
};

export default SodefiFundComponent; 