export const ratingLabel = (rating: string) => ({ Excellent: 'ممتاز', 'Very Good': 'جيد جدًا', Good: 'جيد', Pass: 'مقبول', Fail: 'غير مجتاز' }[rating] || rating);
export const numberLabel = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });
