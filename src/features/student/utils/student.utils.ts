export const ratingFor = (score: number) => score >= 85 ? 'Excellent' : score >= 75 ? 'Very Good' : score >= 65 ? 'Good' : score >= 50 ? 'Pass' : 'Fail';
export const ratingLabel = (rating: string) => ({ Excellent: 'ممتاز', 'Very Good': 'جيد جدًا', Good: 'جيد', Pass: 'مقبول', Fail: 'غير مجتاز' }[rating] || rating);
export const numberLabel = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });
