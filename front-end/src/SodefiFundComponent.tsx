import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ContributionChart from './components/ContributionChart';

// Sample performance data - replace with real data
const performanceData = [
  { date: '2011-12', sodefi: 100, reference: 100 },
  { date: '2012-12', sodefi: 98, reference: 95 },
  { date: '2013-12', sodefi: 105, reference: 110 },
  { date: '2014-12', sodefi: 110, reference: 115 },
  { date: '2015-12', sodefi: 118, reference: 120 },
  { date: '2016-12', sodefi: 125, reference: 125 },
  { date: '2017-12', sodefi: 135, reference: 130 },
  { date: '2018-12', sodefi: 140, reference: 135 },
  { date: '2019-12', sodefi: 155, reference: 145 },
  { date: '2020-12', sodefi: 165, reference: 155 },
  { date: '2021-12', sodefi: 185, reference: 175 },
  { date: '2022-12', sodefi: 195, reference: 185 },
  { date: '2023-12', sodefi: 220, reference: 205 },
  { date: '2024-12', sodefi: 245, reference: 225 },
  { date: '2025-03', sodefi: 258, reference: 235 }
];

const lgPortfolioData = [
  { name: 'Industrial', value: 30, fill: '#22c55e' },
  { name: 'Consumer Cyclical', value: 40, fill: '#22c55e' },
  { name: 'Financials', value: 35, fill: '#22c55e' },
  { name: 'Real Estate', value: 25, fill: '#22c55e' },
  { name: 'Telecoms', value: 15, fill: '#22c55e' },
  { name: 'Technology', value: 20, fill: '#22c55e' },
  { name: 'Consumer Cyclical', value: 30, fill: '#ef4444' },
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
  { name: 'Equity Index', value: 35, fill: '#ef4444' },
  { name: 'Energy', value: 40, fill: '#22c55e' },
  { name: 'Bonds', value: 50, fill: '#22c55e' },
];

const SodefiFundComponent = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload) return null;

    const descriptions = {
      'SODEFI': '(70% Quality stocks, 30% Managed futures)',
      '70/30 Reference Index': '(70% MSCI World Equity, 30% FTSE World Gov Bond)'
    };

    return (
      <div className="flex justify-center items-center gap-8 py-2 mt-4">
        {payload.map((entry: { value: string, color: string }, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div style={{ width: '24px', height: '2px', backgroundColor: entry.color }} />
            <span className="text-sm font-medium">{entry.value}</span>
            <span className="text-xs">{descriptions[entry.value as keyof typeof descriptions]}</span>
          </div>
        ))}
      </div>
    );
  };

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
        onclone: (document) => {
          // Hide button in cloned document
          const button = document.getElementById('pdf-button-container');
          if (button) {
            button.style.visibility = 'hidden';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const ratio = canvasWidth / pdfWidth;
      const imgHeight = canvasHeight / ratio;

      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
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

  const PageHeader = () => (
    <div className="bg-white p-4">
      <header className="flex justify-between items-center">
        <div>
          <img src="/SodefiFundLogo.png" alt="Sodefi Fund Logo" className="w-64" />
        </div>
        <div className="text-right">
          <div className="text-lg font-normal text-amber-700 mb-1">Sodefi Fund: EUR Class</div>
          <div className="text-base text-gray-600 italic">March 2025</div>
        </div>
      </header>
    </div>
  );

  return (
    <div className="font-sans p-8 max-w-full mx-auto bg-white">
      <div id="pdf-button-container" className="text-center mb-4">
        <button 
          onClick={generatePdf}
          disabled={isGenerating}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating PDF...' : 'Download as PDF'}
        </button>
      </div>

      <div id="pdf-container" className="border border-gray-300 shadow-sm">
        <div id="page1">
          <PageHeader />
          <div className="bg-brand-background text-brand-text p-4">
            {/* Factsheet Content */}
            <div className="p-2 mb-4">
              <p className="text-sm leading-relaxed">
                <strong>The Sodefi Fund is an absolute return fund that invests primarily in quality European and US stocks together with a 30% allocation to a Trend Following futures strategy. Domiciled in the Netherlands, the fund's objective is to generate above average returns and focuses on mitigation of large drawdowns.</strong>
              </p>
            </div>
            
            <hr className="border-none border-t-2 border-brand-text my-4" />
            
            <div className="flex justify-between gap-4 mb-4">
              <div className="w-[48%]">
                <table className="w-full border-collapse border-2 border-brand-text">
                  <thead>
                    <tr>
                      <th className="font-bold text-left pl-3 border border-brand-text p-3 text-sm w-40 text-red-700">
                        Performance<br/>in%
                      </th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">1M</th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">3M</th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">6M</th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">12M</th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">YTD</th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">
                        CAGR<br/>since<br/>Inception**
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-left pl-3 font-bold w-40 border border-brand-text p-2 text-xs">
                        Sodefi Fund<br/>Lead Series*
                      </td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">-0.79</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">2.21</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">7.54</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">10.92</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">3.58</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">10.44</td>
                    </tr>
                    <tr>
                      <td className="text-left pl-3 font-bold w-40 border border-brand-text p-2 text-xs">
                        Reference<br/>Index 70/30
                      </td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">0.03</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">1.49</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">8.98</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">15.76</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">2.14</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">9.35</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="w-[48%]">
                <table className="w-full border-collapse border-2 border-brand-text">
                  <thead>
                    <tr>
                      <th className="font-bold text-left pl-3 border border-brand-text p-3 text-sm w-40 text-red-700">
                        Statistics<br/>in%
                      </th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">
                        Sharpe<br/>Ratio
                      </th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">
                        Ann.<br/>volatility-<br/>36 Month
                      </th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">
                        Worst<br/>Monthly<br/>Return
                      </th>
                      <th className="font-bold border border-brand-text p-2 text-center text-xs">
                        Max<br/>Drawdown
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-left pl-3 font-bold w-40 border border-brand-text p-2 text-xs">
                        Sodefi Fund<br/>Lead Series*
                      </td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">-0.79</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">2.21</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">7.54</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">10.92</td>
                    </tr>
                    <tr>
                      <td className="text-left pl-3 font-bold w-40 border border-brand-text p-2 text-xs">
                        Reference<br/>Index 70/30
                      </td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">0.03</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">1.49</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">8.98</td>
                      <td className="font-bold border border-brand-text p-2 text-center text-xs">15.76</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="my-2 text-xs text-left">
              <p className="my-1">* Past performance is not a guarantee of future return.</p>
              <p className="my-1">** Performance of Lead Series from 1st of November 2022, historic track record of founding investor from April 2011 to October 2022.</p>
            </div>

            <div className="my-4">
              <div className="flex gap-4">
                <div className="w-1/2 flex flex-col">
                  <h2 className="text-2xl font-bold mb-2 text-left">Performance</h2>
                  <div className="border-2 border-gray-400 bg-white p-2 flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid 
                          strokeDasharray="3 3" 
                          stroke="#d1d5db" 
                        />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: '#374151' }}
                          stroke="#6b7280"
                          axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                          tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 10, fill: '#374151' }}
                          stroke="#6b7280"
                          axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                          tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                          domain={['dataMin - 20', 'dataMax + 20']}
                          label={{ 
                            value: 'Log Scale', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fontSize: '12px', fill: '#374151' }
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
                        <Legend verticalAlign="bottom" content={renderLegend} />
                        <Line 
                          type="monotone" 
                          dataKey="sodefi" 
                          name="SODEFI"
                          stroke="#dc2626" 
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4, fill: '#dc2626', stroke: '#dc2626', strokeWidth: 1 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="reference" 
                          name="70/30 Reference Index"
                          stroke="#2563eb" 
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4, fill: '#2563eb', stroke: '#2563eb', strokeWidth: 1 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="w-1/2 p-2">
                  <h2 className="text-lg font-bold text-red-800 mb-2">General Information</h2>
                  <div className="mb-4">
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Investment Manager</span>
                      <span className="flex-1 font-medium">Sodefi Management BV</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Type of Fund</span>
                      <span className="flex-1 font-medium">Dutch FGR</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Share Class</span>
                      <span className="flex-1 font-medium">EUR</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Management Fee</span>
                      <span className="flex-1 font-medium">1%</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Performance Fee</span>
                      <span className="flex-1 font-medium">15% with HWM above ECB reference rate</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Minimum Investment</span>
                      <span className="flex-1 font-medium">EUR 250000</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Fund Costs</span>
                      <span className="flex-1 font-medium">Capped at 0.35%</span>
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-bold text-red-800 mb-2">Administration</h2>
                  <div className="mb-2">
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Custodian (Stichting* Director)</span>
                      <span className="flex-1 font-medium">Stichting Sodefi Umbrella Fund</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32"></span>
                      <span className="flex-1 font-medium">Custodian and Apex Financial Services BV</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Sub investment manager</span>
                      <span className="flex-1 font-medium">Neural Capital Ltd</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Investment Advisor</span>
                      <span className="flex-1 font-medium">Mpartners BV</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Auditor</span>
                      <span className="flex-1 font-medium">London & Van Holland</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Tax advisor</span>
                      <span className="flex-1 font-medium">Vink & Partners Legal and Tax</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Brokers</span>
                      <span className="flex-1 font-medium">Interactive Brokers Inc</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32"></span>
                      <span className="flex-1 font-medium">StoneX Financial Inc.</span>
                    </div>
                    <div className="flex mb-1 text-xs">
                      <span className="w-32">Administrator</span>
                      <span className="flex-1 font-medium">Apex Fund Services (Malta) Ltd</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs leading-relaxed text-left">
                <p className="my-1">The performance above represents a pro forma EUR result for a single investor in the fund, prior to the restatement of its Terms & Conditions to permit outside investor participation. The first fund NAV calculation was for the month of NOV 2022. The results have been independently verified.</p>
                <p className="my-1">* The "stichting" is a foundation which is a self-contained legal entity with separate legal personality that has no members or shareholders.</p>
                <p className="my-1">All powers within the stichting are vested in its board of Directors.</p>
              </div>
            </div>
            
            <div className="my-4">
              <h2 className="text-center mb-2 text-lg text-gray-800">Relative Return Contribution - February 2025</h2>
              <div className="flex justify-between gap-2 mb-2">
                <ContributionChart title="LG Portfolio" data={lgPortfolioData} />
                <ContributionChart title="EU Portfolio" data={euPortfolioData} />
                <ContributionChart title="Managed Futures" data={managedFuturesData} />
              </div>
              <p className="text-center text-xs text-gray-600 mt-1 italic">*LG = Consumer Non-Cyclical + Consumer Non-Cyclical</p>
            </div>
            
            {/* Banner 1 - After Factsheet */}
            <div className="mt-4 mb-2">
              <img 
                src="/Banner.png" 
                alt="Sodefi Banner" 
                className="w-full h-auto"
              />
            </div>
            
            {/* Footer 1 - After Factsheet */}
            <div className="mt-5 p-3 bg-amber-800 text-white text-center">
              {/* <p className="my-1 text-xs">Attention! This investment falls outside AFM supervision. No license required for this activity.</p> */}
              <p className="my-1 text-xs">Sodefi Management BV - www.sodefi.nl - gerardrum@sodefi.nl</p>
              <p className="my-1 text-xs">Amsterdamseweg 206 - 1182 HL Amstelveen - The Netherlands</p>
            </div>
          </div>
        </div>

        <div id="page2">
          <PageHeader />
          <div className="bg-brand-background text-brand-text p-8">
            {/* Monthly Commentary Section */}
            <div className="mt-12" style={{pageBreakBefore: 'always'}}>
              <div className="p-4 mb-6">
                <h1 className="text-2xl font-bold mb-2">Monthly Commentary - March 2025</h1>
                <p className="text-sm italic">
                  Sodefi Fund: EUR Class Performance Review and Market Outlook
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 text-sm leading-relaxed text-left">
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
                <p className="text-xs italic text-left">
                  This commentary reflects the views of Sodefi Management BV as of March 31, 2025. Past performance does not guarantee future results. 
                  All investments carry risk of loss. Please refer to the fund's prospectus for complete risk disclosures.
                </p>
              </div>
            </div>
            
            {/* Banner 2 - After Commentary */}
            <div className="mt-8 mb-4">
              <img 
                src="/Banner.png" 
                alt="Sodefi Banner" 
                className="w-full h-auto"
              />
            </div>
            
            {/* Footer 2 - After Commentary */}
            <div className="mt-10 p-5 bg-amber-800 text-white text-center">
              {/* <p className="my-1 text-xs">Attention! This investment falls outside AFM supervision. No license required for this activity.</p> */}
              <p className="my-1 text-xs">Sodefi Management BV - www.sodefi.nl - gerardrum@sodefi.nl</p>
              <p className="my-1 text-xs">Amsterdamseweg 206 - 1182 HL Amstelveen - The Netherlands</p>
            </div>
          </div>
        </div>

        <div id="page3">
          <PageHeader />
          <div className="bg-brand-background text-brand-text p-8">
            {/* Disclaimer - Always visible in two columns */}
            <div className="mt-6 p-6" style={{pageBreakBefore: 'always'}}>
              <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed text-left">
                <div className="space-y-3">
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
                
                <div className="space-y-3">
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
            
            {/* Banner 3 - After Disclaimer */}
            <div className="mt-8 mb-4">
              <img 
                src="/Banner.png" 
                alt="Sodefi Banner" 
                className="w-full h-auto"
              />
            </div>
            
            {/* Footer 3 - Final Footer */}
            <div className="mt-10 p-5 bg-amber-800 text-white text-center">
              {/* <p className="my-1 text-xs">Attention! This investment falls outside AFM supervision. No license required for this activity.</p> */}
              <p className="my-1 text-xs">Sodefi Management BV - www.sodefi.nl - gerardrum@sodefi.nl</p>
              <p className="my-1 text-xs">Amsterdamseweg 206 - 1182 HL Amstelveen - The Netherlands</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SodefiFundComponent; 