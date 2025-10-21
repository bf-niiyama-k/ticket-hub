export const validatePhone = (phone: string): boolean => {
  // 日本の電話番号形式（ハイフン含む）
  const phoneRegex = /^0\d{1,4}-\d{1,4}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const validateBirthDate = (birthDate: string): boolean => {
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return false;

  // 未来の日付は不可
  if (date > new Date()) return false;

  // 150歳以上は不可
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  if (date < minDate) return false;

  return true;
};

export const validateFullName = (name: string): boolean => {
  // 1文字以上、100文字以下
  return name.length > 0 && name.length <= 100;
};
