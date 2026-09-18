export function localized(item, field, language) {
  return item?.[`${field}_${language}`] || item?.[`${field}_en`] || '';
}

export function formatDate(value, language = 'ta') {
  if (!value) return '';
  return new Intl.DateTimeFormat(language === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export function slugify(value = '') {
  return value.toString().toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}
