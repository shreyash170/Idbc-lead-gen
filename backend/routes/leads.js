const express = require('express');
const router = express.Router();
const customers = require('../data/customers.json');
const { scoreCustomer } = require('../services/scoring');

// GET /api/leads?loanType=Home Loan&minScore=60
router.get('/', (req, res) => {
  const { loanType, minScore } = req.query;

  let scored = customers.map(scoreCustomer);

  if (loanType) {
    scored = scored.filter(c => c.loanTypeInterest === loanType);
  }
  if (minScore) {
    scored = scored.filter(c => c.leadScore >= Number(minScore));
  }

  scored.sort((a, b) => b.leadScore - a.leadScore);

  const summary = {
    totalLeads: scored.length,
    predictedConversions: scored.filter(c => c.predictedConversion).length,
    predictedConversionRate: scored.length
      ? +((scored.filter(c => c.predictedConversion).length / scored.length) * 100).toFixed(1)
      : 0
  };

  res.json({ summary, leads: scored });
});

// GET /api/leads/:id
router.get('/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Not found' });
  res.json(scoreCustomer(customer));
});

module.exports = router;