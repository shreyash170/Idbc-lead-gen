// Estimates real repayment capacity and lead conversion likelihood
// using behavioral + transactional signals instead of just declared income.

function estimateActualIncome(customer) {
  const { monthlySalary, upiMonthlyVolume, avgMonthlyBalance } = customer;

  // Blend declared salary with transactional behavior signals
  const behaviorIncomeProxy = (upiMonthlyVolume * 0.6) + (avgMonthlyBalance * 0.1);
  const estimatedIncome = Math.round((monthlySalary * 0.7) + (behaviorIncomeProxy * 0.3));

  return estimatedIncome;
}

function repaymentCapacityScore(customer, estimatedIncome) {
  const disposable = estimatedIncome - customer.existingEMI - customer.creditCardUsage * 0.3;
  const ratio = disposable / estimatedIncome;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function intentScore(customer) {
  const intentWeights = {
    searched_home_loan: 85,
    searched_personal_loan: 80,
    searched_auto_loan: 75,
    contacted_branch: 90,
    browsed_loan_page: 50,
    no_signal: 10
  };
  return intentWeights[customer.loanIntentSignal] ?? 10;
}

function stabilityScore(customer) {
  let score = 50;
  if (customer.savingsRate > 0.2) score += 20;
  if (customer.existingLoans === 0) score += 15;
  if (customer.avgMonthlyBalance > 20000) score += 15;
  return Math.min(100, score);
}

function scoreCustomer(customer) {
  const estimatedIncome = estimateActualIncome(customer);
  const repayment = repaymentCapacityScore(customer, estimatedIncome);
  const intent = intentScore(customer);
  const stability = stabilityScore(customer);

  // Weighted final lead score
  const finalScore = Math.round(
    repayment * 0.35 + intent * 0.4 + stability * 0.25
  );

  const reasons = [];
  if (repayment > 60) reasons.push('Strong repayment capacity');
  if (intent > 70) reasons.push('High loan intent signal');
  if (stability > 70) reasons.push('Stable financial behavior');
  if (customer.existingLoans === 0) reasons.push('No existing loan burden');

  return {
    ...customer,
    estimatedIncome,
    repaymentScore: repayment,
    intentScore: intent,
    stabilityScore: stability,
    leadScore: finalScore,
    reasons,
    predictedConversion: finalScore > 65
  };
}

module.exports = { scoreCustomer };