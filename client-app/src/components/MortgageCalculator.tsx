import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  ArrowLeft, 
  Calculator, 
  TrendingUp, 
  DollarSign,
  Home,
  Percent,
  Calendar,
  PieChart,
  Download,
  Share
} from 'lucide-react';
import { useRouter } from './Router';

export function MortgageCalculator() {
  const { navigate } = useRouter();
  
  // Calculator inputs
  const [propertyPrice, setPropertyPrice] = useState(32000000); // 3.2 Cr
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  
  // Calculated values
  const [loanAmount, setLoanAmount] = useState(0);
  const [monthlyEMI, setMonthlyEMI] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  useEffect(() => {
    calculateEMI();
  }, [propertyPrice, downPayment, interestRate, loanTenure]);

  const calculateEMI = () => {
    const principal = propertyPrice * (1 - downPayment / 100);
    setLoanAmount(principal);

    const monthlyRate = interestRate / 12 / 100;
    const numPayments = loanTenure * 12;

    if (monthlyRate === 0) {
      const emi = principal / numPayments;
      setMonthlyEMI(emi);
      setTotalInterest(0);
      setTotalPayment(principal);
    } else {
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / 
                  (Math.pow(1 + monthlyRate, numPayments) - 1);
      setMonthlyEMI(emi);
      
      const total = emi * numPayments;
      setTotalPayment(total);
      setTotalInterest(total - principal);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `PKR ${(value / 10000000).toFixed(2)}Cr`;
    } else if (value >= 100000) {
      return `PKR ${(value / 100000).toFixed(2)}L`;
    }
    return `PKR ${value.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
  };

  const generateAmortizationSchedule = () => {
    const schedule = [];
    let balance = loanAmount;
    const monthlyRate = interestRate / 12 / 100;

    for (let year = 1; year <= Math.min(loanTenure, 5); year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 1; month <= 12; month++) {
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyEMI - interestPayment;
        
        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        balance -= principalPayment;
      }

      schedule.push({
        year,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: balance
      });
    }

    return schedule;
  };

  const amortizationSchedule = generateAmortizationSchedule();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('dashboard')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Mortgage Calculator</h1>
              <p className="text-sm text-gray-600">Calculate your home loan EMI and affordability</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Inputs */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-[#00B894]" />
                  Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Price */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Home className="w-4 h-4 mr-2 text-gray-500" />
                      Property Price
                    </span>
                    <span className="font-semibold text-[#00B894]">
                      {formatCurrency(propertyPrice)}
                    </span>
                  </Label>
                  <Slider
                    value={[propertyPrice]}
                    onValueChange={(value) => setPropertyPrice(value[0])}
                    min={1000000}
                    max={100000000}
                    step={100000}
                    className="py-4"
                  />
                  <Input
                    type="number"
                    value={propertyPrice}
                    onChange={(e) => setPropertyPrice(Number(e.target.value))}
                    className="text-center"
                  />
                </div>

                {/* Down Payment */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                      Down Payment
                    </span>
                    <span className="font-semibold text-[#0984E3]">
                      {downPayment}% ({formatCurrency(propertyPrice * downPayment / 100)})
                    </span>
                  </Label>
                  <Slider
                    value={[downPayment]}
                    onValueChange={(value) => setDownPayment(value[0])}
                    min={10}
                    max={50}
                    step={5}
                    className="py-4"
                  />
                  <div className="flex space-x-2">
                    {[10, 20, 30, 40].map((percent) => (
                      <Button
                        key={percent}
                        variant={downPayment === percent ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDownPayment(percent)}
                        className={downPayment === percent ? "bg-[#0984E3]" : ""}
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Percent className="w-4 h-4 mr-2 text-gray-500" />
                      Interest Rate (Annual)
                    </span>
                    <span className="font-semibold text-[#FF7675]">
                      {interestRate}%
                    </span>
                  </Label>
                  <Slider
                    value={[interestRate]}
                    onValueChange={(value) => setInterestRate(value[0])}
                    min={5}
                    max={15}
                    step={0.1}
                    className="py-4"
                  />
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="text-center"
                    step="0.1"
                  />
                </div>

                {/* Loan Tenure */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      Loan Tenure
                    </span>
                    <span className="font-semibold text-[#FAB1A0]">
                      {loanTenure} years
                    </span>
                  </Label>
                  <Slider
                    value={[loanTenure]}
                    onValueChange={(value) => setLoanTenure(value[0])}
                    min={5}
                    max={30}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex space-x-2">
                    {[10, 15, 20, 25, 30].map((years) => (
                      <Button
                        key={years}
                        variant={loanTenure === years ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLoanTenure(years)}
                        className={loanTenure === years ? "bg-[#FAB1A0]" : ""}
                      >
                        {years}Y
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Presets */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col"
                    onClick={() => {
                      setPropertyPrice(18000000);
                      setDownPayment(20);
                      setInterestRate(8.5);
                      setLoanTenure(20);
                    }}
                  >
                    <span className="font-semibold mb-1">Entry Level</span>
                    <span className="text-xs text-gray-600">PKR 1.8Cr</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col"
                    onClick={() => {
                      setPropertyPrice(32000000);
                      setDownPayment(20);
                      setInterestRate(8.5);
                      setLoanTenure(20);
                    }}
                  >
                    <span className="font-semibold mb-1">Mid Range</span>
                    <span className="text-xs text-gray-600">PKR 3.2Cr</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col"
                    onClick={() => {
                      setPropertyPrice(45000000);
                      setDownPayment(20);
                      setInterestRate(8.5);
                      setLoanTenure(20);
                    }}
                  >
                    <span className="font-semibold mb-1">Premium</span>
                    <span className="text-xs text-gray-600">PKR 4.5Cr</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col"
                    onClick={() => {
                      setPropertyPrice(70000000);
                      setDownPayment(20);
                      setInterestRate(8.5);
                      setLoanTenure(20);
                    }}
                  >
                    <span className="font-semibold mb-1">Luxury</span>
                    <span className="text-xs text-gray-600">PKR 7Cr</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* EMI Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-[#00B894] to-[#55E6C1]">
              <CardContent className="p-8 text-center text-white">
                <div className="flex items-center justify-center mb-2">
                  <Calculator className="w-6 h-6 mr-2" />
                  <span className="text-sm uppercase tracking-wide">Monthly EMI</span>
                </div>
                <div className="text-5xl font-bold mb-2">
                  {formatCurrency(monthlyEMI)}
                </div>
                <p className="text-sm text-white/80">
                  for {loanTenure} years at {interestRate}% interest
                </p>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Loan Amount</div>
                  <div className="text-2xl font-bold text-[#0984E3]">
                    {formatCurrency(loanAmount)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {100 - downPayment}% of property price
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Total Interest</div>
                  <div className="text-2xl font-bold text-[#FF7675]">
                    {formatCurrency(totalInterest)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Over {loanTenure} years
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Down Payment</div>
                  <div className="text-2xl font-bold text-[#FAB1A0]">
                    {formatCurrency(propertyPrice * downPayment / 100)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {downPayment}% upfront
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-600 mb-1">Total Payment</div>
                  <div className="text-2xl font-bold text-[#00B894]">
                    {formatCurrency(totalPayment + (propertyPrice * downPayment / 100))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Principal + Interest
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Breakdown */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-[#0984E3]" />
                  Payment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Principal Amount</span>
                      <span className="font-semibold">{((loanAmount / totalPayment) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-[#0984E3] to-[#74B9FF] h-3 rounded-full"
                        style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Interest Amount</span>
                      <span className="font-semibold">{((totalInterest / totalPayment) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-[#FF7675] to-[#FAB1A0] h-3 rounded-full"
                        style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total Amount Payable</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalPayment)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amortization Schedule */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-[#00B894]" />
                  Amortization Schedule (First 5 Years)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {amortizationSchedule.map((item) => (
                    <div key={item.year} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">Year {item.year}</span>
                        <Badge variant="secondary">{formatCurrency(item.balance)} balance</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Principal: </span>
                          <span className="font-medium text-[#0984E3]">{formatCurrency(item.principal)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Interest: </span>
                          <span className="font-medium text-[#FF7675]">{formatCurrency(item.interest)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Affordability Tips */}
            <Card className="border-0 shadow-lg bg-blue-50">
              <CardHeader>
                <CardTitle className="text-[#0984E3]">💡 Affordability Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Your EMI should not exceed 40% of your monthly income</p>
                <p>• Consider additional costs like maintenance, property tax, and insurance</p>
                <p>• A higher down payment reduces your EMI and total interest</p>
                <p>• Compare rates from multiple banks before finalizing</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
