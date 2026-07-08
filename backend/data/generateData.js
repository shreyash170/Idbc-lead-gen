const { faker } = require('@faker-js/faker');
const fs = require('fs');
const path = require('path');

function generateCustomers(count = 300) {
  const customers = [];

  for (let i = 0; i < count; i++) {
    const monthlySalary = faker.number.int({ min: 15000, max: 250000 });
    const upiMonthlyVolume = faker.number.int({ min: 2000, max: 150000 });
    const existingEMI = faker.number.int({ min: 0, max: monthlySalary * 0.5 });
    const avgMonthlyBalance = faker.number.int({ min: 500, max: 500000 });
    const age = faker.number.int({ min: 21, max: 60 });
    const creditCardUsage = faker.number.int({ min: 0, max: 80000 });
    const existingLoans = faker.number.int({ min: 0, max: 3 });
    const savingsRate = +(Math.random() * 0.4).toFixed(2); // 0-40%
    const loanIntentSignal = faker.helpers.arrayElement([
      'browsed_loan_page', 'searched_home_loan', 'searched_personal_loan',
      'searched_auto_loan', 'no_signal', 'contacted_branch'
    ]);
    const loanTypeInterest = faker.helpers.arrayElement([
      'Personal Loan', 'Home Loan', 'Auto Loan', 'Mortgage Loan'
    ]);

    customers.push({
      id: `CUST${1000 + i}`,
      name: faker.person.fullName(),
      age,
      monthlySalary,
      upiMonthlyVolume,
      existingEMI,
      avgMonthlyBalance,
      creditCardUsage,
      existingLoans,
      savingsRate,
      loanIntentSignal,
      loanTypeInterest
    });
  }

  const filePath = path.join(__dirname, 'customers.json');
  fs.writeFileSync(filePath, JSON.stringify(customers, null, 2));
  console.log(`Generated ${count} synthetic customers -> ${filePath}`);
}

generateCustomers(300);