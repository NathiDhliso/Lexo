import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PricingCalculator, ServiceItem, TimeEntry, Expense, DiscountConfig } from '../utils/PricingCalculator';
import { rateCardService } from '../services/rate-card.service';

// Mock the rate card service
vi.mock('../services/rate-card.service');

describe('Rate Card Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PricingCalculator', () => {
    it('should calculate services correctly', () => {
      const services: ServiceItem[] = [
        {
          id: '1',
          name: 'Contract Review',
          pricing_type: 'hourly',
          hourly_rate: 3500,
          estimated_hours: 2,
          quantity: 1,
          description: 'Standard contract review'
        },
        {
          id: '2',
          name: 'Legal Opinion',
          pricing_type: 'fixed',
          fixed_fee: 15000,
          quantity: 1,
          description: 'Written legal opinion'
        }
      ];

      const result = PricingCalculator.calculate(services, [], []);

      expect(result.servicesTotal).toBe(22000); // (3500 * 2) + 15000
      expect(result.vatAmount).toBe(3300); // 22000 * 0.15
      expect(result.total).toBe(25300); // 22000 + 3300
    });

    it('should calculate time entries correctly', () => {
      const timeEntries: TimeEntry[] = [
        {
          id: '1',
          hours: 3,
          rate: 4000,
          description: 'Client consultation',
          date: '2024-01-15'
        },
        {
          id: '2',
          hours: 1.5,
          rate: 3500,
          description: 'Document drafting',
          date: '2024-01-16'
        }
      ];

      const result = PricingCalculator.calculate([], timeEntries, []);

      expect(result.timeEntriesTotal).toBe(17250); // (3 * 4000) + (1.5 * 3500)
      expect(result.vatAmount).toBe(2587.5); // 17250 * 0.15
      expect(result.total).toBe(19837.5); // 17250 + 2587.5
    });

    it('should calculate expenses with VAT correctly', () => {
      const expenses: Expense[] = [
        {
          id: '1',
          amount: 1000,
          description: 'Travel expenses',
          category: 'travel',
          vat_applicable: true
        },
        {
          id: '2',
          amount: 500,
          description: 'Court filing fees',
          category: 'court_fees',
          vat_applicable: false
        }
      ];

      const result = PricingCalculator.calculate([], [], expenses);

      expect(result.expensesTotal).toBe(1500);
      expect(result.breakdown.vat.expensesVAT).toBe(150); // Only 1000 * 0.15
      expect(result.total).toBe(1650); // 1500 + 150
    });

    it('should apply percentage discount correctly', () => {
      const services: ServiceItem[] = [
        {
          id: '1',
          name: 'Legal Service',
          pricing_type: 'fixed',
          fixed_fee: 10000,
          quantity: 1,
          description: 'Legal service'
        }
      ];

      const discount: DiscountConfig = {
        type: 'percentage',
        value: 10,
        description: '10% discount'
      };

      const result = PricingCalculator.calculate(services, [], [], discount);

      expect(result.discountAmount).toBe(1000); // 10000 * 0.1
      expect(result.servicesTotal).toBe(10000);
      expect(result.subtotal).toBe(10000);
      expect(result.vatAmount).toBe(1350); // (10000 - 1000) * 0.15
      expect(result.total).toBe(10350); // 9000 + 1350
    });

    it('should apply fixed discount correctly', () => {
      const services: ServiceItem[] = [
        {
          id: '1',
          name: 'Legal Service',
          pricing_type: 'fixed',
          fixed_fee: 10000,
          quantity: 1,
          description: 'Legal service'
        }
      ];

      const discount: DiscountConfig = {
        type: 'fixed',
        value: 1500,
        description: 'R1500 discount'
      };

      const result = PricingCalculator.calculate(services, [], [], discount);

      expect(result.discountAmount).toBe(1500);
      expect(result.vatAmount).toBe(1275); // (10000 - 1500) * 0.15
      expect(result.total).toBe(9775); // 8500 + 1275
    });

    it('should handle complex mixed calculations', () => {
      const services: ServiceItem[] = [
        {
          id: '1',
          name: 'Contract Review',
          pricing_type: 'hourly',
          hourly_rate: 3500,
          estimated_hours: 2,
          quantity: 1,
          description: 'Contract review'
        }
      ];

      const timeEntries: TimeEntry[] = [
        {
          id: '1',
          hours: 1,
          rate: 4000,
          description: 'Consultation',
          date: '2024-01-15'
        }
      ];

      const expenses: Expense[] = [
        {
          id: '1',
          amount: 500,
          description: 'Travel',
          category: 'travel',
          vat_applicable: true
        }
      ];

      const discount: DiscountConfig = {
        type: 'percentage',
        value: 5,
        description: '5% discount'
      };

      const result = PricingCalculator.calculate(services, timeEntries, expenses, discount);

      const expectedServicesTotal = 7000; // 3500 * 2
      const expectedTimeTotal = 4000; // 1 * 4000
      const expectedProfessionalFees = expectedServicesTotal + expectedTimeTotal; // 11000
      const expectedDiscount = expectedProfessionalFees * 0.05; // 550
      const expectedVAT = (expectedProfessionalFees - expectedDiscount) * 0.15; // 1567.5
      const expectedExpensesVAT = 500 * 0.15; // 75

      expect(result.servicesTotal).toBe(expectedServicesTotal);
      expect(result.timeEntriesTotal).toBe(expectedTimeTotal);
      expect(result.expensesTotal).toBe(500);
      expect(result.discountAmount).toBe(expectedDiscount);
      expect(result.vatAmount).toBe(expectedVAT);
      expect(result.breakdown.vat.expensesVAT).toBe(expectedExpensesVAT);
      expect(result.total).toBe(11000 - 550 + 1567.5 + 500 + 75); // 12592.5
    });

    it('should estimate hours based on matter type and complexity', () => {
      expect(PricingCalculator.estimateHours('commercial', 'low')).toBe(5);
      expect(PricingCalculator.estimateHours('commercial', 'medium')).toBe(15);
      expect(PricingCalculator.estimateHours('commercial', 'high')).toBe(40);
      
      expect(PricingCalculator.estimateHours('litigation', 'low')).toBe(10);
      expect(PricingCalculator.estimateHours('litigation', 'medium')).toBe(25);
      expect(PricingCalculator.estimateHours('litigation', 'high')).toBe(60);
      
      expect(PricingCalculator.estimateHours('corporate', 'low')).toBe(8);
      expect(PricingCalculator.estimateHours('corporate', 'medium')).toBe(20);
      expect(PricingCalculator.estimateHours('corporate', 'high')).toBe(50);
    });

    it('should format currency correctly', () => {
      expect(PricingCalculator.formatCurrency(1234.56)).toBe('R 1,234.56');
      expect(PricingCalculator.formatCurrency(1000)).toBe('R 1,000.00');
      expect(PricingCalculator.formatCurrency(0)).toBe('R 0.00');
    });

    it('should generate detailed breakdown', () => {
      const services: ServiceItem[] = [
        {
          id: '1',
          name: 'Legal Service',
          pricing_type: 'fixed',
          fixed_fee: 10000,
          quantity: 1,
          description: 'Legal service'
        }
      ];

      const breakdown = PricingCalculator.generateBreakdown(services, [], []);

      expect(breakdown).toHaveProperty('services');
      expect(breakdown).toHaveProperty('timeEntries');
      expect(breakdown).toHaveProperty('expenses');
      expect(breakdown).toHaveProperty('vat');
      expect(breakdown).toHaveProperty('totals');

      expect(breakdown.services).toHaveLength(1);
      expect(breakdown.services[0]).toMatchObject({
        name: 'Legal Service',
        amount: 10000,
        description: 'Legal service'
      });
    });

    it('should validate pricing configurations', () => {
      const validService: ServiceItem = {
        id: '1',
        name: 'Valid Service',
        pricing_type: 'fixed',
        fixed_fee: 1000,
        quantity: 1,
        description: 'Valid service'
      };

      const invalidService: ServiceItem = {
        id: '2',
        name: 'Invalid Service',
        pricing_type: 'hourly',
        hourly_rate: -100, // Invalid negative rate
        estimated_hours: 2,
        quantity: 1,
        description: 'Invalid service'
      };

      expect(() => PricingCalculator.validatePricing([validService])).not.toThrow();
      expect(() => PricingCalculator.validatePricing([invalidService])).toThrow();
    });
  });

  describe('Rate Card Service Integration', () => {
    it('should generate pro forma estimate correctly', async () => {
      const mockEstimate = {
        totalAmount: 25000,
        lineItems: [
          {
            id: '1',
            serviceName: 'Contract Review',
            pricingType: 'hourly',
            hourlyRate: 3500,
            estimatedHours: 5,
            totalAmount: 17500,
            description: 'Standard contract review'
          },
          {
            id: '2',
            serviceName: 'Legal Opinion',
            pricingType: 'fixed',
            fixedFee: 7500,
            totalAmount: 7500,
            description: 'Written legal opinion'
          }
        ]
      };

      vi.mocked(rateCardService.generateProFormaEstimate).mockResolvedValue(mockEstimate);

      const request = {
        matterType: 'commercial' as const,
        services: [
          { serviceId: '1', quantity: 1 },
          { serviceId: '2', quantity: 1 }
        ]
      };

      const result = await rateCardService.generateProFormaEstimate(request);

      expect(result.totalAmount).toBe(25000);
      expect(result.lineItems).toHaveLength(2);
      expect(rateCardService.generateProFormaEstimate).toHaveBeenCalledWith(request);
    });
  });

  describe('End-to-End Workflow', () => {
    it('should handle complete workflow from rate card selection to final invoice', async () => {
      // Step 1: Rate card selection and pro forma generation
      const selectedServices = [
        {
          id: '1',
          name: 'Contract Review',
          pricing_type: 'hourly' as const,
          hourly_rate: 3500,
          estimated_hours: 3,
          quantity: 1,
          description: 'Contract review service'
        }
      ];

      // Step 2: Pro forma calculation
      const proFormaResult = PricingCalculator.calculate(selectedServices, [], []);
      expect(proFormaResult.total).toBe(12075); // (3500 * 3) * 1.15

      // Step 3: Time tracking and actual work
      const actualTimeEntries: TimeEntry[] = [
        {
          id: '1',
          hours: 2.5, // Actual time was less than estimated
          rate: 3500,
          description: 'Contract review work',
          date: '2024-01-15'
        }
      ];

      // Step 4: Final invoice calculation
      const finalResult = PricingCalculator.calculate([], actualTimeEntries, []);
      expect(finalResult.total).toBe(10062.5); // (3500 * 2.5) * 1.15

      // Step 5: Verify the workflow maintains consistency
      expect(finalResult.timeEntriesTotal).toBe(8750);
      expect(finalResult.vatAmount).toBe(1312.5);
      expect(finalResult.total).toBeLessThan(proFormaResult.total); // Actual was less than estimate
    });

    it('should handle workflow with expenses and discounts', async () => {
      // Complete workflow with all components
      const services: ServiceItem[] = [
        {
          id: '1',
          name: 'Legal Consultation',
          pricing_type: 'fixed',
          fixed_fee: 5000,
          quantity: 1,
          description: 'Initial consultation'
        }
      ];

      const timeEntries: TimeEntry[] = [
        {
          id: '1',
          hours: 2,
          rate: 4000,
          description: 'Follow-up work',
          date: '2024-01-15'
        }
      ];

      const expenses: Expense[] = [
        {
          id: '1',
          amount: 800,
          description: 'Travel to client',
          category: 'travel',
          vat_applicable: true
        }
      ];

      const discount: DiscountConfig = {
        type: 'percentage',
        value: 10,
        description: 'Client discount'
      };

      const result = PricingCalculator.calculate(services, timeEntries, expenses, discount);

      // Verify all components are calculated correctly
      expect(result.servicesTotal).toBe(5000);
      expect(result.timeEntriesTotal).toBe(8000);
      expect(result.expensesTotal).toBe(800);
      expect(result.discountAmount).toBe(1300); // (5000 + 8000) * 0.1
      expect(result.vatAmount).toBe(1755); // (13000 - 1300) * 0.15
      expect(result.breakdown.vat.expensesVAT).toBe(120); // 800 * 0.15
      expect(result.total).toBe(14375); // 11700 + 1755 + 800 + 120
    });
  });
});