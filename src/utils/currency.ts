// Format number as Indonesian Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Parse Rupiah string back to number
export const parseRupiah = (value: string): number => {
  if (!value) return 0;
  const number = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(number) || 0;
};
