import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

const SodefiFundComponent = () => {
  return (
    <div className="font-sans p-8 max-w-full mx-auto bg-white border border-gray-300 shadow-sm">
      {/* Header */}
      <header className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <div className="text-4xl font-normal text-gray-800 leading-tight">
            sodefi
          </div>
          <div className="text-2xl font-normal text-amber-700 leading-tight">
            fund
          </div>
          <div className="text-xs text-gray-600 mt-1">
            to perform<br/>
            to protect
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-normal text-amber-700 mb-1">Sodefi Fund: EUR Class</div>
          <div className="text-base text-gray-600 italic">March 2025</div>
        </div>
      </header>
      
      {/* Factsheet Content */}
      <div className="bg-blue-50 p-4 mb-6 border-l-4 border-blue-600">
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>The Sodefi Fund is an absolute return fund that invests primarily in quality European and US stocks together with a 30% allocation to a Trend Following futures strategy. Domiciled in the Netherlands, the fund's objective is to generate above average returns and focuses on mitigation of large drawdowns.</strong>
        </p>
      </div>
      
      <hr className="border-none border-t-2 border-gray-800 my-6" />
      
      <div className="flex justify-between gap-6 mb-6">
        <div className="w-[48%]">
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead>
              <tr>
                <th className="bg-amber-900 text-white font-bold text-left pl-3 border border-gray-800 p-3 text-sm w-40">
                  Performance<br/>in%
                </th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">1M</th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">3M</th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">6M</th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">12M</th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">YTD</th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">
                  CAGR<br/>since<br/>Inception**
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left pl-3 bg-blue-100 font-bold w-40 border border-gray-800 p-2 text-xs">
                  Sodefi Fund<br/>Lead Series*
                </td>
                <td className="text-red-600 font-bold border border-gray-800 p-2 text-center text-xs">-0.79</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">2.21</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">7.54</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">10.92</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">3.58</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">10.44</td>
              </tr>
              <tr>
                <td className="text-left pl-3 bg-blue-100 font-bold w-40 border border-gray-800 p-2 text-xs">
                  Reference<br/>Index 70/30
                </td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">0.03</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">1.49</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">8.98</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">15.76</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">2.14</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">9.35</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="w-[48%]">
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead>
              <tr>
                <th className="bg-amber-900 text-white font-bold text-left pl-3 border border-gray-800 p-3 text-sm w-40">
                  Statistics<br/>1%
                </th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">
                  Sharpe<br/>Ratio
                </th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">
                  Ann.<br/>volatility-<br/>36 Month
                </th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">
                  Worst<br/>Monthly<br/>Return
                </th>
                <th className="bg-gray-200 font-bold border border-gray-800 p-2 text-center text-xs">
                  Max<br/>Drawdown
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left pl-3 bg-blue-100 font-bold w-40 border border-gray-800 p-2 text-xs">
                  Sodefi Fund<br/>Lead Series*
                </td>
                <td className="text-red-600 font-bold border border-gray-800 p-2 text-center text-xs">-0.79</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">2.21</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">7.54</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">10.92</td>
              </tr>
              <tr>
                <td className="text-left pl-3 bg-blue-100 font-bold w-40 border border-gray-800 p-2 text-xs">
                  Reference<br/>Index 70/30
                </td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">0.03</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">1.49</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">8.98</td>
                <td className="font-bold border border-gray-800 p-2 text-center text-xs">15.76</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="my-3 text-xs text-blue-800 text-left">
        <p className="my-1">* Past performance is not a guarantee of future return.</p>
        <p className="my-1">** Performance of Lead Series from 1st of November 2022, historic track record of founding investor from April 2011 to October 2022.</p>
      </div>

      <div className="my-6">
        <div className="flex gap-8">
          <div className="flex-[2]">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 text-left">Performance</h2>
            <div className="mb-4">
              <div className="border-2 border-gray-400 bg-white">
                <div className="p-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={performanceData} margin={{ top: 10, right: 10, left: 20, bottom: 50 }}>
                      <CartesianGrid 
                        strokeDasharray="1 1" 
                        stroke="#d1d5db" 
                        horizontal={true}
                        vertical={true}
                      />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 9, fill: '#374151' }}
                        stroke="#6b7280"
                        axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                        tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 9, fill: '#374151' }}
                        stroke="#6b7280"
                        axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                        tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                        domain={['dataMin - 10', 'dataMax + 10']}
                        label={{ 
                          value: 'Log Scale', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { textAnchor: 'middle', fontSize: '9px', fill: '#374151' }
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '10px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value, name) => [
                          `${value}`,
                          name === 'sodefi' ? 'SODEFI' : '70/30 Reference Index'
                        ]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sodefi" 
                        stroke="#dc2626" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3, fill: '#dc2626', stroke: '#dc2626', strokeWidth: 1 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="reference" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 3, fill: '#2563eb', stroke: '#2563eb', strokeWidth: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Single, clean legend at the bottom */}
                <div className="px-2 pb-2 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-center gap-8 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 bg-red-600"></div>
                      <span className="text-sm font-medium text-gray-800">SODEFI</span>
                      <span className="text-xs text-gray-600">(70% Quality stocks, 30% Managed futures)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-0.5 bg-blue-600"></div>
                      <span className="text-sm font-medium text-gray-800">70/30 Reference Index</span>
                      <span className="text-xs text-gray-600">(70% MSCI World Equity, 30% FTSE World Gov Bond)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-700 leading-relaxed text-left">
              <p className="my-1">The performance above represents a pro forma EUR result for a single investor in the fund, prior to the restatement of its Terms & Conditions to permit outside investor participation. The first fund NAV calculation was for the month of NOV 2022. The results have been independently verified.</p>
              <p className="my-1">* The "stichting" is a foundation which is a self-contained legal entity with separate legal personality that has no members or shareholders.</p>
              <p className="my-1">All powers within the stichting are vested in its board of Directors.</p>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-5 border border-gray-300">
            <h2 className="text-lg font-bold text-red-800 mb-4">General Information</h2>
            <div className="mb-6">
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Investment Manager</span>
                <span className="flex-1 text-gray-900 font-medium">Sodefi Management BV</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Type of Fund</span>
                <span className="flex-1 text-gray-900 font-medium">Dutch FGR</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Share Class</span>
                <span className="flex-1 text-gray-900 font-medium">EUR</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Management Fee</span>
                <span className="flex-1 text-gray-900 font-medium">1%</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Performance Fee</span>
                <span className="flex-1 text-gray-900 font-medium">15% with HWM above ECB reference rate</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Minimum Investment</span>
                <span className="flex-1 text-gray-900 font-medium">EUR 250000</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Fund Costs</span>
                <span className="flex-1 text-gray-900 font-medium">Capped at 0.35%</span>
              </div>
            </div>
            
            <h2 className="text-lg font-bold text-red-800 mb-4">Administration</h2>
            <div className="mb-5">
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Custodian (Stichting* Director)</span>
                <span className="flex-1 text-gray-900 font-medium">Stichting Sodefi Umbrella Fund</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700"></span>
                <span className="flex-1 text-gray-900 font-medium">Custodian and Apex Financial Services BV</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Sub investment manager</span>
                <span className="flex-1 text-gray-900 font-medium">Neural Capital Ltd</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Investment Advisor</span>
                <span className="flex-1 text-gray-900 font-medium">Mpartners BV</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Auditor</span>
                <span className="flex-1 text-gray-900 font-medium">London & Van Holland</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Tax advisor</span>
                <span className="flex-1 text-gray-900 font-medium">Vink & Partners Legal and Tax</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Brokers</span>
                <span className="flex-1 text-gray-900 font-medium">Interactive Brokers Inc</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700"></span>
                <span className="flex-1 text-gray-900 font-medium">StoneX Financial Inc.</span>
              </div>
              <div className="flex mb-1 text-xs">
                <span className="w-32 text-gray-700">Administrator</span>
                <span className="flex-1 text-gray-900 font-medium">Apex Fund Services (Malta) Ltd</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="my-8">
        <h2 className="text-center mb-5 text-lg text-gray-800">Relative Return Contribution - February 2025</h2>
        <div className="flex justify-between gap-5 mb-4">
          <div className="flex-1 bg-gray-50 p-4 rounded">
            <h3 className="text-center mb-4 text-sm text-gray-600 bg-gray-300 p-1 rounded">LG Portfolio</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Consumer Cyclical</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-red-500 min-w-0.5" style={{width: '30px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Technology</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '20px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Telecoms</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '15px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Real Estate</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '25px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Financials</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '35px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Consumer Cyclical</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '40px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Industrial</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '30px'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-4 rounded">
            <h3 className="text-center mb-4 text-sm text-gray-600 bg-gray-300 p-1 rounded">EU Portfolio</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Banks</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '45px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Financials</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '35px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Healthcare</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '25px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Utilities</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '20px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">CAGE</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '15px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Basic Materials</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '30px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Technology</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '10px'}}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-4 rounded">
            <h3 className="text-center mb-4 text-sm text-gray-600 bg-gray-300 p-1 rounded">Managed Futures</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Bonds</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '50px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Energy</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '40px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Equity Index</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-red-500 min-w-0.5" style={{width: '35px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">FX</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '20px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Grains</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '15px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Metals</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '25px'}}></div>
                </div>
              </div>
              <div className="flex items-center text-xs">
                <span className="w-24 text-right mr-2 text-xs">Agriculture</span>
                <div className="flex-1 flex items-center h-5 relative">
                  <div className="h-4 rounded bg-green-500 min-w-0.5" style={{width: '30px'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2 italic">*LG = Consumer Non-Cyclical + Consumer Non-Cyclical</p>
      </div>
      
      {/* Banner 1 - After Factsheet */}
      <div className="mt-8 mb-4">
        <img 
          src="/Banner.png" 
          alt="Sodefi Banner" 
          className="w-full h-auto"
        />
      </div>
      
      {/* Footer 1 - After Factsheet */}
      <div className="mt-10 p-5 bg-amber-800 text-white text-center">
        {/* <p className="my-1 text-xs">Attention! This investment falls outside AFM supervision. No license required for this activity.</p> */}
        <p className="my-1 text-xs">Sodefi Management BV - www.sodefi.nl - gerardrum@sodefi.nl</p>
        <p className="my-1 text-xs">Amsterdamseweg 206 - 1182 HL Amstelveen - The Netherlands</p>
      </div>
      
      {/* Monthly Commentary Section */}
      <div className="mt-12">
        <div className="bg-blue-50 p-4 mb-6 border-l-4 border-blue-600">
          <h1 className="text-2xl font-bold text-blue-800 mb-2">Monthly Commentary - March 2025</h1>
          <p className="text-sm text-blue-700 italic">
            Sodefi Fund: EUR Class Performance Review and Market Outlook
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 text-sm leading-relaxed text-left">
          <div className="space-y-4">
            <p className="text-gray-700 mb-3">
              The Sodefi Fund delivered a mixed performance in March 2025, with the EUR Class posting a -0.79% return for the month. While this represents a modest decline, the fund's year-to-date performance remains positive at 3.58%, demonstrating resilience in volatile market conditions.
            </p>
            <p className="text-gray-700 mb-3">
              Our diversified approach, combining 70% quality European and US equities with 30% trend-following futures strategies, continues to provide effective risk management while capturing upside opportunities in selective market segments.
            </p>
            <p className="text-gray-700 mb-3">
              March 2025 presented a challenging environment characterized by heightened geopolitical tensions and central bank policy uncertainty. European markets faced headwinds from energy price volatility, while US markets grappled with mixed economic data and earnings revisions.
            </p>
            <p className="text-gray-700 mb-3">
              The managed futures component of our strategy proved particularly valuable during this period, with strong performance in bonds and energy sectors offsetting some of the weakness in equity index positions.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-700 mb-3">
              Our European portfolio maintained strong exposure to financials and banks, which contributed positively to performance despite broader market weakness. The focus on quality stocks with strong fundamentals helped limit downside exposure during the month's volatility.
            </p>
            <p className="text-gray-700 mb-3">
              In the US large-cap segment, we reduced exposure to consumer cyclicals early in the month, which proved beneficial as this sector underperformed. Technology and industrial positions provided stability to the overall portfolio.
            </p>
            <p className="text-gray-700 mb-3">
              Looking ahead to April, we remain cautiously optimistic about market conditions. Our trend-following strategies are well-positioned to capitalize on emerging market movements, while our equity selections continue to focus on quality companies with strong balance sheets.
            </p>
            <p className="text-gray-700 mb-3">
              We expect continued volatility in the near term but believe our diversified approach and active risk management will continue to serve investors well. The fund's low correlation to traditional benchmarks remains a key advantage in the current environment.
            </p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-50 border-l-4 border-gray-400">
          <p className="text-xs text-gray-600 italic text-left">
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
      
      {/* Disclaimer - Always visible in two columns */}
      <div className="mt-6 p-6 bg-gray-100 border-t-2 border-gray-300">
        <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed text-gray-700 text-left">
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
  );
};

export default SodefiFundComponent; 