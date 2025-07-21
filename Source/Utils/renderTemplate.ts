export function renderTemplate(template: string, data: Record<string, string | number>): string {
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => {
      return data[key]?.toString() ?? '';
    });
  }
  