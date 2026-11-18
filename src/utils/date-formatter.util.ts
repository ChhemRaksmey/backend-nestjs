export class DateFormatter {
  static shortDate(value: Date): string {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return '—';
    }

    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(value);
  }
}
