import ProgressBar from '@/components/ui/ProgressBar';

interface BudgetMeterProps {
  minBudget: number;
  maxBudget: number;
  currentSpend: number;
}

export default function BudgetMeter({
  minBudget,
  maxBudget,
  currentSpend,
}: BudgetMeterProps) {
  return (
    <div className="w-full">
      <h3 className="text-base sm:text-lg font-semibold text-[#5D4037] mb-3 sm:mb-4 font-[var(--font-playfair)]">
        Budget Progress
      </h3>
      <ProgressBar min={minBudget} max={maxBudget} current={currentSpend} />
      <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-[#333333]">
        {currentSpend < minBudget && (
          <p className="text-[#E53935]">
            Add ${(minBudget - currentSpend).toFixed(2)} more to meet the minimum
          </p>
        )}
        {currentSpend >= minBudget && currentSpend <= maxBudget && (
          <p className="text-[#4CAF50]">
            ✓ Budget requirements met! You can proceed.
          </p>
        )}
        {currentSpend > maxBudget && (
          <p className="text-[#E53935]">
            Budget exceeded by ${(currentSpend - maxBudget).toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}
